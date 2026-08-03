import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function Settings({ showToast }) {
  const [narrator, setNarrator] = useState(
    () => localStorage.getItem('ta_narrator') || 'Charlie - Deep, Confident'
  );
  const [runtime, setRuntime] = useState(
    () => localStorage.getItem('ta_runtime') || '60 Seconds (9:16)'
  );

  const handleSave = () => {
    try {
      localStorage.setItem('ta_narrator', narrator);
      localStorage.setItem('ta_runtime', runtime);
      if (showToast) showToast('SETTINGS SAVED TO LOCALSTORAGE');
    } catch (err) {
      if (showToast) showToast('ERROR SAVING TO LOCALSTORAGE');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-bronze-gold" />
            SYSTEM SETTINGS // CONFIGURATION
          </h1>
          <p className="text-slate-400 mt-1">OPERATOR PREFERENCES AND LOCALSTORAGE PERSISTENCE</p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-bronze-light font-bold rounded flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" /> SAVE SETTINGS
        </button>
      </div>

      <div className="bg-stone-panel border border-stone-border rounded-lg p-4 space-y-4 max-w-xl">
        <div className="space-y-1">
          <label htmlFor="narrator-select" className="text-slate-300 font-bold block">
            DEFAULT NARRATOR VOICE
          </label>
          <select
            id="narrator-select"
            value={narrator}
            onChange={(e) => setNarrator(e.target.value)}
            className="w-full p-2 bg-stone-bg border border-stone-border rounded text-slate-200 focus:outline-none focus:border-bronze-gold"
          >
            <option>Charlie - Deep, Confident</option>
            <option>Alpha - Authoritative Command</option>
            <option>Bravo - Archival Documentarian</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="runtime-select" className="text-slate-300 font-bold block">
            TARGET RUNTIME FORMAT
          </label>
          <select
            id="runtime-select"
            value={runtime}
            onChange={(e) => setRuntime(e.target.value)}
            className="w-full p-2 bg-stone-bg border border-stone-border rounded text-slate-200 focus:outline-none focus:border-bronze-gold"
          >
            <option>60 Seconds (9:16 Vertical)</option>
            <option>10 Minutes (16:9 Full Horizontal)</option>
            <option>30 Seconds (1:1 Square)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
