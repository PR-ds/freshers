const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const onboardingRoutes = require('./routes/onboarding');
const mentorRoutes = require('./routes/mentor');
const compilerRoutes = require('./routes/compiler');
const timetableRoutes = require('./routes/timetable');
const testRoutes = require('./routes/tests');

const { supabase } = require('./config/supabase');
const { requireAuth } = require('./middlewares/auth');
const { queryGemini } = require('./services/gemini');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients
app.use(cors({
  origin: '*', // Allow all in dev, configure strict CORS for production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main Router Declarations
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/compiler', compilerRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/tests', testRoutes);

// --- Notification Endpoints ---

// Get student personalized notification timeline
app.get('/api/notifications', requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', userId)
      .order('scheduled_for', { ascending: false });

    if (error) {
      // Return local cache mocks
      return res.status(200).json([
        { id: 'n-mock-1', title: 'Start Onboarding!', content: 'Complete your profile to map your fresher career track.', type: 'mentor', scheduled_for: new Date().toISOString(), is_read: false }
      ]);
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Trigger Notification Scheduler (Called by cron jobs or Admin webhooks)
app.post('/api/notifications/generate', requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('domain_track, academic_interests')
      .eq('id', userId)
      .single();

    // 2. Fetch upcoming timetable schedules to check if alerts are needed
    const { data: schedule } = await supabase
      .from('timetables')
      .select('subject_name, classroom, day_of_week')
      .eq('batch_no', profile?.batch_no || 'CSE-2026');

    // 3. Single batched query to Gemini to build notifications timeline
    const systemPrompt = `You are a weekly academic notification planner. Analyze the student track and events list and generate 3 custom notifications.
Output Schema JSON format only:
[
  {"title": "String", "content": "String", "type": "deadline" | "event" | "mentor", "scheduled_for": "ISO Timestamp String"}
]`;

    const userPrompt = `Track: ${profile?.domain_track || 'General'}. Schedule context: ${JSON.stringify(schedule || [])}.`;

    const generatedNotifications = await queryGemini(userPrompt, systemPrompt, 'json');

    // 4. Save notifications in database
    const dbPayload = generatedNotifications.map(n => ({
      profile_id: userId,
      title: n.title,
      content: n.content,
      type: n.type,
      scheduled_for: n.scheduled_for || new Date().toISOString(),
      is_read: false
    }));

    await supabase.from('notifications').insert(dbPayload);

    return res.status(200).json({
      message: 'New notifications generated via AI cron simulation!',
      notifications: generatedNotifications
    });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate scheduled notifications: ' + err.message });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- Health Check / Default Root ---
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Online', service: 'Fresher Student Portal Express Backend' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Express Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log('🚀 Student Portal Backend running on https://freshers-portal-9zxf.onrender.com');
});