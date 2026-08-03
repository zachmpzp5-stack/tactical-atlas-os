import React, { useState } from 'react';
import { UserPlus, ShieldCheck } from 'lucide-react';

export default function Signup({ showToast, onNavigate }) {
  const [form, setForm] = useState({ name: '', email: '', clearance: 'LEVEL 03' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showToast) {
      showToast('ACCOUNT CREATED — NEW OPERATOR PROFILE STAGED');
    }
    if (onNavigate) {
      onNavigate('/login');
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-command-room">
      <div className="mx-auto max-w-2xl rounded-xl border border-stone-border bg-stone-panel p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-bronze-gold/50 bg-bronze-gold/10">
            <UserPlus className="h-5 w-5 text-bronze-gold" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.38em] text-bronze-gold">
              New Operator
            </div>
            <h1 className="font-serif text-xl text-slate-100 uppercase">Sign Up</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="signup-name" className="font-mono text-[10px] uppercase text-slate-300">
              Operator Alias
            </label>
            <input
              id="signup-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded border border-stone-border bg-stone-bg p-2.5 text-slate-100 outline-none focus:border-bronze-gold"
              placeholder="Lyra"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label htmlFor="signup-email" className="font-mono text-[10px] uppercase text-slate-300">
              Command Channel
            </label>
            <input
              id="signup-email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded border border-stone-border bg-stone-bg p-2.5 text-slate-100 outline-none focus:border-bronze-gold"
              placeholder="lyra@tactical-atlas.io"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="signup-clearance" className="font-mono text-[10px] uppercase text-slate-300">
              Clearance Tier
            </label>
            <select
              id="signup-clearance"
              value={form.clearance}
              onChange={(e) => setForm({ ...form, clearance: e.target.value })}
              className="w-full rounded border border-stone-border bg-stone-bg p-2.5 text-slate-100 outline-none focus:border-bronze-gold"
            >
              <option>LEVEL 03</option>
              <option>LEVEL 04</option>
              <option>LEVEL 05</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="signup-terms" className="font-mono text-[10px] uppercase text-slate-300">
              Legal Compliance
            </label>
            <button
              type="button"
              onClick={() => onNavigate('/terms')}
              className="flex w-full items-center justify-center gap-2 rounded border border-emerald-400/40 bg-emerald-500/10 p-2.5 text-[10px] uppercase text-emerald-300"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Review Terms of Service
            </button>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full rounded border border-tactical-green bg-tactical-green/20 px-4 py-2.5 font-mono text-[10px] font-bold uppercase text-tactical-glow"
            >
              Register Operator Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
