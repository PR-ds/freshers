const axios = require('axios');
const crypto = require('crypto');
const { supabase } = require('../config/supabase');

// Simple in-memory AI cache for offline/mock mode
const memoryCache = new Map();

// Helper to calculate prompt hash
function getQueryHash(prompt) {
  return crypto.createHash('md5').update(prompt).digest('hex');
}

// Check cache for existing answer
async function checkCache(hash) {
  // Check memory first
  if (memoryCache.has(hash)) {
    const cached = memoryCache.get(hash);
    if (cached.expires_at > Date.now()) {
      return cached.data;
    }
    memoryCache.delete(hash);
  }

  // Check Supabase cache table
  try {
    const { data, error } = await supabase
      .from('ai_response_cache')
      .select('cached_response, expires_at')
      .eq('query_hash', hash)
      .single();

    if (data && new Date(data.expires_at) > new Date()) {
      return data.cached_response;
    }
  } catch (err) {
    // Fail silently, query API if DB cache fails
  }
  return null;
}

// Write answer to cache
async function writeCache(hash, responseData, ttlHours = 24) {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  // Save to memory
  memoryCache.set(hash, {
    data: responseData,
    expires_at: expiresAt.getTime()
  });

  // Save to database
  try {
    await supabase.from('ai_response_cache').upsert({
      query_hash: hash,
      cached_response: responseData,
      expires_at: expiresAt.toISOString()
    });
  } catch (err) {
    // Fail silently
  }
}

// Gemini Caller with backoff
async function queryGemini(prompt, systemPrompt = '', responseType = 'text') {
  const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;
  const hash = getQueryHash(fullPrompt);

  // 1. Check cache first
  const cached = await checkCache(hash);
  if (cached) {
    console.log(`[AI Cache] Cache hit for prompt hash: ${hash}`);
    return cached;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Mock Mode Fallback if API key missing
  if (!apiKey) {
    console.log(`[AI Mock] GEMINI_API_KEY missing. Generating mock responses...`);
    const mockAnswer = generateMockAIResponse(prompt, systemPrompt, responseType);
    await writeCache(hash, mockAnswer);
    return mockAnswer;
  }

  // 3. Official API Call with Exponential Backoff
  let delay = 1000;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config = {
        contents: [{ 
          parts: [{ text: fullPrompt }] 
        }]
      };

      if (responseType === 'json') {
        config.generationConfig = { responseMimeType: 'application/json' };
      }

      // We use the Gemini 1.5 Flash model which has high limits and is cost-effective
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await axios.post(endpoint, config, { timeout: 12000 });

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Malformed response from Gemini API.');
      }

      let textResult = response.data.candidates[0].content.parts[0].text;
      
      let finalResult = textResult;
      if (responseType === 'json') {
        try {
          finalResult = JSON.parse(textResult);
        } catch (jsonErr) {
          // If response had markdown wrapper blocks like ```json ... ```
          const cleanText = textResult.replace(/```json|```/g, '').trim();
          finalResult = JSON.parse(cleanText);
        }
      }

      // Save to cache on success
      await writeCache(hash, finalResult);
      return finalResult;

    } catch (error) {
      const isRateLimit = error.response && error.response.status === 429;
      const isServerError = error.response && error.response.status >= 500;

      if (attempt === maxRetries || (!isRateLimit && !isServerError)) {
        console.error(`Gemini API Call final failure: ${error.message}`);
        // Return a mock answer instead of crashing the server for the user
        return generateMockAIResponse(prompt, systemPrompt, responseType);
      }

      console.warn(`[AI Retrying] Attempt ${attempt} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2.5; // Exponential backoff scaling
    }
  }
}

// High-fidelity fallback AI simulation based on keyword parsing
function generateMockAIResponse(prompt, system, type) {
  const query = prompt.toLowerCase();
  
  if (system.includes('Path Planner') || query.includes('onboarding') || query.includes('interests')) {
    return {
      domain_track: query.includes('python') || query.includes('data') ? 'Data Science & Machine Learning' : 'Web Development & Cloud Computing',
      recommended_clubs: ['Coding Club (DevGeeks)', 'Open Source Guild', 'AI Research Lab'],
      initial_nodes: [
        { id: 'git', label: 'Git & GitHub Basics', status: 'learning', details: 'Master commits, branches, and PRs.' },
        { id: 'html_css', label: 'HTML/CSS Semantics', status: 'mastered', details: 'Build modern responsive layouts.' },
        { id: 'js_async', label: 'Asynchronous JavaScript', status: 'gap', details: 'Understand Promises, event loop, and async/await.' }
      ]
    };
  }

  if (system.includes('Curriculum Designer') || query.includes('test') || query.includes('score')) {
    return {
      graph: {
        nodes: [
          { id: 'core_sql', label: 'SQL Core Queries', status: 'mastered' },
          { id: 'joins', label: 'Relational Joins', status: 'gap' },
          { id: 'indexes', label: 'Query Indexing & Performance', status: 'learning' }
        ],
        edges: [
          { source: 'core_sql', target: 'joins' },
          { source: 'joins', target: 'indexes' }
        ]
      },
      improvement_plan: [
        { step: 'Practice Left Outer and Full Outer joins interactive questions', resource: 'SQLBolt Lesson 6 & 7', eta_days: 2 },
        { step: 'Watch database indexing visuals guide', resource: 'YouTube database guides', eta_days: 3 }
      ]
    };
  }

  if (system.includes('weekly notifications') || query.includes('schedule') || query.includes('deadline')) {
    return [
      { title: 'Study Target: Git branches', content: 'You have a gap in Git commands. Take 20 minutes to read about git rebase.', type: 'mentor', scheduled_for: new Date(Date.now() + 3600000).toISOString() },
      { title: 'Upcoming: CSE-2026 Lab 1', content: 'Database Lab 1 timetable conflict cleared. Meeting is at 10 AM in Block C.', type: 'event', scheduled_for: new Date(Date.now() + 86400000).toISOString() },
      { title: 'Mentor Tip', content: 'Try drawing a manual tree diagram for your routing lessons today.', type: 'general', scheduled_for: new Date(Date.now() + 172800000).toISOString() }
    ];
  }

  // Default Chat response
  if (query.includes('hello') || query.includes('hey') || query.includes('hi')) {
    return "Hello! I am your AI Academic Mentor. I'm excited to guide you in your fresher journey. What subject, track, or project are you working on today?";
  }
  
  if (query.includes('index') || query.includes('indexing')) {
    return "Database indexing is a data structure technique used to quickly locate and access data in a database table. Think of it like an index at the back of a textbook: instead of scanning every page (table scan), you jump directly to the page reference. We create them using B-Trees or Hash indexes to speed up SELECT queries at the cost of slight write overhead.";
  }

  return `I've analyzed your question: "${prompt}". Focus on break-down modules, ask questions on components, and check resources like MDN or your syllabus guides to reinforce learning. Let me know how I can detail this further.`;
}

module.exports = { queryGemini };
