import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';

import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Realtime Database Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

let supabaseClient = null;
if (process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log("⚡ Supabase Realtime Cloud Database Client active and connected.");
  } catch (err) {
    console.warn("⚠️ Supabase Client init failed, using persistent storage fallback.", err.message);
  }
} else {
  console.log("ℹ️ Supabase credentials not set in env. Local persistent emulator active.");
}

// Enable CORS and JSON parser with 50mb payload limit for Base64 DataURLs
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mock DB File Path (for persistent fallback)
const DB_FILE = path.join(__dirname, 'db.json');

// Incident & Activity Logger Helper
const logIncident = async (db, incidentType, title, description, performedBy) => {
  if (!db.incidents) db.incidents = [];
  const incidentEntry = {
    id: "inc-" + Math.random().toString(36).substr(2, 9),
    type: incidentType,
    title,
    description,
    performed_by: performedBy || "System",
    timestamp: new Date().toISOString()
  };
  db.incidents.unshift(incidentEntry);

  if (supabaseClient) {
    supabaseClient.from('incidents').insert([incidentEntry]).then().catch(err => console.warn("Supabase incident sync:", err.message));
  }
};

// Initialize Mock Database if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [],
    onboarding_chats: {},
    mentor_chats: {},
    timetable: [],
    quizzes: [
      {
        id: "quiz-1",
        title: "CS Freshers - Logic & SQL basics",
        questions: [
          {
            question_id: "q1",
            text: "Which SQL clause is used to filter query results based on aggregate values?",
            options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
            correct_option_idx: 1
          },
          {
            question_id: "q2",
            text: "What is the time complexity of searching in a balanced Binary Search Tree (BST)?",
            options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
            correct_option_idx: 2
          },
          {
            question_id: "q3",
            text: "What does the 'S' in SOLID principles stand for?",
            options: ["Single Responsibility", "Structural Dependency", "Stack Allocation", "System Integrity"],
            correct_option_idx: 0
          }
        ]
      }
    ],
    attempts: [],
    friends: [],
    messages: [],
    notifications: []
  }, null, 2));
}

// Google Cloud Storage Integration
const bucketName = process.env.GCS_BUCKET_NAME || 'freshman-portal-storage';
const gcsFileName = 'db.json';
let storage;
let bucket;
let file;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCS_BUCKET_NAME) {
  try {
    storage = new Storage();
    bucket = storage.bucket(bucketName);
    file = bucket.file(gcsFileName);
    console.log(`☁️ Google Cloud Storage initialized. Using bucket: ${bucketName}`);
  } catch (err) {
    console.warn("⚠️ Failed to initialize Google Cloud Storage client, using local file storage fallback.", err.message);
  }
} else {
  console.log("ℹ️ GCS credentials or bucket name not configured. Local emulator active.");
}

// Asynchronous GCS read/write helpers
const readDB = async () => {
  let dbData;
  if (file) {
    try {
      const [content] = await file.download();
      dbData = JSON.parse(content.toString('utf8'));
    } catch (err) {
      console.warn("⚠️ Failed to read from Google Cloud Storage, falling back to local file.", err.message);
    }
  }
  if (!dbData) {
    try {
      dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (err) {
      dbData = { users: [], onboarding_chats: {}, mentor_chats: {}, timetable: [], quizzes: [], attempts: [], friends: [], messages: [], notifications: [] };
    }
  }

  // Baseline structure enforcement for live server continuation
  if (!dbData.events) dbData.events = [];
  if (!dbData.timetable) dbData.timetable = [];
  if (!dbData.syllabus) dbData.syllabus = [];
  if (!dbData.staff_schedules) dbData.staff_schedules = [];
  if (!dbData.student_login_logs) dbData.student_login_logs = [];
  if (!dbData.admin_login_logs) dbData.admin_login_logs = [];
  if (!dbData.incidents) dbData.incidents = [];
  if (!dbData.notifications) dbData.notifications = [];
  if (!dbData.student_progress) dbData.student_progress = {};

  return dbData;
};

const writeDB = async (data) => {
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(DB_FILE, content);
  
  if (file) {
    try {
      await file.save(content, {
        contentType: 'application/json',
        resumable: false,
      });
      console.log(`[GCS] Successfully saved database snapshot to GCS bucket: ${bucketName}`);
    } catch (err) {
      console.error("⚠️ Failed to upload database to Google Cloud Storage:", err.message);
    }
  } else {
    console.log(`[GCS LOCAL EMULATOR] Saved database and synced to simulated GCS bucket: ${bucketName}`);
  }
};

// Gemini API Wrapper
const callGemini = async (prompt, systemInstruction = '', responseSchema = null) => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not defined. Using mocked responses.");
    return fallbackMockGemini(prompt, systemInstruction);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    if (responseSchema) {
      requestBody.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (responseSchema) {
      return JSON.parse(responseText);
    }
    return responseText;
  } catch (error) {
    console.error("❌ Gemini Call Failed:", error);
    return fallbackMockGemini(prompt, systemInstruction);
  }
};

// Fallback logic in case Gemini key is missing or fails
const fallbackMockGemini = (prompt, systemInstruction) => {
  console.log("🛠️ Mock Gemini Active.");
  if (systemInstruction.includes("Onboarding")) {
    return {
      academic_focus: "Software Engineering & Algorithms",
      domain_track: "Software Engineering",
      learning_style: "Visual",
      clubs_suggested: ["Computer Science Society", "WebDev Club"],
      recommended_videos_query: "learn React and Node in 2026"
    };
  }
  if (systemInstruction.includes("Growth Mentor")) {
    return "Keep practicing! Focus on structuring your daily study blocks into 25-minute Pomodoro sessions.";
  }
  if (prompt.includes("Academic Analyzer")) {
    return {
      insight_summary: "Great work! You scored well on SOLID principles, but need review on SQL aggregates.",
      graph_data: {
        nodes: [
          { id: "sql-aggr", name: "SQL Aggregate Functions", val: 2, status: "needs_work" },
          { id: "solid-srp", name: "Single Responsibility Principle", val: 5, status: "mastered" },
          { id: "bst-search", name: "BST Search Complexity", val: 4, status: "mastered" }
        ],
        links: [
          { source: "solid-srp", target: "bst-search" },
          { source: "bst-search", target: "sql-aggr" }
        ]
      }
    };
  }
  return "This is a pre-cached response from the portal assistant.";
};



