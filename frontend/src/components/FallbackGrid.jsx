import React from 'react';

export default function FallbackGrid({ nodes = [], onNodeClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'mastered': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'learning': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'gap': return 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {nodes.map(node => (
          <div
            key={node.id}
            onClick={() => onNodeClick(node)}
            className="p-4 rounded-xl border border-white/10 bg-slate-900/40 hover:bg-slate-800/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <h4 className="font-semibold text-white mb-1">{node.label}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{node.details || 'Explore this skill module.'}</p>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(node.status)}`}>
                {capitalize(node.status)}
              </span>
              <span className="text-[10px] text-purple-400 hover:underline">Inspect details &rarr;</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 w-fit">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
          <span>Mastered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block" />
          <span>Learning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
          <span>Gap / Target</span>
        </div>
      </div>
    </div>
  );
}
