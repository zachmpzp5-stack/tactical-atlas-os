import React from 'react';
import { PIPELINE_STEPS } from '../data/mockData';

export default function ProductionPipeline() {
  return (
    <div className="black-glass rounded-lg p-4 shadow-2xl">
      <h3 className="font-serif font-bold text-xs sm:text-sm tracking-wider text-slate-100 uppercase mb-0.5 text-glow-green">
        PRODUCTION PIPELINE
      </h3>
      <span className="font-mono text-[9px] text-bronze-gold uppercase block mb-3">
        CONTENT CREATION WORKFLOW STAGES
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PIPELINE_STEPS.map((s) => (
          <div
            key={s.step}
            className="bg-[#07110d] border border-stone-border rounded p-2.5 font-mono shadow-[inset_0_0_0_1px_rgba(16,185,129,0.05)]"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-300 font-bold">{s.step}</span>
              <span className="text-[9px] text-tactical-glow">{s.progress}%</span>
            </div>
            <div className="w-full h-1 bg-stone-border rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-tactical-green to-tactical-glow transition-all"
                style={{ width: `${s.progress}%` }}
              ></div>
            </div>
            <div className="mt-1 text-[8px] text-slate-500">STATUS // {s.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