/* ==========================================================================
   AUTHENTICATION ENDPOINTS
   ========================================================================== */

app.post('/api/auth/sso/login', async (req, res) => {
  const { email, department, batch_no, role, password, full_name, degree_completion, experience } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const db = await readDB();

  if (role === 'admin') {
    if (!password || password.trim() === '') {
      return res.status(400).json({ error: "Please provide your Faculty ID password." });
    }

    let user = db.users.find(u => u.college_email === email && u.is_admin);
    const resolvedName = (full_name && full_name.trim()) ? full_name.trim() : "FACULTY " + email.split('@')[0].toUpperCase();
    const resolvedDegree = (degree_completion && degree_completion.trim()) ? degree_completion.trim() : "Ph.D in Computer Science & Engineering";
    const resolvedExp = (experience && experience.trim()) ? experience.trim() : "14+ Years Senior Professor & Academic Chair";

    if (!user) {
      user = {
        id: "admin-" + Math.random().toString(36).substr(2, 9),
        college_email: email,
        full_name: resolvedName,
        is_admin: true,
        department: department || "Academic Administration",
        degree_completion: resolvedDegree,
        experience: resolvedExp,
        onboarding_completed: true,
        created_at: new Date().toISOString()
      };
      db.users.push(user);
      await writeDB(db);

      sendEmailNotification(
        email,
        `Welcome Faculty Advisor - Portal SSO Activated`,
        `Hello ${user.full_name},\n\nYour Admin Faculty single sign-on succeeded. Your profile is ready.\n\nDegree: ${user.degree_completion}\nExperience: ${user.experience}\nDept: ${user.department}`
      ).catch(err => console.error("Admin welcome mail fail:", err));
    } else {
      if (full_name && full_name.trim()) user.full_name = full_name.trim();
      if (degree_completion && degree_completion.trim()) user.degree_completion = degree_completion.trim();
      if (experience && experience.trim()) user.experience = experience.trim();
      await writeDB(db);

      sendEmailNotification(
        email,
        `Admin Portal - SSO Login Alert`,
        `Hello ${user.full_name},\n\nA new faculty admin session was established.\n\nTimestamp: ${new Date().toLocaleString()}\nIf this was not you, please audit immediately.`
      ).catch(err => console.error("Admin alert mail fail:", err));
    }

    return res.json({
      token: "mock-sso-jwt-token-" + user.id,
      user
    });
  }

  let user = db.users.find(u => u.college_email === email && !u.is_admin);
  const resolvedStudentName = (full_name && full_name.trim()) ? full_name.trim() : email.split('@')[0].replace('.', ' ').toUpperCase();

  if (!user) {
    const deptName = department || "Computer Science Engineering (CSE B.E)";
    const batchCode = batch_no || "2026-CS";
    user = {
      id: "u-" + Math.random().toString(36).substr(2, 9),
      college_email: email,
      full_name: resolvedStudentName,
      batch_no: batchCode,
      department: deptName,
      roll_no: '2026' + deptName.substring(0,3).toUpperCase() + Math.floor(100 + Math.random() * 900),
      onboarding_completed: true,
      academic_interests: ["Coding Society", "Web Development"],
      domain_track: 'Software Engineering',
      learning_style: 'Visual & Hands-on',
      weekly_summary_cached: '',
      created_at: new Date().toISOString()
    };
    db.users.push(user);
    await writeDB(db);

    sendEmailNotification(
      email,
      `Welcome to Freshman Portal - SSO Activation Successful`,
      `Hello ${user.full_name},\n\nYour institutional Single Sign-On (SSO) login succeeded. A new portal profile has been created for your academic email.\n\nAccount Details:\n- Name: ${user.full_name}\n- Dept: ${user.department}\n- Batch: ${user.batch_no}\n\nExplore your roadmap, schedules, and club dashboards inside the portal!`
    ).catch(err => console.error("SSO welcome email fail:", err));
  } else {
    if (full_name && full_name.trim()) user.full_name = full_name.trim();
    if (batch_no && batch_no.trim()) user.batch_no = batch_no.trim();
    if (department && department.trim()) user.department = department.trim();
    await writeDB(db);

    sendEmailNotification(
      email,
      `University Portal - SSO Login Alert`,
      `Hello ${user.full_name},\n\nThis is to notify you that a new Google Workspace/SAML Single Sign-On session was established for your account.\n\nTimestamp: ${new Date().toLocaleString()}\nIf you did not log in, please audit your account immediately.`
    ).catch(err => console.error("SSO login alert email fail:", err));
  }

  // Record Login Audit Logs (Separate for Admin and Student)
  if (user.is_admin || email.toLowerCase().includes('admin')) {
    if (!db.admin_login_logs) db.admin_login_logs = [];
    const adminLogEntry = {
      id: "adm-log-" + Math.random().toString(36).substr(2, 9),
      admin_name: user.full_name || "System Administrator",
      email: user.college_email || email,
      role: "System Administrator / HOD",
      login_timestamp: new Date().toISOString(),
      ip_address: req.ip || "127.0.0.1",
      user_agent: req.headers['user-agent'] || "Browser Client"
    };
    db.admin_login_logs.unshift(adminLogEntry);
    await logIncident(db, 'ADMIN_LOGIN', `Admin Session Initiated by ${user.full_name}`, `System administrator logged in successfully. IP: ${req.ip || '127.0.0.1'}`, user.full_name);
    
    if (supabaseClient) {
      supabaseClient.from('admin_login_logs').insert([adminLogEntry]).then().catch(err => console.warn("Supabase admin log sync:", err.message));
    }
  } else {
    if (!db.student_login_logs) db.student_login_logs = [];
    const loginLogEntry = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      student_id: user.id,
      student_name: user.full_name,
      college_email: user.college_email,
      batch_no: user.batch_no || batch_no || "2026-CS",
      department: user.department || department || "Computer Science",
      login_timestamp: new Date().toISOString(),
      ip_address: req.ip || "127.0.0.1"
    };
    db.student_login_logs.unshift(loginLogEntry);
    await logIncident(db, 'STUDENT_LOGIN', `Student Login: ${user.full_name}`, `Student ${user.full_name} (${user.department}) authenticated.`, user.full_name);
    
    if (supabaseClient) {
      supabaseClient.from('student_login_logs').insert([loginLogEntry]).then().catch(err => console.warn("Supabase student log sync:", err.message));
    }
  }

  // Initialize Student Isolated Progress Record
  if (!db.student_progress) db.student_progress = {};
  if (!db.student_progress[user.id]) {
    db.student_progress[user.id] = {
      student_id: user.id,
      registered_events: [],
      completed_todos: [],
      quiz_attempts: [],
      enrolled_skill_tracks: [],
      diagnostic_roadmap: null,
      created_at: new Date().toISOString()
    };
  }

  await writeDB(db);

  res.json({
    token: "mock-sso-jwt-token-" + user.id,
    user,
    student_progress: db.student_progress[user.id]
  });
});

