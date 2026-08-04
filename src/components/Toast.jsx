import React from 'react';
import { Info } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-10 right-6 z-50 bg-stone-panel border border-bronze-gold shadow-bronze px-4 py-2.5 rounded font-mono text-xs text-slate-100 flex items-center gap-2 animate-bounce">
      <Info className="w-4 h-4 text-bronze-gold flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
