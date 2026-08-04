import React from 'react';

export default function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-tactical-green/40 bg-tactical-dim/40 text-tactical-glow font-mono text-[10px] font-bold uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-tactical-green animate-pulse"></span>
      {status}
    </span>
  );
}
