import React from 'react';
import { PIPELINE_STEPS } from '../data/mockData';

export default function ProductionPipeline() {
  return (
    <div className="bg-stone-panel border border-stone-border rounded-lg p-4">
      <h3 className="font-serif font-bold text-xs sm:text-sm tracking-wider text-slate-100 uppercase mb-0.5">
        PRODUCTION PIPELINE
      </h3>
      <span className="font-mono text-[9px] text-bronze-gold uppercase block mb-3">
        CONTENT CREATION WORKFLOW STAGES
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PIPELINE_STEPS.map((s) => (
          <div
            key={s.step}
            className="bg-stone-bg border border-stone-border rounded p-2 font-mono"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-300 font-bold">{s.step}</span>
              <span className="text-[9px] text-tactical-glow">{s.progress}%</span>
            </div>
            <div className="w-full h-1 bg-stone-border rounded overflow-hidden">
              <div
                className="h-full bg-tactical-green transition-all"
                style={{ width: `${s.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
