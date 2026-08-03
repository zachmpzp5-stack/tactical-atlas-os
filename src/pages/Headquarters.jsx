import React from 'react';
import ExpeditionMap from '../components/ExpeditionMap';
import ProductionPipeline from '../components/ProductionPipeline';
import SafeImage from '../components/SafeImage';
import { LIBRARY_COLLECTIONS, CASE_FILES_EXPANDED, ARCHIVES_COLLECTION } from '../data/mockData';
import { Video, Mic, Plus } from 'lucide-react';

export default function Headquarters({ onNavigate, notifications, showToast }) {
  return (
    <div className="p-4 space-y-4">
      {/* 1. Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <div className="bg-stone-panel border border-stone-border p-2.5 rounded">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">ACTIVE CASES</span>
          <span className="font-display font-bold text-lg text-slate-100">12</span>
          <span className="font-mono text-[8px] text-bronze-gold block">INVESTIGATIONS</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-2.5 rounded">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">
            EPISODES IN PRODUCTION
          </span>
          <span className="font-display font-bold text-lg text-slate-100">24</span>
          <span className="font-mono text-[8px] text-tactical-glow block">IN PROGRESS</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-2.5 rounded">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">
            ASSETS GENERATED
          </span>
          <span className="font-display font-bold text-lg text-slate-100">1,248</span>
          <span className="font-mono text-[8px] text-slate-500 block">IMAGES / AUDIO / VIDEO</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-2.5 rounded">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">
            NARRATION STATUS
          </span>
          <span className="font-display font-bold text-sm text-tactical-glow">CHARLIE</span>
          <span className="font-mono text-[8px] text-slate-500 block">READY</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-2.5 rounded">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">
            PRODUCTION PIPELINE
          </span>
          <span className="font-display font-bold text-lg text-slate-100">78%</span>
          <span className="font-mono text-[8px] text-tactical-glow block">ACTIVE</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-2.5 rounded">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">
            PUBLISHING QUEUE
          </span>
          <span className="font-display font-bold text-lg text-slate-100">7</span>
          <span className="font-mono text-[8px] text-bronze-gold block">SCHEDULED</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-2.5 rounded">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">WEEKLY OUTPUT</span>
          <span className="font-display font-bold text-lg text-slate-100">18</span>
          <span className="font-mono text-[8px] text-slate-500 block">THIS WEEK</span>
        </div>
      </div>

      {/* Middle Map & Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <ExpeditionMap onSelectCase={(caseId) => onNavigate('/cases', caseId)} />
        </div>

        <div className="lg:col-span-3 bg-stone-panel border border-stone-border rounded-lg p-3 flex flex-col justify-between h-[360px]">
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

        <div className="lg:col-span-3 bg-stone-panel border border-stone-border rounded-lg p-3 flex flex-col justify-between h-[360px]">
          <div>
            <div className="pb-2 border-b border-stone-border mb-2">
              <h3 className="font-serif font-bold text-xs text-slate-100 uppercase">
                TODAY'S MISSION
              </h3>
              <span className="font-mono text-[8px] text-bronze-gold uppercase block">
                PRIMARY OBJECTIVE
              </span>
            </div>

            <div className="relative rounded overflow-hidden mb-2 h-28 bg-stone-bg border border-stone-border">
              <SafeImage
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80"
                alt="El Dorado"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-panel via-transparent to-transparent"></div>
              <div className="absolute bottom-2 left-2">
                <span className="font-serif font-bold text-xs text-slate-100 block">EL DORADO</span>
                <span className="font-mono text-[8px] text-bronze-gold block">
                  THE CITY OF GOLD
                </span>
              </div>
            </div>

            <div className="bg-stone-bg p-2 rounded border border-stone-border font-mono text-[9px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>EPISODE:</span>
                <span className="text-slate-200">03</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>RESEARCH:</span>
                <span className="text-tactical-glow">92%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>NARRATION:</span>
                <span className="text-tactical-glow">CHARLIE</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>PUBLISH:</span>
                <span className="text-bronze-gold">TOMORROW</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/cases', 'CASE-001')}
            className="w-full py-1.5 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-xs font-mono font-bold text-bronze-light rounded uppercase"
          >
            OPEN CASE FILE
          </button>
        </div>
      </div>

      {/* Quick Actions & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-stone-panel border border-stone-border rounded-lg p-3">
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
      <div className="pt-2 border-t border-stone-border">
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
