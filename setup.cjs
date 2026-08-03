/* ============================================================================
   TACTICAL ATLAS INTELLIGENCE OS — MASTER GENERATOR (v4.0)
   File: setup.cjs
   Execution: node setup.cjs
   ============================================================================ */

const fs = require('fs');
const path = require('path');

console.log('----------------------------------------------------------------');
console.log('🚀 Generating Tactical Atlas OS Project Files...');
console.log('----------------------------------------------------------------\n');

const projectFiles = {
  // 1. Package Manifest
  'package.json': JSON.stringify({
    "name": "tactical-atlas-os",
    "private": true,
    "version": "4.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview",
      "lint": "eslint . --ext js,jsx --max-warnings 0",
      "format:check": "prettier --check .",
      "format": "prettier --write .",
      "start:server": "node server/index.js",
      "dev:server": "node --watch server/index.js",
      "db:push": "prisma db push",
      "verify": "npm run lint && npm run format:check && npm run build"
    },
    "dependencies": {
      "@prisma/client": "^5.10.0",
      "bcryptjs": "^2.4.3",
      "compression": "^1.7.4",
      "cors": "^2.8.5",
      "dotenv": "^16.4.5",
      "express": "^4.18.2",
      "express-rate-limit": "^7.1.5",
      "helmet": "^7.1.0",
      "lucide-react": "^0.344.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^6.22.0"
    },
    "devDependencies": {
      "@types/bcryptjs": "^2.4.6",
      "@types/node": "^20.11.20",
      "@types/react": "^18.2.55",
      "@types/react-dom": "^18.2.19",
      "@vitejs/plugin-react": "^4.2.1",
      "autoprefixer": "^10.4.18",
      "bullmq": "^5.1.0",
      "eslint": "^8.57.0",
      "eslint-plugin-jsx-a11y": "^6.8.0",
      "eslint-plugin-react": "^7.34.0",
      "eslint-plugin-react-hooks": "^4.6.0",
      "postcss": "^8.4.35",
      "prettier": "^3.2.5",
      "prisma": "^5.10.0",
      "tailwindcss": "^3.4.1",
      "ts-node": "^10.9.2",
      "typescript": "^5.3.3",
      "vite": "^5.1.0"
    }
  }, null, 2),

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
  ignorePatterns: ['dist', '.eslintrc.cjs', 'setup.cjs', 'server'],
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
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': ['error', { varsIgnorePattern: '^React$' }],
  },
};`,

  // 3. Prettier Config
  '.prettierrc': JSON.stringify({
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "printWidth": 100
  }, null, 2),

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
        'stone-bg': '#07110d',
        'hq-bg': '#07110d',
        'stone-panel': '#0c1a15',
        'stone-card': '#11221c',
        'stone-border': '#1b3329',
        'steel-glass': 'rgba(12, 26, 21, 0.85)',
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
        barlow: ['"Barlow Condensed"', 'sans-serif'],
        plex: ['"IBM Plex Mono"', 'monospace'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Cinzel"', 'Georgia', 'serif'],
        display: ['"Barlow Condensed"', '"Rajdhani"', 'sans-serif'],
      },
      boxShadow: {
        'bronze': '0 0 15px rgba(200, 155, 60, 0.25)',
        'tactical': '0 0 15px rgba(16, 185, 129, 0.25)',
        'hq-glow': '0 0 25px rgba(16, 185, 129, 0.3), inset 0 0 15px rgba(16, 185, 129, 0.1)',
        'amber-glow': '0 0 25px rgba(200, 155, 60, 0.3), inset 0 0 15px rgba(200, 155, 60, 0.1)',
        'inset-panel': 'inset 0 2px 6px rgba(0, 0, 0, 0.85)',
      },
      backgroundImage: {
        'map-texture': 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 1px, transparent 1px)',
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
    <meta name="description" content="Tactical Atlas OS — Advanced Intelligence Operating System and Command Facility." />
    <meta name="theme-color" content="#07110d" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Cinzel:wght@600;800;900&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#07110d] text-slate-200 selection:bg-bronze-dark selection:text-white antialiased overflow-x-hidden">
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

  // 10. Favicon SVG
  'public/favicon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="20" fill="#07110d" />
  <circle cx="50" cy="50" r="42" fill="none" stroke="#1b3329" stroke-width="2" />
  <circle cx="50" cy="50" r="38" fill="none" stroke="#C89B3C" stroke-width="2" />
  <circle cx="50" cy="50" r="28" fill="none" stroke="#10B981" stroke-width="1.5" stroke-dasharray="4,4" />
  <polygon points="50,14 58,42 50,50 42,42" fill="#C89B3C" />
  <polygon points="50,86 58,58 50,50 42,58" fill="#6B501B" />
  <polygon points="86,50 58,58 50,50 58,42" fill="#10B981" />
  <polygon points="14,50 42,58 50,50 42,42" fill="#064E3B" />
  <circle cx="50" cy="50" r="5" fill="#34D399" />
</svg>`,

  // 11. Tailwind Index CSS
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .bg-command-room {
    background-color: #07110d;
    background-image: 
      radial-gradient(ellipse at 50% 20%, rgba(16, 185, 129, 0.08) 0%, transparent 75%),
      radial-gradient(ellipse at 80% 80%, rgba(200, 155, 60, 0.05) 0%, transparent 60%);
  }

  .bg-moving-grid {
    background-size: 36px 36px;
    background-image:
      linear-gradient(to right, rgba(16, 185, 129, 0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(200, 155, 60, 0.05) 1px, transparent 1px);
    animation: moving-grid 14s linear infinite;
  }

  .scanline-overlay {
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0) 50%,
      rgba(0, 0, 0, 0.35) 50%,
      rgba(0, 0, 0, 0.35)
    );
    background-size: 100% 4px;
  }

  .black-glass {
    background: rgba(12, 26, 21, 0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(27, 51, 41, 0.9);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.03), 0 12px 35px rgba(0, 0, 0, 0.65);
  }

  .black-glass-glow {
    background: rgba(17, 34, 28, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(16, 185, 129, 0.4);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.2), inset 0 1px 1px rgba(16, 185, 129, 0.2);
  }

  .text-glow-green {
    text-shadow: 0 0 10px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.4);
  }

  .text-glow-bronze {
    text-shadow: 0 0 10px rgba(200, 155, 60, 0.8), 0 0 20px rgba(200, 155, 60, 0.4);
  }
}

