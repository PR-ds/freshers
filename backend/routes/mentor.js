const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { requireAuth } = require('../middlewares/auth');
const { apiLimiter } = require('../middlewares/rateLimiter');
const { queryGemini } = require('../services/gemini');

// Send chat message to AI Mentor
router.post('/chat', requireAuth, apiLimiter, async (req, res) => {
  const userId = req.user.id;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    // 1. Fetch student profile details to provide system context
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('domain_track, learning_style, academic_interests')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    // 2. Fetch recent knowledge graph nodes as visual learning state context
    const { data: graph } = await supabase
      .from('knowledge_graphs')
      .select('nodes')
      .eq('profile_id', userId)
      .single();

    const missingTopics = graph?.nodes
      ? graph.nodes.filter(n => n.status === 'gap').map(n => n.label).join(', ')
      : 'None identified yet';

    // 3. Setup system instruction targeting the domain and knowledge state
    const systemPrompt = `You are a growth-focused AI Academic Mentor for a college fresher.
Student Context:
- Academic Track: ${profile.domain_track || 'General CSE'}
- Interests: ${profile.academic_interests?.join(', ') || 'Computer Science'}
- Learning Style: ${profile.learning_style || 'Balanced'}
- Identified Skill Gaps: ${missingTopics}

Rules:
- Keep your answer direct and under 150 words.
- Focus on explaining core concepts, coding principles, and logical tips.
- Do not write long blocks of code; write quick snippets when necessary.
- Ask questions at the end to prompt critical thinking and active recall.`;

    // 4. Query Gemini
    const mentorResponse = await queryGemini(message, systemPrompt, 'text');

    return res.status(200).json({
      response: mentorResponse
    });

  } catch (err) {
    return res.status(500).json({ error: 'Mentor Chat failed: ' + err.message });
  }
});

module.exports = router;
