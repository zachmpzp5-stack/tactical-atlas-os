import React from 'react';
import { Globe, Radio } from 'lucide-react';
import { EXPEDITION_LOCATIONS } from '../data/mockData';

export default function ResearchNetwork() {
  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Globe className="w-5 h-5 text-bronze-gold" />
            RESEARCH NETWORK // GLOBAL INTELLIGENCE NODES
          </h1>
          <p className="text-slate-400 mt-1">12 GLOBAL INVESTIGATION NODES SYNCHRONIZED</p>
        </div>
        <div className="px-3 py-1 bg-stone-bg border border-stone-border text-tactical-glow font-bold rounded">
          NETWORK STATUS: OPTIMAL
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPEDITION_LOCATIONS.map((loc) => (
          <div
            key={loc.id}
            className="bg-stone-panel border border-stone-border rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-bronze-gold">{loc.category}</span>
              <span className="text-tactical-glow">{loc.progress}%</span>
            </div>
            <h3 className="font-serif font-bold text-sm text-slate-100">{loc.name}</h3>
            <p className="text-[10px] text-slate-400">REGION: {loc.sub}</p>
            <div className="pt-2 border-t border-stone-border/60 flex justify-between items-center text-[9px] text-slate-500">
              <span>STATUS: {loc.status}</span>
              <Radio className="w-3.5 h-3.5 text-tactical-green animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