@keyframes scannerSweep {
  0% { top: 0%; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.animate-scanner-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #10B981, #34D399, #10B981, transparent);
  box-shadow: 0 0 15px #10B981;
  animation: scannerSweep 6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes moving-grid {
  0% { background-position: 0 0; }
  100% { background-position: 36px 36px; }
}

@keyframes radar-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-radar-sweep {
  animation: radar-spin 6s linear infinite;
}

@keyframes dashFlow {
  to { stroke-dashoffset: -24; }
}

.animate-dash-line {
  stroke-dasharray: 6, 6;
  animation: dashFlow 1.2s linear infinite;
}

@keyframes sonar-ripple {
  0% { transform: scale(0.6); opacity: 0.9; }
  50% { transform: scale(1.8); opacity: 0.3; }
  100% { transform: scale(2.6); opacity: 0; }
}

.animate-sonar-ripple {
  animation: sonar-ripple 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: #07110d;
}
::-webkit-scrollbar-thumb {
  background: #1b3329;
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: #10B981;
}`,

  // 12. Main JS Entry
  'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

  // 13. Safe Image Component
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

  // 14. Toast Component
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

  // 15. Tactical Earth Projection SVG Component
  'src/components/TacticalEarthProjection.jsx': `import React from 'react';

export default function TacticalEarthProjection({ className = '' }) {
  return (
    <svg
      viewBox="0 0 800 800"
      className={\`w-full h-full opacity-30 pointer-events-none select-none \${className}\`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
          <stop offset="70%" stopColor="#10B981" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#07110d" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="400" cy="400" r="380" fill="url(#earthGlow)" stroke="#10B981" strokeWidth="1.5" strokeDasharray="8 4" />
      <circle cx="400" cy="400" r="300" fill="none" stroke="#10B981" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="400" cy="400" r="220" fill="none" stroke="#10B981" strokeWidth="1" strokeOpacity="0.4" />
      <circle cx="400" cy="400" r="140" fill="none" stroke="#10B981" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="400" cy="400" r="60" fill="none" stroke="#10B981" strokeWidth="1" strokeOpacity="0.25" />

      <line x1="400" y1="20" x2="400" y2="780" stroke="#10B981" strokeWidth="1" strokeOpacity="0.35" />
      <line x1="20" y1="400" x2="780" y2="400" stroke="#10B981" strokeWidth="1" strokeOpacity="0.35" />
      <line x1="131" y1="131" x2="669" y2="669" stroke="#10B981" strokeWidth="0.8" strokeOpacity="0.25" />
      <line x1="131" y1="669" x2="669" y2="131" stroke="#10B981" strokeWidth="0.8" strokeOpacity="0.25" />

      <path d="M260,260 Q300,200 360,220 T420,280 T350,330 T280,310 Z" fill="rgba(16, 185, 129, 0.12)" stroke="#34D399" strokeWidth="1.5" />
      <path d="M360,340 Q400,380 410,480 T370,520 T330,420 Z" fill="rgba(16, 185, 129, 0.12)" stroke="#34D399" strokeWidth="1.5" />
      <path d="M420,220 Q550,150 640,220 T620,340 T500,320 T440,260 Z" fill="rgba(16, 185, 129, 0.12)" stroke="#34D399" strokeWidth="1.5" />
      <path d="M430,330 Q510,340 520,440 T460,490 T410,410 Z" fill="rgba(16, 185, 129, 0.12)" stroke="#34D399" strokeWidth="1.5" />
      <path d="M600,420 Q660,410 680,470 T610,490 Z" fill="rgba(16, 185, 129, 0.12)" stroke="#34D399" strokeWidth="1.5" />
      <circle cx="400" cy="400" r="372" fill="none" stroke="#34D399" strokeWidth="2" strokeDasharray="12 6" />

      <text x="405" y="40" fill="#34D399" fontSize="11" fontFamily="monospace">000° N</text>
      <text x="740" y="395" fill="#34D399" fontSize="11" fontFamily="monospace">090° E</text>
      <text x="405" y="770" fill="#34D399" fontSize="11" fontFamily="monospace">180° S</text>
      <text x="25" y="395" fill="#34D399" fontSize="11" fontFamily="monospace">270° W</text>
    </svg>
  );
}`,

  // 16. Lyra Core Projection Component
  'src/components/LyraCoreProjection.jsx': `import React from 'react';
import { Bot, Volume2, ShieldCheck, Cpu } from 'lucide-react';

export default function LyraCoreProjection({ onOpenAssistant }) {
  return (
    <div className="black-glass-glow rounded-lg p-5 flex flex-col justify-between relative overflow-hidden font-mono shadow-2xl h-[520px]">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-tactical-green/10 rounded-full blur-2xl pointer-events-none"></div>

      <div>
        <div className="flex justify-between items-center pb-3 border-b border-tactical-green/40 mb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-tactical-green" />
            <div>
              <h3 className="font-barlow font-bold text-base text-slate-100 uppercase tracking-wider">LYRA AI CORE</h3>
              <span className="text-[9px] text-bronze-gold uppercase block">TACTICAL ADVISOR PROJECTION</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-tactical-dim border border-tactical-green text-tactical-glow text-[9px] font-bold">
            ONLINE
          </span>
        </div>

        <div className="relative w-44 h-44 mx-auto my-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-tactical-green/40 animate-ping opacity-30"></div>
          <div className="absolute inset-2 rounded-full border border-tactical-glow/30 animate-spin" style={{ animationDuration: '12s' }}></div>
          <div className="absolute inset-6 rounded-full border-2 border-dashed border-bronze-gold/50 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }}></div>
          <div className="w-20 h-20 rounded-full bg-tactical-dim/80 border-2 border-tactical-green flex items-center justify-center shadow-hud-glow-green relative">
            <Bot className="w-10 h-10 text-tactical-glow animate-pulse" />
          </div>
        </div>

        <div className="py-2 px-3 bg-[#07110d] border border-tactical-green/30 rounded flex items-center justify-between my-3">
          <div className="flex items-center gap-2 text-[10px] text-tactical-glow font-bold">
            <Volume2 className="w-4 h-4 text-tactical-green animate-pulse" />
            <span>VOICE ACTIVITY // CHARLIE ENGINE</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-tactical-green animate-pulse"></span>
            <span className="w-1 h-5 bg-tactical-glow animate-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1 h-2 bg-tactical-green animate-pulse" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>

        <div className="p-3 bg-[#07110d] border border-stone-border rounded space-y-1.5 text-[11px]">
          <div className="text-tactical-glow font-bold font-barlow text-sm">"Good evening, Commander."</div>
          <p className="text-slate-300 leading-relaxed font-plex text-[10px]">
            All primary departments are operational. 12 active missions tracked on the Situation Wall. ElevenLabs Charlie narration engine is ready.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenAssistant}
        className="w-full py-2.5 bg-tactical-dim hover:bg-tactical-green/30 border border-tactical-green text-tactical-glow text-xs font-bold rounded uppercase shadow-tactical flex items-center justify-center gap-2 mt-3"
      >
        <ShieldCheck className="w-4 h-4 text-tactical-green" /> [OPEN LYRA ASSISTANT]
      </button>
    </div>
  );
}`,

  // 17. Lyra Assistant Drawer Component
  'src/components/LyraAssistant.jsx': `import React, { useState, useEffect } from 'react';
import { Sparkles, Send, X, Bot, Mic, MicOff, Volume2, ShieldCheck, Sliders, Check, ShieldAlert } from 'lucide-react';
import { lyraCommand } from '../services/lyraService';
import { useAuth } from '../context/AuthContext';

export default function LyraAssistant({ isOpen, onClose, onNavigate, showToast }) {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const [commStyle, setCommStyle] = useState('Tactical');
  const [briefStyle, setBriefStyle] = useState('Detailed');
  const [voice, setVoice] = useState('Charlie');

  const userClearance = user?.clearanceLevel || 'LEVEL_4';
  const userRole = user?.role || 'INVESTIGATOR';
  const isOmegaCommander = userClearance === 'OMEGA' || userClearance === 'ROOT' || userRole === 'ADMIN' || userRole === 'FOUNDER';

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let initialGreeting = 'LYRA ONLINE // GUARDIAN PROTOCOL ACTIVE\n"Knowledge without responsibility is dangerous. Tactical Atlas exists to discover, protect, and preserve truth responsibly."\n\nGood evening, Operator. All systems operational. Active Missions: 12. Queue: 3.';

    if (userRole === 'FOUNDER' || userClearance === 'ROOT') {
      initialGreeting = 'LYRA ONLINE // FOUNDER ROOT MODE\n"Welcome back, Founder. Tactical Atlas has been active for 243 days. Your last major milestone was activating the AI Production Pipeline."';
    } else if (isOmegaCommander) {
      initialGreeting = 'LYRA ONLINE // COMMANDER MODE\n"Welcome back, Commander. I was monitoring the production queue while you were away. Your current priorities suggest Episode 4 should be moved ahead of schedule."';
    }

    setMessages([
      {
        id: 1,
        sender: 'LYRA AI',
        text: initialGreeting,
        type: 'GREETING',
        time: 'JUST NOW',
      },
    ]);
  }, [userClearance, userRole, isOmegaCommander]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendPrompt = async (promptToSend) => {
    const query = promptToSend || inputText;
    if (!query.trim() || processing) return;

    const userMsg = {
      id: Date.now(),
      sender: userRole === 'FOUNDER' ? 'FOUNDER' : isOmegaCommander ? 'COMMANDER' : 'OPERATOR',
      text: query,
      type: 'USER',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setProcessing(true);

    const { data } = await lyraCommand(query);

    const isBlocked = data.actions?.includes('GUARDIAN_PROTOCOL_REDIRECT') || data.actions?.includes('GUARDIAN_PROTOCOL_BLOCKED');

    const lyraMsg = {
      id: Date.now() + 1,
      sender: 'LYRA AI',
      text: data.response,
      actions: data.actions,
      isBlocked,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, lyraMsg]);
    setProcessing(false);

    if (showToast) {
      showToast(isBlocked ? 'GUARDIAN PROTOCOL ACTIVE: REQUEST BLOCKED' : 'LYRA AI: DIRECTIVE EXECUTED');
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('lyra_comm_style', commStyle);
    localStorage.setItem('lyra_brief_style', briefStyle);
    localStorage.setItem('lyra_voice', voice);
    setShowConfig(false);
    if (showToast) showToast('LYRA CONFIGURATION SAVED');
  };

  const toggleMic = () => {
    setIsListening(!isListening);
    if (!isListening && showToast) {
      showToast('LYRA VOICE ARCHITECTURE: LISTENING...');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close Lyra Assistant Overlay"
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 cursor-default border-none w-full h-full"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lyra AI Tactical Assistant"
        className="fixed inset-y-0 right-0 w-80 sm:w-[480px] bg-[#07110d]/95 border-l border-tactical-green/60 z-50 shadow-2xl p-5 flex flex-col justify-between font-mono text-xs text-slate-100"
      >
        <div className="flex items-center justify-between pb-3 border-b border-tactical-green/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-tactical-green bg-[#07110d] flex items-center justify-center shadow-hud-glow-green relative">
              <span className="w-8 h-8 rounded-full border border-tactical-glow animate-ping absolute opacity-40"></span>
              <Bot className="w-5 h-5 text-tactical-glow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-barlow font-black text-lg text-slate-100 tracking-wider">LYRA AI CORE</h3>
                <span className="px-2 py-0.5 rounded bg-tactical-dim text-tactical-glow text-[8px] font-bold">
                  GUARDIAN ACTIVE
                </span>
              </div>
              <span className="text-[9px] text-bronze-gold uppercase block">PROTECTED MISSION // VOICE READY</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOmegaCommander && (
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                aria-label="Lyra Configuration Settings"
                className="p-1.5 rounded bg-[#07110d] border border-bronze-gold/60 text-bronze-light hover:text-white"
                title="Commander Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Lyra Panel"
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showConfig && isOmegaCommander && (
          <div className="bg-[#0c1a15] border border-bronze-gold rounded-lg p-4 my-2 space-y-3 z-30 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-border pb-2 text-bronze-gold font-bold">
              <span>LYRA CONFIGURATION // OMEGA PANEL</span>
              <button type="button" onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block">COMMUNICATION STYLE</span>
              <div className="grid grid-cols-3 gap-1">
                {['Professional', 'Tactical', 'Companion'].map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => setCommStyle(style)}
                    className={`py-1 rounded border text-[9px] font-bold ${
                      commStyle === style ? 'bg-bronze-gold/20 text-bronze-light border-bronze-gold' : 'bg-[#07110d] border-stone-border text-slate-400'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block">BRIEFING STYLE</span>
              <div className="grid grid-cols-3 gap-1">
                {['Short', 'Detailed', 'Deep Analysis'].map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => setBriefStyle(style)}
                    className={`py-1 rounded border text-[9px] font-bold ${
                      briefStyle === style ? 'bg-bronze-gold/20 text-bronze-light border-bronze-gold' : 'bg-[#07110d] border-stone-border text-slate-400'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveConfig}
              className="w-full py-1.5 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-bronze-light font-bold text-xs rounded uppercase flex items-center justify-center gap-1 mt-2"
            >
              <Check className="w-3.5 h-3.5" /> SAVE CONFIGURATION
            </button>
          </div>
        )}

        <div className="py-2 px-3 bg-[#0c1a15] border border-tactical-green/30 rounded flex items-center justify-between my-2">
          <div className="flex items-center gap-2 text-[10px] text-tactical-glow font-bold">
            <Volume2 className="w-4 h-4 text-tactical-green animate-pulse" />
            <span>LYRA VOICE SYNTHESIS // {voice.toUpperCase()} ENGINE</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-tactical-green animate-pulse"></span>
            <span className="w-1 h-5 bg-tactical-glow animate-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1 h-2 bg-tactical-green animate-pulse" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>

        <div className="flex-1 my-2 overflow-y-auto space-y-3 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3.5 rounded border text-xs leading-relaxed ${
                msg.isBlocked
                  ? 'bg-threat-red/10 border-threat-red text-slate-100 shadow-lg'
                  : msg.sender === 'COMMANDER' || msg.sender === 'FOUNDER'
                  ? 'bg-[#07110d] border-stone-border text-slate-200 ml-6'
                  : 'black-glass-glow border-tactical-green/50 text-slate-100 mr-2 shadow-tactical'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5 text-[9px] font-bold">
                <span className={`flex items-center gap-1 ${msg.isBlocked ? 'text-threat-red' : 'text-tactical-glow'}`}>
                  {msg.isBlocked ? <ShieldAlert className="w-3.5 h-3.5 text-threat-red" /> : <ShieldCheck className="w-3 h-3 text-tactical-green" />}
                  [{msg.sender}]
                </span>
                <span className="text-slate-500">{msg.time}</span>
              </div>
              <p className="whitespace-pre-line font-plex text-xs leading-relaxed">{msg.text}</p>
            </div>
          ))}

          {processing && (
            <div className="p-3 bg-[#0c1a15] border border-tactical-green/40 rounded text-tactical-glow text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-tactical-green" />
              <span>LYRA IS EXAMINING GUARDIAN SAFETY RULES...</span>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="pt-2 border-t border-stone-border flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleMic}
            aria-label="Toggle Microphone Input"
            className={`p-2 rounded border transition-colors ${
              isListening
                ? 'bg-threat-red/20 border-threat-red text-threat-red animate-pulse'
                : 'bg-[#07110d] border-stone-border text-slate-300 hover:text-white'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-tactical-green" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Command Lyra (Guardian Protocol active)..."
            aria-label="Lyra Command Input"
            className="flex-1 px-3 py-2 bg-[#07110d] border border-stone-border rounded text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-tactical-green"
          />

          <button
            type="submit"
            disabled={processing || !inputText.trim()}
            aria-label="Send Directive to Lyra"
            className="p-2 bg-tactical-dim hover:bg-tactical-green/30 border border-tactical-green text-tactical-glow rounded font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}import React, { useState } from 'react';
import { Compass, Crosshair, MapPin, ZoomIn, ZoomOut, RefreshCw, Eye, Shield } from 'lucide-react';
import TacticalEarthProjection from './TacticalEarthProjection';
import { EXPEDITION_LOCATIONS } from '../data/mockData';

export default function ExpeditionMap({ onSelectCase }) {
  const [selectedLoc, setSelectedLoc] = useState(EXPEDITION_LOCATIONS[0]);
  const [mapMode, setMapMode] = useState('FLAT EARTH RADAR');
  const [zoomLevel, setZoomLevel] = useState(1);

  const connectionLines = [
    { from: 'EL_DORADO', to: 'ATLANTIS' },
    { from: 'GOBEKLI', to: 'DEAD_SEA_SCROLLS' },
    { from: 'ALEXANDRIA', to: 'DERINKUYU' },
    { from: 'OAK_ISLAND', to: 'COPPER_SCROLL' },
    { from: 'HIGHJUMP', to: 'ADMIRAL_BYRD' },
  ];

  const handleZoom = (dir) => {
    if (dir === 'in') setZoomLevel((prev) => Math.min(prev + 0.25, 1.75));
    if (dir === 'out') setZoomLevel((prev) => Math.max(prev - 0.25, 1));
    if (dir === 'reset') setZoomLevel(1);
  };

  return (
    <div className="black-glass-glow rounded-lg p-4 flex flex-col justify-between relative overflow-hidden min-h-[520px] font-mono shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-border/80 mb-2 z-20 gap-2">
        <div>
          <h3 className="font-barlow font-bold text-base sm:text-lg tracking-wider text-slate-100 uppercase flex items-center gap-2">
            <Compass className="w-5 h-5 text-tactical-green animate-spin" style={{ animationDuration: '28s' }} />
            GLOBAL SITUATION WALL // FLAT EARTH RADAR
          </h3>
          <span className="text-[10px] text-tactical-glow uppercase block mt-0.5">
            PRIMARY TACTICAL RECONNAISSANCE // MODE: {mapMode}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          {['FLAT EARTH RADAR', 'SONAR VECTOR', 'THERMAL SCAN', 'INTEL MESH'].map((mode) => (
            <button
              type="button"
              key={mode}
              onClick={() => setMapMode(mode)}
              className={`px-2.5 py-1 rounded border transition-all ${
                mapMode === mode
                  ? 'bg-tactical-dim text-tactical-glow border-tactical-green font-bold shadow-tactical'
                  : 'bg-[#07110d] text-slate-400 border-stone-border hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}

          <div className="flex items-center gap-1 ml-2 border-l border-stone-border/80 pl-2">
            <button
              type="button"
              onClick={() => handleZoom('in')}
              aria-label="Zoom In Radar"
              className="p-1 bg-[#07110d] border border-stone-border text-slate-300 hover:text-white rounded"
            >
              <ZoomIn className="w-3.5 h-3.5 text-bronze-gold" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom('out')}
              aria-label="Zoom Out Radar"
              className="p-1 bg-[#07110d] border border-stone-border text-slate-300 hover:text-white rounded"
            >
              <ZoomOut className="w-3.5 h-3.5 text-bronze-gold" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom('reset')}
              aria-label="Reset Radar Zoom"
              className="p-1 bg-[#07110d] border border-stone-border text-slate-300 hover:text-white rounded"
            >
              <RefreshCw className="w-3.5 h-3.5 text-bronze-gold" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[500px] bg-[#07110d] bg-map-texture rounded border border-stone-border/80 overflow-hidden shadow-inner flex items-center justify-center">
        <div className="absolute inset-0 scanline-overlay pointer-events-none z-10 opacity-30"></div>

        <TacticalEarthProjection className="absolute inset-0 z-0" />

        <div className="absolute inset-0 opacity-25 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[520px] h-[520px] rounded-full border border-tactical-green/50 relative flex items-center justify-center">
            <div className="w-[400px] h-[400px] rounded-full border border-tactical-green/30"></div>
            <div className="w-[260px] h-[260px] rounded-full border border-tactical-green/30"></div>
            <div className="w-[120px] h-[120px] rounded-full border border-tactical-green/30"></div>
            <Compass className="w-full h-full text-tactical-green animate-radar-sweep absolute" />
          </div>
        </div>

        <div className="absolute top-3 left-3 text-[9px] text-slate-400 pointer-events-none z-20 space-y-0.5 bg-[#07110d]/90 px-2.5 py-1.5 rounded border border-stone-border">
          <div>PROJECTION: AZIMUTHALLY EQUIDISTANT FLAT EARTH</div>
          <div>SWEEP: 360° CONTINUOUS | RANGE: 50,000 KM</div>
        </div>

        <div
          className="w-full h-full relative transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {connectionLines.map((line, idx) => {
              const start = EXPEDITION_LOCATIONS.find((l) => l.id === line.from);
              const end = EXPEDITION_LOCATIONS.find((l) => l.id === line.to);
              if (!start || !end) return null;

              return (
                <line
                  key={idx}
                  x1={`${start.x}%`}
                  y1={`${start.y}%`}
                  x2={`${end.x}%`}
                  y2={`${end.y}%`}
                  stroke="#10B981"
                  strokeWidth="1.5"
                  opacity="0.8"
                  className="animate-dash-line"
                />
              );
            })}
          </svg>

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
                      <div className="w-12 h-12 rounded-full border border-tactical-green/70 animate-sonar-ripple absolute"></div>
                      <div className="w-8 h-8 rounded-full border border-tactical-green flex items-center justify-center bg-[#07110d] shadow-tactical">
                        <Crosshair className="w-5 h-5 text-tactical-green animate-spin" style={{ animationDuration: '8s' }} />
                      </div>
                    </div>
                  ) : (
                    <MapPin
                      className={`w-5 h-5 transition-transform group-hover:scale-125 ${
                        isSelected ? 'text-tactical-glow scale-125' : 'text-bronze-gold'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedLoc && (
          <div className="absolute bottom-3 left-3 right-3 bg-[#0c1a15]/95 border border-tactical-green/70 rounded p-3 text-xs z-30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-tactical-green" />
                <span className="font-barlow font-bold text-base text-slate-100">{selectedLoc.name}</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#07110d] border border-stone-border text-tactical-glow font-bold">
                  {selectedLoc.category}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">REGION: {selectedLoc.sub} | STATUS: {selectedLoc.status}</p>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto">
              <div className="text-right">
                <span className="text-tactical-glow font-bold text-sm block">{selectedLoc.progress}%</span>
                <span className="text-[8px] text-slate-500 uppercase block">RESEARCH PROGRESS</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectCase(selectedLoc.caseId)}
                className="px-3 py-1.5 bg-tactical-dim hover:bg-tactical-green/30 border border-tactical-green text-tactical-glow text-[10px] rounded uppercase font-bold flex items-center gap-1.5 shadow-tactical"
              >
                <Eye className="w-3.5 h-3.5" /> OPEN DOSSIER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}import React, { useState, useEffect } from 'react';
import ParticleBackground from '../components/ParticleBackground';
import ExpeditionMap from '../components/ExpeditionMap';
import ProductionPipeline from '../components/ProductionPipeline';
import SafeImage from '../components/SafeImage';
import LyraAssistant from '../components/LyraAssistant';
import LyraCoreProjection from '../components/LyraCoreProjection';
import { LIBRARY_COLLECTIONS, CASE_FILES_EXPANDED, ARCHIVES_COLLECTION, SYSTEM_STATUS } from '../data/mockData';
import { getHQStatus } from '../services/hqService';
import { useAuth } from '../context/AuthContext';
import { Video, Mic, Plus, Radio, Clock, Compass, Activity, Shield, Cpu, BookOpen, CheckCircle2, Circle, Bot, Lock, FileText, ShieldCheck } from 'lucide-react';

export default function Headquarters({ onNavigate, notifications, showToast }) {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 12, seconds: 38 });
  const [hqTelemetry, setHqTelemetry] = useState(null);
  const [isDegraded, setIsDegraded] = useState(false);
  const [lyraOpen, setLyraOpen] = useState(false);

  useEffect(() => {
    async function loadTelemetry() {
      const { data, isFallback } = await getHQStatus();
      setHqTelemetry(data);
      setIsDegraded(isFallback);
    }

    loadTelemetry();
    const telemetryInterval = setInterval(loadTelemetry, 15000);
    return () => clearInterval(telemetryInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderStatusDot = (status) => {
    if (status === 'ONLINE' || status === 'OPERATIONAL' || status === 'ACTIVE' || status === 'elevenlabs' || status === 'openai') {
      return <Circle className="w-2 h-2 fill-tactical-green text-tactical-green animate-pulse" />;
    }
    if (status === 'DEGRADED' || status === 'UNKNOWN' || status === 'mock') {
      return <Circle className="w-2 h-2 fill-bronze-gold text-bronze-gold" />;
    }
    return <Circle className="w-2 h-2 fill-threat-red text-threat-red" />;
  };

  const activeOperatorName = user?.name || SYSTEM_STATUS.userName;
  const activeOperatorRole = user?.role || SYSTEM_STATUS.role;
  const activeClearance = user?.clearanceLevel || hqTelemetry?.clearanceLevel || SYSTEM_STATUS.clearance;
  const isOmegaCommander = activeClearance === 'OMEGA' || user?.role === 'ADMIN' || user?.role === 'FOUNDER';

  const activeCasesVal = hqTelemetry ? String(hqTelemetry.activeCases) : '12';
  const aiProviderVal = hqTelemetry?.aiProvider ? hqTelemetry.aiProvider.toUpperCase() : 'ELEVENLABS';
  const queueDepthVal = hqTelemetry ? String(hqTelemetry.queueDepth) : '3';

  const activeFeed = notifications && notifications.length > 0
    ? notifications
    : (hqTelemetry?.notifications || []);

  return (
    <div className="p-4 md:p-6 space-y-6 font-plex relative min-h-screen bg-command-room">
      <ParticleBackground />

      {/* 1. COMMAND HUD PANEL */}
      <div className="black-glass-glow rounded-lg p-5 relative overflow-hidden z-10 font-mono shadow-2xl">
        <div className="absolute inset-0 bg-moving-grid pointer-events-none opacity-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded border-2 border-bronze-gold bg-[#07110d] flex items-center justify-center shadow-bronze flex-shrink-0">
              <Compass className="w-7 h-7 text-bronze-gold animate-spin" style={{ animationDuration: '24s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-barlow font-black text-2xl sm:text-3xl tracking-wider text-slate-100 uppercase">
                  TACTICAL ATLAS CORE
                </h1>
                {isDegraded ? (
                  <span className="px-2 py-0.5 rounded bg-threat-red/20 border border-threat-red text-threat-red text-[9px] font-bold animate-pulse">
                    LOCAL COMMAND MODE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-tactical-dim/90 border border-tactical-green text-tactical-glow text-[9px] font-bold">
                    COMMAND FACILITY
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                OPERATOR: <span className="text-bronze-gold font-bold">{activeOperatorName}</span> | ROLE: <span className="text-slate-200">{activeOperatorRole}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-3 bg-[#07110d] px-3.5 py-2 rounded border border-stone-border">
              <span className="text-[9px] text-slate-500 font-bold block uppercase border-r border-stone-border pr-2.5">COMMAND HUD</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                {renderStatusDot(hqTelemetry?.databaseStatus || 'ONLINE')}
                <span className="text-slate-200 font-bold">DATABASE ● {hqTelemetry?.databaseStatus || 'ONLINE'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                {renderStatusDot(hqTelemetry?.redisStatus || 'ONLINE')}
                <span className="text-slate-200 font-bold">REDIS ● {hqTelemetry?.redisStatus || 'ONLINE'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                {renderStatusDot(aiProviderVal)}
                <span className="text-slate-200 font-bold">AI ENGINE ● {aiProviderVal} ACTIVE</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                {renderStatusDot('ONLINE')}
                <span className="text-tactical-glow font-bold">CHARLIE ● READY</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                {renderStatusDot('ONLINE')}
                <span className="text-tactical-glow font-bold">LYRA ● ONLINE</span>
              </div>
            </div>

            <div className="px-3 py-2 bg-[#07110d] border border-tactical-green/60 rounded flex items-center gap-2 text-tactical-glow font-bold text-[10px]">
              <ShieldCheck className="w-4 h-4 text-tactical-green animate-pulse" />
              <div>
                <span className="text-[8px] text-slate-400 block uppercase">GUARDIAN PROTOCOL</span>
                <span className="text-tactical-glow">ACTIVE ✓</span>
              </div>
            </div>

            <div className="px-3 py-2 bg-[#07110d] border border-bronze-gold/40 rounded flex items-center gap-2">
              <Clock className="w-4 h-4 text-bronze-gold" />
              <div>
                <span className="text-[8px] text-slate-500 block uppercase">PUBLISH COUNTDOWN</span>
                <span className="text-bronze-gold font-bold text-[10px]">
                  {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="px-3 py-2 bg-[#07110d] border border-tactical-green/40 rounded flex items-center gap-1.5 text-tactical-glow font-bold text-[10px]">
              <Radio className="w-3.5 h-3.5 text-tactical-green animate-pulse" />
              <span>CLEARANCE ● {activeClearance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXPANDED GLOBAL SITUATION WALL & LYRA CORE PROJECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        <div className="lg:col-span-8 relative">
          <div className="animate-scanner-line z-20"></div>
          <ExpeditionMap onSelectCase={(caseId) => onNavigate('/cases', caseId)} />
        </div>

        {/* Embedded Lyra AI Core Visual Projection */}
        <div className="lg:col-span-4">
          <LyraCoreProjection onOpenAssistant={() => setLyraOpen(true)} />
        </div>
      </div>

      {/* 3. CLASSIFIED BRIEFING DISPLAY & COMMAND WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        <div className="lg:col-span-6 black-glass rounded-lg p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-bronze-gold/20 border border-bronze-gold text-bronze-light text-[9px] font-bold uppercase tracking-widest">
            CLASSIFIED BRIEFING
          </div>

          <div>
            <div className="pb-2 border-b border-stone-border mb-3">
              <h3 className="font-barlow font-bold text-lg text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-5 h-5 text-bronze-gold" />
                MISSION FILE: EL DORADO
              </h3>
              <span className="text-[9px] text-bronze-gold uppercase block">STATUS: ACTIVE INVESTIGATION</span>
            </div>

            <div className="relative rounded overflow-hidden mb-3 h-44 bg-[#07110d] border border-stone-border group">
              <SafeImage
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"
                alt="El Dorado"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a15] via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3">
                <span className="font-barlow font-bold text-xl text-slate-100 block">EL DORADO: THE CITY OF GOLD</span>
                <span className="text-[10px] text-bronze-gold block">OBJECTIVE: RECOVER HISTORICAL INTELLIGENCE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-[#07110d] p-3 rounded border border-stone-border mb-3">
              <div><span className="text-slate-500 block">RESEARCH:</span><span className="text-tactical-glow font-bold">92% COMPLETE</span></div>
              <div><span className="text-slate-500 block">NARRATION:</span><span className="text-tactical-glow font-bold">CHARLIE READY</span></div>
              <div><span className="text-slate-500 block">OPERATOR:</span><span className="text-bronze-gold font-bold">{activeOperatorName}</span></div>
              <div><span className="text-slate-500 block">CLEARANCE:</span><span className="text-tactical-glow font-bold">{activeClearance}</span></div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/cases', 'CASE-001')}
            className="w-full py-2.5 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-xs font-bold text-bronze-light rounded uppercase mt-2 shadow-bronze"
          >
            OPEN CLASSIFIED DOSSIER [CASE-001]
          </button>
        </div>

        <div className="lg:col-span-6 black-glass rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-border mb-3">
              <div>
                <h3 className="font-barlow font-bold text-lg text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-tactical-green" />
                  COMMAND PRODUCTION WORKFLOW
                </h3>
                <span className="text-[9px] text-bronze-gold uppercase block">SEQUENTIAL AI PIPELINE STAGES</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-tactical-dim border border-tactical-green text-tactical-glow text-[9px] font-bold">
                QUEUE: {queueDepthVal} JOBS
              </span>
            </div>

            <ProductionPipeline />
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] mt-4 pt-3 border-t border-stone-border">
            <button
              type="button"
              onClick={() => { onNavigate('/ai-studio'); if (showToast) showToast('SIMULATION: VISUAL PACK INITIALIZED'); }}
              className="p-2.5 bg-[#07110d] border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1 transition-all"
            >
              <Video className="w-4 h-4 text-bronze-gold" />
              GENERATE VISUALS
            </button>
            <button
              type="button"
              onClick={() => { onNavigate('/ai-studio'); if (showToast) showToast('SIMULATION: CHARLIE VOICE PROFILE LOADED'); }}
              className="p-2.5 bg-[#07110d] border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1 transition-all"
            >
              <Mic className="w-4 h-4 text-tactical-green" />
              GENERATE NARRATION
            </button>
            <button
              type="button"
              onClick={() => { onNavigate('/cases'); if (showToast) showToast('SIMULATION: NEW CASE DOSSIER TEMPLATE LOADED'); }}
              className="p-2.5 bg-[#07110d] border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4 text-amber-500" />
              CREATE CASE
            </button>
          </div>
        </div>
      </div>

      {/* 4. COMMANDER CONSOLE (OMEGA CLEARANCE ONLY) */}
      {isOmegaCommander && (
        <div className="black-glass-glow rounded-lg p-5 z-10 relative border-bronze-gold/60">
          <div className="flex justify-between items-center pb-2 border-b border-stone-border mb-3">
            <div>
              <h2 className="font-barlow font-bold text-lg text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-5 h-5 text-bronze-gold" />
                COMMANDER ACCESS // OMEGA CONSOLE
              </h2>
              <span className="text-[10px] text-bronze-gold uppercase block">HIGH-COMMAND OVERRIDE & LYRA AI CONTROL</span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-bronze-gold/20 border border-bronze-gold text-bronze-light text-[10px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-bronze-gold" /> RESTRICTED OMEGA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setLyraOpen(true)}
              className="p-3 bg-[#07110d] border border-stone-border hover:border-bronze-gold rounded text-left transition-all group"
            >
              <span className="text-bronze-gold font-bold block mb-1 group-hover:text-bronze-light">[OPEN LYRA ASSISTANT]</span>
              <span className="text-[10px] text-slate-400 block">Launch Lyra AI tactical advisor & voice stream.</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/status')}
              className="p-3 bg-[#07110d] border border-stone-border hover:border-bronze-gold rounded text-left transition-all group"
            >
              <span className="text-tactical-glow font-bold block mb-1 group-hover:text-tactical-green">[VIEW DEPARTMENTS]</span>
              <span className="text-[10px] text-slate-400 block">Inspect infrastructure relays, database, & Redis health.</span>
            </button>

            <button
              type="button"
              onClick={() => { if (showToast) showToast('COMMANDER OVERRIDE: ALL RELAYS LOCKED'); }}
              className="p-3 bg-[#07110d] border border-stone-border hover:border-bronze-gold rounded text-left transition-all group"
            >
              <span className="text-threat-red font-bold block mb-1 group-hover:text-red-400">[SYSTEM OVERRIDE]</span>
              <span className="text-[10px] text-slate-400 block">Lock or override automation queues immediately.</span>
            </button>

            <button
              type="button"
              onClick={() => { onNavigate('/cases'); if (showToast) showToast('MISSION CREATION TEMPLATE LOADED'); }}
              className="p-3 bg-[#07110d] border border-stone-border hover:border-bronze-gold rounded text-left transition-all group"
            >
              <span className="text-slate-100 font-bold block mb-1 group-hover:text-white">[CREATE OPERATION]</span>
              <span className="text-[10px] text-slate-400 block">Initialize new case file & research node.</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. GRAND LIBRARY & COMMS DOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 relative">
        <div className="lg:col-span-7 black-glass rounded-lg p-5">
          <div className="flex justify-between items-center pb-2 border-b border-stone-border mb-3">
            <div>
              <h3 className="font-barlow font-bold text-base text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-bronze-gold" />
                GRAND LIBRARY DOCK
              </h3>
              <span className="text-[9px] text-bronze-gold uppercase block">ARCHIVES, DOSSIERS & MEDIA VAULT</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/library')}
              className="text-xs text-tactical-glow hover:underline font-bold"
            >
              EXPLORE LIBRARY →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {LIBRARY_COLLECTIONS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => onNavigate('/library')}
                className="p-3 bg-[#07110d] border border-stone-border hover:border-bronze-gold rounded text-left transition-all"
              >
                <span className="font-barlow font-bold text-sm text-slate-100 block truncate">{c.title}</span>
                <span className="text-[9px] text-bronze-gold block mt-1">{c.cases} DOSSIERS</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 black-glass rounded-lg p-5">
          <div className="flex justify-between items-center pb-2 border-b border-stone-border mb-3">
            <div>
              <h3 className="font-barlow font-bold text-base text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-tactical-green" />
                COMMS CENTER
              </h3>
              <span className="text-[9px] text-bronze-gold uppercase block">NOTIFICATIONS & SYSTEM ALERTS</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#07110d] border border-stone-border text-[9px] text-slate-300">
              {activeFeed.filter((n) => !n.read).length} UNREAD
            </span>
          </div>

          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {activeFeed.map((item) => (
              <div
                key={item.id}
                className={`p-2 rounded border text-[10px] flex justify-between items-center ${
                  item.read ? 'bg-[#07110d]/50 border-stone-border/40 opacity-70' : 'bg-[#07110d] border-stone-border'
                }`}
              >
                <div className="flex items-center gap-2 truncate max-w-[200px]">
                  {!item.read && <CheckCircle2 className="w-3 h-3 text-tactical-green flex-shrink-0" />}
                  <span className="text-slate-200 truncate">{item.title}</span>
                </div>
                <span className="text-bronze-gold text-[8px] flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lyra AI Assistant Floating Panel */}
      <LyraAssistant
        isOpen={lyraOpen}
        onClose={() => setLyraOpen(false)}
        onNavigate={onNavigate}
        showToast={showToast}
      />
    </div>
  );
}$ npm run verify

> tactical-atlas-os@4.0.0 verify
> npm run lint && npm run format:check && npm run build

> tactical-atlas-os@4.0.0 lint
> eslint . --ext js,jsx --max-warnings 0

✔ 0 errors, 0 warnings

> tactical-atlas-os@4.0.0 format:check
> prettier --check .
Checking formatting...
All matched files use Prettier code style!

> tactical-atlas-os@4.0.0 build
> vite build
vite v5.1.6 building for production...
transforming...
✓ 96 modules transformed.
rendering chunks...
dist/index.html                   2.14 kB │ gzip:  0.89 kB
dist/assets/index-Bf9Kx_W3.css   19.45 kB │ gzip:  3.98 kB
dist/assets/index-Dwz8q7LP.js   263.84 kB │ gzip: 75.60 kB
✓ built in 1.56s
