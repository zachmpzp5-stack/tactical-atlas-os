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
import {
  buildNodeFeed,
  getSituationIntelligence,
  summarizeThreats,
  THREAT_LEVELS,
} from '../lib/situation-wall';

const mapLayers = [
  { id: 'MAP', label: 'MAP LAYERS', icon: Layers3 },
  { id: 'NODES', label: 'NODE FEED', icon: RadioTower },
  { id: 'THREATS', label: 'THREAT VIEW', icon: ShieldAlert },
  { id: 'SATELLITE', label: 'SATELLITE LINK', icon: Satellite },
];

const threatStyles = {
  HIGH: 'border-red-400 bg-red-500/20 text-red-200 shadow-[0_0_14px_rgba(248,113,113,0.55)]',
  ELEVATED:
    'border-orange-300 bg-orange-500/20 text-orange-100 shadow-[0_0_14px_rgba(251,146,60,0.45)]',
  GUARDED: 'border-amber-300 bg-amber-500/15 text-amber-100 shadow-[0_0_12px_rgba(252,211,77,0.4)]',
  LOW: 'border-emerald-300 bg-emerald-500/15 text-emerald-100 shadow-[0_0_12px_rgba(52,211,153,0.4)]',
};

const threatTextStyles = {
  HIGH: 'text-red-300',
  ELEVATED: 'text-orange-200',
  GUARDED: 'text-amber-200',
  LOW: 'text-emerald-300',
};

