import React, { useState } from 'react';
import { Activity, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SystemStatus({ showToast }) {
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [lastCheck, setLastDiagnostics] = useState('JUST NOW');

  const handleRunDiagnostics = () => {
    setDiagnosticsRunning(true);
    setTimeout(() => {
      setDiagnosticsRunning(false);
      const timeStr = new Date().toUTCString().slice(17, 25) + ' UTC';
      setLastDiagnostics(timeStr);
      if (showToast) showToast('DIAGNOSTIC TEST COMPLETE — ALL RELAYS OPERATIONAL');
    }, 1200);
  };

  const services = [
    { name: 'AI Generation Simulation', status: 'Operational', response: '12ms' },
    { name: 'Local Mock Data Store', status: 'Operational', response: '2ms' },
    { name: 'Netlify Static Relay', status: 'Operational', response: '24ms' },
    { name: 'Charlie Voice Synth Profile', status: 'Operational', response: '18ms' },
    { name: 'Cartographic Map Engine', status: 'Operational', response: '8ms' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Activity className="w-5 h-5 text-tactical-green" />
            SYSTEM STATUS // INFRASTRUCTURE BOARD
          </h1>
          <p className="text-slate-400 mt-1">REAL-TIME SYSTEM DIAGNOSTICS AND RELAY HEALTH</p>
        </div>

        <button
          type="button"
          onClick={handleRunDiagnostics}
          disabled={diagnosticsRunning}
          className="px-3 py-1.5 bg-stone-bg border border-stone-border hover:border-tactical-green rounded text-slate-200 flex items-center gap-1.5"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-tactical-green ${diagnosticsRunning ? 'animate-spin' : ''}`}
          />
          {diagnosticsRunning ? 'TESTING RELAYS...' : 'RUN DIAGNOSTICS'}
        </button>
      </div>

      <div className="p-2 bg-stone-bg border border-stone-border rounded text-[10px] text-slate-400 flex justify-between">
        <span>LAST DIAGNOSTIC SCAN: {lastCheck}</span>
        <span className="text-tactical-glow">ALL RELAYS HEALTHY</span>
      </div>

      <div className="space-y-2">
        {services.map((s) => (
          <div
            key={s.name}
            className="p-3 bg-stone-panel border border-stone-border rounded flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-tactical-green" />
              <span className="font-bold text-slate-200">{s.name}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="text-slate-400">LATENCY: {s.response}</span>
              <span className="px-2 py-0.5 rounded bg-tactical-dim/40 border border-tactical-green text-tactical-glow font-bold uppercase">
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
