const BASE_URL = 'http://localhost:5000/api';

// Utility helper to load auth header
function getAuthHeader() {
  const token = localStorage.getItem('portal_token') || 'demo-user-id';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Global request wrapper that catches failure and returns fallback mock data
async function request(endpoint, options = {}, mockFallback) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeader(),
        ...options.headers
      }
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}`);
    }
    
    return await res.json();
  } catch (err) {
    console.warn(`[API Offline Fallback] Direct request to ${endpoint} failed. Using frontend mock. Error:`, err.message);
    
    if (mockFallback !== undefined) {
      // Simulate network lag
      await new Promise(resolve => setTimeout(resolve, 600));
      return typeof mockFallback === 'function' ? mockFallback() : mockFallback;
    }
    throw err;
  }
}

export const api = {
  // Authentication
  otpRequest: async (email) => {
    return request('/auth/otp-request', {
      method: 'POST',
      body: JSON.stringify({ email })
    }, { message: 'Mock OTP sent! Use verification code: 123456' });
  },

  verifyOtp: async (email, otp, roll_no, batch_no) => {
    return request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, roll_no, batch_no })
    }, () => {
      if (otp !== '123456' && otp !== '000000') {
        throw new Error('Invalid OTP. Use 123456 for mock mode.');
      }
      return {
        token: 'mock-session-jwt',
        user: { id: 'demo-user-id', email, onboarding_completed: false }
      };
    });
  },

  // Onboarding
  submitOnboarding: async (data) => {
    return request('/onboarding/submit-profile', {
      method: 'POST',
      body: JSON.stringify(data)
    }, {
      message: 'Onboarding completed and learning track mapped!',
      domain_track: data.academic_interests?.includes('Data') ? 'Data Science & Machine Learning' : 'Web Development & Cloud Computing',
      recommended_clubs: ['Coding Club (DevGeeks)', 'Open Source Guild'],
      graph: {
        nodes: [
          { id: 'git', label: 'Git & GitHub Basics', status: 'learning', details: 'Master commits, branches, and PRs.' },
          { id: 'html_css', label: 'HTML/CSS Semantics', status: 'mastered', details: 'Build modern responsive layouts.' },
          { id: 'js_async', label: 'Asynchronous JavaScript', status: 'gap', details: 'Understand Promises, event loop, and async/await.' }
        ],
        edges: [
          { source: 'html_css', target: 'js_async' }
        ]
      }
    });
  },

  // Mentor Chat
  sendMentorMessage: async (message) => {
    return request('/mentor/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    }, () => {
      const q = message.toLowerCase();
      if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
        return { response: 'Hello! I am your AI Academic Mentor. Welcome to your fresher year! Ask me anything about your domain track or how to check your timetable.' };
      }
      if (q.includes('index') || q.includes('indexing')) {
        return { response: 'A database index is like a book index. It allows searching for specific rows quickly. B-Trees are typically used for this purpose to decrease retrieval complexity from O(N) to O(log N).' };
      }
      return { response: `I received: "${message}". I recommend reviewing your learning path or attempting this weekend quiz to clear active gaps.` };
    });
  },

  // Online Compiler
  compileCode: async (language, code, input = '') => {
    return request('/compiler/execute', {
      method: 'POST',
      body: JSON.stringify({ language, code, input })
    }, () => {
      const clean = code.toLowerCase();
      let stdout = 'Code executed successfully.';
      if (clean.includes('hello')) stdout = 'Hello, World!';
      else if (clean.includes('fib')) stdout = '0, 1, 1, 2, 3, 5, 8, 13';
      return { stdout, stderr: '', status: 'completed' };
    });
  },

  // Timetable
  getTimetable: async () => {
    return request('/timetable/my-timetable', { method: 'GET' }, {
      batch_no: 'CSE-2026',
      schedule: [
        { id: 't1', day_of_week: 1, start_time: '09:00', end_time: '10:30', subject_name: 'Data Structures', classroom: 'Block C - Room 302', faculty_records: { name: 'Dr. Jane Smith', email: 'jsmith@college.edu', office_hours: 'Mon 2-4 PM' } },
        { id: 't2', day_of_week: 1, start_time: '11:00', end_time: '12:30', subject_name: 'Database Systems', classroom: 'Block C - Room 401', faculty_records: { name: 'Prof. Alan Turing', email: 'aturing@college.edu', office_hours: 'Wed 10-12 AM' } },
        { id: 't3', day_of_week: 2, start_time: '10:00', end_time: '11:30', subject_name: 'Computer Networks', classroom: 'Block D - Room 102', faculty_records: { name: 'Dr. Robert Kahn', email: 'rkahn@college.edu', office_hours: 'Tue 3-5 PM' } },
        { id: 't4', day_of_week: 3, start_time: '09:00', end_time: '10:30', subject_name: 'Discrete Mathematics', classroom: 'Block A - Room 201', faculty_records: { name: 'Dr. Grace Hopper', email: 'ghopper@college.edu', office_hours: 'Thu 1-3 PM' } },
        { id: 't5', day_of_week: 4, start_time: '14:00', end_time: '15:30', subject_name: 'Web Engineering Lab', classroom: 'Block C - Lab 5', faculty_records: { name: 'Prof. Tim Berners-Lee', email: 'tbl@college.edu', office_hours: 'Fri 10-12 AM' } }
      ]
    });
  },

  // Assessments
  getQuizzes: async () => {
    return request('/tests/list', { method: 'GET' }, [
      {
        id: 'test-sql-1',
        title: 'Database Joins & Keys',
        description: 'Check your knowledge about Primary/Foreign Keys and Relational Joins.',
        questions: [
          { question: 'Which SQL join returns all rows from the left table?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'], answer_index: 1 },
          { question: 'What type of key uniquely identifies a record in a table?', options: ['Foreign Key', 'Primary Key', 'Super Key', 'Composite Key'], answer_index: 1 },
          { question: 'Which index is created automatically when a primary key is defined?', options: ['Clustered Index', 'Non-Clustered Index', 'Unique Index', 'Bitmap Index'], answer_index: 0 }
        ],
        category_name: 'SQL & DB'
      }
    ]);
  },

  submitQuiz: async (assessmentId, score, totalQuestions, answers, categoryName) => {
    return request('/tests/submit', {
      method: 'POST',
      body: JSON.stringify({ assessment_id: assessmentId, score, total_questions: totalQuestions, answers, category_name: categoryName })
    }, {
      message: 'Test submitted and graph updated successfully!',
      score,
      total_questions: totalQuestions,
      new_graph: {
        nodes: [
          { id: 'html', label: 'HTML & CSS', status: 'mastered' },
          { id: 'js', label: 'JavaScript Essentials', status: 'learning' },
          { id: 'three', label: 'Three.js & Canvas', status: 'gap' }
        ],
        edges: [
          { source: 'html', target: 'js' },
          { source: 'js', target: 'three' }
        ]
      },
      improvement_plan: [
        { step: 'Practise Left Outer and Full Outer joins interactive questions', resource: 'SQLBolt Lesson 6 & 7', eta_days: 2 },
        { step: 'Watch database indexing visuals guide', resource: 'YouTube database guides', eta_days: 3 }
      ]
    });
  },

  // Notifications
  getNotifications: async () => {
    return request('/notifications', { method: 'GET' }, [
      { id: 'n-mock-1', title: 'Complete Onboarding', content: 'Tell us about your learning style to plan your tracks.', type: 'mentor', scheduled_for: new Date().toISOString(), is_read: false },
      { id: 'n-mock-2', title: 'Lab Timetable Updated', content: 'Web Dev Lab time shifted to Friday 2PM.', type: 'event', scheduled_for: new Date(Date.now() - 3600000).toISOString(), is_read: true }
    ]);
  },

  triggerNotificationCron: async () => {
    return request('/notifications/generate', { method: 'POST' }, {
      message: 'New notifications generated via AI cron simulation!',
      notifications: [
        { title: 'Study Target: Three.js', content: 'You have a gap in Three.js & Canvas. Try implementing a spinning cube.', type: 'mentor', scheduled_for: new Date().toISOString() }
      ]
    });
  },

  markNotificationRead: async (id) => {
    return request(`/notifications/${id}/read`, { method: 'PUT' }, { success: true });
  }
};