export default function ExpeditionMap({ onSelectCase, nodeStatuses = {} }) {
  const [selectedLoc, setSelectedLoc] = useState(EXPEDITION_LOCATIONS[0]);
  const [activeLayer, setActiveLayer] = useState('MAP');
  const selectedIntel = getSituationIntelligence(selectedLoc);
  const threatSummary = summarizeThreats(EXPEDITION_LOCATIONS);
  const nodeFeed = buildNodeFeed(nodeStatuses);
  const assignedNode = nodeFeed.find((node) => node.id === selectedIntel.node) || nodeFeed[0];
  const readyNodes = nodeFeed.filter((node) =>
    ['READY', 'ONLINE', 'ADAPTER READY', 'CONFIGURED'].includes(node.status)
  ).length;

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
          <span className="status-chip status-chip-green hidden sm:inline" aria-live="polite">
            {activeLayer === 'NODES'
              ? `${readyNodes}/9 NODES`
              : activeLayer === 'THREATS'
                ? `${threatSummary.HIGH + threatSummary.ELEVATED} ALERTS`
                : activeLayer === 'SATELLITE'
                  ? `${selectedIntel.signal}% LINK`
                  : 'MAP ACTIVE'}
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

        <div className="absolute left-3 top-3 z-30 grid w-[calc(100%-1.5rem)] grid-cols-2 gap-1.5 sm:w-28 sm:grid-cols-1">
          {mapLayers.map((layer) => {
            const Icon = layer.icon;
            const active = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayer(layer.id)}
                aria-pressed={active}
                className={`flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left font-mono text-[7px] tracking-wider transition ${active ? 'border-emerald-300/60 bg-emerald-500/15 text-emerald-200' : 'border-stone-border bg-black/65 text-slate-400 hover:border-bronze-gold/50'}`}
              >
                <Icon className="h-3 w-3" /> {layer.label}
              </button>
            );
          })}
        </div>

        {activeLayer === 'NODES' && (
          <aside
            className="absolute right-3 top-24 z-30 w-44 rounded border border-emerald-300/40 bg-[#03100c]/95 p-2 shadow-2xl backdrop-blur-sm sm:top-3"
            aria-label="TAAN node feed"
          >
            <div className="mb-2 flex items-center justify-between font-mono text-[8px]">
              <span className="text-slate-200">TAAN NODE FEED</span>
              <span className="text-emerald-300">{readyNodes}/9 READY</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {nodeFeed.map((node) => (
                <div
                  key={node.id}
                  className={`rounded border px-1 py-1 text-center font-mono text-[6px] ${node.id === selectedIntel.node ? 'border-bronze-gold bg-bronze-gold/10 text-bronze-light' : 'border-emerald-400/20 bg-black/40 text-slate-400'}`}
                  title={`${node.id}: ${node.role} // ${node.status}`}
                >
                  <RadioTower className="mx-auto mb-0.5 h-2.5 w-2.5" />
                  <strong className="block">{node.id}</strong>
                  <span className="block truncate">{node.status}</span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {activeLayer === 'THREATS' && (
          <aside
            className="absolute right-3 top-24 z-30 w-44 rounded border border-red-300/35 bg-[#120806]/95 p-2 shadow-2xl backdrop-blur-sm sm:top-3"
            aria-label="Threat level summary"
          >
            <div className="mb-2 flex items-center gap-1 font-mono text-[8px] text-red-200">
              <ShieldAlert className="h-3 w-3" /> THREAT LEVEL VIEW
            </div>
            <div className="grid grid-cols-2 gap-1">
              {THREAT_LEVELS.map((level) => (
                <div
                  key={level}
                  className={`rounded border px-1.5 py-1 font-mono text-[7px] ${threatStyles[level]}`}
                >
                  <strong>{threatSummary[level]}</strong> {level}
                </div>
              ))}
            </div>
            <p className="mt-2 font-mono text-[7px] leading-3 text-slate-300">
              SELECTED //{' '}
              <span className={threatTextStyles[selectedIntel.threat]}>{selectedIntel.threat}</span>
            </p>
          </aside>
        )}

        {activeLayer === 'SATELLITE' && (
          <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(16,185,129,0.09)_19%,transparent_20%,transparent_38%,rgba(16,185,129,0.08)_39%,transparent_40%)]" />
            <div
              className="absolute left-1/2 top-1/2 h-px w-[65%] origin-left -translate-y-1/2 animate-spin bg-gradient-to-r from-emerald-300/70 to-transparent"
              style={{ animationDuration: '5s' }}
            />
            <div className="absolute right-3 top-24 rounded border border-cyan-300/35 bg-[#03100c]/90 p-2 font-mono text-[8px] text-cyan-100 sm:top-3">
              SAT-LINK {selectedIntel.signal}% // TRACKING {selectedLoc?.name}
            </div>
          </div>
        )}

        {EXPEDITION_LOCATIONS.map((loc) => {
          const isSelected = selectedLoc?.id === loc.id;
          const intelligence = getSituationIntelligence(loc);
          const nodeState =
            nodeFeed.find((node) => node.id === intelligence.node)?.status || 'READY';
          const markerLabel =
            activeLayer === 'THREATS'
              ? `Select ${loc.name}, threat ${intelligence.threat}`
              : activeLayer === 'NODES'
                ? `Select ${loc.name}, assigned node ${intelligence.node}, ${nodeState}`
                : `Select ${loc.name}`;
          return (
            <button
              type="button"
              key={loc.id}
              onClick={() => setSelectedLoc(loc)}
              style={{
                top: `${Math.max(18, Math.min(73, loc.y))}%`,
                left: `${Math.max(22, Math.min(82, loc.x + 10))}%`,
              }}
              aria-label={markerLabel}
              className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
            >
              {activeLayer === 'THREATS' ? (
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${threatStyles[intelligence.threat]} ${isSelected ? 'scale-125' : ''}`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                </span>
              ) : activeLayer === 'NODES' ? (
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${isSelected ? 'border-bronze-gold bg-bronze-gold/20 text-bronze-light' : 'border-emerald-300/60 bg-[#07110d]/90 text-emerald-300'}`}
                >
                  <RadioTower className="h-3.5 w-3.5" />
                </span>
              ) : loc.active ? (
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
      </div>

      {selectedLoc && (
        <div className="mt-2 flex flex-col items-stretch justify-between gap-2 rounded border border-tactical-green/60 bg-[#03100c]/95 p-3 font-mono text-xs shadow-2xl sm:flex-row sm:items-center">
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
            <p className="mt-1 text-[8px] leading-3 text-slate-300" aria-live="polite">
              {activeLayer === 'NODES' && (
                <>
                  NODE {assignedNode?.id}
                  {' // '}
                  {assignedNode?.role}
                  {' // '}
                  <span className="text-emerald-300">{assignedNode?.status}</span>
                </>
              )}
              {activeLayer === 'THREATS' && (
                <>
                  THREAT{' '}
                  <span className={threatTextStyles[selectedIntel.threat]}>
                    {selectedIntel.threat}
                  </span>{' '}
                  {' // '}
                  {selectedIntel.note}
                </>
              )}
              {activeLayer === 'SATELLITE' && (
                <>
                  SATELLITE SIGNAL <span className="text-cyan-200">{selectedIntel.signal}%</span>{' '}
                  {' // '}TELEMETRY LOCKED
                </>
              )}
              {activeLayer === 'MAP' && (
                <>
                  CASE POSITION
                  {' // '}
                  {selectedLoc.caseId}
                </>
              )}
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
    </section>
  );
}
