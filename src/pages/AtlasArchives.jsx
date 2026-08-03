import React, { useState } from 'react';
import { Archive, Search, ExternalLink } from 'lucide-react';
import SafeImage from '../components/SafeImage';
import { ARCHIVES_COLLECTION } from '../data/mockData';

export default function AtlasArchives({ showToast }) {
  const [search, setSearch] = useState('');

  const filtered = ARCHIVES_COLLECTION.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Archive className="w-5 h-5 text-bronze-gold" />
            ATLAS ARCHIVES // HISTORICAL CASE COLLECTIONS
          </h1>
          <p className="text-slate-400 mt-1">
            PERMANENT DECLASSIFIED VAULT OF EXPEDITIONS AND TELEMETRY
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH ARCHIVES..."
            aria-label="Search Archives"
            className="w-full pl-8 pr-3 py-1.5 bg-stone-bg border border-stone-border rounded text-xs text-slate-200 focus:outline-none focus:border-bronze-gold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((a) => (
          <div
            key={a.id}
            className="bg-stone-panel border border-stone-border rounded-lg overflow-hidden flex flex-col justify-between hover:border-bronze-gold/50 transition-all"
          >
            <div>
              <div className="relative h-36 bg-stone-bg">
                <SafeImage
                  src={a.image}
                  alt={a.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-stone-bg/80 border border-stone-border rounded text-[9px] text-tactical-glow">
                  {a.progress}% COMPLETE
                </div>
              </div>
              <div className="p-3 space-y-1.5">
                <h3 className="font-serif font-bold text-sm text-slate-100">{a.title}</h3>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {a.description}
                </p>
              </div>
            </div>

            <div className="p-3 border-t border-stone-border flex justify-between items-center text-[10px] text-bronze-gold">
              <span>{a.episodes} EPISODES</span>
              <button
                type="button"
                onClick={() => {
                  if (showToast) showToast(`SIMULATION: ARCHIVE FILE ${a.title} OPENED`);
                }}
                className="px-2 py-1 bg-stone-bg border border-stone-border rounded hover:border-bronze-gold text-slate-200 flex items-center gap-1"
              >
                OPEN <ExternalLink className="w-3 h-3 text-bronze-gold" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
