import React, { useEffect, useState } from 'react';
import ExpeditionMap from '../components/ExpeditionMap';
import ProductionPipeline from '../components/ProductionPipeline';
import SafeImage from '../components/SafeImage';
import LyraAssistantPanel from '../components/LyraAssistantPanel';
import { LIBRARY_COLLECTIONS, CASE_FILES_EXPANDED, ARCHIVES_COLLECTION } from '../data/mockData';
import { Video, Mic, Plus } from 'lucide-react';

function BootSequenceOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  const playBootTone = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const start = context.currentTime + 0.05;
    const playTone = (frequency, duration, offset, type, gainValue) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, start + offset);
      gain.gain.setValueAtTime(0.0001, start + offset);
      gain.gain.exponentialRampToValueAtTime(gainValue, start + offset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + duration);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(start + offset);
      osc.stop(start + offset + duration + 0.02);
    };

    playTone(220, 0.22, 0, 'sine', 0.045);
    playTone(330, 0.18, 0.12, 'triangle', 0.03);
    playTone(440, 0.34, 0.24, 'sawtooth', 0.025);
    playTone(660, 0.42, 0.36, 'triangle', 0.02);

    window.setTimeout(() => {
      if (context.state !== 'closed') {
        context.close().catch(() => {});
      }
    }, 900);
  };

  const handleBootGesture = () => {
    playBootTone();
  };

  if (!visible) return null;

  return (
    <div
      className="boot-sequence-screen fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
      onPointerDown={handleBootGesture}
      onKeyDown={handleBootGesture}
      role="presentation"
    >
      <div className="boot-sequence-frame relative w-[min(92vw,760px)] rounded-2xl border border-emerald-400/30 bg-black/80 px-6 py-8 shadow-[0_0_80px_rgba(16,185,129,0.18)]">
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),transparent_60%)]" />
        <div className="absolute left-4 top-4 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-transparent via-emerald-300/40 to-transparent" />
        <div className="absolute right-4 top-4 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-transparent via-amber-300/30 to-transparent" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.45em] text-emerald-300/80">
                Tactical Atlas
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-50">
                INTELLIGENCE OPERATING SYSTEM
              </h2>
            </div>

            <div className="relative flex items-center justify-center h-24 w-24 rounded-full border border-emerald-300/40 bg-black/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.18)]">
              <div className="absolute h-3 w-3 rounded-full bg-emerald-200 shadow-[0_0_16px_rgba(52,211,153,0.95)]" />
              <div className="flat-earth-core absolute h-10 w-10 rounded-full border border-emerald-300/60" />
              <div className="absolute h-16 w-16 rounded-full border border-amber-300/20" />
              <div className="absolute h-20 w-20 rounded-full border border-dashed border-emerald-300/35 animate-[spin_8s_linear_infinite]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-[10px] text-slate-300">
            <div className="boot-status-line">[00:01] BIO-ORIGIN FIELD SYNCHRONIZED</div>
            <div className="boot-status-line">[00:02] FLAT-EARTH PROJECTION CALIBRATED</div>
            <div className="boot-status-line">[00:03] NARRATIVE EXTRACTION BAND STABLE</div>
            <div className="boot-status-line">[00:04] RESEARCH LATTICE READY</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-amber-300">
              <span>Boot sequence</span>
              <span>78%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div className="boot-progress-fill h-full rounded-full" />
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-200/70">
              Click the frame to arm the boot tone.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Headquarters({ onNavigate, notifications, showToast }) {
  return (
    <div className="p-4 space-y-4 relative min-h-screen bg-command-room">
      <BootSequenceOverlay />
      <div className="pointer-events-none absolute inset-0 bg-moving-grid opacity-10" />
      <div className="pointer-events-none absolute inset-0 scanline-overlay opacity-15" />

      <div className="relative z-10">
        <div className="animate-scanner-line z-20" />
      </div>

      <div className="relative z-10 black-glass rounded-lg p-4 lg:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="font-mono text-[9px] uppercase tracking-[0.36em] text-bronze-gold block">
              Flat Earth Cinematic
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-slate-100 uppercase tracking-wide">
              Projection Grid Synchronization
            </h2>
            <p className="mt-2 font-mono text-[10px] text-slate-400 uppercase tracking-[0.24em]">
              Global intelligence lattice aligned • visual feed on standby
            </p>
          </div>

          <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-emerald-400/50 bg-black/30">
            <div className="flat-earth-ring absolute h-32 w-32 rounded-full border border-dashed border-emerald-300/50" />
            <div className="flat-earth-ring absolute h-24 w-24 rounded-full border border-emerald-300/40" />
            <div className="flat-earth-ring absolute h-16 w-16 rounded-full border border-amber-200/30" />
            <div className="flat-earth-core absolute h-12 w-12 rounded-full border border-emerald-300/60" />
            <div className="absolute inset-0 rounded-full border border-emerald-300/20" />
            <div className="absolute h-0.5 w-24 bg-emerald-200/75 blur-[1px]" />
            <div className="absolute h-24 w-0.5 bg-emerald-200/60 blur-[1px]" />
          </div>
        </div>
      </div>

      {/* 1. Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 relative z-10">
        <div className="black-glass rounded p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.07)]">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">ACTIVE CASES</span>
          <span className="font-display font-bold text-lg text-slate-100">12</span>
          <span className="font-mono text-[8px] text-bronze-gold block">INVESTIGATIONS</span>
        </div>
        <div className="black-glass rounded p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.07)]">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">
            EPISODES IN PRODUCTION
          </span>
          <span className="font-display font-bold text-lg text-slate-100">24</span>
          <span className="font-mono text-[8px] text-tactical-glow block">IN PROGRESS</span>
        </div>
        <div className="black-glass rounded p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.07)]">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">
            ASSETS GENERATED
          </span>
          <span className="font-display font-bold text-lg text-slate-100">1,248</span>
          <span className="font-mono text-[8px] text-slate-500 block">IMAGES / AUDIO / VIDEO</span>
        </div>
        <div className="black-glass rounded p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.07)]">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">
            NARRATION STATUS
          </span>
          <span className="font-display font-bold text-sm text-tactical-glow">CHARLIE</span>
          <span className="font-mono text-[8px] text-slate-500 block">READY</span>
        </div>
        <div className="black-glass rounded p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.07)]">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">
            PRODUCTION PIPELINE
          </span>
          <span className="font-display font-bold text-lg text-slate-100">78%</span>
          <span className="font-mono text-[8px] text-tactical-glow block">ACTIVE</span>
        </div>
        <div className="black-glass rounded p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.07)]">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">
            PUBLISHING QUEUE
          </span>
          <span className="font-display font-bold text-lg text-slate-100">7</span>
          <span className="font-mono text-[8px] text-bronze-gold block">SCHEDULED</span>
        </div>
        <div className="black-glass rounded p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.07)]">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">WEEKLY OUTPUT</span>
          <span className="font-display font-bold text-lg text-slate-100">18</span>
          <span className="font-mono text-[8px] text-slate-500 block">THIS WEEK</span>
        </div>
      </div>

      {/* Middle Map & Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        <div className="lg:col-span-6">
          <ExpeditionMap onSelectCase={(caseId) => onNavigate('/cases', caseId)} />
        </div>

        <div className="lg:col-span-3 black-glass rounded-lg p-3 flex flex-col justify-between h-[360px]">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-border mb-2">
              <div>
                <h3 className="font-serif font-bold text-xs text-slate-100 uppercase">
                  INTELLIGENCE FEED
                </h3>
                <span className="font-mono text-[8px] text-bronze-gold uppercase block">
                  LATEST UPDATES
                </span>
              </div>
            </div>
            <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-1.5 rounded border flex justify-between items-center text-[10px] font-mono ${
                    item.read
                      ? 'bg-stone-bg/50 border-stone-border/40 opacity-70'
                      : 'bg-stone-bg border-stone-border/60'
                  }`}
                >
                  <span className="text-slate-300 truncate max-w-[170px]">{item.title}</span>
                  <span className="text-bronze-gold text-[8px]">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/cases')}
            className="w-full py-1 bg-stone-bg hover:bg-stone-card border border-stone-border text-[10px] font-mono text-slate-300 rounded uppercase"
          >
            VIEW ALL ACTIVITY
          </button>
        </div>

        <LyraAssistantPanel />
      </div>

      {/* Quick Actions & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        <div className="lg:col-span-5 black-glass rounded-lg p-3">
          <h3 className="font-serif font-bold text-xs text-slate-100 uppercase mb-0.5">
            QUICK ACTIONS
          </h3>
          <span className="font-mono text-[8px] text-bronze-gold uppercase block mb-2">
            INITIATE PRODUCTION SEQUENCE
          </span>

          <div className="grid grid-cols-3 gap-2 font-mono text-[9px]">
            <button
              type="button"
              onClick={() => {
                onNavigate('/ai-studio');
                if (showToast) showToast('SIMULATION: VISUAL PACK GENERATOR INITIALIZED');
              }}
              className="p-2 bg-stone-bg border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1"
            >
              <Video className="w-3.5 h-3.5 text-bronze-gold" />
              GENERATE VISUALS
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('/ai-studio');
                if (showToast) showToast('SIMULATION: CHARLIE NARRATOR PROFILE LOADED');
              }}
              className="p-2 bg-stone-bg border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1"
            >
              <Mic className="w-3.5 h-3.5 text-tactical-green" />
              GENERATE NARRATION
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('/cases');
                if (showToast) showToast('SIMULATION: NEW CASE DOSSIER TEMPLATE LOADED');
              }}
              className="p-2 bg-stone-bg border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-amber-500" />
              CREATE CASE
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ProductionPipeline />
        </div>
      </div>

      {/* Submodule Previews */}
      <div className="pt-2 border-t border-stone-border relative z-10">
        <span className="font-mono text-[9px] text-bronze-gold tracking-widest block uppercase text-center mb-3">
          SYSTEM MODULES PREVIEW
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            className="text-left bg-stone-panel border border-stone-border rounded p-3 cursor-pointer hover:border-bronze-gold/50"
            onClick={() => onNavigate('/library')}
          >
            <h4 className="font-serif font-bold text-xs text-slate-100 uppercase mb-2">
              GRAND LIBRARY
            </h4>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[8px]">
              {LIBRARY_COLLECTIONS.map((c) => (
                <div key={c.id} className="p-1.5 bg-stone-bg border border-stone-border rounded">
                  <span className="text-slate-200 block font-bold leading-tight truncate">
                    {c.title}
                  </span>
                  <span className="text-bronze-gold block">{c.cases} CASES</span>
                </div>
              ))}
            </div>
          </button>

          <button
            type="button"
            className="text-left bg-stone-panel border border-stone-border rounded p-3 cursor-pointer hover:border-bronze-gold/50"
            onClick={() => onNavigate('/cases')}
          >
            <h4 className="font-serif font-bold text-xs text-slate-100 uppercase mb-2">
              CASE FILES
            </h4>
            <div className="space-y-1 font-mono text-[8px]">
              {CASE_FILES_EXPANDED.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  className="flex justify-between p-1 bg-stone-bg rounded border border-stone-border/60"
                >
                  <span className="text-slate-300 truncate max-w-[120px]">{f.title}</span>
                  <span className="text-tactical-glow">{f.progress}%</span>
                </div>
              ))}
            </div>
          </button>

          <button
            type="button"
            className="text-left bg-stone-panel border border-stone-border rounded p-3 cursor-pointer hover:border-bronze-gold/50"
            onClick={() => onNavigate('/vault')}
          >
            <h4 className="font-serif font-bold text-xs text-slate-100 uppercase mb-2">
              MEDIA VAULT
            </h4>
            <div className="grid grid-cols-3 gap-1">
              {ARCHIVES_COLLECTION.slice(0, 3).map((a) => (
                <SafeImage
                  key={a.id}
                  src={a.image}
                  className="w-full h-10 object-cover rounded border border-stone-border"
                  alt={a.title}
                />
              ))}
            </div>
          </button>

          <button
            type="button"
            className="text-left bg-stone-panel border border-stone-border rounded p-3 cursor-pointer hover:border-bronze-gold/50"
            onClick={() => onNavigate('/archives')}
          >
            <h4 className="font-serif font-bold text-xs text-slate-100 uppercase mb-2">
              ATLAS ARCHIVES
            </h4>
            <div className="space-y-1 font-mono text-[8px]">
              {ARCHIVES_COLLECTION.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between p-1 bg-stone-bg rounded border border-stone-border/60"
                >
                  <span className="text-slate-300 truncate max-w-[120px]">{a.title}</span>
                  <span className="text-bronze-gold">{a.episodes} EPS</span>
                </div>
              ))}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
