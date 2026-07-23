const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
let isMockDB = false;

// Fallback in-memory database store
const mockDbStore = {
  profiles: {
    'demo-user-id': {
      id: 'demo-user-id',
      email: 'demo@college.edu',
      roll_no: '2026CSE101',
      batch_no: 'CSE-2026',
      academic_interests: ['Algorithms', 'Web Design'],
      domain_track: 'Web Development',
      learning_style: 'Visual',
      career_goals: ['Software Engineer'],
      onboarding_completed: true
    }
  },
  chat_rooms: {
    'room-1': { id: 'room-1', name: 'Web Dev Study Circle', is_group: true }
  },
  chat_room_members: [
    { room_id: 'room-1', profile_id: 'demo-user-id' }
  ],
  messages: [
    { id: 'm1', room_id: 'room-1', sender_id: 'demo-user-id', content: 'Hey everyone, let us check out the 3D Graph layout today!', created_at: new Date().toISOString() }
  ],
  timetables: [
    { id: 't1', batch_no: 'CSE-2026', day_of_week: 1, start_time: '09:00', end_time: '10:30', subject_name: 'Data Structures', classroom: 'Block C - Room 302', faculty_id: 'f1' },
    { id: 't2', batch_no: 'CSE-2026', day_of_week: 1, start_time: '11:00', end_time: '12:30', subject_name: 'Database Systems', classroom: 'Block C - Room 401', faculty_id: 'f2' }
  ],
  faculty_records: {
    'f1': { id: 'f1', name: 'Dr. Jane Smith', email: 'janesmith@college.edu', office_hours: 'Mon 2-4 PM', department: 'CSE', classroom_location: 'Block C - Room 302' },
    'f2': { id: 'f2', name: 'Prof. Alan Turing', email: 'aturing@college.edu', office_hours: 'Wed 10-12 AM', department: 'CSE', classroom_location: 'Block C - Room 401' }
  },
  test_results: {},
  knowledge_graphs: {
    'demo-user-id': {
      profile_id: 'demo-user-id',
      nodes: [
        { id: 'html', label: 'HTML & CSS', status: 'mastered' },
        { id: 'js', label: 'JavaScript Essentials', status: 'learning' },
        { id: 'three', label: 'Three.js & Canvas', status: 'gap' }
      ],
      edges: [
        { source: 'html', target: 'js' },
        { source: 'js', target: 'three' }
      ],
      improvement_plan: [
        { step: 'Complete standard DOM operations exercises', resource: 'MDN Tutorials', eta_days: 2 },
        { step: 'Create a simple Canvas spinning square', resource: 'Three.js documentation', eta_days: 4 }
      ]
    }
  },
  notifications: [
    { id: 'n1', profile_id: 'demo-user-id', title: 'Welcome!', content: 'Welcome to your student onboarding portal.', type: 'general', scheduled_for: new Date().toISOString(), is_read: false }
  ]
};

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing.');
  console.warn('⚡ Running backend in DATABASE MOCK MODE. Data will be saved in volatile server memory.');
  isMockDB = true;

  supabase = {
    auth: {
      signUp: async ({ email, password, options }) => {
        const id = 'user-' + Math.random().toString(36).substr(2, 9);
        const data = { user: { id, email, user_metadata: options?.data || {} } };
        mockDbStore.profiles[id] = { id, email, ...options?.data, onboarding_completed: false };
        return { data, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        const profile = Object.values(mockDbStore.profiles).find(p => p.email === email);
        if (profile) {
          return { data: { user: { id: profile.id, email: profile.email } }, error: null };
        }
        return { data: null, error: { message: 'Invalid credentials in mock DB.' } };
      },
      verifyOtp: async ({ email, token, type }) => {
        if (token === '123456' || token === '000000') {
          let profile = Object.values(mockDbStore.profiles).find(p => p.email === email);
          if (!profile) {
            const id = 'user-' + Math.random().toString(36).substr(2, 9);
            profile = { id, email, roll_no: '2026MOCK', batch_no: 'MOCK-2026', onboarding_completed: false };
            mockDbStore.profiles[id] = profile;
          }
          return { data: { user: { id: profile.id, email: profile.email }, session: { access_token: 'mock-session-jwt' } }, error: null };
        }
        return { data: null, error: { message: 'Invalid mock OTP code. Try 123456.' } };
      }
    },
    from: (table) => {
      const getList = () => {
        const value = mockDbStore[table];
        if (!value) return [];
        return Array.isArray(value) ? value : Object.values(value);
      };

      return {
        select: (cols) => {
          let currentData = getList();
          
          const chain = {
            eq: (col, val) => {
              currentData = currentData.filter(item => item[col] == val);
              return chain;
            },
            order: (col, opts) => {
              currentData.sort((a, b) => {
                if (opts?.ascending) return a[col] > b[col] ? 1 : -1;
                return a[col] < b[col] ? 1 : -1;
              });
              return chain;
            },
            single: async () => {
              if (currentData.length === 0) return { data: null, error: { message: 'Not found' } };
              return { data: currentData[0], error: null };
            },
            then: async (resolve) => {
              resolve({ data: currentData, error: null });
            }
          };
          return chain;
        },
        insert: (data) => {
          const insertData = Array.isArray(data) ? data : [data];
          insertData.forEach(row => {
            if (Array.isArray(mockDbStore[table])) {
              mockDbStore[table].push(row);
            } else {
              const id = row.id || row.profile_id || 'row-' + Math.random().toString(36).substr(2, 9);
              mockDbStore[table][id] = { ...row, id };
            }
          });
          const result = Array.isArray(data) ? insertData : insertData[0];
          return {
            select: () => ({
              single: async () => ({ data: result, error: null })
            }),
            then: async (resolve) => resolve({ data: result, error: null })
          };
        },
        upsert: (data) => {
          const upsertData = Array.isArray(data) ? data : [data];
          upsertData.forEach(row => {
            const key = row.profile_id || row.id;
            if (Array.isArray(mockDbStore[table])) {
              const idx = mockDbStore[table].findIndex(item => item.id === row.id);
              if (idx !== -1) mockDbStore[table][idx] = { ...mockDbStore[table][idx], ...row };
              else mockDbStore[table].push(row);
            } else {
              mockDbStore[table][key] = { ...mockDbStore[table][key], ...row };
            }
          });
          const result = Array.isArray(data) ? upsertData : upsertData[0];
          return {
            select: () => ({
              single: async () => ({ data: result, error: null })
            }),
            then: async (resolve) => resolve({ data: result, error: null })
          };
        },
        update: (data) => {
          return {
            eq: (col, val) => {
              if (Array.isArray(mockDbStore[table])) {
                mockDbStore[table].forEach((item, idx) => {
                  if (item[col] == val) mockDbStore[table][idx] = { ...item, ...data };
                });
              } else {
                Object.keys(mockDbStore[table]).forEach(k => {
                  if (mockDbStore[table][k][col] == val) {
                    mockDbStore[table][k] = { ...mockDbStore[table][k], ...data };
                  }
                });
              }
              return {
                then: async (resolve) => resolve({ data, error: null })
              };
            }
          };
        }
      };
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

module.exports = { supabase, isMockDB, mockDbStore };
