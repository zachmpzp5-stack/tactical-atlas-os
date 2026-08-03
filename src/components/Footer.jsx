import React from 'react';
import { Compass, Database, Shield } from 'lucide-react';
import { SYSTEM_STATUS } from '../data/mockData';

export default function Footer() {
  return (
    <footer className="bg-stone-panel border-t border-stone-border py-2 px-4 sm:px-6 text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-20">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-bronze-gold" />
          SYSTEM: <span className="text-slate-300">TACTICAL ATLAS OS v3.0</span>
        </span>
        <span className="hidden md:flex items-center gap-1">
          <Database className="w-3 h-3 text-tactical-green" />
          ACTIVE CASES: <span className="text-slate-300">{SYSTEM_STATUS.activeCases}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Shield className="w-3 h-3 text-bronze-gold" />
        <span className="tracking-widest text-slate-400 uppercase">
          CLASSIFIED RESEARCH NETWORK // AUTHORIZED EYES ONLY
        </span>
      </div>
    </footer>
  );
}
