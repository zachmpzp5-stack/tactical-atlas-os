import React, { useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';

export default function Login({ showToast, onNavigate }) {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const clearance = form.username.trim().toUpperCase() === 'GENERAL HIIIT' ? 'OMEGA' : 'OPERATOR';
    localStorage.setItem('ta_operator_name', form.username.trim() || 'AUTHORIZED OPERATOR');
    localStorage.setItem('ta_clearance', clearance);
    window.dispatchEvent(new CustomEvent('ta:clearance-change', { detail: clearance }));
    if (showToast) {
      showToast('ACCESS GRANTED — OPERATOR AUTHENTICATION SIMULATED');
    }
    if (onNavigate) {
      onNavigate('/');
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-command-room">
      <div className="mx-auto max-w-xl rounded-xl border border-stone-border bg-stone-panel p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10">
            <Shield className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.38em] text-bronze-gold">
              Secure Access
            </div>
            <h1 className="font-serif text-xl text-slate-100 uppercase">Operator Login</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="login-user" className="font-mono text-[10px] uppercase text-slate-300">
              Authorization Name
            </label>
            <input
              id="login-user"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded border border-stone-border bg-stone-bg p-2.5 text-slate-100 outline-none focus:border-bronze-gold"
              placeholder="GENERAL HIIIT"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="login-pass" className="font-mono text-[10px] uppercase text-slate-300">
              Clearance Token
            </label>
            <input
              id="login-pass"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded border border-stone-border bg-stone-bg p-2.5 text-slate-100 outline-none focus:border-bronze-gold"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <button
              type="button"
              onClick={() => onNavigate('/signup')}
              className="text-bronze-gold"
            >
              Create New Operator ID
            </button>
            <button type="button" onClick={() => onNavigate('/terms')} className="text-emerald-300">
              View Terms of Service
            </button>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded border border-bronze-gold bg-bronze-gold/20 px-4 py-2.5 font-mono text-[10px] font-bold uppercase text-bronze-light"
          >
            Access Command Grid
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
