const rateLimit = require('express-rate-limit');
const dns = require('dns').promises;

// Limit OTP verification requests
exports.otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // max 5 OTP requests per 15 minutes per IP
  message: { error: 'Too many requests. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Limit general chat and compiler runs to save credits
exports.apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // max 30 requests per minute
  message: { error: 'Rate limit exceeded. Please wait before executing more requests.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Domain checker middleware
exports.validateCollegeEmail = async (req, res, next) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const domain = email.split('@')[1].toLowerCase();

  // For testing/mocking, allow standard test emails
  if (domain === 'college.edu' || domain === 'test.com' || domain === 'localhost' || domain === 'gmail.com') {
    return next();
  }

  try {
    // Perform MX record lookup to ensure it is a real email server
    const mx = await dns.resolveMx(domain);
    if (!mx || mx.length === 0) {
      return res.status(400).json({ error: 'Email domain has no valid mail servers.' });
    }

    // List of allowed academic domains (can be dynamic, here coded for demo)
    const allowed = ['college.edu', 'university.edu', 'mit.edu', 'stanford.edu', 'iiit.ac.in', 'iit.ac.in'];
    const isAcademic = allowed.some(d => domain.endsWith(d));
    if (!isAcademic) {
      return res.status(403).json({ error: 'Access restricted to approved university domains.' });
    }

    next();
  } catch (err) {
    console.error('Domain check failed:', err);
    // If external DNS resolver fails, fallback to strict domain list check
    const allowed = ['college.edu', 'university.edu', 'mit.edu', 'stanford.edu', 'iiit.ac.in', 'iit.ac.in'];
    const isAllowed = allowed.some(d => domain.endsWith(d));
    if (isAllowed) {
      return next();
    }
    return res.status(400).json({ error: 'Failed to verify email domain MX records.' });
  }
};
