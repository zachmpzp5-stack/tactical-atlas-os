import React, { useState } from 'react';
import { Compass, Crosshair, MapPin, ArrowRight } from 'lucide-react';
import { EXPEDITION_LOCATIONS } from '../data/mockData';

export default function ExpeditionMap({ onSelectCase }) {
  const [selectedLoc, setSelectedLoc] = useState(EXPEDITION_LOCATIONS[0]);

  return (
    <div className="bg-stone-panel border border-stone-border rounded-lg p-4 flex flex-col justify-between relative overflow-hidden min-h-[360px]">
      <div className="flex items-center justify-between pb-2 border-b border-stone-border mb-2 z-10">
        <div>
          <h3 className="font-serif font-bold text-sm tracking-wider text-slate-100 uppercase">
            EXPEDITION MAP
          </h3>
          <span className="font-mono text-[9px] text-bronze-gold uppercase block">
            GLOBAL INVESTIGATION TRACKER
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSelectCase(selectedLoc?.caseId)}
          className="px-3 py-1 bg-stone-bg hover:bg-stone-card border border-stone-border text-xs font-mono text-slate-300 rounded transition-colors uppercase flex items-center gap-1"
        >
          VIEW CASE <ArrowRight className="w-3 h-3 text-bronze-gold" />
        </button>
      </div>

      <div className="relative w-full h-64 bg-stone-bg/90 bg-map-texture rounded border border-stone-border overflow-hidden">
        <div className="absolute inset-0 opacity-15 flex items-center justify-center pointer-events-none">
          <Compass className="w-64 h-64 text-bronze-gold animate-radar-sweep" />
        </div>

        {EXPEDITION_LOCATIONS.map((loc) => {
          const isSelected = selectedLoc?.id === loc.id;
          return (
            <button
              type="button"
              key={loc.id}
              onClick={() => setSelectedLoc(loc)}
              style={{ top: `${loc.y}%`, left: `${loc.x}%` }}
              aria-label={`Select ${loc.name}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group focus:outline-none"
            >
              <div className="relative flex items-center justify-center">
                {loc.active ? (
                  <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border border-tactical-green/60 animate-ping absolute"></div>
                    <div className="w-7 h-7 rounded-full border border-tactical-green flex items-center justify-center bg-stone-bg shadow-glow-green">
                      <Crosshair
                        className="w-4 h-4 text-tactical-green animate-spin"
                        style={{ animationDuration: '8s' }}
                      />
                    </div>
                  </div>
                ) : (
                  <MapPin
                    className={`w-4 h-4 transition-transform group-hover:scale-125 ${
                      isSelected ? 'text-tactical-glow scale-125' : 'text-bronze-gold'
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}

        {selectedLoc && (
          <div className="absolute bottom-3 left-3 right-3 bg-stone-panel/95 border border-bronze-gold/50 rounded p-3 font-mono text-xs z-30 backdrop-blur-sm flex items-center justify-between gap-2 shadow-2xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100">{selectedLoc.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-bg border border-stone-border text-bronze-gold">
                  {selectedLoc.category}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                REGION: {selectedLoc.sub} | STATUS: {selectedLoc.status}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-tactical-glow font-bold block">{selectedLoc.progress}%</span>
                <span className="text-[8px] text-slate-500 uppercase block">PROGRESS</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectCase(selectedLoc.caseId)}
                className="px-2.5 py-1 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-bronze-light text-[10px] rounded uppercase font-bold"
              >
                OPEN DOSSIER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