// Email Sender Simulator
const sendEmailNotification = async (recipientEmail, subject, body) => {
  const resendKey = process.env.RESEND_API_KEY || '';
  console.log(`\n📧 [EMAIL SENDER SYSTEM] Preparing transmission:`);
  console.log(`   To:      ${recipientEmail}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Body:    ${body}\n`);

  if (resendKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Academics Portal <onboarding@resend.dev>',
          to: recipientEmail,
          subject: subject,
          text: body
        })
      });
      if (response.ok) {
        console.log(`⚡ Real Email successfully sent via Resend API to: ${recipientEmail}`);
      } else {
        const errText = await response.text();
        console.error(`❌ Resend API returned error: ${errText}`);
      }
    } catch (error) {
      console.error(`❌ Real Email send failed:`, error);
    }
  } else {
    console.log(`💡 Local Simulator: Email logged in terminal (Setup RESEND_API_KEY for real delivery).`);
  }
};

/* ==========================================================================
   STUDENT ISOLATED PROGRESS & ADMIN AUDIT LOGS ENDPOINTS
   ========================================================================== */

app.get('/api/student/progress/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const db = await readDB();
  if (!db.student_progress) db.student_progress = {};
  const progress = db.student_progress[studentId] || {
    student_id: studentId,
    registered_events: [],
    completed_todos: [],
    quiz_attempts: [],
    enrolled_skill_tracks: [],
    diagnostic_roadmap: null
  };
  res.json({ progress });
});

app.post('/api/student/progress/update', async (req, res) => {
  const { student_id, progress } = req.body;
  if (!student_id) return res.status(400).json({ error: "student_id is required" });

  const db = await readDB();
  if (!db.student_progress) db.student_progress = {};
  db.student_progress[student_id] = {
    ...db.student_progress[student_id],
    ...progress,
    updated_at: new Date().toISOString()
  };

  await writeDB(db);
  res.json({ success: true, progress: db.student_progress[student_id] });
});

app.get('/api/admin/student-audit-logs', async (req, res) => {
  const db = await readDB();
  const students = (db.users || []).filter(u => !u.is_admin);
  const loginLogs = db.student_login_logs || [];
  const adminLoginLogs = db.admin_login_logs || [];
  const incidents = db.incidents || [];
  const studentProgress = db.student_progress || {};

  res.json({
    total_students: students.length,
    students,
    login_logs: loginLogs,
    admin_login_logs: adminLoginLogs,
    incidents: incidents,
    student_progress: studentProgress
  });
});

/* ==========================================================================
   GEMINI AI CHATBOT API ENDPOINT
   ========================================================================== */

app.post('/api/chatbot', async (req, res) => {
  const { message, context, user_profile } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message content is required." });
  }

  const systemInstruction = `You are Freshman AI Guide, an empathetic, intelligent academic counselor and campus navigator for freshers and college students. 
Student Context: Name: ${user_profile?.full_name || 'Student'}, Dept: ${user_profile?.department || 'Computer Science'}, Year: ${user_profile?.college_year || '1st Year'}.
Provide clear, motivating, concise, and helpful advice regarding subjects, timetables, study roadmaps, exam preparation, and campus life.`;

  try {
    const aiResponse = await callGemini(message, systemInstruction);
    res.json({ response: aiResponse });
  } catch (err) {
    res.json({ response: "I am here to guide you through your college semester! Ask me about your subjects, timetable, or skill roadmap." });
  }
});

app.post('/api/user/update', async (req, res) => {
  const { id, full_name, degree, batch_no, department, college_year, academic_interests } = req.body;
  const db = await readDB();
  const user = db.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }

  // Update details
  user.full_name = full_name;
  user.degree = degree;
  user.batch_no = batch_no;
  user.department = department;
  user.college_year = college_year;
  user.academic_interests = academic_interests;

  await writeDB(db);

  // Send update email notification
  sendEmailNotification(
    user.college_email,
    `University Portal - Student Profile Updated`,
    `Hello ${user.full_name},\n\nThis is to notify you that your student profile details have been successfully updated in the University Portal.\n\nNew Profile Settings:\n- Degree: ${degree}\n- Department: ${department}\n- Year: ${college_year}\n- Batch No: ${batch_no}\n\nIf you did not make this change, please report it immediately.`
  ).catch(err => console.error("Email notify fail:", err));

  res.json({ success: true, user });
});

