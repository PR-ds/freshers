import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import { api } from '../services/api';
import { Sparkles, Check, ArrowRight, BrainCircuit } from 'lucide-react';

const INTERESTS_OPTIONS = [
  'Web Development', 'Data Science & Analytics', 'Artificial Intelligence & ML', 
  'Cloud Computing & DevOps', 'Cybersecurity', 'Mobile App Development', 'Game Design'
];

const STYLE_OPTIONS = [
  { value: 'Visual', label: 'Visual (Diagrams, charts, 3D animations)' },
  { value: 'Auditory', label: 'Auditory (Lectures, speech explanations, videos)' },
  { value: 'Reading', label: 'Reading & Writing (Textbooks, documentations, scripts)' },
  { value: 'Kinesthetic', label: 'Kinesthetic (Code sandboxes, interactive challenges)' }
];

const GOAL_OPTIONS = [
  'Full Stack Software Developer', 'AI/ML Research Scientist', 
  'DevOps Cloud Architect', 'Cybersecurity Expert', 'Product Lead / Tech Founder'
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0 || !selectedStyle || selectedGoals.length === 0) {
      setError('Please fill in all options before finalizing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userStr = localStorage.getItem('portal_user');
      const user = userStr ? JSON.parse(userStr) : {};
      
      const payload = {
        roll_no: user.roll_no || '2026MOCK',
        batch_no: user.batch_no || 'MOCK-2026',
        academic_interests: selectedInterests,
        learning_style: selectedStyle,
        career_goals: selectedGoals
      };

      const result = await api.submitOnboarding(payload);
      
      // Update local storage status
      const updatedUser = { ...user, onboarding_completed: true, domain_track: result.domain_track };
      localStorage.setItem('portal_user', JSON.stringify(updatedUser));
      
      onComplete(updatedUser);
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Step Indicator Header */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/5 z-0" />
        {[1, 2, 3].map(num => (
          <button 
            key={num}
            onClick={() => num < step && setStep(num)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border relative z-10 transition-all ${
              step === num 
                ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-500/20' 
                : step > num 
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-400' 
                  : 'bg-slate-900 border-white/10 text-slate-500'
            }`}
          >
            {step > num ? <Check className="h-4 w-4" /> : num}
          </button>
        ))}
      </div>

      <GlassCard className="relative" glow={step === 3}>
        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-300">
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">What are your primary academic interests?</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">Select topics you want to explore or deepen during college.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {INTERESTS_OPTIONS.map(interest => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-all flex justify-between items-center ${
                      isSelected 
                        ? 'bg-purple-900/20 border-purple-500 text-white font-medium' 
                        : 'bg-slate-950/30 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <span>{interest}</span>
                    {isSelected && <span className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-[10px]">&check;</span>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => selectedInterests.length > 0 ? setStep(2) : setError('Select at least one interest.')}
              className="ml-auto flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs px-5 py-2.5 rounded-xl font-semibold transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="h-5 w-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Choose your preferred learning style</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6 font-light">This matches resource formats and study layouts on your personal dashboard.</p>

            <div className="space-y-3 mb-8">
              {STYLE_OPTIONS.map(style => {
                const isSelected = selectedStyle === style.value;
                return (
                  <button
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value)}
                    className={`w-full p-4 rounded-xl border text-left text-xs transition-all flex justify-between items-center ${
                      isSelected 
                        ? 'bg-cyan-950/30 border-cyan-500 text-white font-medium' 
                        : 'bg-slate-950/30 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <span>{style.label}</span>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:underline">Back</button>
              <button
                onClick={() => selectedStyle ? setStep(3) : setError('Select a learning style.')}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs px-5 py-2.5 rounded-xl font-semibold transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">Select your primary career goals</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6 font-light">We will configure node objectives, club suggestions, and mentor context based on these milestones.</p>

            <div className="space-y-3 mb-8">
              {GOAL_OPTIONS.map(goal => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex justify-between items-center ${
                      isSelected 
                        ? 'bg-emerald-950/20 border-emerald-500 text-white font-medium' 
                        : 'bg-slate-950/30 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && <span className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[10px]">&check;</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep(2)} className="text-xs text-slate-500 hover:underline">Back</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {loading ? 'Initializing Path Planning...' : 'Finalize Profile & Plan Roadmap'}
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
