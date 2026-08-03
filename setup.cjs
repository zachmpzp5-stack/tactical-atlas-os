/* ============================================================================
   TACTICAL ATLAS INTELLIGENCE OS — PROJECT GENERATOR (v3.0)
   File: setup.cjs
   Execution: node setup.cjs
   ============================================================================ */

const fs = require('fs');
const path = require('path');

console.log('----------------------------------------------------------------');
console.log('🚀 Generating Tactical Atlas Intelligence OS (v3.0)...');
console.log('----------------------------------------------------------------\n');

const projectFiles = {
  // 1. Package Manifest
  'package.json': JSON.stringify(
    {
      name: 'tactical-atlas-os',
      private: true,
      version: '3.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
        lint: 'eslint . --ext js,jsx --max-warnings 0',
        'format:check': 'prettier --check .',
        verify: 'npm run lint && npm run format:check && npm run build',
      },
      dependencies: {
        'lucide-react': '^0.344.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.22.0',
      },
      devDependencies: {
        '@types/react': '^18.2.55',
        '@types/react-dom': '^18.2.19',
        '@vitejs/plugin-react': '^4.2.1',
        autoprefixer: '^10.4.18',
        eslint: '^8.57.0',
        'eslint-plugin-jsx-a11y': '^6.8.0',
        'eslint-plugin-react': '^7.34.0',
        'eslint-plugin-react-hooks': '^4.6.0',
        postcss: '^8.4.35',
        prettier: '^3.2.5',
        tailwindcss: '^3.4.1',
        vite: '^5.1.0',
      },
    },
    null,
    2
  ),

  // 2. ESLint Config
  '.eslintrc.cjs': `module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'setup.cjs'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: '18.2',
    },
  },
  rules: {
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
  },
};`,

  // 3. Prettier Config
  '.prettierrc': JSON.stringify(
    {
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5',
      printWidth: 100,
    },
    null,
    2
  ),

  // 4. Prettier Ignore
  '.prettierignore': `node_modules
dist
package-lock.json`,

  // 5. Vite Config
  'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,

  // 6. Tailwind Config
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stone-bg': '#0B0D10',
        'stone-panel': '#12161E',
        'stone-card': '#171C26',
        'stone-border': '#222A38',
        'bronze-gold': '#C89B3C',
        'bronze-light': '#E0B55C',
        'bronze-dark': '#6B501B',
        'parchment-gold': '#D4AF37',
        'tactical-green': '#10B981',
        'tactical-glow': '#34D399',
        'tactical-dim': '#064E3B',
        'threat-red': '#EF4444',
        'weathered-steel': '#2A3240',
        'aged-parchment': '#E6D5B8',
        'moss-dark': '#132219',
        'mud-brown': '#3D2D1D',
        'archive-bronze': '#947128',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Cinzel"', 'Georgia', 'serif'],
        display: ['"Rajdhani"', '"Orbitron"', 'sans-serif'],
      },
      boxShadow: {
        'bronze': '0 0 15px rgba(200, 155, 60, 0.25)',
        'tactical': '0 0 15px rgba(16, 185, 129, 0.25)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 20px rgba(200, 155, 60, 0.4)',
        'inset-panel': 'inset 0 2px 6px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'map-texture': 'radial-gradient(circle, rgba(200, 155, 60, 0.08) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
};`,

  // 7. PostCSS Config
  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,

  // 8. HTML Entry
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tactical Atlas Intelligence Operating System</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Rajdhani:wght@600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-stone-bg text-slate-200 selection:bg-bronze-dark selection:text-white antialiased overflow-x-hidden">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,

  // 9. Netlify Config
  'netlify.toml': `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`,

  'public/_redirects': `/*    /index.html   200`,

  // 10. Tailwind Index CSS
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .bg-grid-pattern {
    background-size: 28px 28px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  }
}

@keyframes radar-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-radar-sweep {
  animation: radar-spin 6s linear infinite;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #0B0D10;
}
::-webkit-scrollbar-thumb {
  background: #222A38;
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: #C89B3C;
}`,

  // 11. Main Entry
  'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

  // 12. Safe Image Component
  'src/components/SafeImage.jsx': `import React, { useState } from 'react';

export default function SafeImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={\`bg-stone-card border border-stone-border flex items-center justify-center p-2 text-center text-bronze-gold font-serif text-[10px] uppercase select-none \${className || ''}\`}>
        <span>{alt || 'ARCHIVE MEDIA'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Archive Media'}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}`,

  // 13. Toast Component
  'src/components/Toast.jsx': `import React from 'react';
import { Info } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-10 right-6 z-50 bg-stone-panel border border-bronze-gold shadow-bronze px-4 py-2.5 rounded font-mono text-xs text-slate-100 flex items-center gap-2 animate-bounce">
      <Info className="w-4 h-4 text-bronze-gold flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}`,

  // 14. Mock Data Repository
  'src/data/mockData.js': `export const SYSTEM_STATUS = {
  userName: 'GENERAL HIIIT',
  role: 'COMMANDER OF INTELLIGENCE',
  clearance: 'OMEGA',
  publishingStatus: 'GREEN',
  statusLabel: 'ALL SYSTEMS GO',
  weeklyOutput: 18,
  activeCases: 12,
  episodesInProduction: 24,
  assetsGenerated: 1248,
  narrationStatus: 'CHARLIE - READY',
  pipelineActive: '78%',
  publishingQueue: 7,
};

export const EXPEDITION_LOCATIONS = [
  { id: 'EL_DORADO', caseId: 'CASE-001', name: 'EL DORADO', sub: 'SOUTH AMERICA', x: 28, y: 64, active: true, progress: 92, category: 'Lost Civilizations', status: 'Publishing Ready' },
  { id: 'OAK_ISLAND', caseId: 'CASE-002', name: 'OAK ISLAND', sub: 'NOVA SCOTIA', x: 26, y: 32, active: false, progress: 78, category: 'Hidden Treasures', status: 'Script In Review' },
  { id: 'HIGHJUMP', caseId: 'CASE-003', name: 'OPERATION HIGHJUMP', sub: 'ANTARCTICA', x: 38, y: 88, active: false, progress: 33, category: 'Historical Anomalies', status: 'Researching' },
  { id: 'ATLANTIS', caseId: 'CASE-004', name: 'ATLANTIS', sub: 'ATLANTIC OCEAN', x: 42, y: 45, active: false, progress: 54, category: 'Ancient Ruins', status: 'Assets Rendering' },
  { id: 'GOBEKLI', caseId: 'CASE-005', name: 'GOBEKLI TEPE', sub: 'TURKEY', x: 58, y: 36, active: false, progress: 60, category: 'Ancient Astronomy', status: 'Narration Complete' },
  { id: 'DEAD_SEA_SCROLLS', caseId: 'CASE-006', name: 'DEAD SEA SCROLLS', sub: 'QUMRAN CAVES', x: 62, y: 42, active: false, progress: 70, category: 'Sacred Records', status: 'Editing Episode' },
  { id: 'PIRI_REIS', caseId: 'CASE-007', name: 'PIRI REIS MAP', sub: 'OTTOMAN EMPIRE', x: 52, y: 50, active: false, progress: 50, category: 'Cartographic Relics', status: 'Researching' },
  { id: 'COPPER_SCROLL', caseId: 'CASE-008', name: 'COPPER SCROLL', sub: 'JORDAN', x: 60, y: 55, active: false, progress: 45, category: 'Decrypted Texts', status: 'Writing Script' },
  { id: 'ALEXANDRIA', caseId: 'CASE-009', name: 'LIBRARY OF ALEXANDRIA', sub: 'EGYPT', x: 61, y: 48, active: false, progress: 65, category: 'Lost Knowledge', status: 'Assets Rendering' },
  { id: 'DERINKUYU', caseId: 'CASE-010', name: 'DERINKUYU', sub: 'CAPPADOCIA', x: 59, y: 39, active: false, progress: 40, category: 'Subterranean Cities', status: 'Planning' },
  { id: 'ADMIRAL_BYRD', caseId: 'CASE-011', name: 'ADMIRAL BYRD DIARIES', sub: 'NORTH POLE', x: 48, y: 15, active: false, progress: 82, category: 'Exploration Records', status: 'Narration Queue' },
  { id: 'WOOLPIT', caseId: 'CASE-012', name: 'GREEN CHILDREN OF WOOLPIT', sub: 'ENGLAND', x: 49, y: 28, active: false, progress: 28, category: 'Forbidden Knowledge', status: 'Initial Research' },
];

export const INTELLIGENCE_FEED = [
  { id: 1, title: 'El Dorado script approved by Commander', time: '2m ago', type: 'Script', read: false },
  { id: 2, title: 'Charlie narration voiceover generated', time: '7m ago', type: 'Narration', read: false },
  { id: 3, title: '20 image visual pack concept planned', time: '12m ago', type: 'Visuals', read: false },
  { id: 4, title: 'Oak Island Money Pit archive updated', time: '18m ago', type: 'Archive', read: true },
  { id: 5, title: 'Library of Alexandria dossier expanded', time: '21m ago', type: 'Research', read: true },
  { id: 6, title: 'Thumbnail concept rendered for Episode 3', time: '25m ago', type: 'Media', read: true },
  { id: 7, title: 'Episode 06 9:16 vertical plan exported', time: '32m ago', type: 'Export', read: true },
  { id: 8, title: 'TikTok distribution package ready', time: '45m ago', type: 'Publish', read: true },
];

export const PIPELINE_STEPS = [
  { step: 'RESEARCH', progress: 100, status: 'DONE' },
  { step: 'SCRIPT', progress: 85, status: 'ACTIVE' },
  { step: 'NARRATION', progress: 90, status: 'READY' },
  { step: 'VISUALS', progress: 95, status: 'ACTIVE' },
  { step: 'EDITING', progress: 70, status: 'ACTIVE' },
  { step: 'PUBLISH', progress: 25, status: 'QUEUED' },
];

export const LIBRARY_COLLECTIONS = [
  { id: 'CIVILIZATIONS', title: 'ANCIENT CIVILIZATIONS', category: 'Lost Civilizations', cases: 18, assets: 240 },
  { id: 'HISTORIES', title: 'LOST HISTORIES', category: 'Lost Knowledge', cases: 14, assets: 185 },
  { id: 'KNOWLEDGE', title: 'FORBIDDEN KNOWLEDGE', category: 'Forbidden Knowledge', cases: 12, assets: 150 },
  { id: 'PLACES', title: 'HIDDEN PLACES', category: 'Hidden Treasures', cases: 16, assets: 310 },
];

export const CASE_FILES_EXPANDED = [
  {
    id: 'CASE-001',
    title: 'EL DORADO',
    subtitle: 'THE CITY OF GOLD',
    category: 'Lost Civilizations',
    priority: 'HIGH',
    owner: 'General HIIIT',
    stage: 'Publishing',
    progress: 92,
    status: 'Publishing Ready',
    lastUpdated: '10m ago',
    researchStatus: 'Complete',
    scriptStatus: 'Approved',
    narrationStatus: 'Charlie - Ready',
    visualStatus: '20 Shots Planned',
    editingStatus: 'Rendered (9:16)',
    publishingStatus: 'Scheduled',
    notes: 'Primary investigation focused on 16th-century Spanish cartography and subterranean river systems in Colombia.',
    tags: ['Gold', 'South America', 'Cartography', 'Mythology'],
    linkedArchive: 'ARCH-001-GOLD',
    recentActivity: 'Thumbnail and master track verified.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CASE-002',
    title: 'OAK ISLAND',
    subtitle: 'THE MONEY PIT',
    category: 'Hidden Treasures',
    priority: 'HIGH',
    owner: 'Investigator Vance',
    stage: 'Editing',
    progress: 78,
    status: 'Script In Review',
    lastUpdated: '18m ago',
    researchStatus: 'Complete',
    scriptStatus: 'In Review',
    narrationStatus: 'Queued',
    visualStatus: '15 Shots Ready',
    editingStatus: 'In Progress',
    publishingStatus: 'Queued',
    notes: 'Deep borehole analysis and Templar parchment linkage verified against 18th-century local records.',
    tags: ['Money Pit', 'Nova Scotia', 'Templars', 'Engineering'],
    linkedArchive: 'ARCH-002-OAK',
    recentActivity: 'Parchment translation cross-referenced.',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CASE-003',
    title: 'OPERATION HIGHJUMP',
    subtitle: 'THE ANTARCTIC EXPEDITION',
    category: 'Historical Anomalies',
    priority: 'HIGH',
    owner: 'Investigator Vance',
    stage: 'Research',
    progress: 33,
    status: 'Researching',
    lastUpdated: '2h ago',
    researchStatus: 'In Progress',
    scriptStatus: 'Outline Ready',
    narrationStatus: 'Pending',
    visualStatus: '5 Concept Shots',
    editingStatus: 'Pending',
    publishingStatus: 'Draft',
    notes: '1946 Admiral Byrd logs and magnetic sensor readings mapped near Queen Maud Land.',
    tags: ['Antarctica', 'Admiral Byrd', '1946', 'Ice Caves'],
    linkedArchive: 'ARCH-005-ANT',
    recentActivity: 'Magnetic anomaly telemetry ingested.',
    image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CASE-004',
    title: 'ATLANTIS',
    subtitle: 'THE SUNKEN CIVILIZATION',
    category: 'Ancient Ruins',
    priority: 'HIGH',
    owner: 'General HIIIT',
    stage: 'Narration',
    progress: 54,
    status: 'Narration Queue',
    lastUpdated: '1h ago',
    researchStatus: 'Complete',
    scriptStatus: 'Approved',
    narrationStatus: 'In Studio',
    visualStatus: '18 Shots Ready',
    editingStatus: 'Pending',
    publishingStatus: 'Draft',
    notes: 'Cross-referencing Plato Critias dialogue measurements against Richat Structure satellite telemetry.',
    tags: ['Atlantis', 'Richat Structure', 'Plato', 'Oceanography'],
    linkedArchive: 'ARCH-004-ATL',
    recentActivity: 'Charlie narrator voice synthesis initialized.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CASE-005',
    title: 'GOBEKLI TEPE',
    subtitle: 'ANCIENT ASTRONOMY',
    category: 'Ancient Astronomy',
    priority: 'MEDIUM',
    owner: 'Archivist Drake',
    stage: 'Narration',
    progress: 60,
    status: 'Narration Complete',
    lastUpdated: '3h ago',
    researchStatus: 'Complete',
    scriptStatus: 'Approved',
    narrationStatus: 'Charlie - Complete',
    visualStatus: '10 Shots Ready',
    editingStatus: 'Pending',
    publishingStatus: 'Queued',
    notes: 'Pillar 43 Vulture Stone star alignments matched against 9600 BC astronomical precession models.',
    tags: ['Turkey', 'Monoliths', 'Precession', 'Stone Age'],
    linkedArchive: 'ARCH-006-GOB',
    recentActivity: 'Acoustic resonance logs synced.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CASE-006',
    title: 'DEAD SEA SCROLLS',
    subtitle: 'QUMRAN CAVES',
    category: 'Sacred Records',
    priority: 'MEDIUM',
    owner: 'General HIIIT',
    stage: 'Editing',
    progress: 70,
    status: 'Editing Episode',
    lastUpdated: '4h ago',
    researchStatus: 'Complete',
    scriptStatus: 'Approved',
    narrationStatus: 'Complete',
    visualStatus: '20 Shots Ready',
    editingStatus: 'Active',
    publishingStatus: 'Queued',
    notes: 'Multi-spectral imaging analysis of fragmented Cave 4 leather manuscripts.',
    tags: ['Qumran', 'Scrolls', 'Parchment', 'Judean Desert'],
    linkedArchive: 'ARCH-007-DSS',
    recentActivity: 'Multispectral image overlays finished.',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CASE-007',
    title: 'PIRI REIS MAP',
    subtitle: 'OTTOMAN CARTOGRAPHY',
    category: 'Cartographic Relics',
    priority: 'LOW',
    owner: 'Investigator Vance',
    stage: 'Writing',
    progress: 50,
    status: 'Researching',
    lastUpdated: '5h ago',
    researchStatus: 'Complete',
    scriptStatus: 'Writing',
    narrationStatus: 'Pending',
    visualStatus: '8 Shots Ready',
    editingStatus: 'Pending',
    publishingStatus: 'Draft',
    notes: '1513 gazelle skin map detailing ice-free Antarctic coastal contours.',
    tags: ['Cartography', '1513', 'Ottoman', 'Coastlines'],
    linkedArchive: 'ARCH-008-PRM',
    recentActivity: 'Coastline projection models rendered.',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CASE-008',
    title: 'COPPER SCROLL',
    subtitle: 'DECRYPTED TREASURE MAP',
    category: 'Decrypted Texts',
    priority: 'MEDIUM',
    owner: 'Archivist Drake',
    stage: 'Writing',
    progress: 45,
    status: 'Writing Script',
    lastUpdated: '6h ago',
    researchStatus: 'Complete',
    scriptStatus: 'Writing',
    narrationStatus: 'Pending',
    visualStatus: '6 Shots Ready',
    editingStatus: 'Pending',
    publishingStatus: 'Draft',
    notes: 'Catalogue of 64 hidden gold and silver locations in ancient Judea.',
    tags: ['Jordan', 'Copper', 'Treasure'],
    linkedArchive: 'ARCH-009-COP',
    recentActivity: 'Metallurgical survey logs attached.',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CASE-009',
    title: 'LIBRARY OF ALEXANDRIA',
    subtitle: 'THE LOST KNOWLEDGE',
    category: 'Lost Knowledge',
    priority: 'MEDIUM',
    owner: 'Archivist Drake',
    stage: 'Visuals',
    progress: 65,
    status: 'Assets Rendering',
    lastUpdated: '21m ago',
    researchStatus: 'Complete',
    scriptStatus: 'Approved',
    narrationStatus: 'Recorded',
    visualStatus: 'Rendering (12/20)',
    editingStatus: 'Pending',
    publishingStatus: 'Queued',
    notes: 'Reconstructing catalog scrolls from Herculaneum papyri fragments and Byzantine copies.',
    tags: ['Alexandria', 'Papyri', 'Ancient Manuscripts'],
    linkedArchive: 'ARCH-003-ALEX',
    recentActivity: '12 visual cards concepted.',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CASE-010',
    title: 'DERINKUYU',
    subtitle: 'SUBTERRANEAN CITY',
    category: 'Subterranean Cities',
    priority: 'LOW',
    owner: 'Investigator Vance',
    stage: 'Planning',
    progress: 40,
    status: 'Planning Stage',
    lastUpdated: '7h ago',
    researchStatus: 'In Progress',
    scriptStatus: 'Outline Ready',
    narrationStatus: 'Pending',
    visualStatus: '4 Shots Ready',
    editingStatus: 'Pending',
    publishingStatus: 'Draft',
    notes: '18-level underground city engineered for 20,000 inhabitants with ventilation shafts.',
    tags: ['Turkey', 'Underground', 'Architecture'],
    linkedArchive: 'ARCH-010-DER',
    recentActivity: '3D spatial laser scan maps ingested.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CASE-011',
    title: 'ADMIRAL BYRD DIARIES',
    subtitle: 'NORTH POLE EXPEDITION',
    category: 'Exploration Records',
    priority: 'HIGH',
    owner: 'General HIIIT',
    stage: 'Narration',
    progress: 82,
    status: 'Narration Queue',
    lastUpdated: '1h ago',
    researchStatus: 'Complete',
    scriptStatus: 'Approved',
    narrationStatus: 'Queued',
    visualStatus: '16 Shots Ready',
    editingStatus: 'Pending',
    publishingStatus: 'Draft',
    notes: '1926 polar flight flight-deck logs and unexplained compass deviations.',
    tags: ['North Pole', 'Byrd', 'Flight Logs'],
    linkedArchive: 'ARCH-011-BYRD',
    recentActivity: 'Audio script verified.',
    image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'CASE-012',
    title: 'GREEN CHILDREN OF WOOLPIT',
    subtitle: 'UNEXPLAINED PHENOMENA',
    category: 'Forbidden Knowledge',
    priority: 'LOW',
    owner: 'Archivist Drake',
    stage: 'Research',
    progress: 28,
    status: 'Initial Research',
    lastUpdated: '8h ago',
    researchStatus: 'In Progress',
    scriptStatus: 'Draft',
    narrationStatus: 'Pending',
    visualStatus: '2 Shots Ready',
    editingStatus: 'Pending',
    publishingStatus: 'Draft',
    notes: '12th-century Suffolk chronicle records of two green-skinned subterranean children.',
    tags: ['England', '12th Century', 'Folklore'],
    linkedArchive: 'ARCH-012-WOOL',
    recentActivity: 'Latin chronicle translation completed.',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80'
  }
];

export const ARCHIVES_COLLECTION = [
  { id: 'A1', title: 'EL DORADO', episodes: 13, assets: 240, progress: 92, status: 'Active', description: 'Complete catalog of Colombia lost gold rituals, Muisca raft artifacts, and Andean subterranean maps.', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
  { id: 'A2', title: 'ATLANTIS', episodes: 8, assets: 180, progress: 54, status: 'Active', description: 'Sub-surface oceanic resonance studies, Richat Structure photogrammetry, and classical text translations.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
  { id: 'A3', title: 'OPERATION HIGHJUMP', episodes: 6, assets: 110, progress: 33, status: 'Active', description: 'Declassified 1946 naval expedition logs, aerial photography, and polar anomaly tracking.', image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80' },
  { id: 'A4', title: 'LIBRARY OF ALEXANDRIA', episodes: 10, assets: 195, progress: 65, status: 'Active', description: 'Digital reconstruction of lost scroll indexes, ancient observatory plans, and Byzantine copies.', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80' },
  { id: 'A5', title: 'GOBEKLI TEPE', episodes: 6, assets: 140, progress: 60, status: 'Active', description: 'Stone pillar glyph translations, astronomical alignment models, and acoustic resonance tests.', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80' },
  { id: 'A6', title: 'DEAD SEA SCROLLS', episodes: 7, assets: 165, progress: 70, status: 'Active', description: 'Multispectral image scans of Cave 4 fragments and copper scroll inventory breakdown.', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80' },
  { id: 'A7', title: 'OAK ISLAND', episodes: 9, assets: 155, progress: 78, status: 'Active', description: 'Engineering diagrams of the flood tunnel system, Templar cipher logs, and artifact radio-carbon dates.', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80' },
  { id: 'A8', title: 'PIRI REIS MAP', episodes: 5, assets: 95, progress: 50, status: 'Active', description: '1513 portolan chart analysis, medieval projection comparison, and gazelle skin preservation records.', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80' }
];

export const VAULT_ASSETS = [
  { id: 'V1', title: 'El Dorado Map Concept', type: 'IMAGES', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
  { id: 'V2', title: 'Charlie Narration Track Ep 3', type: 'AUDIO', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80' },
  { id: 'V3', title: 'Oak Island Borehole Dossier', type: 'DOCUMENTS', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80' },
  { id: 'V4', title: '1513 Piri Reis Portolan Chart', type: 'MAPS', image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80' },
  { id: 'V5', title: 'Atlantis Richat Satellite Scan', type: 'IMAGES', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
  { id: 'V6', title: 'Qumran Cave 4 Fragment Map', type: 'MAPS', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80' },
  { id: 'V7', title: 'Highjump 1946 Audio Log', type: 'AUDIO', image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80' },
  { id: 'V8', title: 'Gobekli Pillar 43 Analysis', type: 'DOCUMENTS', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80' },
];`,

  // 15. AI Prompts Repository
  'src/data/aiPrompts.js': `export const AI_PROMPT_TEMPLATES = [
  {
    id: 'VISUAL_PACK',
    title: 'Generate Visual Asset Pack',
    category: 'Visuals',
    description: 'Produces 20 4K archival shot concepts with lighting & composition rules.',
    targetTool: 'Midjourney / DALL-E 3',
    estimatedOutput: '20 Image Cards',
    promptText: 'Generate 20 cinematic 4K archival render concepts for El Dorado lost gold temple ruins with atmospheric lighting, 35mm lens depth, and wet gold reflections.'
  },
  {
    id: 'NARRATION',
    title: 'Generate Charlie Voiceover Script',
    category: 'Narration',
    description: 'Drafts a 60-second or 10-minute documentary voiceover script formatted for Charlie narrator.',
    targetTool: 'ElevenLabs Charlie Model',
    estimatedOutput: '150 Words (60s)',
    promptText: 'Draft a tense, authoritative 60-second documentary narration script exploring the 1888 Patagonia expedition journals. Use dramatic pauses [pause] and focus on unresolved gold relics.'
  },
  {
    id: 'CASE_DOSSIER',
    title: 'Synthesize Case Dossier',
    category: 'Research',
    description: 'Compiles raw telemetry, maps, and historical citations into a structured case dossier.',
    targetTool: 'Atlas Research Engine',
    estimatedOutput: 'Structured Markdown Brief',
    promptText: 'Synthesize all available hydrophone records, satellite magnetometry, and 1946 Admiral Byrd log excerpts into an executive investigation dossier for Operation Highjump.'
  }
];`,

  // 16. Header Component
  'src/components/Header.jsx': `import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, Clock } from 'lucide-react';
import { SYSTEM_STATUS } from '../data/mockData';

export default function Header({ onToggleMobileMenu, onOpenNotifications, unreadCount }) {
  const [clockText, setClockText] = useState({ time: '00:00:00 UTC', date: '01 JAN 2026' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = months[now.getUTCMonth()];
      const year = now.getUTCFullYear();

      setClockText({
        time: \`\${hours}:\${mins}:\${secs} UTC\`,
        date: \`\${day} \${month} \${year}\`
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-stone-panel border-b border-stone-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Open Mobile Menu"
          className="p-2 rounded bg-stone-bg border border-stone-border text-slate-300 hover:text-white lg:hidden focus:outline-none focus:ring-2 focus:ring-bronze-gold"
        >
          <Menu className="w-5 h-5 text-bronze-gold" />
        </button>

        <div>
          <span className="font-mono text-[9px] text-slate-400 tracking-widest block uppercase">WELCOME BACK,</span>
          <h2 className="font-serif font-bold text-xs sm:text-sm text-slate-100 tracking-wider uppercase leading-none">
            {SYSTEM_STATUS.userName}
          </h2>
          <span className="font-mono text-[9px] text-bronze-gold tracking-widest hidden sm:block uppercase mt-0.5">
            {SYSTEM_STATUS.role}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-stone-bg border border-stone-border rounded font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-bronze-gold flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-bronze-gold font-bold leading-none">{clockText.time}</span>
            <span className="text-slate-500 text-[9px] leading-tight mt-0.5">{clockText.date}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="SEARCH INTEL, CASES..."
            aria-label="Search Intel and Cases"
            className="w-48 lg:w-64 pl-8 pr-3 py-1.5 bg-stone-bg border border-stone-border rounded text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-bronze-gold focus:ring-1 focus:ring-bronze-gold"
          />
        </div>

        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Open Notifications Drawer"
          className="relative p-2 rounded bg-stone-bg border border-stone-border text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-bronze-gold"
        >
          <Bell className="w-4 h-4 text-bronze-gold" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-tactical-green text-stone-bg text-[9px] font-mono font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 px-2.5 py-1 bg-stone-bg border border-bronze-gold/40 rounded font-mono text-xs">
          <span className="w-5 h-5 rounded bg-bronze-gold/20 text-bronze-gold flex items-center justify-center font-bold text-[10px]">
            TA
          </span>
          <span className="text-bronze-gold text-[10px] font-bold hidden sm:inline">CLEARANCE: {SYSTEM_STATUS.clearance}</span>
        </div>
      </div>
    </header>
  );
}`,

  // 17. Sidebar Component
  'src/components/Sidebar.jsx': `import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Compass, LayoutDashboard, BookOpen, Archive, Image, 
  Globe, Shield, BarChart2, Cpu, Settings, Activity, X 
} from 'lucide-react';

export default function Sidebar({ isMobileOpen, onClose }) {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const navItems = [
    { name: 'HEADQUARTERS', path: '/', icon: LayoutDashboard },
    { name: 'OPERATIONS', path: '/operations', icon: Compass },
    { name: 'GRAND LIBRARY', path: '/library', icon: BookOpen },
    { name: 'ATLAS ARCHIVES', path: '/archives', icon: Archive },
    { name: 'MEDIA VAULT', path: '/vault', icon: Image },
    { name: 'RESEARCH NETWORK', path: '/research', icon: Globe },
    { name: 'CASE FILES', path: '/cases', icon: Shield },
    { name: 'AI PRODUCTION', path: '/ai-studio', icon: Cpu },
    { name: 'ANALYTICS', path: '/analytics', icon: BarChart2 },
    { name: 'SYSTEM STATUS', path: '/status', icon: Activity },
    { name: 'SETTINGS', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation overlay"
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden cursor-default border-none w-full h-full"
        />
      )}

      <aside
        className={\`fixed top-0 bottom-0 left-0 w-64 bg-stone-panel border-r border-stone-border z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 \${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }\`}
      >
        <div>
          <div className="p-4 border-b border-stone-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded border border-bronze-gold flex items-center justify-center bg-stone-bg shadow-bronze">
                <Compass className="w-5 h-5 text-bronze-gold animate-spin" style={{ animationDuration: '24s' }} />
              </div>
              <div>
                <h1 className="font-serif font-black text-xs tracking-wider text-slate-100 uppercase leading-none">
                  TACTICAL ATLAS
                </h1>
                <span className="font-mono text-[8px] text-bronze-gold tracking-widest block mt-0.5 uppercase">
                  INTELLIGENCE OS v3.0
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Sidebar"
              className="p-1 text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] font-mono text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    \`flex items-center gap-3 px-3 py-2.5 rounded transition-all group tracking-wider uppercase \${
                      isActive
                        ? 'bg-tactical-dim/80 text-tactical-glow border-l-2 border-tactical-green shadow-tactical font-bold'
                        : 'text-slate-400 hover:bg-stone-card hover:text-slate-200'
                    }\`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-bronze-gold transition-colors" />
                  <span className="truncate text-[11px]">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-stone-border bg-stone-bg/80">
          <p className="font-serif text-[9px] text-bronze-gold/90 italic leading-tight">
            "THE TRUTH IS OUT THERE. WE FIND IT. WE SHARE IT. WE REMEMBER."
          </p>
          <span className="font-mono text-[8px] text-slate-500 block mt-1 font-bold">
            — GENERAL HIIIT
          </span>
        </div>
      </aside>
    </>
  );
}`,

  // 18. Footer Component
  'src/components/Footer.jsx': `import React from 'react';
import { Compass, Database, Shield } from 'lucide-react';
import { SYSTEM_STATUS } from '../data/mockData';

export default function Footer() {
  return (
    <footer className="bg-stone-panel border-t border-stone-border py-2 px-4 sm:px-6 text-[10px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-20">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-bronze-gold" />
          SYSTEM: <span className="text-slate-300">TACTICAL ATLAS OS v3.0</span>
        </span>
        <span className="hidden md:flex items-center gap-1">
          <Database className="w-3 h-3 text-tactical-green" />
          ACTIVE CASES: <span className="text-slate-300">{SYSTEM_STATUS.activeCases}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Shield className="w-3 h-3 text-bronze-gold" />
        <span className="tracking-widest text-slate-400 uppercase">
          CLASSIFIED RESEARCH NETWORK // AUTHORIZED EYES ONLY
        </span>
      </div>
    </footer>
  );
}`,

  // 19. Status Badge Component
  'src/components/StatusBadge.jsx': `import React from 'react';

export default function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-tactical-green/40 bg-tactical-dim/40 text-tactical-glow font-mono text-[10px] font-bold uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-tactical-green animate-pulse"></span>
      {status}
    </span>
  );
}`,

  // 20. Expedition Map Component
  'src/components/ExpeditionMap.jsx': `import React, { useState } from 'react';
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
              style={{ top: \`\${loc.y}%\`, left: \`\${loc.x}%\` }}
              aria-label={\`Select \${loc.name}\`}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group focus:outline-none"
            >
              <div className="relative flex items-center justify-center">
                {loc.active ? (
                  <div className="relative flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border border-tactical-green/60 animate-ping absolute"></div>
                    <div className="w-7 h-7 rounded-full border border-tactical-green flex items-center justify-center bg-stone-bg shadow-glow-green">
                      <Crosshair className="w-4 h-4 text-tactical-green animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                  </div>
                ) : (
                  <MapPin className={\`w-4 h-4 transition-transform group-hover:scale-125 \${
                    isSelected ? 'text-tactical-glow scale-125' : 'text-bronze-gold'
                  }\`} />
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
              <p className="text-[10px] text-slate-400 mt-0.5">REGION: {selectedLoc.sub} | STATUS: {selectedLoc.status}</p>
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
}`,

  // 21. Production Pipeline Component
  'src/components/ProductionPipeline.jsx': `import React from 'react';
import { PIPELINE_STEPS } from '../data/mockData';

export default function ProductionPipeline() {
  return (
    <div className="bg-stone-panel border border-stone-border rounded-lg p-4">
      <h3 className="font-serif font-bold text-xs sm:text-sm tracking-wider text-slate-100 uppercase mb-0.5">
        PRODUCTION PIPELINE
      </h3>
      <span className="font-mono text-[9px] text-bronze-gold uppercase block mb-3">
        CONTENT CREATION WORKFLOW STAGES
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {PIPELINE_STEPS.map((s) => (
          <div key={s.step} className="bg-stone-bg border border-stone-border rounded p-2 font-mono">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-300 font-bold">{s.step}</span>
              <span className="text-[9px] text-tactical-glow">{s.progress}%</span>
            </div>
            <div className="w-full h-1 bg-stone-border rounded overflow-hidden">
              <div
                className="h-full bg-tactical-green transition-all"
                style={{ width: \`\${s.progress}%\` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  // 22. Notification Panel Drawer
  'src/components/NotificationPanel.jsx': `import React, { useEffect } from 'react';
import { X, Bell, CheckCheck } from 'lucide-react';

export default function NotificationPanel({ isOpen, onClose, notifications, onMarkAllRead }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification panel overlay"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-default border-none w-full h-full"
      />

      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Intelligence Feed Notifications"
        className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-stone-panel border-l border-stone-border z-50 shadow-2xl p-4 flex flex-col font-mono text-xs"
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-border mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-bronze-gold" />
            <h3 className="font-serif font-bold text-sm text-slate-100 uppercase">INTELLIGENCE FEED</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Notification Panel"
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={\`p-2.5 rounded border transition-colors \${
                item.read
                  ? 'bg-stone-bg/50 border-stone-border/40 opacity-70'
                  : 'bg-stone-bg border-stone-border hover:border-bronze-gold/40'
              }\`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-panel border border-stone-border text-bronze-gold font-bold">
                  {item.type}
                </span>
                <span className="text-[9px] text-slate-500">{item.time}</span>
              </div>
              <p className="text-slate-200 leading-snug">{item.title}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-stone-border mt-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="w-full py-2 bg-stone-bg hover:bg-stone-card border border-stone-border text-slate-300 rounded font-bold uppercase flex items-center justify-center gap-2"
          >
            <CheckCheck className="w-3.5 h-3.5 text-tactical-green" />
            MARK ALL AS READ
          </button>
        </div>
      </div>
    </>
  );
}`,

  // 23. Headquarters Page
  'src/pages/Headquarters.jsx': `import React from 'react';
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
          <span className="font-mono text-[8px] text-slate-400 block uppercase">EPISODES IN PRODUCTION</span>
          <span className="font-display font-bold text-lg text-slate-100">24</span>
          <span className="font-mono text-[8px] text-tactical-glow block">IN PROGRESS</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-2.5 rounded">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">ASSETS GENERATED</span>
          <span className="font-display font-bold text-lg text-slate-100">1,248</span>
          <span className="font-mono text-[8px] text-slate-500 block">IMAGES / AUDIO / VIDEO</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-2.5 rounded">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">NARRATION STATUS</span>
          <span className="font-display font-bold text-sm text-tactical-glow">CHARLIE</span>
          <span className="font-mono text-[8px] text-slate-500 block">READY</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-2.5 rounded">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">PRODUCTION PIPELINE</span>
          <span className="font-display font-bold text-lg text-slate-100">78%</span>
          <span className="font-mono text-[8px] text-tactical-glow block">ACTIVE</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-2.5 rounded">
          <span className="font-mono text-[8px] text-slate-400 block uppercase">PUBLISHING QUEUE</span>
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
                <h3 className="font-serif font-bold text-xs text-slate-100 uppercase">INTELLIGENCE FEED</h3>
                <span className="font-mono text-[8px] text-bronze-gold uppercase block">LATEST UPDATES</span>
              </div>
            </div>
            <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
              {notifications.map((item) => (
                <div key={item.id} className={\`p-1.5 rounded border flex justify-between items-center text-[10px] font-mono \${
                  item.read ? 'bg-stone-bg/50 border-stone-border/40 opacity-70' : 'bg-stone-bg border-stone-border/60'
                }\`}>
                  <span className="text-slate-300 truncate max-w-[170px]">{item.title}</span>
                  <span className="text-bronze-gold text-[8px]">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => onNavigate('/cases')} className="w-full py-1 bg-stone-bg hover:bg-stone-card border border-stone-border text-[10px] font-mono text-slate-300 rounded uppercase">
            VIEW ALL ACTIVITY
          </button>
        </div>

        <div className="lg:col-span-3 bg-stone-panel border border-stone-border rounded-lg p-3 flex flex-col justify-between h-[360px]">
          <div>
            <div className="pb-2 border-b border-stone-border mb-2">
              <h3 className="font-serif font-bold text-xs text-slate-100 uppercase">TODAY'S MISSION</h3>
              <span className="font-mono text-[8px] text-bronze-gold uppercase block">PRIMARY OBJECTIVE</span>
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
                <span className="font-mono text-[8px] text-bronze-gold block">THE CITY OF GOLD</span>
              </div>
            </div>

            <div className="bg-stone-bg p-2 rounded border border-stone-border font-mono text-[9px] space-y-1">
              <div className="flex justify-between text-slate-400"><span>EPISODE:</span><span className="text-slate-200">03</span></div>
              <div className="flex justify-between text-slate-400"><span>RESEARCH:</span><span className="text-tactical-glow">92%</span></div>
              <div className="flex justify-between text-slate-400"><span>NARRATION:</span><span className="text-tactical-glow">CHARLIE</span></div>
              <div className="flex justify-between text-slate-400"><span>PUBLISH:</span><span className="text-bronze-gold">TOMORROW</span></div>
            </div>
          </div>

          <button type="button" onClick={() => onNavigate('/cases', 'CASE-001')} className="w-full py-1.5 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-xs font-mono font-bold text-bronze-light rounded uppercase">
            OPEN CASE FILE
          </button>
        </div>
      </div>

      {/* Quick Actions & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-stone-panel border border-stone-border rounded-lg p-3">
          <h3 className="font-serif font-bold text-xs text-slate-100 uppercase mb-0.5">QUICK ACTIONS</h3>
          <span className="font-mono text-[8px] text-bronze-gold uppercase block mb-2">INITIATE PRODUCTION SEQUENCE</span>
          
          <div className="grid grid-cols-3 gap-2 font-mono text-[9px]">
            <button type="button" onClick={() => { onNavigate('/ai-studio'); if (showToast) showToast('SIMULATION: VISUAL PACK GENERATOR INITIALIZED'); }} className="p-2 bg-stone-bg border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1">
              <Video className="w-3.5 h-3.5 text-bronze-gold" />
              GENERATE VISUALS
            </button>
            <button type="button" onClick={() => { onNavigate('/ai-studio'); if (showToast) showToast('SIMULATION: CHARLIE NARRATOR PROFILE LOADED'); }} className="p-2 bg-stone-bg border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-tactical-green" />
              GENERATE NARRATION
            </button>
            <button type="button" onClick={() => { onNavigate('/cases'); if (showToast) showToast('SIMULATION: NEW CASE DOSSIER TEMPLATE LOADED'); }} className="p-2 bg-stone-bg border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1">
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
          <button type="button" className="text-left bg-stone-panel border border-stone-border rounded p-3 cursor-pointer hover:border-bronze-gold/50" onClick={() => onNavigate('/library')}>
            <h4 className="font-serif font-bold text-xs text-slate-100 uppercase mb-2">GRAND LIBRARY</h4>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[8px]">
              {LIBRARY_COLLECTIONS.map((c) => (
                <div key={c.id} className="p-1.5 bg-stone-bg border border-stone-border rounded">
                  <span className="text-slate-200 block font-bold leading-tight truncate">{c.title}</span>
                  <span className="text-bronze-gold block">{c.cases} CASES</span>
                </div>
              ))}
            </div>
          </button>

          <button type="button" className="text-left bg-stone-panel border border-stone-border rounded p-3 cursor-pointer hover:border-bronze-gold/50" onClick={() => onNavigate('/cases')}>
            <h4 className="font-serif font-bold text-xs text-slate-100 uppercase mb-2">CASE FILES</h4>
            <div className="space-y-1 font-mono text-[8px]">
              {CASE_FILES_EXPANDED.slice(0, 3).map((f) => (
                <div key={f.id} className="flex justify-between p-1 bg-stone-bg rounded border border-stone-border/60">
                  <span className="text-slate-300 truncate max-w-[120px]">{f.title}</span>
                  <span className="text-tactical-glow">{f.progress}%</span>
                </div>
              ))}
            </div>
          </button>

          <button type="button" className="text-left bg-stone-panel border border-stone-border rounded p-3 cursor-pointer hover:border-bronze-gold/50" onClick={() => onNavigate('/vault')}>
            <h4 className="font-serif font-bold text-xs text-slate-100 uppercase mb-2">MEDIA VAULT</h4>
            <div className="grid grid-cols-3 gap-1">
              {ARCHIVES_COLLECTION.slice(0, 3).map((a) => (
                <SafeImage key={a.id} src={a.image} className="w-full h-10 object-cover rounded border border-stone-border" alt={a.title} />
              ))}
            </div>
          </button>

          <button type="button" className="text-left bg-stone-panel border border-stone-border rounded p-3 cursor-pointer hover:border-bronze-gold/50" onClick={() => onNavigate('/archives')}>
            <h4 className="font-serif font-bold text-xs text-slate-100 uppercase mb-2">ATLAS ARCHIVES</h4>
            <div className="space-y-1 font-mono text-[8px]">
              {ARCHIVES_COLLECTION.slice(0, 2).map((a) => (
                <div key={a.id} className="flex justify-between p-1 bg-stone-bg rounded border border-stone-border/60">
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
}`,

  // 24. Operations Page
  'src/pages/Operations.jsx': `import React from 'react';
import ProductionPipeline from '../components/ProductionPipeline';
import { CASE_FILES_EXPANDED } from '../data/mockData';
import { Compass } from 'lucide-react';

export default function Operations() {
  const stages = ['Research', 'Writing', 'Narration', 'Visuals', 'Editing', 'Publishing'];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Compass className="w-5 h-5 text-bronze-gold" />
            OPERATIONS // MISSION CONTROL
          </h1>
          <p className="text-slate-400 mt-1">ACTIVE INVESTIGATION PIPELINE & PRODUCTION TIMELINES</p>
        </div>
        <div className="px-3 py-1.5 bg-stone-bg border border-stone-border rounded text-tactical-glow font-bold">
          6 ACTIVE EXPEDITION STAGES
        </div>
      </div>

      <ProductionPipeline />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-2">
        {stages.map((stage) => {
          const items = CASE_FILES_EXPANDED.filter((c) => c.stage === stage);
          return (
            <div key={stage} className="bg-stone-panel border border-stone-border rounded p-3 min-w-[200px]">
              <div className="flex justify-between items-center pb-2 border-b border-stone-border mb-3">
                <span className="font-bold text-slate-200 text-[11px] uppercase">{stage}</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-stone-bg border border-stone-border rounded text-bronze-gold">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic text-center py-4">No active cases</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="p-2.5 bg-stone-bg border border-stone-border rounded space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-100">{item.title}</span>
                        <span className="text-[8px] text-tactical-glow">{item.progress}%</span>
                      </div>
                      <p className="text-[9px] text-slate-400 line-clamp-1">{item.subtitle}</p>
                      <div className="flex justify-between text-[8px] text-slate-500 pt-1 border-t border-stone-border/40">
                        <span>{item.owner}</span>
                        <span>{item.lastUpdated}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`,

  // 25. Grand Library Page
  'src/pages/GrandLibrary.jsx': `import React, { useState } from 'react';
import { BookOpen, Search, FileText } from 'lucide-react';
import { LIBRARY_COLLECTIONS, CASE_FILES_EXPANDED } from '../data/mockData';

export default function GrandLibrary({ showToast }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredCases = CASE_FILES_EXPANDED.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.subtitle.toLowerCase().includes(search.toLowerCase());
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
          <p className="text-slate-400 mt-1">SEARCHABLE REPOSITORY OF SCRIPTS, DOSSIERS, AND ARCHIVAL MANUSCRIPTS</p>
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
            onClick={() => setSelectedCategory(selectedCategory === c.category ? 'ALL' : c.category)}
            className={\`p-4 bg-stone-panel border rounded-lg cursor-pointer text-left transition-all \${
              selectedCategory === c.category ? 'border-bronze-gold bg-stone-card shadow-bronze' : 'border-stone-border hover:border-bronze-gold/40'
            }\`}
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
          <div key={item.id} className="bg-stone-panel border border-stone-border rounded-lg p-4 space-y-2">
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
              <span className="text-slate-500 truncate max-w-[180px]">TAGS: {item.tags.join(', ')}</span>
              <button 
                type="button"
                onClick={() => { if (showToast) showToast(\`VIEWING MANUSCRIPT FOR \${item.title}\`); }}
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
}`,

  // 26. Atlas Archives Page
  'src/pages/AtlasArchives.jsx': `import React, { useState } from 'react';
import { Archive, Search, ExternalLink } from 'lucide-react';
import SafeImage from '../components/SafeImage';
import { ARCHIVES_COLLECTION } from '../data/mockData';

export default function AtlasArchives({ showToast }) {
  const [search, setSearch] = useState('');

  const filtered = ARCHIVES_COLLECTION.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Archive className="w-5 h-5 text-bronze-gold" />
            ATLAS ARCHIVES // HISTORICAL CASE COLLECTIONS
          </h1>
          <p className="text-slate-400 mt-1">PERMANENT DECLASSIFIED VAULT OF EXPEDITIONS AND TELEMETRY</p>
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
          <div key={a.id} className="bg-stone-panel border border-stone-border rounded-lg overflow-hidden flex flex-col justify-between hover:border-bronze-gold/50 transition-all">
            <div>
              <div className="relative h-36 bg-stone-bg">
                <SafeImage src={a.image} alt={a.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-stone-bg/80 border border-stone-border rounded text-[9px] text-tactical-glow">
                  {a.progress}% COMPLETE
                </div>
              </div>
              <div className="p-3 space-y-1.5">
                <h3 className="font-serif font-bold text-sm text-slate-100">{a.title}</h3>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{a.description}</p>
              </div>
            </div>

            <div className="p-3 border-t border-stone-border flex justify-between items-center text-[10px] text-bronze-gold">
              <span>{a.episodes} EPISODES</span>
              <button 
                type="button"
                onClick={() => { if (showToast) showToast(\`SIMULATION: ARCHIVE FILE \${a.title} OPENED\`); }}
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
}`,

  // 27. Media Vault Page
  'src/pages/MediaVault.jsx': `import React, { useState } from 'react';
import { Image, Upload, Download } from 'lucide-react';
import SafeImage from '../components/SafeImage';
import { VAULT_ASSETS } from '../data/mockData';

export default function MediaVault({ showToast }) {
  const [activeTab, setActiveTab] = useState('ALL');

  const tabs = ['ALL', 'IMAGES', 'AUDIO', 'DOCUMENTS', 'MAPS'];

  const filteredAssets = activeTab === 'ALL' 
    ? VAULT_ASSETS 
    : VAULT_ASSETS.filter(a => a.type === activeTab);

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Image className="w-5 h-5 text-bronze-gold" />
            MEDIA VAULT // ASSET & RESOURCE MANAGER
          </h1>
          <p className="text-slate-400 mt-1">CONCEPT RENDERS, NARRATION AUDIO TRACKS, AND CARTOGRAPHIC MAPS</p>
        </div>

        <button 
          type="button"
          onClick={() => { if (showToast) showToast('SIMULATION: ASSET UPLOAD DIALOG OPENED'); }}
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
            className={\`px-3 py-1.5 rounded border text-[10px] font-bold transition-colors \${
              activeTab === tab
                ? 'bg-bronze-gold/20 text-bronze-light border-bronze-gold'
                : 'bg-stone-panel border-stone-border text-slate-400 hover:text-white'
            }\`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets.map((a) => (
          <div key={a.id} className="bg-stone-panel border border-stone-border rounded overflow-hidden group">
            <div className="relative h-32 bg-stone-bg">
              <SafeImage src={a.image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-stone-bg/90 border border-stone-border text-[8px] text-bronze-gold rounded">
                {a.type}
              </span>
            </div>
            <div className="p-2.5 flex justify-between items-center text-[10px]">
              <span className="text-slate-200 truncate font-bold">{a.title}</span>
              <button 
                type="button"
                aria-label={\`Download \${a.title}\`}
                onClick={() => { if (showToast) showToast(\`SIMULATION: DOWNLOADING \${a.title}\`); }}
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
}`,

  // 28. Research Network Page
  'src/pages/ResearchNetwork.jsx': `import React from 'react';
import { Globe, Radio } from 'lucide-react';
import { EXPEDITION_LOCATIONS } from '../data/mockData';

export default function ResearchNetwork() {
  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Globe className="w-5 h-5 text-bronze-gold" />
            RESEARCH NETWORK // GLOBAL INTELLIGENCE NODES
          </h1>
          <p className="text-slate-400 mt-1">12 GLOBAL INVESTIGATION NODES SYNCHRONIZED</p>
        </div>
        <div className="px-3 py-1 bg-stone-bg border border-stone-border text-tactical-glow font-bold rounded">
          NETWORK STATUS: OPTIMAL
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPEDITION_LOCATIONS.map((loc) => (
          <div key={loc.id} className="bg-stone-panel border border-stone-border rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-bronze-gold">{loc.category}</span>
              <span className="text-tactical-glow">{loc.progress}%</span>
            </div>
            <h3 className="font-serif font-bold text-sm text-slate-100">{loc.name}</h3>
            <p className="text-[10px] text-slate-400">REGION: {loc.sub}</p>
            <div className="pt-2 border-t border-stone-border/60 flex justify-between items-center text-[9px] text-slate-500">
              <span>STATUS: {loc.status}</span>
              <Radio className="w-3.5 h-3.5 text-tactical-green animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  // 29. Case Files Page
  'src/pages/CaseFiles.jsx': `import React, { useState, useEffect } from 'react';
import { Shield, Search } from 'lucide-react';
import SafeImage from '../components/SafeImage';
import { CASE_FILES_EXPANDED } from '../data/mockData';

export default function CaseFiles({ selectedId, showToast }) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState(
    () => CASE_FILES_EXPANDED.find(c => c.id === selectedId) || CASE_FILES_EXPANDED[0]
  );

  useEffect(() => {
    if (selectedId) {
      const found = CASE_FILES_EXPANDED.find(c => c.id === selectedId);
      if (found) setSelectedCase(found);
    }
  }, [selectedId]);

  const stages = ['ALL', 'Planning', 'Research', 'Writing', 'Narration', 'Visuals', 'Editing', 'Publishing'];

  const filtered = CASE_FILES_EXPANDED.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.subtitle.toLowerCase().includes(search.toLowerCase());
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
          <p className="text-slate-400 mt-1">MASTER DATABASE OF EXPEDITION DOSSIERS, SCRIPTS, AND PUBLISHING STAGES</p>
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
            className={\`px-2.5 py-1 rounded border text-[10px] font-bold transition-colors \${
              stageFilter === st
                ? 'bg-bronze-gold/20 text-bronze-light border-bronze-gold'
                : 'bg-stone-panel border-stone-border text-slate-400 hover:text-white'
            }\`}
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
                  className={\`cursor-pointer transition-colors \${
                    selectedCase?.id === item.id ? 'bg-stone-card font-bold text-slate-100' : 'hover:bg-stone-bg text-slate-300'
                  }\`}
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
              <SafeImage src={selectedCase.image} alt={selectedCase.title} className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-panel via-transparent to-transparent"></div>
              <div className="absolute bottom-2 left-3">
                <span className="text-[10px] text-bronze-gold font-bold block">{selectedCase.id}</span>
                <h2 className="font-serif font-bold text-lg text-slate-100">{selectedCase.title}</h2>
                <span className="text-xs text-slate-300 block">{selectedCase.subtitle}</span>
              </div>
            </div>

            <div className="bg-stone-bg p-3 rounded border border-stone-border space-y-1 text-[10px]">
              <div className="flex justify-between"><span>CATEGORY:</span><span className="text-slate-200">{selectedCase.category}</span></div>
              <div className="flex justify-between"><span>STAGE:</span><span className="text-tactical-glow">{selectedCase.stage}</span></div>
              <div className="flex justify-between"><span>NARRATION:</span><span className="text-slate-200">{selectedCase.narrationStatus}</span></div>
              <div className="flex justify-between"><span>VISUALS:</span><span className="text-slate-200">{selectedCase.visualStatus}</span></div>
              <div className="flex justify-between"><span>OWNER:</span><span className="text-bronze-gold">{selectedCase.owner}</span></div>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed bg-stone-bg/60 p-2.5 border border-stone-border rounded">
              {selectedCase.notes}
            </p>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => { if (showToast) showToast(\`SIMULATION: DOSSIER \${selectedCase.id} OPENED FOR EDITING\`); }}
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
}`,

  // 30. AI Production Page
  'src/pages/AiProduction.jsx': `import React, { useState } from 'react';
import { Cpu, Play, Copy, Check, Sparkles, Mic } from 'lucide-react';
import { AI_PROMPT_TEMPLATES } from '../data/aiPrompts';

export default function AiProduction({ showToast }) {
  const [selectedTemplate, setSelectedTemplate] = useState(AI_PROMPT_TEMPLATES[0]);
  const [customPrompt, setCustomPrompt] = useState(AI_PROMPT_TEMPLATES[0].promptText);
  const [scriptText, setScriptText] = useState("In the high Andes of 16th-century Colombia, Spanish conquistadors recorded whispers of a golden ruler who submerged himself in Lake Guatavita. [pause] But modern satellite sensor data reveals something far deeper.");
  const [simulating, setSimulating] = useState(false);
  const [statusText, setStatusText] = useState('PROMPT LOADED — READY FOR PROTOTYPE SIMULATION');
  const [copied, setCopied] = useState(false);

  // Dynamic Word Count & 150 WPM Duration Calculation
  const wordCount = scriptText.trim() ? scriptText.trim().split(/\\s+/).length : 0;
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
          <p className="text-slate-400 mt-1">PROMPT STUDIO, SCRIPT EDITOR, AND CHARLIE NARRATION PROFILES</p>
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
                className={\`w-full text-left p-3 rounded border cursor-pointer transition-all \${
                  selectedTemplate.id === tmpl.id
                    ? 'bg-stone-card border-bronze-gold shadow-bronze'
                    : 'bg-stone-bg border-stone-border hover:border-bronze-gold/40'
                }\`}
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
              <button type="button" onClick={handleCopy} className="px-2 py-1 bg-stone-bg border border-stone-border rounded text-[10px] text-slate-200 flex items-center gap-1">
                {copied ? <Check className="w-3 h-3 text-tactical-green" /> : <Copy className="w-3 h-3" />}
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
              <span>WORD COUNT: {wordCount} | ESTIMATED DURATION: ~{estimatedSeconds} SECONDS (@ 150 WPM)</span>
              <button
                type="button"
                onClick={() => setScriptText(scriptText + " [pause]")}
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
}`,

  // 31. Analytics Page
  'src/pages/Analytics.jsx': `import React from 'react';
import { BarChart2 } from 'lucide-react';

export default function Analytics() {
  const weeklyData = [
    { day: 'MON', count: 12 },
    { day: 'TUE', count: 19 },
    { day: 'WED', count: 15 },
    { day: 'THU', count: 24 },
    { day: 'FRI', count: 22 },
    { day: 'SAT', count: 30 },
    { day: 'SUN', count: 28 },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-bronze-gold" />
            ANALYTICS // INSIGHTS & METRICS
          </h1>
          <p className="text-slate-400 mt-1">PUBLISHING PERFORMANCE AND RESEARCH REACH METRICS</p>
        </div>
        <div className="px-3 py-1 bg-stone-bg border border-stone-border text-bronze-gold font-bold rounded">
          WEEKLY OUTPUT: 18 EPISODES
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-panel border border-stone-border p-3 rounded">
          <span className="text-[10px] text-slate-400 block">TOTAL VIEWS</span>
          <span className="font-display font-bold text-lg text-slate-100">1.42M</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-3 rounded">
          <span className="text-[10px] text-slate-400 block">FOLLOWERS</span>
          <span className="font-display font-bold text-lg text-tactical-glow">184.2K</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-3 rounded">
          <span className="text-[10px] text-slate-400 block">AVG WATCH TIME</span>
          <span className="font-display font-bold text-lg text-bronze-gold">48.2s</span>
        </div>
        <div className="bg-stone-panel border border-stone-border p-3 rounded">
          <span className="text-[10px] text-slate-400 block">COMPLETION RATE</span>
          <span className="font-display font-bold text-lg text-slate-100">74.8%</span>
        </div>
      </div>

      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg space-y-3">
        <h3 className="font-serif font-bold text-xs text-slate-100 uppercase">WEEKLY EPISODE OUTPUT CHART</h3>
        
        <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2 bg-stone-bg border border-stone-border rounded">
          {weeklyData.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div 
                className="w-full bg-bronze-gold/80 hover:bg-bronze-gold rounded-t transition-all"
                style={{ height: \`\${(d.count / 30) * 100}%\` }}
              />
              <span className="text-[9px] text-slate-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,

  // 32. System Status Page
  'src/pages/SystemStatus.jsx': `import React, { useState } from 'react';
import { Activity, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SystemStatus({ showToast }) {
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [lastCheck, setLastDiagnostics] = useState('JUST NOW');

  const handleRunDiagnostics = () => {
    setDiagnosticsRunning(true);
    setTimeout(() => {
      setDiagnosticsRunning(false);
      const timeStr = new Date().toUTCString().slice(17, 25) + ' UTC';
      setLastDiagnostics(timeStr);
      if (showToast) showToast('DIAGNOSTIC TEST COMPLETE — ALL RELAYS OPERATIONAL');
    }, 1200);
  };

  const services = [
    { name: 'AI Generation Simulation', status: 'Operational', response: '12ms' },
    { name: 'Local Mock Data Store', status: 'Operational', response: '2ms' },
    { name: 'Netlify Static Relay', status: 'Operational', response: '24ms' },
    { name: 'Charlie Voice Synth Profile', status: 'Operational', response: '18ms' },
    { name: 'Cartographic Map Engine', status: 'Operational', response: '8ms' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <Activity className="w-5 h-5 text-tactical-green" />
            SYSTEM STATUS // INFRASTRUCTURE BOARD
          </h1>
          <p className="text-slate-400 mt-1">REAL-TIME SYSTEM DIAGNOSTICS AND RELAY HEALTH</p>
        </div>

        <button
          type="button"
          onClick={handleRunDiagnostics}
          disabled={diagnosticsRunning}
          className="px-3 py-1.5 bg-stone-bg border border-stone-border hover:border-tactical-green rounded text-slate-200 flex items-center gap-1.5"
        >
          <RefreshCw className={\`w-3.5 h-3.5 text-tactical-green \${diagnosticsRunning ? 'animate-spin' : ''}\`} />
          {diagnosticsRunning ? 'TESTING RELAYS...' : 'RUN DIAGNOSTICS'}
        </button>
      </div>

      <div className="p-2 bg-stone-bg border border-stone-border rounded text-[10px] text-slate-400 flex justify-between">
        <span>LAST DIAGNOSTIC SCAN: {lastCheck}</span>
        <span className="text-tactical-glow">ALL RELAYS HEALTHY</span>
      </div>

      <div className="space-y-2">
        {services.map((s) => (
          <div key={s.name} className="p-3 bg-stone-panel border border-stone-border rounded flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-tactical-green" />
              <span className="font-bold text-slate-200">{s.name}</span>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="text-slate-400">LATENCY: {s.response}</span>
              <span className="px-2 py-0.5 rounded bg-tactical-dim/40 border border-tactical-green text-tactical-glow font-bold uppercase">
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  // 33. Settings Page
  'src/pages/Settings.jsx': `import React, { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function Settings({ showToast }) {
  const [narrator, setNarrator] = useState(() => localStorage.getItem('ta_narrator') || 'Charlie - Deep, Confident');
  const [runtime, setRuntime] = useState(() => localStorage.getItem('ta_runtime') || '60 Seconds (9:16)');

  const handleSave = () => {
    try {
      localStorage.setItem('ta_narrator', narrator);
      localStorage.setItem('ta_runtime', runtime);
      if (showToast) showToast('SETTINGS SAVED TO LOCALSTORAGE');
    } catch (err) {
      if (showToast) showToast('ERROR SAVING TO LOCALSTORAGE');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-mono text-xs">
      <div className="bg-stone-panel border border-stone-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif font-bold text-lg text-slate-100 uppercase flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-bronze-gold" />
            SYSTEM SETTINGS // CONFIGURATION
          </h1>
          <p className="text-slate-400 mt-1">OPERATOR PREFERENCES AND LOCALSTORAGE PERSISTENCE</p>
        </div>

        <button type="button" onClick={handleSave} className="px-3 py-1.5 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-bronze-light font-bold rounded flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> SAVE SETTINGS
        </button>
      </div>

      <div className="bg-stone-panel border border-stone-border rounded-lg p-4 space-y-4 max-w-xl">
        <div className="space-y-1">
          <label htmlFor="narrator-select" className="text-slate-300 font-bold block">DEFAULT NARRATOR VOICE</label>
          <select
            id="narrator-select"
            value={narrator}
            onChange={(e) => setNarrator(e.target.value)}
            className="w-full p-2 bg-stone-bg border border-stone-border rounded text-slate-200 focus:outline-none focus:border-bronze-gold"
          >
            <option>Charlie - Deep, Confident</option>
            <option>Alpha - Authoritative Command</option>
            <option>Bravo - Archival Documentarian</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="runtime-select" className="text-slate-300 font-bold block">TARGET RUNTIME FORMAT</label>
          <select
            id="runtime-select"
            value={runtime}
            onChange={(e) => setRuntime(e.target.value)}
            className="w-full p-2 bg-stone-bg border border-stone-border rounded text-slate-200 focus:outline-none focus:border-bronze-gold"
          >
            <option>60 Seconds (9:16 Vertical)</option>
            <option>10 Minutes (16:9 Full Horizontal)</option>
            <option>30 Seconds (1:1 Square)</option>
          </select>
        </div>
      </div>
    </div>
  );
}`,

  // 34. Main App Component
  'src/App.jsx': `import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import NotificationPanel from './components/NotificationPanel';
import Toast from './components/Toast';

import Headquarters from './pages/Headquarters';
import Operations from './pages/Operations';
import GrandLibrary from './pages/GrandLibrary';
import AtlasArchives from './pages/AtlasArchives';
import MediaVault from './pages/MediaVault';
import ResearchNetwork from './pages/ResearchNetwork';
import CaseFiles from './pages/CaseFiles';
import AiProduction from './pages/AiProduction';
import Analytics from './pages/Analytics';
import SystemStatus from './pages/SystemStatus';
import Settings from './pages/Settings';

import { INTELLIGENCE_FEED } from './data/mockData';

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [notifications, setNotifications] = useState(INTELLIGENCE_FEED);
  const [toastMessage, setToastMessage] = useState(null);
  
  const navigate = useNavigate();

  const handleCloseSidebar = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('ALL NOTIFICATIONS MARKED AS READ');
    setNotificationsOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNavigateCase = (path, caseId = null) => {
    if (caseId) setSelectedCaseId(caseId);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-stone-bg text-slate-200 flex font-sans bg-grid-pattern overflow-x-hidden">
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onClose={handleCloseSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          unreadCount={unreadCount}
        />

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Headquarters onNavigate={handleNavigateCase} notifications={notifications} showToast={showToast} />} />
            <Route path="/operations" element={<Operations showToast={showToast} />} />
            <Route path="/library" element={<GrandLibrary showToast={showToast} />} />
            <Route path="/archives" element={<AtlasArchives showToast={showToast} />} />
            <Route path="/vault" element={<MediaVault showToast={showToast} />} />
            <Route path="/research" element={<ResearchNetwork showToast={showToast} />} />
            <Route path="/cases" element={<CaseFiles selectedId={selectedCaseId} showToast={showToast} />} />
            <Route path="/ai-studio" element={<AiProduction showToast={showToast} />} />
            <Route path="/analytics" element={<Analytics showToast={showToast} />} />
            <Route path="/status" element={<SystemStatus showToast={showToast} />} />
            <Route path="/settings" element={<Settings showToast={showToast} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>

      <NotificationPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />

      <Toast message={toastMessage} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}`,
};

// Write files to disk
Object.entries(projectFiles).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  ✓ Generated: ${filePath}`);
});

console.log('\n----------------------------------------------------------------');
console.log('✨ Tactical Atlas OS Generator Setup Completed!');
console.log('----------------------------------------------------------------\n');