/* ==========================================================================
   ONBOARDING BOT ENDPOINTS
   ========================================================================== */

app.post('/api/onboarding/chat', async (req, res) => {
  const { user_id, message } = req.body;
  const db = await readDB();

  if (!db.onboarding_chats[user_id]) {
    db.onboarding_chats[user_id] = [];
  }

  const userChats = db.onboarding_chats[user_id];
  userChats.push({ role: 'user', message_content: message });

  const turn = userChats.filter(c => c.role === 'user').length;

  if (turn === 1) {
    const reply = "Nice to meet you! What specific domain tracks spark your interest? (e.g. Software Engineering, AI & Robotics, Biotech, Finance)";
    userChats.push({ role: 'model', message_content: reply });
    await writeDB(db);
    return res.json({ nextQuestion: reply, isCompleted: false });
  } else if (turn === 2) {
    const reply = "Got it. How do you learn best? Do you prefer practical visual diagrams, listening to lectures, or coding hands-on projects?";
    userChats.push({ role: 'model', message_content: reply });
    await writeDB(db);
    return res.json({ nextQuestion: reply, isCompleted: false });
  } else if (turn >= 3) {
    // Process final turn and trigger Gemini optimized profile builder
    const userAnswers = userChats.filter(c => c.role === 'user').map(c => c.message_content).join('\n');
    
    const onboardingInstruction = `
    You are the College Fresher Onboarding Architect.
    Your task is to analyze the student's answers and output their profiles.
    
    You must output ONLY a valid JSON object matching this schema:
    {
      "academic_focus": "string",
      "domain_track": "string",
      "learning_style": "string",
      "clubs_suggested": ["string"],
      "recommended_videos_query": "string"
    }
    No leading/trailing markdown blocks or formatting.
    `;

    // Fire single call
    callGemini(userAnswers, onboardingInstruction, {
      type: "OBJECT",
      properties: {
        academic_focus: { type: "STRING" },
        domain_track: { type: "STRING" },
        learning_style: { type: "STRING" },
        clubs_suggested: { type: "ARRAY", items: { type: "STRING" } },
        recommended_videos_query: { type: "STRING" }
      },
      required: ["academic_focus", "domain_track", "learning_style", "clubs_suggested", "recommended_videos_query"]
    }).then(async parsedData => {
      const userIndex = db.users.findIndex(u => u.id === user_id);
      if (userIndex !== -1) {
        db.users[userIndex].onboarding_completed = true;
        db.users[userIndex].academic_interests = parsedData.clubs_suggested;
        db.users[userIndex].domain_track = parsedData.domain_track;
        db.users[userIndex].learning_style = parsedData.learning_style;
      }
      await writeDB(db);
      res.json({ isCompleted: true, recommendations: parsedData });
    }).catch(err => {
      console.error(err);
      res.status(500).json({ error: "Could not finalize profile recommendations." });
    });
  }
});

/* ==========================================================================
   AI MENTOR CHAT ENDPOINTS
   ========================================================================== */

app.post('/api/mentor/chat', async (req, res) => {
  const { user_id, message } = req.body;
  const db = await readDB();
  const user = db.users.find(u => u.id === user_id);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (!db.mentor_chats[user_id]) {
    db.mentor_chats[user_id] = [];
  }

  const mentorHistory = db.mentor_chats[user_id];
  mentorHistory.push({ role: 'user', message_content: message });

  // Get recent 6 turns to feed into Gemini prompt
  const recentHistory = mentorHistory.slice(-6);
  const formattedHistory = recentHistory.map(m => `${m.role === 'user' ? 'Student' : 'Mentor'}: ${m.message_content}`).join('\n');

  const systemInstruction = `
  You are an expert college growth mentor helper. 
  Student Profile:
  - Domain: ${user.domain_track}
  - Learning Style: ${user.learning_style}
  
  Rule: Answer in maximum 3 sentences. Be extremely actionable, encouraging, and direct.
  `;

  try {
    const replyText = await callGemini(formattedHistory, systemInstruction);
    mentorHistory.push({ role: 'model', message_content: replyText });
    await writeDB(db);
    res.json({ reply: replyText });
  } catch (error) {
    res.status(500).json({ error: "Mentor connection error." });
  }
});

/* ==========================================================================
   TIMETABLE MANAGEMENT ENDPOINTS (Years 1 to 4 & All Departments)
   ========================================================================== */

app.get('/api/timetable/all', async (req, res) => {
  const db = await readDB();
  res.json({ timetable: db.timetable || [] });
});

// Department HOD Email Resolver
const getDepartmentHODEmail = (deptName) => {
  const lower = (deptName || "").toLowerCase();
  if (lower.includes("cse") || lower.includes("computer science engineering")) return "hod.cse@college.edu";
  if (lower.includes("ai") || lower.includes("data science") || lower.includes("aids")) return "hod.aids@college.edu";
  if (lower.includes("ece") || lower.includes("electronics")) return "hod.ece@college.edu";
  if (lower.includes("csbs") || lower.includes("business systems")) return "hod.csbs@college.edu";
  if (lower.includes("mech") || lower.includes("mechanical")) return "hod.mech@college.edu";
  if (lower.includes("civil")) return "hod.civil@college.edu";
  return "hod.general@college.edu";
};

