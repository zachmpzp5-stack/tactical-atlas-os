import React from 'react';
import {
  Archive,
  BarChart3,
  BookOpenCheck,
  Brush,
  Megaphone,
  Orbit,
  Radar,
  ShieldCheck,
  Waypoints,
} from 'lucide-react';

const agents = [
  { id: 'HOTEL', role: 'Research + Innovation', path: '/research', icon: Radar },
  { id: 'ORBIT', role: 'Digital Operations', path: '/operations', icon: Orbit },
  { id: 'LEGION', role: 'Security + Defense', path: '/status', icon: ShieldCheck },
  { id: 'INSPECTOR', role: 'Verification + Quality', path: '/analytics', icon: BookOpenCheck },
  { id: 'ACADEMY', role: 'Training + Doctrine', path: '/library', icon: Waypoints },
  { id: 'COMMS', role: 'Media + Messaging', path: '/vault', icon: Megaphone },
  { id: 'ARCHIVES', role: 'Knowledge + Memory', path: '/archives', icon: Archive },
  { id: 'PMO', role: 'Mission Control', path: '/operations', icon: BarChart3 },
  { id: 'ATELIER', role: 'Design + Brand', path: '/ai-studio', icon: Brush },
];

export default function TaanNetwork({ onNavigate, statuses = {} }) {
  return (
    <section className="command-panel p-3" aria-labelledby="taan-title">
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-emerald-400/15 pb-2">
        <div>
          <h3 id="taan-title" className="command-title">
            TAAN // AGENT NETWORK
          </h3>
          <p className="command-kicker">Nine governed specialist departments</p>
        </div>
        <span className="status-chip status-chip-green">9 NODES</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-9">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const state = statuses[agent.id] || 'READY';
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => onNavigate(agent.path)}
              className="agent-node group text-left"
              aria-label={`Open ${agent.id}: ${agent.role}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="agent-orb">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#34d399]" />
              </div>
              <strong className="block font-mono text-[10px] tracking-[0.14em] text-slate-100">
                {agent.id}
              </strong>
              <span className="mt-1 block min-h-7 font-mono text-[7px] uppercase leading-3 text-slate-500">
                {agent.role}
              </span>
              <span className="mt-2 block font-mono text-[7px] text-emerald-300">{state}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export { agents as TAAN_AGENTS };
