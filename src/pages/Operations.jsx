import React from 'react';
import ProductionPipeline from '../components/ProductionPipeline';
import { CASE_FILES_EXPANDED } from '../data/mockData';
import { Compass } from 'lucide-react';

export default function Operations() {
  const stages = ['Research', 'Writing', 'Narration', 'Visuals', 'Editing', 'Publishing'];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Compass className="w-5 h-5 text-bronze-gold" />
            OPERATIONS // MISSION CONTROL
          </h1>
          <p className="text-slate-400 mt-1">
            ACTIVE INVESTIGATION PIPELINE & PRODUCTION TIMELINES
          </p>
        </div>
        <div className="px-3 py-1.5 bg-stone-bg border border-stone-border rounded text-tactical-glow font-bold">
          6 ACTIVE EXPEDITION STAGES
        </div>
      </div>

      <ProductionPipeline />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-2">
        {stages.map((stage) => {
          const items = CASE_FILES_EXPANDED.filter((c) => c.stage === stage);
          return (
            <div
              key={stage}
              className="bg-stone-panel border border-stone-border rounded p-3 min-w-[200px]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-stone-border mb-3">
                <span className="font-bold text-slate-200 text-[11px] uppercase">{stage}</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-stone-bg border border-stone-border rounded text-bronze-gold">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic text-center py-4">
                    No active cases
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-stone-bg border border-stone-border rounded space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-100">{item.title}</span>
                        <span className="text-[8px] text-tactical-glow">{item.progress}%</span>
                      </div>
                      <p className="text-[9px] text-slate-400 line-clamp-1">{item.subtitle}</p>
                      <div className="flex justify-between text-[8px] text-slate-500 pt-1 border-t border-stone-border/40">
                        <span>{item.owner}</span>
                        <span>{item.lastUpdated}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