app.post('/api/timetable/manage', async (req, res) => {
  const { id, department, year, batch_no, day_of_week, subject_name, time_start, time_end, classroom, building, faculty, timetable_image_url } = req.body;

  const db = await readDB();
  if (!db.timetable) db.timetable = [];

  const targetBatch = batch_no || `${year || '1st Year'}-${department || 'General'}`;

  let targetSlot;
  if (id) {
    const idx = db.timetable.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.timetable[idx] = {
        ...db.timetable[idx],
        department: department || db.timetable[idx].department,
        year: year || db.timetable[idx].year,
        batch_no: targetBatch,
        day_of_week: day_of_week || "Monday",
        subject_name: subject_name || "Department Timetable Chart",
        time_start: time_start || "09:00 AM",
        time_end: time_end || "10:00 AM",
        classroom: classroom || "LH-101",
        building: building || "Academic Block A",
        faculty: faculty || "Faculty",
        timetable_image_url: timetable_image_url || db.timetable[idx].timetable_image_url
      };
      targetSlot = db.timetable[idx];
    }
  }

  if (!targetSlot) {
    targetSlot = {
      id: "tt-" + Math.random().toString(36).substr(2, 9),
      department: department || "Computer Science Engineering (CSE B.E)",
      year: year || "1st Year",
      batch_no: targetBatch,
      day_of_week: day_of_week || "Monday",
      subject_name: subject_name || "Department Timetable Chart",
      time_start: time_start || "09:00 AM",
      time_end: time_end || "10:00 AM",
      classroom: classroom || "LH-101",
      building: building || "Academic Block A",
      faculty: faculty || "Faculty",
      timetable_image_url: timetable_image_url || "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop",
      created_at: new Date().toISOString()
    };
    db.timetable.push(targetSlot);
  }

  // Push System Broadcast Notification for Students
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift({
    id: "notif-" + Math.random().toString(36).substr(2, 9),
    type: "academic",
    title: `📅 Timetable Update: ${targetSlot.department}`,
    body: `New ${targetSlot.year} Class Timetable chart published for ${targetSlot.department}. Check your Class Timetable option!`,
    created_at: new Date().toISOString()
  });

  await writeDB(db);

  // Email Notification to Principal and Department HOD
  const hodEmail = getDepartmentHODEmail(targetSlot.department);
  const emailSubject = `[OFFICIAL TIMETABLE ANNOUNCEMENT] Class Timetable Published: ${targetSlot.department} (${targetSlot.year})`;
  const emailBody = `Dear Principal & HOD,\n\nOfficial Class Timetable update published by Admin.\n\nDepartment: ${targetSlot.department}\nAcademic Year: ${targetSlot.year}\nTimetable Chart Image: ${targetSlot.timetable_image_url || 'Attached'}\n\nThis timetable image has been automatically synced to all students in ${targetSlot.department}.`;

  sendEmailNotification("principal@college.edu", emailSubject, emailBody).catch(err => console.error("Principal email fail:", err));
  sendEmailNotification(hodEmail, emailSubject, emailBody).catch(err => console.error("HOD email fail:", err));

  res.json({ success: true, slot: targetSlot });
});

app.post('/api/timetable/delete', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Slot id is required." });

  const db = await readDB();
  if (!db.timetable) db.timetable = [];
  db.timetable = db.timetable.filter(t => t.id !== id);
  await writeDB(db);
  res.json({ success: true });
});

/* ==========================================================================
   STAFF SCHEDULE ENDPOINTS (Faculty Timetable Charts & Availability)
   ========================================================================== */

const defaultStaffScheduleSeed = [
  {
    id: "staff-sc-1",
    staff_name: "Dr. A. K. Sharma",
    designation: "Senior Professor & HOD",
    department: "Computer Science Engineering (CSE B.E)",
    available_hours: "Mon, Wed, Fri: 10:00 AM - 12:30 PM",
    schedule_image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop",
    assigned_subjects: "Data Structures, Database Architectures"
  },
  {
    id: "staff-sc-2",
    staff_name: "Prof. Priya Sen",
    designation: "Associate Professor",
    department: "Artificial Intelligence & Data Science (AI & DS)",
    available_hours: "Tue, Thu: 02:00 PM - 04:30 PM",
    schedule_image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop",
    assigned_subjects: "Machine Learning, Neural Networks"
  }
];

app.get('/api/staff-schedule', async (req, res) => {
  const db = await readDB();
  if (!db.staff_schedules || db.staff_schedules.length === 0) {
    db.staff_schedules = defaultStaffScheduleSeed;
    await writeDB(db);
  }
  res.json({ staff_schedules: db.staff_schedules });
});

app.post('/api/staff-schedule', async (req, res) => {
  const { staff_name, designation, department, available_hours, schedule_image_url, assigned_subjects } = req.body;
  if (!staff_name || !department) {
    return res.status(400).json({ error: "Staff name and department are required." });
  }

  const db = await readDB();
  if (!db.staff_schedules) db.staff_schedules = [];

  const newSchedule = {
    id: "staff-sc-" + Math.random().toString(36).substr(2, 9),
    staff_name: staff_name.trim(),
    designation: designation ? designation.trim() : "Faculty Member",
    department: department.trim(),
    available_hours: available_hours ? available_hours.trim() : "Mon-Fri: 09:00 AM - 04:00 PM",
    schedule_image_url: schedule_image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop",
    assigned_subjects: assigned_subjects ? assigned_subjects.trim() : "Core Subjects",
    created_at: new Date().toISOString()
  };

  db.staff_schedules.push(newSchedule);

  // Push System Broadcast Notification for Students
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift({
    id: "notif-" + Math.random().toString(36).substr(2, 9),
    type: "academic",
    title: `👨‍🏫 Staff Schedule Update: ${newSchedule.department}`,
    body: `Faculty schedule & office hours updated for ${newSchedule.staff_name} (${newSchedule.department}).`,
    created_at: new Date().toISOString()
  });

  await writeDB(db);

  // Email Notification to Principal and Department HOD
  const hodEmail = getDepartmentHODEmail(newSchedule.department);
  const emailSubject = `[STAFF SCHEDULE ANNOUNCEMENT] Faculty Schedule Updated: ${newSchedule.staff_name} (${newSchedule.department})`;
  const emailBody = `Dear Principal & HOD,\n\nFaculty schedule and office hours updated by Admin.\n\nFaculty Name: ${newSchedule.staff_name}\nDesignation: ${newSchedule.designation}\nDepartment: ${newSchedule.department}\nAvailable Hours: ${newSchedule.available_hours}\nAssigned Subjects: ${newSchedule.assigned_subjects}\nSchedule Image: ${newSchedule.schedule_image_url || 'Attached'}\n\nThis schedule record has been automatically synced to all students in ${newSchedule.department}.`;

  sendEmailNotification("principal@college.edu", emailSubject, emailBody).catch(err => console.error("Principal email fail:", err));
  sendEmailNotification(hodEmail, emailSubject, emailBody).catch(err => console.error("HOD email fail:", err));

  res.json({ success: true, staff_schedule: newSchedule });
});

