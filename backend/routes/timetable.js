const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { requireAuth } = require('../middlewares/auth');

// Upload and Parse Timetable (Admin authorized, mocked check for demo)
router.post('/upload', requireAuth, async (req, res) => {
  const { batch_no, timetable_entries } = req.body;

  if (!batch_no || !Array.isArray(timetable_entries)) {
    return res.status(400).json({ error: 'Batch number and timetable entries array are required.' });
  }

  // Basic timetable entry format validation
  for (const entry of timetable_entries) {
    const { day_of_week, start_time, end_time, subject_name, classroom } = entry;
    if (day_of_week === undefined || !start_time || !end_time || !subject_name || !classroom) {
      return res.status(400).json({ error: 'Timetable entry missing mandatory attributes: day_of_week, start_time, end_time, subject_name, classroom.' });
    }
    if (day_of_week < 0 || day_of_week > 6) {
      return res.status(400).json({ error: 'Invalid day of week. Must be between 0 and 6.' });
    }
  }

  try {
    // 1. Transaction simulation: clear existing timetable for this batch first
    const { error: deleteErr } = await supabase
      .from('timetables')
      .delete()
      .eq('batch_no', batch_no);

    if (deleteErr) {
      return res.status(500).json({ error: 'Clear existing batch timetable failed: ' + deleteErr.message });
    }

    // 2. Format entries with faculty matching
    const insertData = timetable_entries.map(entry => ({
      batch_no,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      subject_name: entry.subject_name,
      classroom: entry.classroom,
      faculty_id: entry.faculty_id || null
    }));

    // 3. Perform bulk insert
    const { data, error: insertErr } = await supabase
      .from('timetables')
      .insert(insertData)
      .select();

    if (insertErr) {
      return res.status(500).json({ error: 'Bulk insert failed: ' + insertErr.message });
    }

    return res.status(200).json({
      message: 'Timetable updated successfully!',
      count: data?.length || 0
    });

  } catch (err) {
    return res.status(500).json({ error: 'Timetable update execution error: ' + err.message });
  }
});

// Get student personal timetable
router.get('/my-timetable', requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Find user's batch
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('batch_no')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Student batch details not found.' });
    }

    // 2. Select timetables matching batch
    const { data: schedule, error: scheduleErr } = await supabase
      .from('timetables')
      .select('*, faculty_records(*)')
      .eq('batch_no', profile.batch_no)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (scheduleErr) {
      return res.status(500).json({ error: 'Fetch schedule failed: ' + scheduleErr.message });
    }

    return res.status(200).json({
      batch_no: profile.batch_no,
      schedule
    });

  } catch (err) {
    return res.status(500).json({ error: 'Schedule request processing error: ' + err.message });
  }
});

module.exports = router;
