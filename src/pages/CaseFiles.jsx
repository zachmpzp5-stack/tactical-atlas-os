import React, { useState, useEffect } from 'react';
import { Shield, Search } from 'lucide-react';
import SafeImage from '../components/SafeImage';
import { CASE_FILES_EXPANDED } from '../data/mockData';

export default function CaseFiles({ selectedId, showToast }) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState(
    () => CASE_FILES_EXPANDED.find((c) => c.id === selectedId) || CASE_FILES_EXPANDED[0]
  );

  useEffect(() => {
    if (selectedId) {
      const found = CASE_FILES_EXPANDED.find((c) => c.id === selectedId);
      if (found) setSelectedCase(found);
    }
  }, [selectedId]);

  const stages = [
    'ALL',
    'Planning',
    'Research',
    'Writing',
    'Narration',
    'Visuals',
    'Editing',
    'Publishing',
  ];

  const filtered = CASE_FILES_EXPANDED.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || c.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Shield className="w-5 h-5 text-bronze-gold" />
            CASE FILES // ACTIVE INVESTIGATIONS DATABASE
          </h1>
          <p className="text-slate-400 mt-1">
            MASTER DATABASE OF EXPEDITION DOSSIERS, SCRIPTS, AND PUBLISHING STAGES
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH CASES..."
              aria-label="Search Case Files"
              className="pl-8 pr-3 py-1.5 bg-stone-bg border border-stone-border rounded text-xs text-slate-200 focus:outline-none focus:border-bronze-gold"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {stages.map((st) => (
          <button
            type="button"
            key={st}
            onClick={() => setStageFilter(st)}
            className={`px-2.5 py-1 rounded border text-[10px] font-bold transition-colors ${
              stageFilter === st
                ? 'bg-bronze-gold/20 text-bronze-light border-bronze-gold'
                : 'bg-stone-panel border-stone-border text-slate-400 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-stone-panel border border-stone-border rounded-lg p-3 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-border text-[9px] text-bronze-gold">
                <th className="p-2">CASE ID</th>
                <th className="p-2">TITLE</th>
                <th className="p-2">STAGE</th>
                <th className="p-2">PROGRESS</th>
                <th className="p-2">PRIORITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-border/40">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className={`cursor-pointer transition-colors ${
                    selectedCase?.id === item.id
                      ? 'bg-stone-card font-bold text-slate-100'
                      : 'hover:bg-stone-bg text-slate-300'
                  }`}
                >
                  <td className="p-2 text-bronze-gold">{item.id}</td>
                  <td className="p-2">
                    <span className="block font-serif font-bold text-xs">{item.title}</span>
                    <span className="text-[9px] text-slate-500 block">{item.subtitle}</span>
                  </td>
                  <td className="p-2">
                    <span className="px-1.5 py-0.5 rounded bg-stone-bg border border-stone-border text-[9px]">
                      {item.stage}
                    </span>
                  </td>
                  <td className="p-2 text-tactical-glow">{item.progress}%</td>
                  <td className="p-2 text-amber-500">{item.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedCase && (
          <div className="lg:col-span-5 bg-stone-panel border border-stone-border rounded-lg p-4 space-y-4">
            <div className="relative h-40 bg-stone-bg rounded border border-stone-border overflow-hidden">
              <SafeImage
                src={selectedCase.image}
                alt={selectedCase.title}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-panel via-transparent to-transparent"></div>
              <div className="absolute bottom-2 left-3">
                <span className="text-[10px] text-bronze-gold font-bold block">
                  {selectedCase.id}
                </span>
                <h2 className="font-serif font-bold text-lg text-slate-100">
                  {selectedCase.title}
                </h2>
                <span className="text-xs text-slate-300 block">{selectedCase.subtitle}</span>
              </div>
            </div>

            <div className="bg-stone-bg p-3 rounded border border-stone-border space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>CATEGORY:</span>
                <span className="text-slate-200">{selectedCase.category}</span>
              </div>
              <div className="flex justify-between">
                <span>STAGE:</span>
                <span className="text-tactical-glow">{selectedCase.stage}</span>
              </div>
              <div className="flex justify-between">
                <span>NARRATION:</span>
                <span className="text-slate-200">{selectedCase.narrationStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>VISUALS:</span>
                <span className="text-slate-200">{selectedCase.visualStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>OWNER:</span>
                <span className="text-bronze-gold">{selectedCase.owner}</span>
              </div>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed bg-stone-bg/60 p-2.5 border border-stone-border rounded">
              {selectedCase.notes}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (showToast)
                    showToast(`SIMULATION: DOSSIER ${selectedCase.id} OPENED FOR EDITING`);
                }}
                className="flex-1 py-2 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-bronze-light font-bold rounded uppercase"
              >
                EDIT DOSSIER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
