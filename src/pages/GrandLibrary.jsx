import React, { useState } from 'react';
import { BookOpen, Search, FileText } from 'lucide-react';
import { LIBRARY_COLLECTIONS, CASE_FILES_EXPANDED } from '../data/mockData';

export default function GrandLibrary({ showToast }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredCases = CASE_FILES_EXPANDED.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-bronze-gold" />
            GRAND LIBRARY // RESEARCH COLLECTIONS
          </h1>
          <p className="text-slate-400 mt-1">
            SEARCHABLE REPOSITORY OF SCRIPTS, DOSSIERS, AND ARCHIVAL MANUSCRIPTS
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH RESEARCH..."
            aria-label="Search Research Collections"
            className="w-full pl-8 pr-3 py-1.5 bg-stone-bg border border-stone-border rounded text-xs text-slate-200 focus:outline-none focus:border-bronze-gold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LIBRARY_COLLECTIONS.map((c) => (
          <button
            type="button"
            key={c.id}
            onClick={() =>
              setSelectedCategory(selectedCategory === c.category ? 'ALL' : c.category)
            }
            className={`p-4 bg-stone-panel border rounded-lg cursor-pointer text-left transition-all ${
              selectedCategory === c.category
                ? 'border-bronze-gold bg-stone-card shadow-bronze'
                : 'border-stone-border hover:border-bronze-gold/40'
            }`}
          >
            <h3 className="font-serif font-bold text-sm text-slate-100">{c.title}</h3>
            <span className="text-[10px] text-slate-400 block mt-1">CATEGORY: {c.category}</span>
            <div className="flex justify-between items-center mt-3 text-[10px] text-bronze-gold">
              <span>{c.cases} DOSSIERS</span>
              <span>{c.assets} ASSETS</span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((item) => (
          <div
            key={item.id}
            className="bg-stone-panel border border-stone-border rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-bg border border-stone-border text-bronze-gold">
                {item.category}
              </span>
              <span className="text-tactical-glow font-bold">{item.progress}%</span>
            </div>
            <h3 className="font-serif font-bold text-sm text-slate-100">{item.title}</h3>
            <p className="text-[11px] text-slate-400">{item.subtitle}</p>
            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{item.notes}</p>
            <div className="pt-2 border-t border-stone-border/60 flex justify-between items-center text-[10px]">
              <span className="text-slate-500 truncate max-w-[180px]">
                TAGS: {item.tags.join(', ')}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (showToast) showToast(`VIEWING MANUSCRIPT FOR ${item.title}`);
                }}
                className="px-2 py-1 bg-stone-bg border border-stone-border rounded hover:border-bronze-gold text-slate-200 flex items-center gap-1 flex-shrink-0"
              >
                <FileText className="w-3 h-3 text-bronze-gold" /> VIEW
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
