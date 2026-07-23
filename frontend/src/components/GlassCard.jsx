import React from 'react';

export default function GlassCard({ children, className = '', glow = false }) {
  return (
    <div 
      className={`
        rounded-2xl 
        p-6 
        transition-all 
        duration-300 
        relative 
        overflow-hidden
        ${glow ? 'glass-panel-glow border-purple-500/30' : 'glass-panel'}
        ${className}
      `}
    >
      {/* Subtle overlay shine */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
