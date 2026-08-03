import React, { useState } from 'react';
import { Cpu, Play, Copy, Check, Sparkles, Mic } from 'lucide-react';
import { AI_PROMPT_TEMPLATES } from '../data/aiPrompts';

export default function AiProduction({ showToast }) {
  const [selectedTemplate, setSelectedTemplate] = useState(AI_PROMPT_TEMPLATES[0]);
  const [customPrompt, setCustomPrompt] = useState(AI_PROMPT_TEMPLATES[0].promptText);
  const [scriptText, setScriptText] = useState(
    'In the high Andes of 16th-century Colombia, Spanish conquistadors recorded whispers of a golden ruler who submerged himself in Lake Guatavita. [pause] But modern satellite sensor data reveals something far deeper.'
  );
  const [simulating, setSimulating] = useState(false);
  const [statusText, setStatusText] = useState('PROMPT LOADED — READY FOR PROTOTYPE SIMULATION');
  const [copied, setCopied] = useState(false);

  // Dynamic Word Count & 150 WPM Duration Calculation
  const wordCount = scriptText.trim() ? scriptText.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round((wordCount / 150) * 60);

  const handleSimulate = () => {
    setSimulating(true);
    setStatusText('SIMULATION RUNNING — PARSING PROMPT PARAMETERS...');
    setTimeout(() => {
      setSimulating(false);
      setStatusText('PROTOTYPE SIMULATION COMPLETE — 20-SHOT PLAN READY.');
      if (showToast) showToast('SIMULATION COMPLETE: 20-SHOT PLAN GENERATED');
    }, 1500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customPrompt);
      setCopied(true);
      if (showToast) showToast('PROMPT COPIED TO CLIPBOARD');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      if (showToast) showToast('COPY FAILED - PERMISSION DENIED');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Cpu className="w-5 h-5 text-bronze-gold" />
            AI PRODUCTION // STUDIO PIPELINE PROTOTYPE
          </h1>
          <p className="text-slate-400 mt-1">
            PROMPT STUDIO, SCRIPT EDITOR, AND CHARLIE NARRATION PROFILES
          </p>
        </div>
        <div className="px-3 py-1 bg-stone-bg border border-stone-border text-tactical-glow font-bold rounded">
          {statusText}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-stone-panel border border-stone-border rounded-lg p-4 space-y-3">
          <h3 className="font-serif font-bold text-xs text-slate-100 uppercase border-b border-stone-border pb-2">
            PROMPT TEMPLATE LIBRARY
          </h3>

          <div className="space-y-2">
            {AI_PROMPT_TEMPLATES.map((tmpl) => (
              <button
                type="button"
                key={tmpl.id}
                onClick={() => {
                  setSelectedTemplate(tmpl);
                  setCustomPrompt(tmpl.promptText);
                }}
                className={`w-full text-left p-3 rounded border cursor-pointer transition-all ${
                  selectedTemplate.id === tmpl.id
                    ? 'bg-stone-card border-bronze-gold shadow-bronze'
                    : 'bg-stone-bg border-stone-border hover:border-bronze-gold/40'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-100">{tmpl.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-panel border border-stone-border text-bronze-gold">
                    {tmpl.category}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{tmpl.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-stone-panel border border-stone-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-stone-border pb-2">
              <span className="font-serif font-bold text-xs text-slate-100 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-bronze-gold" />
                ACTIVE PROMPT EDITOR
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2 py-1 bg-stone-bg border border-stone-border rounded text-[10px] text-slate-200 flex items-center gap-1"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-tactical-green" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copied ? 'COPIED' : 'COPY PROMPT'}
              </button>
            </div>

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              aria-label="Active Prompt Editor"
              className="w-full p-3 bg-stone-bg border border-stone-border rounded font-mono text-xs text-slate-200 focus:outline-none focus:border-bronze-gold resize-none"
            />

            <button
              type="button"
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full py-2.5 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-bronze-light font-bold rounded uppercase flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              {simulating ? 'RUNNING PROTOTYPE SIMULATION...' : 'EXECUTE PROTOTYPE SIMULATION'}
            </button>
          </div>

          <div className="bg-stone-panel border border-stone-border rounded-lg p-4 space-y-3">
            <h3 className="font-serif font-bold text-xs text-slate-100 uppercase border-b border-stone-border pb-2 flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-tactical-green" />
              CHARLIE NARRATION SCRIPT BUILDER
            </h3>

            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={4}
              aria-label="Charlie Narration Script Builder"
              className="w-full p-3 bg-stone-bg border border-stone-border rounded font-mono text-xs text-slate-200 focus:outline-none focus:border-tactical-green resize-none"
            />

            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>
                WORD COUNT: {wordCount} | ESTIMATED DURATION: ~{estimatedSeconds} SECONDS (@ 150
                WPM)
              </span>
              <button
                type="button"
                onClick={() => setScriptText(scriptText + ' [pause]')}
                className="px-2 py-1 bg-stone-bg border border-stone-border rounded hover:border-tactical-green text-slate-200"
              >
                + ADD PAUSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
