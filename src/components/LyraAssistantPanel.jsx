import React, { useState } from 'react';
import { Bot, Sparkles, ChevronRight, Play, ShieldCheck } from 'lucide-react';

const assistantSignals = [
  'PROTOCOL: command routing stable',
  'VOICE LINK: Charlie profile synced',
  'CLEARANCE: visual research access live',
];

const assistantActions = [
  { label: 'VERIFY BUILD', message: 'VERIFY BUILD STATUS AND CURRENT OPERATOR READINESS.' },
  { label: 'EMIT BRIEF', message: 'EMIT A TARGETED INTELLIGENCE BRIEF FOR CURRENT CASELOAD.' },
  { label: 'OPEN CASE', message: 'OPEN THE TOP PRIORITY CASE FILE AND ALIGN THE CURRENT BRIEFING MODEL.' },
];

export default function LyraAssistantPanel() {
  const [query, setQuery] = useState('Open case files and align briefing output.');
  const [reply, setReply] = useState('LYRA READY — AWAITING OPERATOR INPUT.');
  const [isSending, setIsSending] = useState(false);

  const sendLyraRequest = async (message) => {
    setIsSending(true);

    try {
      const response = await fetch('http://localhost:3001/api/lyra/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'LYRA REQUEST FAILED');
      }

      setReply(data.reply || 'LYRA ACKNOWLEDGED THE QUERY.');
    } catch (error) {
      setReply(error.message || 'LYRA LINK LOST — NO RESPONSE RECEIVED.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="lg:col-span-3 black-glass rounded-lg p-3 flex flex-col justify-between h-[360px]">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-stone-border mb-2">
          <div>
            <h3 className="font-serif font-bold text-xs text-slate-100 uppercase">LYRA</h3>
            <span className="font-mono text-[8px] text-bronze-gold uppercase block">
              AI ASSISTANT // TACTICAL LINK
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/40 bg-emerald-500/10">
            <Bot className="h-4 w-4 text-emerald-300" />
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between rounded border border-stone-border bg-stone-bg px-2 py-1.5">
            <span className="font-mono text-[9px] text-slate-300">SYSTEM LINK</span>
            <span className="font-mono text-[9px] text-tactical-glow">ONLINE</span>
          </div>
          <div className="flex items-center justify-between rounded border border-stone-border bg-stone-bg px-2 py-1.5">
            <span className="font-mono text-[9px] text-slate-300">NARRATION SYNC</span>
            <span className="font-mono text-[9px] text-bronze-gold">CHARLIE</span>
          </div>
        </div>

        <div className="rounded border border-emerald-400/30 bg-emerald-500/10 p-2.5 space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-200 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            LYR A // ACTIVE COMMAND THREAD
          </div>
          <p className="font-mono text-[9px] text-slate-300 leading-relaxed">
            "Generating the next tactical brief, aligning narrative tone, and routing operator
            context into the current mission frame."
          </p>
        </div>

        <div className="space-y-1.5">
          {assistantSignals.map((signal) => (
            <div
              key={signal}
              className="rounded border border-stone-border bg-stone-bg px-2 py-1.5 font-mono text-[8px] text-slate-300"
            >
              {signal}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 mt-3">
        <div className="grid grid-cols-3 gap-2">
          {assistantActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => sendLyraRequest(action.message)}
              className="rounded border border-stone-border bg-stone-bg px-1.5 py-2 text-[8px] font-mono uppercase text-slate-200 hover:border-bronze-gold"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="rounded border border-stone-border bg-stone-bg p-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] text-slate-300 uppercase">Operator Query</span>
            <span className="font-mono text-[8px] text-emerald-300">
              {isSending ? 'PROCESSING' : 'READY'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 rounded border border-emerald-400/25 bg-emerald-500/10 px-2 py-1.5">
            <Play className="h-3.5 w-3.5 text-emerald-300" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent font-mono text-[8px] text-slate-200 outline-none"
              aria-label="Lyra operator query"
            />
          </div>
          <button
            type="button"
            onClick={() => sendLyraRequest(query)}
            className="mt-2 w-full rounded border border-emerald-400/30 bg-emerald-500/10 px-2 py-1.5 font-mono text-[8px] uppercase text-emerald-200 hover:border-emerald-300"
          >
            SEND TO LYRA
          </button>
          <div className="mt-2 rounded border border-stone-border bg-black/20 px-2 py-1.5 font-mono text-[8px] text-slate-300">
            {reply}
          </div>
        </div>

        <div className="flex items-center justify-between rounded border border-bronze-gold/50 bg-bronze-gold/10 px-2 py-1.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-bronze-gold" />
            <span className="font-mono text-[8px] text-slate-200 uppercase">lyra-ops // linked</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-bronze-gold" />
        </div>
      </div>
    </div>
  );
}
