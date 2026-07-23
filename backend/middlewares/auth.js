const { supabase, isMockDB } = require('../config/supabase');

exports.requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  // Mock token validation support
  if (isMockDB || token === 'mock-session-jwt' || token === 'demo-user-id') {
    req.user = { id: 'demo-user-id', email: 'demo@college.edu' };
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Auth service error.' });
  }
};
