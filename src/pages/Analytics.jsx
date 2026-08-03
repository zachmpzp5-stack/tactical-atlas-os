import React from 'react';
import { BarChart2 } from 'lucide-react';

export default function Analytics() {
  const weeklyData = [
    { day: 'MON', count: 12 },
    { day: 'TUE', count: 19 },
    { day: 'WED', count: 15 },
    { day: 'THU', count: 24 },
    { day: 'FRI', count: 22 },
    { day: 'SAT', count: 30 },
    { day: 'SUN', count: 28 },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-bronze-gold" />
            ANALYTICS // INSIGHTS & METRICS
          </h1>
          <p className="text-slate-400 mt-1">PUBLISHING PERFORMANCE AND RESEARCH REACH METRICS</p>
        </div>
        <div className="px-3 py-1 bg-stone-bg border border-stone-border text-bronze-gold font-bold rounded">
          WEEKLY OUTPUT: 18 EPISODES
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-panel border border-stone-border p-3 rounded">
          <span className="text-[10px] text-slate-400 block">TOTAL VIEWS</span>
          <span className="font-display font-bold text-lg text-slate-100">1.42M</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-3 rounded">
          <span className="text-[10px] text-slate-400 block">FOLLOWERS</span>
          <span className="font-display font-bold text-lg text-tactical-glow">184.2K</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-3 rounded">
          <span className="text-[10px] text-slate-400 block">AVG WATCH TIME</span>
          <span className="font-display font-bold text-lg text-bronze-gold">48.2s</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-3 rounded">
          <span className="text-[10px] text-slate-400 block">COMPLETION RATE</span>
          <span className="font-display font-bold text-lg text-slate-100">74.8%</span>
        </div>
      </div>

      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg space-y-3">
        <h3 className="font-serif font-bold text-xs text-slate-100 uppercase">
          WEEKLY EPISODE OUTPUT CHART
        </h3>

        <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2 bg-stone-bg border border-stone-border rounded">
          {weeklyData.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div
                className="w-full bg-bronze-gold/80 hover:bg-bronze-gold rounded-t transition-all"
                style={{ height: `${(d.count / 30) * 100}%` }}
              />
              <span className="text-[9px] text-slate-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
