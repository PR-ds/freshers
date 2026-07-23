const express = require('express');
const router = express.Router();
const { supabase, isMockDB } = require('../config/supabase');
const { otpLimiter, validateCollegeEmail } = require('../middlewares/rateLimiter');

// 1. Request OTP Code
router.post('/otp-request', otpLimiter, validateCollegeEmail, async (req, res) => {
  const { email } = req.body;
  
  if (isMockDB) {
    console.log(`[Mock Auth] OTP requested for ${email}. Code is: 123456`);
    return res.status(200).json({ message: 'Mock OTP code sent! Use code: 123456' });
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'OTP verification code sent to your email.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server authentication error.' });
  }
});

// 2. Verify OTP Code
router.post('/verify-otp', otpLimiter, async (req, res) => {
  const { email, otp, roll_no, batch_no } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP token are required.' });
  }

  try {
    // If in Mock database mode or standard test code used
    if (isMockDB || otp === '123456') {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Ensure profile exists in mock db
      const profileResult = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      let profile = profileResult.data;
      if (!profile) {
        const { data: newProfile } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          roll_no: roll_no || 'MOCK-ROLL',
          batch_no: batch_no || 'MOCK-BATCH',
          onboarding_completed: false
        }).select().single();
        profile = newProfile;
      }

      return res.status(200).json({
        message: 'Authentication successful.',
        token: data.session?.access_token || 'mock-session-jwt',
        user: {
          id: data.user.id,
          email: data.user.email,
          onboarding_completed: profile?.onboarding_completed || false
        }
      });
    }

    // Production flow
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Check if user profile already exists
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // If profile does not exist, create it using credentials provided during signup
    if (!profile) {
      const { data: newProfile, error: profileErr } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          roll_no: roll_no || 'TBD',
          batch_no: batch_no || 'TBD',
          onboarding_completed: false
        })
        .select()
        .single();

      if (profileErr) {
        return res.status(500).json({ error: 'Failed to initialize student profile: ' + profileErr.message });
      }
      profile = newProfile;
    }

    return res.status(200).json({
      message: 'Authentication successful.',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        onboarding_completed: profile.onboarding_completed
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed. ' + err.message });
  }
});

module.exports = router;
