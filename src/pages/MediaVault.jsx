import React, { useState } from 'react';
import { Image, Upload, Download } from 'lucide-react';
import SafeImage from '../components/SafeImage';
import { VAULT_ASSETS } from '../data/mockData';

export default function MediaVault({ showToast }) {
  const [activeTab, setActiveTab] = useState('ALL');

  const tabs = ['ALL', 'IMAGES', 'AUDIO', 'DOCUMENTS', 'MAPS'];

  const filteredAssets =
    activeTab === 'ALL' ? VAULT_ASSETS : VAULT_ASSETS.filter((a) => a.type === activeTab);

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Image className="w-5 h-5 text-bronze-gold" />
            MEDIA VAULT // ASSET & RESOURCE MANAGER
          </h1>
          <p className="text-slate-400 mt-1">
            CONCEPT RENDERS, NARRATION AUDIO TRACKS, AND CARTOGRAPHIC MAPS
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showToast) showToast('SIMULATION: ASSET UPLOAD DIALOG OPENED');
          }}
          className="px-3 py-1.5 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-bronze-light font-bold rounded flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" /> UPLOAD NEW ASSET
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded border text-[10px] font-bold transition-colors ${
              activeTab === tab
                ? 'bg-bronze-gold/20 text-bronze-light border-bronze-gold'
                : 'bg-stone-panel border-stone-border text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((a) => (
          <div
            key={a.id}
            className="bg-stone-panel border border-stone-border rounded overflow-hidden group"
          >
            <div className="relative h-32 bg-stone-bg">
              <SafeImage
                src={a.image}
                alt={a.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-stone-bg/90 border border-stone-border text-[8px] text-bronze-gold rounded">
                {a.type}
              </span>
            </div>
            <div className="p-2.5 flex justify-between items-center text-[10px]">
              <span className="text-slate-200 truncate font-bold">{a.title}</span>
              <button
                type="button"
                aria-label={`Download ${a.title}`}
                onClick={() => {
                  if (showToast) showToast(`SIMULATION: DOWNLOADING ${a.title}`);
                }}
                className="text-bronze-gold hover:text-white flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
