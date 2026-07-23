const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { requireAuth } = require('../middlewares/auth');
const { queryGemini } = require('../services/gemini');

// Submit student profile questionnaire
router.post('/submit-profile', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { roll_no, batch_no, academic_interests, career_goals, learning_style } = req.body;

  if (!roll_no || !batch_no) {
    return res.status(400).json({ error: 'Roll number and Batch number are required.' });
  }

  try {
    // 1. Save data into the student profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: req.user.email,
        roll_no,
        batch_no,
        academic_interests: academic_interests || [],
        career_goals: career_goals || [],
        learning_style: learning_style || 'General',
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileErr) {
      return res.status(500).json({ error: 'Profile save failed: ' + profileErr.message });
    }

    // 2. Query Gemini in one single optimized token call to plan domain track and initial knowledge graph nodes
    const systemPrompt = `You are an Academic Path Planner for college freshers. Analyze this onboarding profile and produce a structured learning path.
Strict JSON output format only:
{
  "domain_track": "String",
  "recommended_clubs": ["String"],
  "initial_nodes": [{"id": "String", "label": "String", "status": "learning", "details": "String"}],
  "initial_edges": [{"source": "String", "target": "String"}]
}`;

    const userPrompt = `Interests: ${JSON.stringify(academic_interests)}. Goals: ${JSON.stringify(career_goals)}. Learning Style: ${learning_style}.`;

    const aiPlan = await queryGemini(userPrompt, systemPrompt, 'json');

    // 3. Store the AI-generated domain track recommendation
    await supabase
      .from('profiles')
      .update({ domain_track: aiPlan.domain_track })
      .eq('id', userId);

    // 4. Store initial knowledge graph and learning roadmap
    const { error: graphErr } = await supabase
      .from('knowledge_graphs')
      .upsert({
        profile_id: userId,
        nodes: aiPlan.initial_nodes || [],
        edges: aiPlan.initial_edges || [],
        improvement_plan: [
          { step: `Join ${aiPlan.recommended_clubs?.[0] || 'Domain Circles'} and download starter materials.`, resource: 'Campus Hub', eta_days: 3 },
          { step: 'Review the base node in your interactive 3D Skill Graph.', resource: 'Graph Module', eta_days: 5 }
        ],
        updated_at: new Date().toISOString()
      });

    if (graphErr) {
      console.error('Graph init failed:', graphErr.message);
    }

    return res.status(200).json({
      message: 'Onboarding completed and learning track mapped!',
      domain_track: aiPlan.domain_track,
      recommended_clubs: aiPlan.recommended_clubs,
      graph: {
        nodes: aiPlan.initial_nodes,
        edges: aiPlan.initial_edges
      }
    });

  } catch (err) {
    return res.status(500).json({ error: 'Onboarding processing failed: ' + err.message });
  }
});

module.exports = router;
