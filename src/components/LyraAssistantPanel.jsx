import React, { useEffect, useState } from 'react';
import { Bot, Radio, Send, ShieldCheck, Sparkles, Volume2, VolumeX } from 'lucide-react';

const quickActions = [
  'Summarize current mission readiness.',
  'Review the approval queue and identify risks.',
  'Route the highest-priority task through TAAN.',
];

function speakAsLyra(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const preferredNames = ['Aria', 'Jenny', 'Ava', 'Samantha', 'Victoria', 'Zira', 'Susan'];
  utterance.voice =
    preferredNames.map((name) => voices.find((voice) => voice.name.includes(name))).find(Boolean) ||
    voices.find((voice) => voice.lang?.startsWith('en')) ||
    null;
  utterance.rate = 0.94;
  utterance.pitch = 1.03;
  utterance.volume = 0.88;
  window.speechSynthesis.speak(utterance);
}

export default function LyraAssistantPanel() {
  const [query, setQuery] = useState('Brief me on current Tactical Atlas readiness.');
  const [reply, setReply] = useState(
    'Secure command channel initialized. Awaiting Commander input.'
  );
  const [isSending, setIsSending] = useState(false);
  const [linkState, setLinkState] = useState('CHECKING');
  const [voiceEnabled, setVoiceEnabled] = useState(
    () => localStorage.getItem('ta-lyra-voice') !== 'off'
  );
  const [clearance, setClearance] = useState('STANDARD');
  const [isCommanderVerified, setIsCommanderVerified] = useState(false);


  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('offline'))))
      .then((data) => setLinkState(data.lyra === 'online' ? 'ONLINE' : 'READY'))
      .catch(() => setLinkState('PREVIEW'));
    return () => controller.abort();
  }, []);

  const sendLyraRequest = async (message) => {
    const cleanMessage = message.trim();
    if (!cleanMessage || isSending) return;
    setIsSending(true);
    setReply('LYRA is coordinating TAIM context and TAAN routing…');

    try {
      const response = await fetch('/api/lyra/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanMessage }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'LYRA command channel unavailable.');
      setClearance(data.clearance || 'STANDARD');
      setIsCommanderVerified(Boolean(data.isCommander));
      const nextReply = data.reply || 'Command acknowledged.';
      setReply(nextReply);
      if (voiceEnabled) speakAsLyra(nextReply);
      setLinkState('ONLINE');
    } catch (error) {
      setReply(error.message || 'LYRA command channel unavailable.');
      setLinkState('READY');
    } finally {
      setIsSending(false);
    }
  };

  const isOmegaView = isCommanderVerified && clearance === 'OMEGA';

  return (
    <section
      className="command-panel lyra-panel flex min-h-[440px] flex-col p-4"
      aria-labelledby="lyra-title"
    >
      <div className="flex items-start justify-between border-b border-emerald-400/15 pb-3">
        <div>
          <h3 id="lyra-title" className="command-title flex items-center gap-2">
            <Bot className="h-4 w-4 text-emerald-300" /> LYRA COMMAND CORE
          </h3>
          <p className="command-kicker">Commander-facing intelligence coordinator</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextState = !voiceEnabled;
              setVoiceEnabled(nextState);
              localStorage.setItem('ta-lyra-voice', nextState ? 'on' : 'off');
              if (nextState) speakAsLyra('Voice link online. I am here, Commander.');
              else window.speechSynthesis?.cancel();
            }}
            className="status-chip status-chip-gold flex items-center gap-1"
            aria-pressed={voiceEnabled}
            aria-label={voiceEnabled ? 'Disable LYRA voice' : 'Enable LYRA voice'}
          >
            {voiceEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
            VOICE {voiceEnabled ? 'ON' : 'OFF'}
          </button>
          <span
            className={`status-chip ${linkState === 'ONLINE' ? 'status-chip-green' : 'status-chip-gold'}`}
          >
            {linkState}
          </span>
        </div>
      </div>

      <div className="relative my-4 flex min-h-48 items-center justify-center overflow-hidden rounded border border-emerald-300/20 bg-black/35">
        <img
          src={
            isOmegaView ? '/assets/lyra-command-avatar.png' : '/assets/lyra-operator-uniform.png'
          }
          alt={`LYRA, Tactical Atlas AI Command Assistant — ${isOmegaView ? 'OMEGA' : 'operator'} clearance view`}
          className="absolute inset-0 h-full w-full object-cover object-[50%_18%] opacity-80 contrast-125 saturate-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        <div className="lyra-halo lyra-halo-large left-5 opacity-50" />
        <Sparkles className="absolute right-4 top-4 h-4 w-4 text-emerald-200" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-200">
          <Radio className="h-3 w-3" /> Neural command link
        </div>
        <div className="absolute right-3 top-3 font-mono text-[7px] text-emerald-300/70">
          LYRA v2.1.7 // {isOmegaView ? 'OMEGA VIEW' : 'OPERATOR VIEW'}
        </div>
        <blockquote className="absolute bottom-3 right-3 max-w-[55%] text-right font-mono text-[7px] uppercase leading-3 text-emerald-200/90">
          “I am here, Commander. Whatever you need, wherever you need it.”
        </blockquote>
      </div>

      <div className="mb-3 rounded border border-emerald-400/20 bg-emerald-500/[0.06] p-3">
        <div className="mb-1 flex items-center gap-2 font-mono text-[8px] uppercase tracking-widest text-emerald-300">
          <ShieldCheck className="h-3 w-3" /> Governed response
        </div>
        <p
          className="max-h-20 overflow-y-auto font-mono text-[9px] leading-relaxed text-slate-300"
          aria-live="polite"
        >
          {reply}
        </p>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {quickActions.map((action, index) => (
          <button
            key={action}
            type="button"
            onClick={() => sendLyraRequest(action)}
            className="command-button px-2 py-2 text-[7px]"
          >
            {['READINESS', 'RISK REVIEW', 'ROUTE TASK'][index]}
          </button>
        ))}
      </div>

      <form
        className="mt-auto flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          sendLyraRequest(query);
        }}
      >
        <label htmlFor="lyra-query" className="sr-only">
          Send a command to LYRA
        </label>
        <input
          id="lyra-query"
          value={query}
          maxLength={2000}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 rounded border border-emerald-400/25 bg-black/40 px-3 py-2 font-mono text-[9px] text-slate-100 outline-none transition focus:border-emerald-300"
        />
        <button
          type="submit"
          disabled={isSending}
          className="command-button flex items-center gap-2 px-3 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" /> {isSending ? 'ROUTING' : 'SEND'}
        </button>
      </form>
    </section>
  );
}




