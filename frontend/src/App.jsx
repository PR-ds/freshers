import React, { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user exist in local storage on page mount
    const savedUser = localStorage.getItem('portal_user');
    const token = localStorage.getItem('portal_token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleOnboardingComplete = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkBg">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading Fresher Portal context...</p>
        </div>
      </div>
    );
  }

  // Router layout conditions
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Auth onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  if (!user.onboarding_completed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-wide">Configure Your Learning Roadmap</h2>
          <p className="text-xs text-slate-400 mt-1">Let us target your goals and interests to design your 3D graph tracker.</p>
        </div>
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <Dashboard user={user} onLogout={handleLogout} />
  );
}