app.post('/api/staff-schedule/delete', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Staff schedule id is required." });

  const db = await readDB();
  if (!db.staff_schedules) db.staff_schedules = [];
  db.staff_schedules = db.staff_schedules.filter(s => s.id !== id);
  await writeDB(db);
  res.json({ success: true });
});

app.post('/api/timetable/upload', async (req, res) => {
  const { csv_data, batch_no, department, year } = req.body;
  
  if (!csv_data || !batch_no) {
    return res.status(400).json({ error: "Timetable CSV data and batch number are required." });
  }

  const lines = csv_data.split('\n');
  const parsedRecords = [];

  try {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [day, subject, start, end, room, bld, fac] = line.split(',');
      parsedRecords.push({
        id: "tt-" + Math.random().toString(36).substr(2, 9),
        department: department || "Computer Science",
        year: year || "1st Year",
        batch_no,
        day_of_week: day ? day.trim() : "Monday",
        subject_name: subject ? subject.trim() : "Core Subject",
        time_start: start ? start.trim() : "09:00 AM",
        time_end: end ? end.trim() : "10:00 AM",
        classroom: room ? room.trim() : "LH-101",
        building: bld ? bld.trim() : "Academic Block A",
        faculty: fac ? fac.trim() : "Faculty Advisor"
      });
    }

    const db = await readDB();
    db.timetable = db.timetable.filter(t => t.batch_no !== batch_no);
    db.timetable.push(...parsedRecords);
    await writeDB(db);

    res.json({ success: true, count: parsedRecords.length });
  } catch (err) {
    res.status(400).json({ error: "Invalid CSV format or missing columns." });
  }
});

app.get('/api/timetable/:batch', async (req, res) => {
  const { batch } = req.params;
  const db = await readDB();
  const filtered = db.timetable.filter(t => t.batch_no === batch || t.department === batch);
  res.json({ timetable: filtered });
});

/* ==========================================================================
   SUBJECTS & SYLLABUS ENDPOINTS (Years 1 to 4 & All Departments)
   ========================================================================== */

const defaultSyllabusSeed = [
  {
    id: "syl-cse-1",
    department: "Computer Science Engineering (CSE B.E)",
    year: "1st Year",
    subject_code: "CS101",
    subject_name: "Problem Solving & Data Structures",
    credits: 4,
    category: "Core Engineering",
    units: [
      "Unit 1: Computational Logic, Flowcharts & C Fundamentals",
      "Unit 2: Dynamic Memory Allocation, Pointers & Array Math",
      "Unit 3: Stack, Queue Implementations & Linked List Operations",
      "Unit 4: Binary Trees, BST Traversals & Heaps",
      "Unit 5: Graph Theory, Dijkstra Algorithm & Hashing Techniques"
    ],
    reference_links: ["https://mitopencourseware.com", "https://freecodecamp.org"]
  },
  {
    id: "syl-cse-2",
    department: "Computer Science Engineering (CSE B.E)",
    year: "2nd Year",
    subject_code: "CS201",
    subject_name: "Database Management Systems (DBMS)",
    credits: 4,
    category: "Core Engineering",
    units: [
      "Unit 1: Relational Algebra & ER Modeling",
      "Unit 2: SQL DDL, DML, Joins & Subqueries",
      "Unit 3: Normalization (1NF to BCNF) & Functional Dependencies",
      "Unit 4: Transaction Processing, ACID Properties & Concurrency Control",
      "Unit 5: B-Trees, Indexing & NoSQL Architectures"
    ],
    reference_links: ["https://w3schools.com/sql", "https://youtube.com"]
  },
  {
    id: "syl-aids-1",
    department: "Artificial Intelligence & Data Science (AI & DS)",
    year: "1st Year",
    subject_code: "AD101",
    subject_name: "Foundations of Artificial Intelligence",
    credits: 4,
    category: "Core AI",
    units: [
      "Unit 1: Intelligent Agents & Problem Spaces",
      "Unit 2: Heuristic Search Strategies (A*, Minimax, Alpha-Beta)",
      "Unit 3: Knowledge Representation & First-Order Logic",
      "Unit 4: Probabilistic Reasoning & Bayesian Networks",
      "Unit 5: Introduction to Neural Networks & Reinforcement Learning"
    ],
    reference_links: ["https://ai.stanford.edu", "https://deeplearning.ai"]
  },
  {
    id: "syl-ece-1",
    department: "Electronics & Communication (ECE)",
    year: "1st Year",
    subject_code: "EC101",
    subject_name: "Digital Electronics & Signals",
    credits: 4,
    category: "Core Circuits",
    units: [
      "Unit 1: Boolean Algebra & Logic Gate Networks",
      "Unit 2: Combinational Logic (Multiplexers, Decoders, Adders)",
      "Unit 3: Sequential Logic (Flip-Flops, Counters, Shift Registers)",
      "Unit 4: Continuous vs Discrete Signals & Fourier Transforms",
      "Unit 5: Microcontroller Architecture (8051 & STM32 Basics)"
    ],
    reference_links: ["https://nptel.ac.in"]
  }
];

