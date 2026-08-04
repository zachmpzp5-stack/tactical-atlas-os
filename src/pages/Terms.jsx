import React from 'react';
import { ScrollText } from 'lucide-react';

export default function Terms({ onNavigate }) {
  return (
    <div className="p-4 sm:p-6 min-h-screen bg-command-room">
      <div className="mx-auto max-w-3xl rounded-xl border border-stone-border bg-stone-panel p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-bronze-gold/50 bg-bronze-gold/10">
            <ScrollText className="h-5 w-5 text-bronze-gold" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.38em] text-bronze-gold">
              Legal Access
            </div>
            <h1 className="font-serif text-xl text-slate-100 uppercase">Terms of Service</h1>
          </div>
        </div>

        <div className="space-y-3 font-mono text-[10px] text-slate-300">
          <p>
            Tactical Atlas Intelligence Operating System grants authorized operators access to
            classified research interfaces, archival data streams, and AI-assisted production
            assistance subject to command oversight.
          </p>
          <p>
            Operators must maintain secure credentials, avoid unauthorized disclosure, and operate
            within the approved mission scope and jurisdiction of the current command directive.
          </p>
          <p>
            The system is provided as a tactical prototype interface for presentation and
            operational storytelling workflows. All usage remains subject to local security
            requirements, access control, and legal compliance procedures.
          </p>
          <p>
            By proceeding, the operator acknowledges the command classification, lawful use
            requirements, and the necessity of preserving source integrity throughout all mission
            operations.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/signup')}
            className="rounded border border-bronze-gold bg-bronze-gold/20 px-4 py-2 text-[10px] uppercase text-bronze-light"
          >
            Register New Operator
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="rounded border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-[10px] uppercase text-emerald-300"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}
