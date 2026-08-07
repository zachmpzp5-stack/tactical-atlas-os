import React, { useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';

export default function Login({ showToast, onNavigate }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = form.username.trim();
    const isCommanderLogin = username.toUpperCase() === 'GENERAL HIIIT';

    setIsAuthenticating(true);

    try {
      if (isCommanderLogin) {
        const response = await fetch('/api/auth/commander', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            credential: form.password
          })
        });

        const data = await response.json();

        if (!response.ok || !data.authenticated) {
          localStorage.setItem('ta_clearance', 'STANDARD');

          if (showToast) {
            showToast('OMEGA AUTHENTICATION DENIED');
          }

          return;
        }

        localStorage.setItem('ta_operator_name', 'GENERAL HIIIT');
        localStorage.setItem('ta_clearance', 'OMEGA');

        window.dispatchEvent(
          new CustomEvent('ta:clearance-change', {
            detail: 'OMEGA'
          })
        );

        if (showToast) {
          showToast('OMEGA CLEARANCE VERIFIED — COMMANDER CHANNEL ACTIVE');
        }

        if (onNavigate) {
          onNavigate('/');
        }

        return;
      }

      localStorage.setItem(
        'ta_operator_name',
        username || 'AUTHORIZED OPERATOR'
      );

      localStorage.setItem('ta_clearance', 'STANDARD');

      window.dispatchEvent(
        new CustomEvent('ta:clearance-change', {
          detail: 'STANDARD'
        })
      );

      if (showToast) {
        showToast('STANDARD OPERATOR ACCESS GRANTED');
      }

      if (onNavigate) {
        onNavigate('/');
      }
    } catch (error) {
      console.error('[TACTICAL_ATLAS_AUTH_ERROR]', error);

      if (showToast) {
        showToast('AUTHENTICATION LINK FAILURE');
      }
    } finally {
      setIsAuthenticating(false);
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

            <h1 className="font-serif text-xl text-slate-100 uppercase">
              Operator Login
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="login-user"
              className="font-mono text-[10px] uppercase text-slate-300"
            >
              Authorization Name
            </label>

            <input
              id="login-user"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              className="w-full rounded border border-stone-border bg-stone-bg p-2.5 text-slate-100 outline-none focus:border-bronze-gold"
              placeholder="GENERAL HIIIT"
              disabled={isAuthenticating}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="login-pass"
              className="font-mono text-[10px] uppercase text-slate-300"
            >
              Clearance Token
            </label>

            <input
              id="login-pass"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full rounded border border-stone-border bg-stone-bg p-2.5 text-slate-100 outline-none focus:border-bronze-gold"
              placeholder="••••••••"
              disabled={isAuthenticating}
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

            <button
              type="button"
              onClick={() => onNavigate('/terms')}
              className="text-emerald-300"
            >
              View Terms of Service
            </button>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="flex w-full items-center justify-center gap-2 rounded border border-bronze-gold bg-bronze-gold/20 px-4 py-2.5 font-mono text-[10px] font-bold uppercase text-bronze-light disabled:opacity-50"
          >
            {isAuthenticating ? 'VERIFYING...' : 'Access Command Grid'}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
