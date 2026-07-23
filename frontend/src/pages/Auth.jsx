import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import { api } from '../services/api';
import { Mail, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Resend OTP countdown timer
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email) {
      setError('Please input a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.otpRequest(email);
      setMessage(res.message);
      setStep('verify');
      setTimer(60); // 60 seconds throttle limit
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!otp) {
      setError('Verification OTP is required.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.verifyOtp(email, otp, rollNo, batchNo);
      localStorage.setItem('portal_token', res.token);
      localStorage.setItem('portal_user', JSON.stringify(res.user));
      
      onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative p-4">
      {/* Visual background ambient circles */}
      <div className="glow-orb glow-purple top-10 left-1/3" />
      <div className="glow-orb glow-cyan bottom-10 right-1/3" />

      <GlassCard className="w-full max-w-md" glow={true}>
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/30 mx-auto mb-3">
            <ShieldCheck className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">College Fresher Portal</h2>
          <p className="text-sm text-slate-400 mt-1">Onboarding, AI Mentorship & Timetables</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-300 flex items-start gap-2 animate-shake">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-5 p-3 rounded-lg border border-green-500/30 bg-green-500/10 text-xs text-green-300 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            <span>{message}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">College Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="e.g. roll_no@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                  required
                />
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Verification OTP is sent to college email domains only.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
            >
              {loading ? 'Requesting Code...' : 'Send Verification OTP'}
            </button>

            <div className="pt-4 border-t border-white/5 text-center">
              <span className="text-[11px] text-slate-500">Demo Key? Use email and code <b>123456</b> to test instantly.</span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Verify Email Address</label>
              <span className="text-xs text-slate-400 font-mono block mb-2">{email}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Roll Number</label>
                <input
                  type="text"
                  placeholder="2026CSE101"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Batch Code</label>
                <input
                  type="text"
                  placeholder="CSE-2026"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Verification Code (OTP)</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-purple-500/50"
                  required
                />
                <UserCheck className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
            >
              {loading ? 'Verifying OTP...' : 'Verify & Enter Portal'}
            </button>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-xs text-purple-400 hover:underline"
              >
                &larr; Change Email
              </button>
              
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={timer > 0 || loading}
                className="text-xs text-slate-400 hover:underline disabled:text-slate-600"
              >
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
