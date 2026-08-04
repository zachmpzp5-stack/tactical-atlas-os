import React, { useState } from 'react';
import {
  ArrowRight,
  Crosshair,
  Layers3,
  MapPin,
  RadioTower,
  Satellite,
  ShieldAlert,
} from 'lucide-react';
import { EXPEDITION_LOCATIONS } from '../data/mockData';

const mapLayers = [
  { id: 'MAP', label: 'MAP LAYERS', icon: Layers3 },
  { id: 'NODES', label: 'NODE FEED', icon: RadioTower },
  { id: 'THREATS', label: 'THREAT VIEW', icon: ShieldAlert },
  { id: 'SATELLITE', label: 'SATELLITE LINK', icon: Satellite },
];

export default function ExpeditionMap({ onSelectCase }) {
  const [selectedLoc, setSelectedLoc] = useState(EXPEDITION_LOCATIONS[0]);
  const [activeLayer, setActiveLayer] = useState('MAP');

  return (
    <section
      className="black-glass-glow relative flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-tactical-green/40 p-4 shadow-2xl"
      aria-labelledby="situation-wall-title"
    >
      <div className="z-10 mb-2 flex items-center justify-between gap-2 border-b border-stone-border/80 pb-2">
        <div>
          <h3
            id="situation-wall-title"
            className="font-serif text-sm font-bold uppercase tracking-wider text-slate-100 text-glow-green"
          >
            GLOBAL SITUATION WALL
          </h3>
          <span className="block font-mono text-[9px] uppercase text-bronze-gold">
            FLAT-EARTH INTELLIGENCE + ANOMALY TRACKER
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-chip status-chip-green hidden sm:inline">
            {activeLayer} ACTIVE
          </span>
          <button
            type="button"
            onClick={() => onSelectCase(selectedLoc?.caseId)}
            className="flex items-center gap-1 rounded border border-bronze-gold/60 bg-[#07110d] px-3 py-1 font-mono text-xs uppercase text-slate-200 shadow-bronze transition-colors hover:bg-[#0c1a15]"
          >
            VIEW CASE <ArrowRight className="h-3 w-3 text-bronze-gold" />
          </button>
        </div>
      </div>

      <div className="relative h-[350px] w-full overflow-hidden rounded border border-stone-border/80 bg-[#020604]">
        <img
          src="/assets/flat-earth-situation-wall.png"
          alt="Tactical Atlas flat-earth polar situation map"
          className="absolute inset-0 h-full w-full object-cover object-center contrast-110 saturate-[0.88]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/10" />
        <div className="pointer-events-none absolute inset-0 scanline-overlay opacity-20" />

        <div className="absolute left-3 top-3 z-30 hidden w-28 space-y-1.5 sm:block">
          {mapLayers.map((layer) => {
            const Icon = layer.icon;
            const active = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayer(layer.id)}
                className={`flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left font-mono text-[7px] tracking-wider transition ${active ? 'border-emerald-300/60 bg-emerald-500/15 text-emerald-200' : 'border-stone-border bg-black/65 text-slate-400 hover:border-bronze-gold/50'}`}
              >
                <Icon className="h-3 w-3" /> {layer.label}
              </button>
            );
          })}
        </div>

        {EXPEDITION_LOCATIONS.map((loc) => {
          const isSelected = selectedLoc?.id === loc.id;
          return (
            <button
              type="button"
              key={loc.id}
              onClick={() => setSelectedLoc(loc)}
              style={{
                top: `${Math.max(18, Math.min(73, loc.y))}%`,
                left: `${Math.max(22, Math.min(82, loc.x + 10))}%`,
              }}
              aria-label={`Select ${loc.name}`}
              className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
            >
              {loc.active ? (
                <span className="relative flex items-center justify-center">
                  <span className="absolute h-10 w-10 animate-sonar-ripple rounded-full border border-tactical-green/70" />
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-tactical-green bg-[#07110d]/90 shadow-tactical">
                    <Crosshair
                      className="h-4 w-4 animate-spin text-tactical-green"
                      style={{ animationDuration: '8s' }}
                    />
                  </span>
                </span>
              ) : (
                <MapPin
                  className={`h-4 w-4 drop-shadow-[0_0_6px_rgba(200,155,60,0.8)] transition-transform group-hover:scale-125 ${isSelected ? 'scale-125 text-tactical-glow' : 'text-bronze-gold'}`}
                />
              )}
            </button>
          );
        })}

        {selectedLoc && (
          <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between gap-2 rounded border border-tactical-green/60 bg-[#03100c]/95 p-3 font-mono text-xs shadow-2xl backdrop-blur-sm sm:left-36">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100">{selectedLoc.name}</span>
                <span className="truncate rounded border border-stone-border bg-[#07110d] px-1.5 py-0.5 text-[9px] text-bronze-gold">
                  {selectedLoc.category}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[9px] text-slate-400">
                REGION: {selectedLoc.sub} | STATUS: {selectedLoc.status}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="text-right">
                <span className="block font-bold text-tactical-glow">{selectedLoc.progress}%</span>
                <span className="block text-[7px] uppercase text-slate-500">PROGRESS</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectCase(selectedLoc.caseId)}
                className="rounded border border-[#10B981] bg-[#064E3B] px-2.5 py-1 text-[9px] font-bold uppercase text-[#34D399] hover:bg-[#10B981]/30"
              >
                OPEN DOSSIER
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