app.get('/api/syllabus', async (req, res) => {
  const { department, year } = req.query;
  const db = await readDB();
  
  if (!db.syllabus || db.syllabus.length === 0) {
    db.syllabus = defaultSyllabusSeed;
    await writeDB(db);
  }

  let result = db.syllabus;
  if (department && department !== 'All') {
    result = result.filter(s => s.department === department || s.department.includes(department));
  }
  if (year && year !== 'All') {
    result = result.filter(s => s.year === year);
  }

  res.json({ syllabus: result });
});

app.post('/api/syllabus/manage', async (req, res) => {
  const { id, department, year, subject_code, subject_name, credits, category, units, reference_links, syllabus_image_url } = req.body;
  if (!department || !year) {
    return res.status(400).json({ error: "Department and academic year are required." });
  }

  const db = await readDB();
  if (!db.syllabus) db.syllabus = defaultSyllabusSeed;

  let targetSubject;
  if (id) {
    const idx = db.syllabus.findIndex(s => s.id === id);
    if (idx !== -1) {
      db.syllabus[idx] = {
        ...db.syllabus[idx],
        department,
        year,
        subject_code: subject_code || db.syllabus[idx].subject_code,
        subject_name: subject_name || db.syllabus[idx].subject_name,
        credits: credits || 4,
        category: category || "Core",
        units: units || db.syllabus[idx].units,
        reference_links: reference_links || db.syllabus[idx].reference_links,
        syllabus_image_url: syllabus_image_url || db.syllabus[idx].syllabus_image_url
      };
      targetSubject = db.syllabus[idx];
    }
  }

  if (!targetSubject) {
    targetSubject = {
      id: "syl-" + Math.random().toString(36).substr(2, 9),
      department,
      year,
      subject_code: subject_code || `SUB${Math.floor(100 + Math.random() * 900)}`,
      subject_name: subject_name || "Official Course Curriculum & Syllabus Diagram",
      credits: credits || 4,
      category: category || "Core",
      syllabus_image_url: syllabus_image_url || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop",
      units: units || [
        "Unit 1: Computational Logic & Fundamentals",
        "Unit 2: Dynamic Memory Allocation & Algorithms",
        "Unit 3: Data Structures & Core Operations",
        "Unit 4: Advanced Systems & Trees",
        "Unit 5: Real-World Case Studies & Industry Applications"
      ],
      reference_links: reference_links || []
    };
    db.syllabus.push(targetSubject);
  }

  // Push System Broadcast Notification for Students
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift({
    id: "notif-" + Math.random().toString(36).substr(2, 9),
    type: "academic",
    title: `📚 Syllabus Update: ${targetSubject.subject_name}`,
    body: `New Subject & Syllabus curriculum published for ${targetSubject.department} (${targetSubject.year}). Check Academics option!`,
    created_at: new Date().toISOString()
  });

  await writeDB(db);

  // Email Notification to Principal and Department HOD
  const hodEmail = getDepartmentHODEmail(targetSubject.department);
  const emailSubject = `[OFFICIAL SYLLABUS ANNOUNCEMENT] Subject & Syllabus Published: ${targetSubject.subject_name} (${targetSubject.department})`;
  const emailBody = `Dear Principal & HOD,\n\nOfficial Course Syllabus & Subject update published by Admin.\n\nSubject Code: ${targetSubject.subject_code}\nSubject Title: ${targetSubject.subject_name}\nDepartment: ${targetSubject.department}\nAcademic Year: ${targetSubject.year}\nSyllabus Document Image: ${targetSubject.syllabus_image_url || 'Attached'}\n\nThis subject and syllabus record has been automatically synced to all students in ${targetSubject.department}.`;

  sendEmailNotification("principal@college.edu", emailSubject, emailBody).catch(err => console.error("Principal email fail:", err));
  sendEmailNotification(hodEmail, emailSubject, emailBody).catch(err => console.error("HOD email fail:", err));

  res.json({ success: true, subject: targetSubject });
});

app.post('/api/syllabus/delete', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Subject id is required." });

  const db = await readDB();
  if (!db.syllabus) db.syllabus = [];
  db.syllabus = db.syllabus.filter(s => s.id !== id);
  await writeDB(db);
  res.json({ success: true });
});

/* ==========================================================================
   TODOS ENDPOINTS
   ========================================================================== */

app.get('/api/todo', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id parameter is required." });
  
  const db = await readDB();
  if (!db.todos) db.todos = [];
  
  const userTodos = db.todos.filter(t => t.user_id === user_id);
  res.json({ todos: userTodos });
});

app.post('/api/todo', async (req, res) => {
  const { user_id, text } = req.body;
  if (!user_id || !text) return res.status(400).json({ error: "user_id and text are required." });

  const db = await readDB();
  if (!db.todos) db.todos = [];

  const newTodo = {
    id: "todo-" + Math.random().toString(36).substr(2, 9),
    user_id,
    text: text.trim(),
    completed: false,
    created_at: new Date().toISOString()
  };

  db.todos.push(newTodo);
  await writeDB(db);
  res.json({ success: true, todo: newTodo });
});

app.post('/api/todo/toggle', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "todo id is required." });

  const db = await readDB();
  if (!db.todos) db.todos = [];

  const todo = db.todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ error: "Todo not found." });

  todo.completed = !todo.completed;
  await writeDB(db);
  res.json({ success: true, todo });
});

app.post('/api/todo/delete', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "todo id is required." });

  const db = await readDB();
  if (!db.todos) db.todos = [];

  db.todos = db.todos.filter(t => t.id !== id);
  await writeDB(db);
  res.json({ success: true });
});

/* ==========================================================================
   CAMPUS EVENTS & REGISTRATION ENDPOINTS (With HOD & Principal Email Broadcast)
   ========================================================================== */

