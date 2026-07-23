const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { requireAuth } = require('../middlewares/auth');
const { queryGemini } = require('../services/gemini');

// Fetch active quizzes/assessments
router.get('/list', requireAuth, async (req, res) => {
  try {
    const { data: list, error } = await supabase
      .from('assessments')
      .select('*');

    if (error) {
      // Fallback mocks
      const fallbackList = [
        {
          id: 'test-sql-1',
          title: 'Database Joins & Keys',
          description: 'A 5-question test to test query parsing and key relations.',
          questions: [
            { question: 'Which SQL join returns all rows from the left table?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'OUTER JOIN'], answer_index: 1 },
            { question: 'What type of key uniquely identifies a record in a table?', options: ['Foreign Key', 'Primary Key', 'Super Key', 'Unique Key'], answer_index: 1 }
          ],
          active_date: new Date().toISOString().split('T')[0]
        }
      ];
      return res.status(200).json(fallbackList);
    }
    return res.status(200).json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Submit test answer and update knowledge graph
router.post('/submit', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { assessment_id, score, total_questions, answers, category_name } = req.body;

  if (!assessment_id || score === undefined || !total_questions) {
    return res.status(400).json({ error: 'Assessment ID, score, and total questions count are required.' });
  }

  try {
    // 1. Save test scores inside Supabase
    const { error: scoreErr } = await supabase
      .from('test_results')
      .upsert({
        profile_id: userId,
        assessment_id,
        score,
        total_questions,
        answers: answers || [],
        created_at: new Date().toISOString()
      });

    if (scoreErr) {
      console.warn('Failed to record score in DB:', scoreErr.message);
    }

    // 2. Fetch student profile domain track
    const { data: profile } = await supabase
      .from('profiles')
      .select('domain_track')
      .eq('id', userId)
      .single();

    // 3. Make single AI call to process skill graphs based on test result
    const systemPrompt = `You are a Curriculum Designer. Evaluate the following quiz performance and update their knowledge graph structure.
Generate the nodes and edges for their Three.js graph visualization.
Output Schema JSON format only:
{
  "graph": {
    "nodes": [{"id": "String", "label": "String", "status": "mastered" | "learning" | "gap"}],
    "edges": [{"source": "String", "target": "String"}]
  },
  "improvement_plan": [{"step": "String", "resource_keyword": "String", "eta_days": Number}]
}`;

    const userPrompt = `Student Track: ${profile?.domain_track || 'General'}. Assessment Category: ${category_name || 'SQL & DB'}. Quiz Score: ${score}/${total_questions}. Answers List: ${JSON.stringify(answers)}.`;

    const graphUpdate = await queryGemini(userPrompt, systemPrompt, 'json');

    // 4. Update student knowledge graph
    const { error: graphErr } = await supabase
      .from('knowledge_graphs')
      .upsert({
        profile_id: userId,
        nodes: graphUpdate.graph?.nodes || [],
        edges: graphUpdate.graph?.edges || [],
        improvement_plan: graphUpdate.improvement_plan || [],
        updated_at: new Date().toISOString()
      });

    if (graphErr) {
      return res.status(500).json({ error: 'Failed to update knowledge graph: ' + graphErr.message });
    }

    return res.status(200).json({
      message: 'Test submitted and graph updated successfully!',
      score,
      total_questions,
      new_graph: graphUpdate.graph,
      improvement_plan: graphUpdate.improvement_plan
    });

  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit test results: ' + err.message });
  }
});

module.exports = router;