app.get('/api/events', async (req, res) => {
  const db = await readDB();
  
  if (!db.events || db.events.length === 0) {
    db.events = [
      {
        id: "ev-1",
        type: "Hackathon",
        title: "Prism Hack 2026: 3D Frontend Challenge",
        description: "Design fluid interactive 3D WebGL interfaces using Three.js and custom shaders. Organized by the CSE Coding Society.",
        organizer: "CSE Dept",
        date_string: "Ongoing (Ends in 4 hrs)",
        is_ongoing: true,
        poster_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop",
        registration_link: ""
      },
      {
        id: "ev-2",
        type: "Symposium",
        title: "Robotics & IoT Showcase",
        description: "Live demonstration of autonomous hardware models and STM32 sensor relays. Organized by ECE Dept.",
        organizer: "ECE Dept",
        date_string: "Ongoing (Live Session)",
        is_ongoing: true,
        poster_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop",
        registration_link: ""
      },
      {
        id: "ev-3",
        type: "Workshop",
        title: "Web3 Smart Contracts & Auditing",
        description: "Learn Solidity compile patterns and test smart contract vulnerabilities. Organized by CSBS Dept.",
        organizer: "CSBS Dept",
        date_string: "July 25",
        is_ongoing: false,
        poster_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop",
        registration_link: "https://ethereum.org"
      }
    ];
    await writeDB(db);
  }

  res.json({ events: db.events });
});

app.post('/api/events', async (req, res) => {
  const { type, title, description, organizer, date_string, registration_link, is_ongoing, poster_url } = req.body;
  if (!title || !description || !organizer) {
    return res.status(400).json({ error: "Title, description, and organizer are required." });
  }

  const db = await readDB();
  if (!db.events) db.events = [];

  const newEvent = {
    id: "ev-" + Math.random().toString(36).substr(2, 9),
    type: type || "General",
    title,
    description,
    organizer,
    date_string: date_string || "TBA",
    is_ongoing: !!is_ongoing,
    poster_url: poster_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop",
    registration_link: registration_link || "",
    created_at: new Date().toISOString()
  };

  db.events.push(newEvent);

  // AUTOMATED BROADCAST NOTIFICATION FOR STUDENTS
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift({
    id: "notif-" + Math.random().toString(36).substr(2, 9),
    type: "event",
    title: `📣 New Event: ${title}`,
    body: `${type} event announced by ${organizer}. Check the Events portal option to view poster and register!`,
    created_at: new Date().toISOString()
  });

  await writeDB(db);

  // AUTOMATED EMAIL BROADCAST TO PRINCIPAL AND ALL DEPARTMENT HODS
  const broadcastRecipients = [
    "principal@college.edu",
    "hod.cse@college.edu",
    "hod.ece@college.edu",
    "hod.aids@college.edu",
    "hod.mech@college.edu",
    "hod.civil@college.edu",
    "hod.csbs@college.edu"
  ];

  const emailSubject = `[OFFICIAL ANNOUNCEMENT] New Campus Event Poster Published: ${title}`;
  const emailBody = `Dear Principal & Department HODs,\n\nA new campus event announcement and poster has been published by ${organizer}.\n\nEvent Title: ${title}\nEvent Type: ${type}\nDate: ${date_string}\nOrganizer: ${organizer}\nPoster URL: ${newEvent.poster_url}\n\nDescription:\n${description}\n\nThis event poster has been automatically published to all student portal views across all departments.`;

  broadcastRecipients.forEach(email => {
    sendEmailNotification(email, emailSubject, emailBody).catch(err => 
      console.error(`Broadcast failed for ${email}:`, err)
    );
  });

  res.json({ success: true, event: newEvent });
});

app.post('/api/events/register', async (req, res) => {
  const { event_id, team_name, members } = req.body;
  if (!event_id || !team_name || !members || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ error: "event_id, team_name, and members array are required." });
  }

  const db = await readDB();
  if (!db.registrations) db.registrations = [];

  const mockDocId = "1" + Math.random().toString(36).substr(2, 12).toUpperCase();
  const mockGoogleDocUrl = `https://docs.google.com/document/d/${mockDocId}/edit?usp=sharing`;

  const registrationRecord = {
    id: "reg-" + Math.random().toString(36).substr(2, 9),
    event_id,
    team_name,
    members: members.map(m => ({
      name: m.name || "",
      class_section: m.class_section || "",
      batch_no: m.batch_no || "",
      email: m.email || ""
    })),
    google_doc_url: mockGoogleDocUrl,
    created_at: new Date().toISOString()
  };

  db.registrations.push(registrationRecord);
  await writeDB(db);

  // Send Resend confirmation to team leader (member 1)
  const leader = members[0];
  if (leader && leader.email) {
    const memberLines = members.map((m, idx) => `Member ${idx + 1}: ${m.name} (${m.class_section}, Batch: ${m.batch_no})`).join('\n');
    sendEmailNotification(
      leader.email,
      `Event Registration Completed - Google Doc Active`,
      `Hello ${leader.name},\n\nYour team "${team_name}" has been registered for the event.\n\nHere is your generated Google Document template containing your team details:\n${mockGoogleDocUrl}\n\nTeam Details:\n${memberLines}\n\nMake sure to review your schedules and check the timetable before the event to obtain On-Duty (OD) attendance credit.\n\nGood luck!`
    ).catch(err => console.error("Event registration email failed:", err));
  }

  res.json({ success: true, google_doc_url: mockGoogleDocUrl });
});

/* ==========================================================================
   STATIC ASSET SERVING & SPA ROUTING FALLBACK
   ========================================================================== */

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
  console.log("⚡ Static frontend assets registered for production SPA redirection.");
}

app.listen(PORT, () => {
  console.log(`🚀 Portal Express Server running on port ${PORT}`);
});

