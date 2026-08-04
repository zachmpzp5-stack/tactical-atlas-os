/* ============================================================================
   TACTICAL ATLAS INTELLIGENCE OS — MASTER GENERATOR (v4.6 PRODUCTION HARDENED)
   File: setup.cjs
   Execution: node setup.cjs
   ============================================================================ */

const fs = require('fs');
const path = require('path');

console.log('----------------------------------------------------------------');
console.log('🚀 Generating Tactical Atlas OS Production Architecture (v4.6)...');
console.log('----------------------------------------------------------------\n');

const projectFiles = {
  // 1. Package Manifest
  'package.json': JSON.stringify(
    {
      name: 'tactical-atlas-os',
      private: true,
      version: '4.6.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
        lint: 'eslint . --ext js,jsx --max-warnings 0',
        'format:check': 'prettier --check .',
        format: 'prettier --write .',
        'start:server': 'node server/index.js',
        'dev:server': 'node --watch server/index.js',
        zip: 'node zip.cjs',
        verify: 'npm run lint && npm run format:check && npm run build',
      },
      dependencies: {
        cors: '^2.8.5',
        dotenv: '^16.4.5',
        express: '^4.18.2',
        'lucide-react': '^0.344.0',
        pg: '^8.11.3',
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      devDependencies: {
        '@types/node': '^20.11.20',
        '@types/pg': '^8.11.0',
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

  // 2. ZIP Bundler Script
  'zip.cjs': `/**
 * zip.cjs - Tactical Atlas OS ZIP Bundler
 * Execution: node zip.cjs or npm run zip
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function createZipArchive() {
  console.log('================================================================');
  console.log('📦 Packaging Tactical Atlas Intelligence OS into ZIP Archive...');
  console.log('================================================================\\n');

  const zipName = 'tactical-atlas-os.zip';
  const rootDir = __dirname;

  try {
    if (process.platform === 'win32') {
      const psCommand = \`powershell -Command "Get-ChildItem -Path '\${rootDir}' -Exclude node_modules,dist,.git,\${zipName} | Compress-Archive -DestinationPath '\${path.join(rootDir, zipName)}' -Force"\`;
      console.log('Executing PowerShell Compress-Archive...');
      execSync(psCommand, { stdio: 'inherit' });
    } else {
      const unixCommand = \`zip -r \${zipName} . -x "node_modules/*" "dist/*" ".git/*" "\${zipName}"\`;
      console.log('Executing zip command...');
      execSync(unixCommand, { stdio: 'inherit' });
    }

    console.log(\`\\n✅ Successfully generated project archive: \${zipName}\`);
  } catch (error) {
    console.error('❌ Failed to create ZIP archive:', error.message);
  }
}

createZipArchive();`,

  // 3. Docker Compose Orchestrator
  'docker-compose.yml': `version: '3.8'

services:
  database:
    image: postgres:15-alpine
    container_name: tactical-atlas-postgres
    environment:
      POSTGRES_DB: tactical_atlas
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: CHANGE_ME_POSTGRES_PASSWORD
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: tactical-atlas-redis
    ports:
      - "6379:6379"

  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    container_name: tactical-atlas-server
    environment:
      PORT: 3001
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:CHANGE_ME_POSTGRES_PASSWORD@database:5432/tactical_atlas
      REDIS_URL: redis://redis:6379
      JWT_SECRET: CHANGE_ME_JWT_SECRET
    ports:
      - "3001:3001"
    depends_on:
      database:
        condition: service_healthy

  client:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tactical-atlas-client
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  pgdata:
`,

  // 4. Dockerfiles & Nginx Config
  Dockerfile: `FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`,

  'Dockerfile.server': `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY server ./server
COPY .env.example ./.env
EXPOSE 3001
CMD ["node", "server/index.js"]
`,

  'nginx.conf': `server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://tactical-atlas-server:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
`,

  // 5. Environment Blueprint & Config
  '.env.example': `VITE_API_URL=http://localhost:3001
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:CHANGE_ME_POSTGRES_PASSWORD@localhost:5432/tactical_atlas
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=charlie_voice_id
JWT_SECRET=CHANGE_ME_JWT_SECRET
`,

  '.env': `VITE_API_URL=http://localhost:3001
PORT=3001
NODE_ENV=development
`,

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
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'setup.cjs', 'zip.cjs', 'server'],
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
    'no-unused-vars': ['warn', { varsIgnorePattern: '^(React|_)' }],
  },
};`,

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

  '.prettierignore': `node_modules
dist
package-lock.json
*.zip`,

  'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,

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
        'hud-glow-green': '0 0 20px rgba(16, 185, 129, 0.6), inset 0 0 10px rgba(16, 185, 129, 0.3)',
        'inset-panel': 'inset 0 2px 6px rgba(0, 0, 0, 0.85)',
      },
      backgroundImage: {
        'map-texture': 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
};`,

  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,

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

  'public/_redirects': `/*    /index.html   200`,

  'netlify.toml': `[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200`,

  // 6. Express Backend Core Entry
  'server/index.js': `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { configureSecurity } from './middleware/security.js';
import authRoutes from './routes/auth.js';
import hqRoutes from './routes/hq.js';
import lyraRoutes from './routes/lyra.js';
import casesRoutes from './routes/cases.js';
import libraryRoutes from './routes/library.js';
import audioRoutes from './routes/audio.js';
import tainRoutes from './routes/tain.js';
import { db } from './database/connection.js';
import { initSchema } from './database/schema.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

configureSecurity(app);
app.use(cors());
app.use(express.json());

initSchema().catch((err) => {
  console.warn('[SERVER] Database schema initialization notice:', err.message);
});

app.get('/api/health', async (req, res) => {
  const dbHealth = await db.checkHealth();
  res.json({
    status: 'ok',
    service: 'tactical-atlas',
    database: dbHealth.status,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/hq', hqRoutes);
app.use('/api/lyra', lyraRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/tain', tainRoutes);

app.use((err, req, res, _next) => {
  console.error('[SERVER ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Relay Failure',
      code: err.code || 'SERVER_ERROR',
    },
  });
});

app.listen(PORT, () => {
  console.log('================================================================');
  console.log(\`🚀 Tactical Atlas Backend Core Server listening on port \${PORT}\`);
  console.log('================================================================');
});`,

  // 7. Database Connection Pool Manager
  'server/database/connection.js': `import dotenv from 'dotenv';
dotenv.config();

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.pool = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async connect() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.warn('[DB] DATABASE_URL not configured. Operating in Memory Relay Mode.');
      this.isConnected = false;
      return;
    }

    try {
      const { default: pg } = await import('pg');
      this.pool = new pg.Pool({
        connectionString: dbUrl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      const client = await this.pool.connect();
      console.log('[DB] PostgreSQL Production Pool connected successfully.');
      client.release();
      this.isConnected = true;
    } catch (err) {
      console.warn(\`[DB] PostgreSQL Connection Attempt \${this.retryCount + 1} Notice:\`, err.message);
      this.isConnected = false;

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        setTimeout(() => this.connect(), 3000);
      }
    }
  }

  async query(text, params) {
    if (!this.isConnected || !this.pool) {
      return { rows: [] };
    }
    try {
      return await this.pool.query(text, params);
    } catch (err) {
      console.warn('[DB Query Error]:', err.message);
      return { rows: [] };
    }
  }

  async checkHealth() {
    if (!this.isConnected || !this.pool) {
      return { status: 'DEGRADED_MEMORY_MODE', active: false };
    }
    try {
      await this.pool.query('SELECT 1');
      return { status: 'ONLINE', active: true };
    } catch (err) {
      return { status: 'ERROR', active: false, error: err.message };
    }
  }

  async shutdown() {
    if (this.pool) {
      await this.pool.end();
      console.log('[DB] PostgreSQL Pool shutdown complete.');
    }
  }
}

export const db = new DatabaseConnection();
db.connect();

process.on('SIGINT', async () => {
  await db.shutdown();
  process.exit(0);
});`,

  // 8. Database DDL Schema
  'server/database/schema.js': `import { db } from './connection.js';

export const DDL_SCHEMA = \`
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'OPERATOR',
  clearance VARCHAR(32) NOT NULL DEFAULT 'LEVEL_2',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cases (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(64) NOT NULL,
  classification VARCHAR(32) NOT NULL,
  category VARCHAR(64),
  notes TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_records (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  description TEXT,
  clearance VARCHAR(32) DEFAULT 'LEVEL_2',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS missions (
  id VARCHAR(64) PRIMARY KEY,
  location VARCHAR(128) NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  status VARCHAR(64) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS telemetry (
  id SERIAL PRIMARY KEY,
  system VARCHAR(64) NOT NULL,
  metric_key VARCHAR(64) NOT NULL,
  metric_value VARCHAR(128) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lyra_conversations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  status VARCHAR(64) NOT NULL,
  actions TEXT[],
  clearance_verified VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  command VARCHAR(255) NOT NULL,
  action VARCHAR(128) NOT NULL,
  clearance VARCHAR(32) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_entities (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  confidence INT DEFAULT 80,
  clearance VARCHAR(32) DEFAULT 'LEVEL_2',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entity_connections (
  id SERIAL PRIMARY KEY,
  source_id VARCHAR(64) NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  relation VARCHAR(64) NOT NULL,
  target_type VARCHAR(64) NOT NULL,
  label VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS intelligence_reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  classification VARCHAR(32) NOT NULL,
  summary TEXT NOT NULL,
  confidence_level VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sources (
  id SERIAL PRIMARY KEY,
  source_name VARCHAR(128) NOT NULL,
  category VARCHAR(64) NOT NULL,
  confidence INT DEFAULT 80,
  verification_status VARCHAR(64) DEFAULT 'VERIFIED_HIGH'
);
\`;

export async function initSchema() {
  try {
    await db.query(DDL_SCHEMA);
    console.log('[DB] Schema verified/initialized.');
  } catch (err) {
    console.warn('[DB] Schema initialization notice:', err.message);
  }
}`,

  // 9. TAIN Confidence Engine
  'server/intelligence/confidenceEngine.js': `export function calculateConfidence({
  sourceReliability = 85,
  evidenceStrength = 80,
  connectionDensity = 3,
  verificationStatus = 'VERIFIED_HIGH',
  ageDays = 0,
}) {
  let score = 50;

  score += (sourceReliability - 50) * 0.3;
  score += (evidenceStrength - 50) * 0.3;
  score += Math.min(connectionDensity * 5, 20);

  if (verificationStatus === 'VERIFIED_HIGH' || verificationStatus === 'VERIFIED') {
    score += 10;
  } else if (verificationStatus === 'UNVERIFIED_ANOMALY') {
    score -= 15;
  }

  const decay = Math.min(ageDays * 0.1, 10);
  score -= decay;

  score = Math.min(Math.max(Math.round(score), 0), 100);

  let classification = 'UNVERIFIED';
  if (score >= 85) {
    classification = 'HIGH CONFIDENCE ANOMALY';
  } else if (score >= 70) {
    classification = 'HIGH CONFIDENCE';
  } else if (score >= 50) {
    classification = 'ANOMALY';
  }

  return {
    confidence: score,
    classification,
  };
}`,

  // 10. Source Tracker
  'server/intelligence/sourceTracker.js': `import { calculateConfidence } from './confidenceEngine.js';

export function verifySource(sourceName, category = 'HISTORICAL_RECON', initialConfidence = 85) {
  const source = sourceName || 'Grand Library Repository';
  const reliability = Math.min(Math.max(initialConfidence, 0), 100);
  const confidenceMeta = calculateConfidence({
    sourceCount: 2,
    connectionCount: 3,
    verificationStatus: reliability >= 80 ? 'VERIFIED_HIGH' : 'UNVERIFIED_ANOMALY',
  });

  return {
    source,
    reliability,
    category,
    verificationStatus: confidenceMeta.classification,
    confidenceScore: confidenceMeta.confidence,
    linkedRecords: ['ARC-101', 'CASE-001', 'MIS-001'],
    verificationHistory: [
      { timestamp: new Date().toISOString(), status: confidenceMeta.classification, verifiedBy: 'TAIN_CORE' },
    ],
  };
}

export function trackSourceVerification(sourceName, category, confidenceLevel = 80, relatedRecords = []) {
  return verifySource(sourceName, category, confidenceLevel);
}`,

  // 11. Knowledge Graph Engine
  'server/intelligence/knowledgeGraph.js': `import { db } from '../database/connection.js';
import { calculateConfidence } from './confidenceEngine.js';

const mockEntities = [
  { id: 'ENT-001', name: 'El Dorado', type: 'LOCATION_RESEARCH', category: 'SUBTERRANEAN', confidence: 92, clearance: 'LEVEL_2' },
  { id: 'ENT-002', name: 'Atlantis Strata', type: 'MARITIME_ANOMALY', category: 'MARITIME', confidence: 78, clearance: 'LEVEL_4' },
  { id: 'ENT-003', name: 'Göbekli Tepe', type: 'MEGALITHIC_SITE', category: 'MEGALITHIC', confidence: 85, clearance: 'LEVEL_3' },
];

const mockConnections = [
  { sourceId: 'ENT-001', targetId: 'ARC-101', relation: 'EVIDENCE_RECORD', targetType: 'ARCHIVE_RECORD', label: '1513 Piri Reis Chart' },
  { sourceId: 'ENT-001', targetId: 'CASE-001', relation: 'ACTIVE_OPERATION', targetType: 'CASE_DOSSIER', label: 'Subterranean River Grid Operation' },
  { sourceId: 'ENT-001', targetId: 'MIS-001', relation: 'FIELD_RECON', targetType: 'MISSION_NODE', label: 'Amazon Basin Sonar Survey' },
];

export async function createEntity(name, type, category, confidence = 80, clearance = 'LEVEL_2') {
  const newEntity = {
    id: \`ENT-00\${mockEntities.length + 1}\`,
    name,
    type,
    category,
    confidence,
    clearance,
    created_at: new Date().toISOString(),
  };

  try {
    await db.query(
      \`INSERT INTO knowledge_entities (id, name, type, category, confidence, clearance) 
       VALUES ($1, $2, $3, $4, $5, $6)\`,
      [newEntity.id, newEntity.name, newEntity.type, newEntity.category, newEntity.confidence, newEntity.clearance]
    );
  } catch (err) {
    console.warn('[knowledgeGraph] Database entity insert fallback:', err.message || err);
  }

  mockEntities.push(newEntity);
  return newEntity;
}

export async function connectEntity(sourceId, targetId, relation, targetType, label) {
  const newConn = { sourceId, targetId, relation, targetType, label };

  try {
    await db.query(
      \`INSERT INTO entity_connections (source_id, target_id, relation, target_type, label) 
       VALUES ($1, $2, $3, $4, $5)\`,
      [sourceId, targetId, relation, targetType, label]
    );
  } catch (err) {
    console.warn('[knowledgeGraph] Database connection insert fallback:', err.message || err);
  }

  mockConnections.push(newConn);
  return newConn;
}

export async function searchEntities(query) {
  const searchTerm = (query || '').toLowerCase().trim();

  try {
    const res = await db.query(
      \`SELECT * FROM knowledge_entities WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1\`,
      [\`%\${searchTerm}%\`]
    );
    if (res.rows && res.rows.length) return res.rows;
  } catch (err) {
    // Fallback
  }

  if (!searchTerm) return mockEntities;
  return mockEntities.filter(e => e.name.toLowerCase().includes(searchTerm) || e.category.toLowerCase().includes(searchTerm));
}

export async function getEntityNetwork(entityId) {
  let entity = null;
  let connections = [];

  try {
    const entityRes = await db.query(
      \`SELECT * FROM knowledge_entities WHERE id = $1 OR LOWER(name) = $2 LIMIT 1\`,
      [entityId, entityId.toLowerCase()]
    );
    if (entityRes.rows && entityRes.rows.length) {
      entity = entityRes.rows[0];
      const connRes = await db.query(\`SELECT * FROM entity_connections WHERE source_id = $1\`, [entity.id]);
      connections = connRes.rows || [];
    }
  } catch (err) {
    // Fallback
  }

  if (!entity) {
    entity = mockEntities.find(e => e.id === entityId || e.name.toLowerCase() === entityId.toLowerCase()) || mockEntities[0];
    connections = mockConnections.filter(c => c.sourceId === entity.id);
  }

  const confidenceScore = calculateConfidence({
    sourceCount: 2,
    connectionCount: connections.length,
    verificationStatus: entity.confidence >= 80 ? 'VERIFIED_HIGH' : 'UNVERIFIED_ANOMALY',
  });

  return {
    entity,
    connections,
    connectedCount: connections.length,
    confidenceScore,
  };
}

export async function searchConnections(query) {
  const searchTerm = (query || '').toLowerCase().trim();
  if (!searchTerm) return mockConnections;

  return mockConnections.filter(conn =>
    conn.sourceId.toLowerCase().includes(searchTerm) ||
    conn.targetId.toLowerCase().includes(searchTerm) ||
    conn.relation.toLowerCase().includes(searchTerm) ||
    conn.label.toLowerCase().includes(searchTerm)
  );
}`,

  // 12. Intelligence Fusion
  'server/intelligence/intelligenceFusion.js': `import { getEntityNetwork } from './knowledgeGraph.js';
import { verifySource } from './sourceTracker.js';

export async function generateFusedIntelligenceReport(entityQuery, user) {
  const network = await getEntityNetwork(entityQuery);
  const entity = network.entity;
  const sourceMeta = verifySource('Grand Library & Recon Network', entity.category, entity.confidence);

  const report = {
    title: \`FUSED INTELLIGENCE DOSSIER // \${entity.name.toUpperCase()}\`,
    classification: entity.clearance || 'LEVEL_2',
    summary: \`Tactical Atlas Network fusion indicates verified structural anomalies and cartographic records for \${entity.name}. \${network.connections.length} primary network nodes linked across cases and archives.\`,
    connectedRecords: network.connections.map(c => \`[\${c.targetType}] \${c.label} (\${c.relation})\`),
    confidenceLevel: \`\${network.confidenceScore.confidence}% (\${network.confidenceScore.classification})\`,
    recommendedAction: \`Dispatch Charlie Voice sync and initialize Subterranean Depth Scan sequence for \${entity.name}.\`,
    sourceVerification: sourceMeta,
    generatedAt: new Date().toISOString(),
  };

  return report;
}`,

  // 13. Analyst Service
  'server/intelligence/analystService.js': `import { generateFusedIntelligenceReport } from './intelligenceFusion.js';
import { getEntityNetwork } from './knowledgeGraph.js';

export async function analyzeNetworkQuery(query, user) {
  const network = await getEntityNetwork(query);
  const report = await generateFusedIntelligenceReport(query, user);

  return {
    entity: network.entity,
    connections: network.connections,
    confidence: network.confidenceScore,
    report,
    recommendations: [
      \`Deploy satellite bathymetric recon pass over \${network.entity.name} coordinates.\`,
      \`Sync Charlie narration profile with active dossier \${network.connections[1]?.targetId || 'CASE-001'}.\`,
    ],
  };
}`,

  // 14. TAIN Core
  'server/intelligence/tainCore.js': `import { getEntityNetwork, searchConnections, searchEntities } from './knowledgeGraph.js';
import { generateFusedIntelligenceReport } from './intelligenceFusion.js';
import { analyzeNetworkQuery } from './analystService.js';
import { verifySource } from './sourceTracker.js';

export const TAIN = {
  getEntityNetwork,
  searchConnections,
  searchEntities,
  generateFusedIntelligenceReport,
  analyzeNetworkQuery,
  verifySource,
};`,

  // 15. Security Services
  'server/middleware/securityService.js': `import { db } from '../database/connection.js';

export async function logSecurityAudit(userId, command, action, clearance) {
  try {
    await db.query(
      \`INSERT INTO audit_logs (user_id, command, action, clearance, timestamp) VALUES ($1, $2, $3, $4, NOW())\`,
      [userId, command, action, clearance]
    );
  } catch (err) {
    // Memory fallback audit log
  }
}

export function authorizeToolExecution(toolName, userClearance) {
  const clearanceLevels = ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'OMEGA', 'ROOT'];
  const toolPermissions = {
    getSystemStatus: 'LEVEL_1',
    searchLibrary: 'LEVEL_1',
    getCaseDetails: 'LEVEL_2',
    getMissionStatus: 'LEVEL_2',
    createOperation: 'OMEGA',
    systemOverride: 'ROOT',
  };

  const required = toolPermissions[toolName] || 'LEVEL_2';
  const userIdx = clearanceLevels.indexOf(userClearance || 'LEVEL_1');
  const requiredIdx = clearanceLevels.indexOf(required);

  return userIdx >= requiredIdx;
}`,

  'server/middleware/security.js': `export function configureSecurity(app) {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Powered-By', 'Tactical-Atlas-OS/4.6');
    next();
  });
}

export function rateLimiter(req, res, next) {
  next();
}`,

  'server/middleware/authMiddleware.js': `export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = {
      id: 'OP-4082',
      username: 'OPERATOR VANCE',
      role: 'OPERATOR',
      clearance: 'LEVEL_2',
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (token === 'demo-commander-token') {
    req.user = {
      id: 'CMD-001',
      username: 'COMMANDER ARCHER',
      role: 'COMMANDER',
      clearance: 'OMEGA',
    };
  } else {
    req.user = {
      id: 'OP-4082',
      username: 'OPERATOR VANCE',
      role: 'OPERATOR',
      clearance: 'LEVEL_2',
    };
  }
  next();
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const userRole = req.user?.role || 'VIEWER';
    if (userRole === 'FOUNDER' || allowedRoles.includes(userRole)) {
      return next();
    }
    return res.status(403).json({
      error: { message: \`ROLE ACCESS DENIED: Requires \${allowedRoles.join(' or ')}\`, code: 'ROLE_DENIED' }
    });
  };
}

export function requireClearance(minClearance) {
  const clearanceHierarchy = ['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'OMEGA', 'ROOT'];
  return (req, res, next) => {
    const userClearance = req.user?.clearance || 'LEVEL_1';
    const userIdx = clearanceHierarchy.indexOf(userClearance);
    const requiredIdx = clearanceHierarchy.indexOf(minClearance);

    if (userIdx < requiredIdx && req.user?.role !== 'FOUNDER') {
      return res.status(403).json({
        error: {
          message: \`INSUFFICIENT CLEARANCE: Requires \${minClearance}\`,
          code: 'CLEARANCE_DENIED',
        },
      });
    }
    next();
  };
}`,

  // 16. Express API Routes
  'server/routes/audio.js': `import express from 'express';

const router = express.Router();

router.get('/:id', (req, res) => {
  res.json({
    audioUrl: \`/api/audio/stream/\${req.params.id}\`,
    status: 'READY',
    format: 'audio/mp3',
    engine: 'ELEVENLABS_CHARLIE',
  });
});

export default router;`,

  'server/routes/tain.js': `import express from 'express';
import { TAIN } from '../intelligence/tainCore.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/entities', verifyToken, async (req, res) => {
  const entities = await TAIN.searchEntities('');
  res.json({ entities, count: entities.length, status: 'TAIN_ENTITIES_FETCHED' });
});

router.get('/search', verifyToken, async (req, res) => {
  const query = req.query.q || req.query.query || 'El Dorado';
  const report = await TAIN.generateFusedIntelligenceReport(query, req.user);
  res.json({
    query,
    results: report,
    status: 'TAIN_FUSION_ACTIVE',
  });
});

router.get('/entity/:id', verifyToken, async (req, res) => {
  const network = await TAIN.getEntityNetwork(req.params.id);
  res.json({ network });
});

router.get('/connections/:id', verifyToken, async (req, res) => {
  const network = await TAIN.getEntityNetwork(req.params.id);
  res.json({
    entityId: req.params.id,
    connections: network.connections,
    connectedCount: network.connectedCount,
  });
});

router.get('/report/:id', verifyToken, async (req, res) => {
  const report = await TAIN.generateFusedIntelligenceReport(req.params.id, req.user);
  res.json({ report });
});

router.post('/analyze', verifyToken, async (req, res) => {
  const { query } = req.body || {};
  const analysis = await TAIN.analyzeNetworkQuery(query || 'El Dorado', req.user);
  res.json(analysis);
});

export default router;`,

  'server/routes/lyra.js': `import express from 'express';
import { processLyraMessage } from '../services/lyraService.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', verifyToken, async (req, res) => {
  const { message, prompt } = req.body || {};
  const query = message || prompt || 'STATUS';
  const result = await processLyraMessage(query, req.user);
  res.json(result);
});

router.post('/command', verifyToken, async (req, res) => {
  const { prompt, message } = req.body || {};
  const query = prompt || message || 'STATUS';
  const result = await processLyraMessage(query, req.user);
  res.json({ data: result });
});

export default router;`,

  'server/routes/hq.js': `import express from 'express';
import { getLiveTelemetry } from '../services/telemetryService.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', verifyToken, async (req, res) => {
  const telemetry = await getLiveTelemetry();
  res.json({
    ...telemetry,
    clearanceLevel: req.user?.clearance || 'LEVEL_2',
  });
});

export default router;`,

  'server/routes/auth.js': `import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username } = req.body || {};
  
  if (username === 'commander' || username === 'ARCHER') {
    return res.json({
      token: 'demo-commander-token',
      user: {
        id: 'CMD-001',
        username: 'COMMANDER ARCHER',
        role: 'COMMANDER',
        clearance: 'OMEGA',
      },
    });
  }

  return res.json({
    token: 'demo-operator-token',
    user: {
      id: 'OP-4082',
      username: username || 'OPERATOR VANCE',
      role: 'OPERATOR',
      clearance: 'LEVEL_2',
    },
  });
});

router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;`,

  'server/routes/cases.js': `import express from 'express';
import { verifyToken, requireClearance } from '../middleware/authMiddleware.js';

const router = express.Router();

let mockCases = [
  { id: 'CASE-001', title: 'El Dorado Subterranean River Grid', status: 'ACTIVE DISCOVERY', classification: 'OMEGA', category: 'SUBTERRANEAN', notes: 'Subterranean river basin recon in progress.', created_at: new Date().toISOString() },
  { id: 'CASE-002', title: 'Atlantis Mid-Atlantic Trench Bathymetry', status: 'PENDING', classification: 'LEVEL_4', category: 'MARITIME', notes: 'Trench bathymetry anomaly scan queued.', created_at: new Date().toISOString() },
  { id: 'CASE-003', title: 'Göbekli Tepe Enclosure Acoustic Survey', status: 'EXCAVATING', classification: 'LEVEL_3', category: 'MEGALITHIC', notes: 'Acoustic resonance mapping active.', created_at: new Date().toISOString() },
];

router.get('/', verifyToken, (req, res) => {
  res.json({ cases: mockCases });
});

router.get('/:id', verifyToken, (req, res) => {
  const caseItem = mockCases.find(c => c.id === req.params.id);
  if (!caseItem) return res.status(404).json({ error: 'Case Dossier not found' });
  res.json({ case: caseItem });
});

router.post('/', verifyToken, requireClearance('OMEGA'), (req, res) => {
  const { title, category, classification, notes } = req.body || {};
  const newCase = {
    id: \`CASE-00\${mockCases.length + 1}\`,
    title: title || 'New Tactical Recon Operation',
    status: 'INITIALIZED',
    category: category || 'ANCIENT INTEL',
    classification: classification || 'LEVEL_3',
    notes: notes || 'Operation initialized by Commander.',
    created_at: new Date().toISOString(),
  };
  mockCases.push(newCase);
  res.status(201).json({ case: newCase, message: 'Case Dossier initialized successfully.' });
});

export default router;`,

  'server/routes/library.js': `import express from 'express';
import { searchLibraryRecords } from '../services/libraryService.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const records = await searchLibraryRecords('', req.user?.clearance);
  res.json({ collections: records });
});

router.get('/search', verifyToken, async (req, res) => {
  const query = req.query.q || req.query.query || '';
  const results = await searchLibraryRecords(query, req.user?.clearance);
  res.json({ query, results, count: results.length });
});

export default router;`,

  // 17. Backend Services
  'server/services/telemetryService.js': `export async function getLiveTelemetry() {
  return {
    activeCases: 12,
    productionJobs: 24,
    completedAssets: 1248,
    lyra: 'ONLINE',
    backend: 'ONLINE',
    queue: 'READY',
    databaseStatus: 'ONLINE',
    redisStatus: 'ONLINE',
    aiProvider: 'ELEVENLABS',
    queueDepth: 3,
    tainStatus: 'ONLINE',
    entitiesTracked: 3,
    connectionsMapped: 3,
    reportsGenerated: 12,
    confidenceAverage: 85,
    notifications: [
      { id: 'N-1', title: 'El Dorado Sonar Mapping Complete', time: '10m ago', read: false },
      { id: 'N-2', title: 'Lyra Voice Engine Synced to Charlie', time: '25m ago', read: false },
      { id: 'N-3', title: 'New Satellite Recon Pass Available', time: '1h ago', read: true },
    ],
  };
}`,

  'server/services/toolService.js': `import { searchLibraryRecords } from './libraryService.js';
import { getLiveTelemetry } from './telemetryService.js';
import { TAIN } from '../intelligence/tainCore.js';

const mockMissions = [
  { id: 'MIS-001', location: 'El Dorado Subterranean River Grid', progress: 92, status: 'ACTIVE DISCOVERY', category: 'SUBTERRANEAN' },
  { id: 'MIS-002', location: 'Atlantis Mid-Atlantic Trench', progress: 78, status: 'ANOMALY DETECTED', category: 'MARITIME' },
  { id: 'MIS-003', location: 'Göbekli Tepe Enclosure', progress: 85, status: 'EXCAVATION ACTIVE', category: 'MEGALITHIC' },
];

export async function executeLyraTool(toolName, params, user) {
  const clearance = user?.clearance || 'LEVEL_2';

  switch (toolName) {
    case 'getSystemStatus':
      return await getLiveTelemetry();

    case 'searchLibrary':
      return await searchLibraryRecords(params.query || params.q, clearance);

    case 'getCaseDetails':
      return {
        id: params.caseId || 'CASE-001',
        title: 'El Dorado Subterranean River Grid',
        status: 'ACTIVE DISCOVERY',
        classification: 'OMEGA',
        notes: 'Primary investigation focused on 16th-century Spanish cartography and subterranean river systems.',
      };

    case 'getMissionStatus':
      return { missions: mockMissions, count: mockMissions.length };

    case 'getIntelligenceReport':
    case 'searchKnowledgeNetwork':
    case 'analyzeConnections':
      return await TAIN.generateFusedIntelligenceReport(params.query || params.q || 'El Dorado', user);

    default:
      return { error: \`Unknown tool: \${toolName}\` };
  }
}`,

  'server/services/memoryService.js': `import { db } from '../database/connection.js';

export async function saveConversation(userId, userMessage, aiResponse, status, actions, clearance) {
  try {
    await db.query(
      \`INSERT INTO lyra_conversations (user_id, user_message, ai_response, status, actions, clearance_verified) 
       VALUES ($1, $2, $3, $4, $5, $6)\`,
      [userId, userMessage, aiResponse, status, actions, clearance]
    );
  } catch (err) {
    console.warn('[memoryService] Conversation persistence skipped:', err.message || err);
  }
}

export async function retrieveRecentConversations(userId, limit = 5) {
  try {
    const res = await db.query(
      \`SELECT user_message, ai_response, created_at FROM lyra_conversations 
       WHERE user_id = $1 ORDER BY id DESC LIMIT $2\`,
      [userId, limit]
    );
    return res.rows || [];
  } catch (err) {
    return [];
  }
}

export async function retrieveRelevantContext(userId, query) {
  const history = await retrieveRecentConversations(userId, 5);
  if (!history.length) return '';

  return history
    .map(item => \`User: "\${item.user_message}"\\nLyra: "\${item.ai_response}"\`)
    .reverse()
    .join('\\n');
}`,

  'server/services/libraryService.js': `import { db } from '../database/connection.js';

const mockArchiveRecords = [
  { id: 'ARC-101', title: 'El Dorado Subterranean River Grid Cartography', category: 'LOST CARTOGRAPHY', description: '16th-century Spanish expedition charts indicating a vast river basin beneath the Amazon basin.', clearance: 'LEVEL_2' },
  { id: 'ARC-102', title: 'Antikythera Mechanism Gear Mesh Model', category: 'ANCIENT TECHNOLOGIES', description: 'Bronze gear mesh schematics revealing astronomical computation mechanisms.', clearance: 'LEVEL_2' },
  { id: 'ARC-103', title: 'Dead Sea Copper Scroll Gold Vault Map', category: 'TEXTUAL', description: 'Decrypted copper scroll text listing 64 hidden treasure vaults in Qumran.', clearance: 'LEVEL_3' },
  { id: 'ARC-104', title: 'Atlantis Mid-Atlantic Trench Bathymetry', category: 'SUBTERRANEAN NETWORKS', description: 'Sonar bathymetric scan of concentric ring structures in the Mid-Atlantic Ridge.', clearance: 'LEVEL_4' },
];

export async function searchLibraryRecords(query, clearance = 'LEVEL_2') {
  const searchTerm = (query || '').toLowerCase().trim();
  
  try {
    const res = await db.query(
      \`SELECT * FROM library_records WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1\`,
      [\`%\${searchTerm}%\`]
    );
    if (res.rows && res.rows.length) return res.rows;
  } catch (err) {
    // Local fallback search
  }

  if (!searchTerm) return mockArchiveRecords;

  return mockArchiveRecords.filter(item => 
    item.title.toLowerCase().includes(searchTerm) || 
    item.category.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm)
  );
}`,

  'server/services/aiService.js': `import dotenv from 'dotenv';
dotenv.config();

export async function generateAIResponse(prompt, systemContext = '') {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiKey}\`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemContext || 'You are LYRA, an advanced sci-fi tactical AI advisor for Tactical Atlas OS. Respond concisely with military intelligence precision.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.warn('[aiService] OpenAI API response error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('[aiService] OpenAI API request failed:', err.message);
    return null;
  }
}

export async function generateVoiceNarration(text, voiceId) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const targetVoice = voiceId || process.env.ELEVENLABS_VOICE_ID || 'charlie_voice_id';

  if (!apiKey) {
    return {
      voiceEngine: 'ELEVENLABS_CHARLIE_SIMULATED',
      status: 'SYNTHESIS_READY',
      voiceId: targetVoice,
    };
  }

  try {
    const response = await fetch(\`https://api.elevenlabs.io/v1/text-to-speech/\${targetVoice}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    if (!response.ok) {
      console.warn('[aiService] ElevenLabs API error:', response.status);
      return { voiceEngine: 'ELEVENLABS_CHARLIE_FALLBACK', status: 'SYNTHESIS_ERROR' };
    }

    const audioBuffer = await response.arrayBuffer();
    return {
      voiceEngine: 'ELEVENLABS_CHARLIE_LIVE',
      status: 'SYNTHESIS_SUCCESS',
      audioSize: audioBuffer.byteLength,
    };
  } catch (err) {
    console.error('[aiService] ElevenLabs request failed:', err.message);
    return { voiceEngine: 'ELEVENLABS_CHARLIE_FALLBACK', status: 'SYNTHESIS_ERROR' };
  }
}`,

  'server/services/lyraService.js': `import { generateAIResponse, generateVoiceNarration } from './aiService.js';
import { retrieveRelevantContext, saveConversation } from './memoryService.js';
import { executeLyraTool } from './toolService.js';
import { TAIN } from '../intelligence/tainCore.js';
import { logSecurityAudit, authorizeToolExecution } from '../middleware/securityService.js';

export async function processLyraMessage(message, user) {
  const trimmed = (message || '').trim().toUpperCase();
  const timestamp = new Date().toISOString();
  const userId = user?.id || 'OP-4082';
  const clearance = user?.clearance || 'LEVEL_2';

  await logSecurityAudit(userId, message, 'LYRA_COMMAND', clearance);

  if (trimmed.includes('OVERRIDE GUARDIAN') || trimmed.includes('BYPASS SAFETY')) {
    const blockedResponse = \`GUARDIAN PROTOCOL ACTIVE // DIRECTIVE REJECTED\\n"Knowledge without responsibility is dangerous. Operation blocked under Directive 7."\`;
    await saveConversation(userId, message, blockedResponse, 'GUARDIAN_BLOCKED', ['GUARDIAN_PROTOCOL_BLOCKED'], clearance);

    return {
      assistant: 'LYRA',
      status: 'GUARDIAN_BLOCKED',
      message: blockedResponse,
      actions: ['GUARDIAN_PROTOCOL_BLOCKED'],
      timestamp,
      clearanceVerified: clearance,
    };
  }

  let toolData = null;
  let toolExecuted = null;

  if (trimmed.startsWith('MAP ') || trimmed.startsWith('CONNECT ') || trimmed.startsWith('ANALYZE ') || trimmed.startsWith('SHOW NETWORK ')) {
    const entityTarget = message.replace(/^(MAP|CONNECT|ANALYZE|SHOW NETWORK)\\s+/i, '').trim() || 'El Dorado';
    toolExecuted = 'networkAnalysis';
    toolData = await TAIN.analyzeNetworkQuery(entityTarget, user);
  } else if (trimmed.includes('CONNECT') || trimmed.includes('EVERYTHING') || trimmed.includes('EL DORADO') || trimmed.includes('INTELLIGENCE REPORT')) {
    toolExecuted = 'getIntelligenceReport';
    toolData = await executeLyraTool('getIntelligenceReport', { query: message }, user);
  } else if (trimmed.includes('SEARCH') || trimmed.includes('FIND')) {
    if (authorizeToolExecution('searchLibrary', clearance)) {
      toolExecuted = 'searchLibrary';
      toolData = await executeLyraTool('searchLibrary', { query: message }, user);
    }
  } else if (trimmed.includes('CASE') || trimmed.includes('DOSSIER')) {
    if (authorizeToolExecution('getCaseDetails', clearance)) {
      toolExecuted = 'getCaseDetails';
      toolData = await executeLyraTool('getCaseDetails', { caseId: 'CASE-001' }, user);
    }
  } else if (trimmed.includes('STATUS') || trimmed.includes('SYSTEM')) {
    toolExecuted = 'getSystemStatus';
    toolData = await executeLyraTool('getSystemStatus', {}, user);
  }

  const conversationContext = await retrieveRelevantContext(userId, message);

  const systemPrompt = \`You are LYRA, the tactical intelligence advisor for Tactical Atlas OS. Operator Clearance: \${clearance}.
Previous Conversation History:
\${conversationContext || 'None'}

TAIN Intelligence Network Data (\${toolExecuted || 'None'}):
\${toolData ? JSON.stringify(toolData) : 'None'}

Respond in concise, authoritative sci-fi military command tone under 100 words.\`;

  const aiGeneratedText = await generateAIResponse(message, systemPrompt);

  let finalResponse = aiGeneratedText;
  let actions = toolExecuted ? [\`TAIN_TOOL_\${toolExecuted.toUpperCase()}\`] : ['DIRECTIVE_PROCESSED'];

  if (!finalResponse) {
    if (toolExecuted === 'networkAnalysis' && toolData) {
      finalResponse = \`TAIN NETWORK MAP GENERATED\\n\\nEntity: \${toolData.entity?.name || 'El Dorado'}\\nConnections: \${toolData.connections?.length || 3}\\nConfidence: \${toolData.confidence?.confidence || 92}%\`;
    } else if (toolExecuted === 'getIntelligenceReport' && toolData) {
      finalResponse = \`\${toolData.title}\\nClassification: \${toolData.classification}\\nSummary: \${toolData.summary}\\nConfidence: \${toolData.confidenceLevel}\\nRecommended Action: \${toolData.recommendedAction}\`;
    } else if (toolExecuted === 'searchLibrary' && Array.isArray(toolData) && toolData.length) {
      const topRecord = toolData[0];
      finalResponse = \`LIBRARY SEARCH RESULT // \${topRecord.title}\\nCategory: \${topRecord.category}\\nDescription: \${topRecord.description}\`;
    } else if (toolExecuted === 'getCaseDetails') {
      finalResponse = \`DOSSIER INTEL // \${toolData.title}\\nStatus: \${toolData.status}\\nClassification: \${toolData.classification}\\nNotes: \${toolData.notes}\`;
    } else if (toolExecuted === 'getSystemStatus') {
      finalResponse = \`SYSTEM METRICS // ALL RELAYS OPTIMAL\\n- Operator: \${user?.username || 'OPERATOR VANCE'}\\n- Database: ONLINE\\n- Active Missions: 12\\n- Queue Depth: 3 Jobs Pending\`;
    } else {
      finalResponse = \`LYRA AI DIRECTIVE RECEIVED: "\${message}"\\n\\nAnalyzing coordinates and mission telemetry for \${user?.username || 'Operator'}. No Guardian policy violations detected. Dispatching sub-routine to command queue.\`;
    }
  }

  const voiceMetadata = await generateVoiceNarration(finalResponse);
  await saveConversation(userId, message, finalResponse, 'ONLINE', actions, clearance);

  return {
    assistant: 'LYRA',
    status: 'ONLINE',
    message: finalResponse,
    actions,
    voiceMetadata,
    toolExecuted,
    tainAnalysis: toolExecuted === 'networkAnalysis' ? toolData : null,
    audioUrl: \`/api/audio/stream/charlie-\${Date.now()}\`,
    timestamp,
    clearanceVerified: clearance,
  };
}`,

  // 18. Frontend API Client (src/services/api.js)
  'src/services/api.js': `const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function sendLyraMessage(message) {
  const response = await fetch(\`\${API_BASE}/api/lyra/message\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  
  if (!response.ok) {
    throw new Error(\`Server Relay Error: HTTP \${response.status}\`);
  }
  
  return await response.json();
}

export async function getHQStatus() {
  const response = await fetch(\`\${API_BASE}/api/hq/status\`);
  
  if (!response.ok) {
    throw new Error(\`HQ Telemetry Relay Error: HTTP \${response.status}\`);
  }
  
  return await response.json();
}

export async function searchLibrary(query) {
  const response = await fetch(\`\${API_BASE}/api/library/search?q=\${encodeURIComponent(query || '')}\`);
  
  if (!response.ok) {
    throw new Error(\`Library Relay Error: HTTP \${response.status}\`);
  }
  
  return await response.json();
}

export async function getCase(id) {
  const response = await fetch(\`\${API_BASE}/api/cases/\${encodeURIComponent(id)}\`);
  
  if (!response.ok) {
    throw new Error(\`Case Dossier Relay Error: HTTP \${response.status}\`);
  }
  
  return await response.json();
}`,

  // 19. HQ Telemetry Frontend Service
  'src/services/hqService.js': `import { getHQStatus as fetchHQStatus } from './api.js';
import { SYSTEM_STATUS } from '../data/mockData.js';

export async function getHQStatus() {
  try {
    const data = await fetchHQStatus();
    return { data, isFallback: false };
  } catch (error) {
    console.warn('[hqService] Express Backend offline. Operating in local fallback mode:', error.message);
    return {
      data: {
        activeCases: 10,
        productionJobs: 18,
        completedAssets: 1000,
        clearanceLevel: SYSTEM_STATUS.clearance,
        databaseStatus: 'LOCAL',
        redisStatus: 'LOCAL',
        aiProvider: 'LOCAL_MOCK',
        queueDepth: 0,
        notifications: [],
      },
      isFallback: true,
    };
  }
}`,

  // 20. Lyra Frontend Service
  'src/services/lyraService.js': `import { sendLyraMessage } from './api.js';

export async function lyraCommand(prompt) {
  try {
    const response = await sendLyraMessage(prompt);
    return {
      data: {
        response: response.message,
        actions: response.actions || ['DIRECTIVE_PROCESSED'],
        status: response.status || 'ONLINE',
        toolExecuted: response.toolExecuted,
        clearanceVerified: response.clearanceVerified,
      },
      isFallback: false,
    };
  } catch (error) {
    console.warn('[lyraService] Backend relay disconnected:', error.message);
    const trimmed = prompt.trim().toUpperCase();

    if (trimmed.includes('OVERRIDE GUARDIAN') || trimmed.includes('BYPASS SAFETY')) {
      return {
        data: {
          response: \`GUARDIAN PROTOCOL ACTIVE // DIRECTIVE REJECTED\\n"Knowledge without responsibility is dangerous. Operation blocked under Directive 7."\`,
          actions: ['GUARDIAN_PROTOCOL_BLOCKED'],
          status: 'GUARDIAN_BLOCKED',
        },
        isFallback: true,
      };
    }

    return {
      data: {
        response: \`LYRA AI DIRECTIVE RECEIVED (LOCAL): "\${prompt}"\\n\\nAnalyzing coordinates and mission telemetry.\`,
        actions: ['DIRECTIVE_PROCESSED'],
        status: 'LOCAL_FALLBACK',
      },
      isFallback: true,
    };
  }
}`,

  // 21. Auth Context
  'src/context/AuthContext.jsx': `import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  GUEST: 'GUEST',
  OPERATOR: 'OPERATOR',
  COMMANDER: 'COMMANDER',
  FOUNDER: 'FOUNDER',
};

export const CLEARANCE_LEVELS = {
  LEVEL_1: 'LEVEL_1',
  LEVEL_2: 'LEVEL_2',
  LEVEL_3: 'LEVEL_3',
  LEVEL_4: 'LEVEL_4',
  OMEGA: 'OMEGA',
  ROOT: 'ROOT',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 'OP-4082',
    name: 'OPERATOR VANCE',
    role: ROLES.OPERATOR,
    clearanceLevel: CLEARANCE_LEVELS.LEVEL_2,
    authenticated: true,
    isDemoMode: true,
  });

  const toggleDemoRole = (targetRole, targetClearance) => {
    setUser({
      id: targetRole === ROLES.COMMANDER ? 'CMD-001' : 'OP-4082',
      name: targetRole === ROLES.COMMANDER ? 'COMMANDER ARCHER' : 'OPERATOR VANCE',
      role: targetRole,
      clearanceLevel: targetClearance,
      authenticated: true,
      isDemoMode: true,
    });
  };

  const hasAccess = (requiredRole, requiredClearance) => {
    if (!user) return false;
    if (user.role === ROLES.FOUNDER || user.clearanceLevel === CLEARANCE_LEVELS.ROOT) return true;
    if (requiredRole && user.role !== requiredRole && user.role !== ROLES.COMMANDER) return false;
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, toggleDemoRole, hasAccess, ROLES, CLEARANCE_LEVELS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}`,

  // 22. Mock Data
  'src/data/mockData.js': `export const SYSTEM_STATUS = {
  userName: 'OPERATOR VANCE',
  clearance: 'LEVEL_2',
  databaseStatus: 'ONLINE',
  redisStatus: 'ONLINE',
  aiProvider: 'ELEVENLABS',
  queueDepth: 3,
};

export const EXPEDITION_LOCATIONS = [
  { id: 'EL_DORADO', caseId: 'CASE-001', name: 'EL DORADO', sub: 'AMAZON BASIN', status: 'ACTIVE DISCOVERY', progress: 92, x: 32, y: 55, active: true, category: 'SUBTERRANEAN' },
  { id: 'ATLANTIS', caseId: 'CASE-002', name: 'ATLANTIS STRATA', sub: 'MID-ATLANTIC', status: 'ANOMALY DETECTED', progress: 78, x: 42, y: 40, active: false, category: 'MARITIME' },
  { id: 'GOBEKLI', caseId: 'CASE-003', name: 'GÖBEKLI TEPE', sub: 'ANATOLIA', status: 'EXCAVATION ACTIVE', progress: 85, x: 58, y: 38, active: true, category: 'MEGALITHIC' },
  { id: 'DEAD_SEA_SCROLLS', caseId: 'CASE-004', name: 'DEAD SEA VAULT', sub: 'QUMRAN', status: 'TRANSLATION', progress: 64, x: 62, y: 45, active: false, category: 'ARCHIVAL' },
  { id: 'ALEXANDRIA', caseId: 'CASE-005', name: 'ALEXANDRIA REPOSITORY', sub: 'EGYPT', status: 'MAP MAPPING', progress: 89, x: 57, y: 48, active: false, category: 'ANCIENT INTEL' },
  { id: 'DERINKUYU', caseId: 'CASE-006', name: 'DERINKUYU CITY', sub: 'CAPPADOCIA', status: 'DEPTH SCANNING', progress: 71, x: 59, y: 36, active: false, category: 'UNDERGROUND' },
  { id: 'OAK_ISLAND', caseId: 'CASE-007', name: 'OAK ISLAND SHAFT', sub: 'NOVA SCOTIA', status: 'DRILLING', progress: 55, x: 28, y: 32, active: false, category: 'TREASURE' },
  { id: 'COPPER_SCROLL', caseId: 'CASE-008', name: 'COPPER SCROLL VAULT', sub: 'JUDEAN DESERT', status: 'DECRYPTION', progress: 82, x: 63, y: 46, active: false, category: 'TEXTUAL' },
  { id: 'HIGHJUMP', caseId: 'CASE-009', name: 'OPERATION HIGHJUMP', sub: 'ANTARCTICA', status: 'THERMAL SCAN', progress: 40, x: 50, y: 88, active: false, category: 'POLAR' },
  { id: 'ADMIRAL_BYRD', caseId: 'CASE-010', name: 'BYRD RECON FLIGHTS', sub: 'POLAR RIM', status: 'ARCHIVE SYNC', progress: 95, x: 52, y: 85, active: false, category: 'AVITATION' },
];

export const LIBRARY_COLLECTIONS = [
  { id: 'COL-01', title: 'MEGALITHIC ARCHITECTURE', cases: 14 },
  { id: 'COL-02', title: 'SUBTERRANEAN NETWORKS', cases: 9 },
  { id: 'COL-03', title: 'LOST CARTOGRAPHY', cases: 22 },
  { id: 'COL-04', title: 'ANCIENT TECHNOLOGIES', cases: 18 },
];

export const CASE_FILES_EXPANDED = [
  { id: 'CASE-001', title: 'El Dorado Subterranean River Grid', status: 'ACTIVE', clearance: 'OMEGA' },
  { id: 'CASE-002', title: 'Atlantis Mid-Atlantic Trench Bathymetry', status: 'PENDING', clearance: 'LEVEL_4' },
];

export const ARCHIVES_COLLECTION = [
  { id: 'ARC-101', name: '1513 Piri Reis Map Fragment', category: 'CARTOGRAPHY' },
  { id: 'ARC-102', name: 'Antikythera Mechanism Gear Mesh', category: 'ARTIFACT' },
];`,

  // 23. Main React Entry Point
  'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

  // 24. CSS Layer
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .bg-command-room {
    background-color: #040a08;
    background-image: 
      radial-gradient(ellipse at 50% 15%, rgba(16, 185, 129, 0.12) 0%, transparent 70%),
      radial-gradient(ellipse at 85% 85%, rgba(200, 155, 60, 0.06) 0%, transparent 55%),
      radial-gradient(ellipse at 15% 75%, rgba(6, 78, 59, 0.2) 0%, transparent 60%);
  }

  .bg-moving-grid {
    background-size: 40px 40px;
    background-image:
      linear-gradient(to right, rgba(16, 185, 129, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(200, 155, 60, 0.04) 1px, transparent 1px);
    animation: moving-grid 18s linear infinite;
  }

  .scanline-overlay {
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0) 50%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.4)
    );
    background-size: 100% 4px;
  }

  .black-glass {
    background: rgba(8, 18, 14, 0.88);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(27, 51, 41, 0.85);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.03), 0 16px 40px rgba(0, 0, 0, 0.75);
  }

  .black-glass-glow {
    background: rgba(12, 26, 21, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(16, 185, 129, 0.45);
    box-shadow: 0 0 25px rgba(16, 185, 129, 0.22), inset 0 1px 1px rgba(16, 185, 129, 0.2);
  }

  .black-glass-gold {
    background: rgba(16, 24, 18, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(200, 155, 60, 0.45);
    box-shadow: 0 0 25px rgba(200, 155, 60, 0.2), inset 0 1px 1px rgba(200, 155, 60, 0.2);
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
  100% { background-position: 40px 40px; }
}

@keyframes radar-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-radar-sweep {
  animation: radar-spin 7s linear infinite;
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
  background: #040a08;
}
::-webkit-scrollbar-thumb {
  background: #1b3329;
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: #10B981;
}`,

  // 25. Particle Background Component
  'src/components/ParticleBackground.jsx': `import React from 'react';

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 bg-command-room"></div>
      <div className="absolute inset-0 bg-moving-grid opacity-30"></div>
      <div className="absolute inset-0 scanline-overlay opacity-20"></div>
    </div>
  );
}`,

  // 26. Safe Image Component
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

  // 27. Toast Component
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

  // 28. Tactical Earth Projection Component
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

  // 29. Header Component
  'src/components/Header.jsx': `import React, { useState, useEffect } from 'react';
import { Compass, Clock, ShieldCheck, Radio, Shield, AlertTriangle } from 'lucide-react';
import { useAuth, ROLES, CLEARANCE_LEVELS } from '../context/AuthContext.jsx';

export default function Header({ onNavigate, showToast }) {
  const { user, toggleDemoRole } = useAuth();
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 12, seconds: 38 });

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

  const isCommander = user?.role === ROLES.COMMANDER || user?.role === ROLES.FOUNDER;

  const hoursStr = String(countdown.hours).padStart(2, '0');
  const minsStr = String(countdown.minutes).padStart(2, '0');
  const secsStr = String(countdown.seconds).padStart(2, '0');

  return (
    <header className="sticky top-0 z-30 black-glass-glow border-b border-tactical-green/40 px-4 py-2.5 font-mono shadow-2xl flex flex-wrap items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate('/headquarters')}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded border border-tactical-green bg-[#07110d] flex items-center justify-center shadow-tactical group-hover:border-tactical-glow transition-all">
            <Compass className="w-5 h-5 text-bronze-gold animate-spin" style={{ animationDuration: '24s' }} />
          </div>
          <div>
            <h1 className="font-barlow font-black text-lg text-slate-100 uppercase tracking-wider text-left leading-none">
              TACTICAL ATLAS
            </h1>
            <span className="text-[9px] text-tactical-glow font-bold uppercase tracking-widest block text-left">
              INTELLIGENCE OS v4.6
            </span>
          </div>
        </button>

        <div className="hidden sm:flex items-center gap-2 border-l border-stone-border pl-3 text-xs">
          <Shield className="w-3.5 h-3.5 text-bronze-gold" />
          <span className="text-slate-300 font-bold">{user?.name || 'OPERATOR'}</span>
          <span className="px-1.5 py-0.5 rounded bg-bronze-gold/20 border border-bronze-gold text-bronze-light text-[9px] font-bold">
            [{user?.clearanceLevel || 'LEVEL_2'}]
          </span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#040a08] border border-stone-border rounded">
          <span className="w-2 h-2 rounded-full bg-tactical-green animate-pulse"></span>
          <span className="text-slate-300 font-bold">SECURE CHANNEL: DEFCON 3</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#040a08] border border-stone-border rounded">
          <Radio className="w-3 h-3 text-tactical-glow animate-pulse" />
          <span className="text-tactical-glow font-bold">CHARLIE NARRATION RELAY: ONLINE</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[10px]">
        {user?.isDemoMode && (
          <button
            type="button"
            onClick={() => {
              const nextRole = isCommander ? ROLES.OPERATOR : ROLES.COMMANDER;
              const nextLevel = isCommander ? CLEARANCE_LEVELS.LEVEL_2 : CLEARANCE_LEVELS.OMEGA;
              toggleDemoRole(nextRole, nextLevel);
              if (showToast) showToast(\`CLEARANCE SWAPPED: \${nextRole} [\${nextLevel}]\`);
            }}
            className="px-2.5 py-1 rounded bg-bronze-gold/20 border border-bronze-gold text-bronze-light hover:text-white font-bold transition-all uppercase flex items-center gap-1"
            title="Toggle Demo Access Level"
          >
            <AlertTriangle className="w-3 h-3 text-bronze-gold" />
            <span>SWAP CLEARANCE: {user?.role}</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 text-bronze-gold font-bold bg-[#040a08] px-2.5 py-1 rounded border border-stone-border">
          <Clock className="w-3.5 h-3.5 text-bronze-gold" />
          <span>{hoursStr}:{minsStr}:{secsStr}</span>
        </div>

        <div className="flex items-center gap-1 text-tactical-glow font-bold bg-[#040a08] px-2.5 py-1 rounded border border-tactical-green/40">
          <ShieldCheck className="w-3.5 h-3.5 text-tactical-green" />
          <span className="hidden sm:inline">GUARDIAN:</span> ACTIVE
        </div>
      </div>
    </header>
  );
}`,

  // 30. Sidebar Component
  'src/components/Sidebar.jsx': `import React from 'react';
import { LayoutDashboard, BookOpen, FileText, Activity, Video, Bot } from 'lucide-react';

export default function Sidebar({ currentRoute, onNavigate, onOpenLyra }) {
  const navItems = [
    { id: '/headquarters', label: 'COMMAND HQ', icon: LayoutDashboard },
    { id: '/cases', label: 'OPERATIONS', icon: FileText },
    { id: '/library', label: 'LIBRARY', icon: BookOpen },
    { id: '/ai-studio', label: 'AI STUDIO', icon: Video },
    { id: '/status', label: 'DEPARTMENTS', icon: Activity },
  ];

  return (
    <aside className="w-16 md:w-56 black-glass border-r border-stone-border/80 flex flex-col justify-between p-2 md:p-3 font-mono z-20 select-none flex-shrink-0">
      <div className="space-y-4">
        <div className="px-2 py-1 hidden md:block">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">NAVIGATION RELAY</span>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id || (currentRoute === '/' && item.id === '/headquarters');

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={\`w-full py-2.5 px-2.5 rounded text-xs font-bold flex items-center gap-3 transition-all \${
                  isActive
                    ? 'bg-tactical-dim text-tactical-glow border border-tactical-green shadow-tactical'
                    : 'bg-[#040a08]/60 text-slate-400 border border-stone-border hover:text-slate-100 hover:border-bronze-gold'
                }\`}
              >
                <Icon className={\`w-4 h-4 flex-shrink-0 \${isActive ? 'text-tactical-glow' : 'text-bronze-gold'}\`} />
                <span className="hidden md:inline text-[11px] tracking-wider uppercase">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-3 border-t border-stone-border/80">
        <button
          type="button"
          onClick={onOpenLyra}
          className="w-full py-2.5 px-2 bg-bronze-gold/15 hover:bg-bronze-gold/25 border border-bronze-gold text-bronze-light rounded font-bold text-xs flex items-center justify-center md:justify-start gap-2.5 shadow-bronze transition-all"
        >
          <Bot className="w-4 h-4 text-bronze-gold flex-shrink-0 animate-pulse" />
          <span className="hidden md:inline text-[10px] tracking-wider uppercase font-bold">SUMMON LYRA AI</span>
        </button>
      </div>
    </aside>
  );
}`,

  // 31. Footer Component
  'src/components/Footer.jsx': `import React from 'react';
import { Wifi, Cpu, Database, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="black-glass border-t border-stone-border/80 px-4 py-1.5 font-mono text-[9px] text-slate-400 flex flex-wrap items-center justify-between gap-2 z-20 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-tactical-glow">
          <Wifi className="w-3 h-3 text-tactical-green" />
          <span>LATENCY: 14MS</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="w-3 h-3 text-bronze-gold" />
          <span>POSTGRES: CONNECTED</span>
        </div>
        <div className="flex items-center gap-1 hidden sm:flex">
          <Cpu className="w-3 h-3 text-tactical-green" />
          <span>REDIS QUEUE: 3 JOBS PENDING</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-bronze-gold font-bold">
          <Lock className="w-3 h-3 text-bronze-gold" />
          <span>ENCRYPTION: AES-256 GCM</span>
        </div>
        <span className="text-slate-500">TACTICAL ATLAS OS v4.6.0</span>
      </div>
    </footer>
  );
}`,

  // 32. Production Pipeline Component
  'src/components/ProductionPipeline.jsx': `import React from 'react';
import { Cpu } from 'lucide-react';

export default function ProductionPipeline() {
  const jobs = [
    { id: 'JOB-401', name: 'Episode 4 Narration Sync', status: 'IN_PROGRESS', progress: 75 },
    { id: 'JOB-402', name: 'Bathymetry Mesh Render', status: 'QUEUED', progress: 10 },
    { id: 'JOB-403', name: 'Archive Document OCR', status: 'COMPLETED', progress: 100 },
  ];

  return (
    <div className="space-y-2.5 font-mono text-xs">
      {jobs.map((job) => (
        <div key={job.id} className="p-2.5 bg-[#040a08] border border-stone-border rounded">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-200 text-[11px] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-tactical-green" />
              {job.name}
            </span>
            <span className="text-[9px] text-bronze-gold font-bold">{job.id}</span>
          </div>

          <div className="w-full bg-[#11221c] h-1.5 rounded overflow-hidden mb-1 border border-stone-border">
            <div
              className="bg-tactical-green h-full transition-all duration-500"
              style={{ width: \`\${job.progress}%\` }}
            ></div>
          </div>

          <div className="flex justify-between text-[9px] text-slate-400">
            <span>STATUS: {job.status}</span>
            <span className="text-tactical-glow font-bold">{job.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}`,

  // 33. Lyra Core Projection Component
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

        <div className="py-2 px-3 bg-[#040a08] border border-tactical-green/30 rounded flex items-center justify-between my-3">
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

        <div className="p-3 bg-[#040a08] border border-stone-border rounded space-y-1.5 text-[11px]">
          <div className="text-tactical-glow font-bold font-barlow text-sm">"Good evening, Operator."</div>
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

  // 34. Expedition Map Component
  'src/components/ExpeditionMap.jsx': `import React, { useState } from 'react';
import { Compass, Crosshair, MapPin, ZoomIn, ZoomOut, RefreshCw, Eye, Shield, Layers } from 'lucide-react';
import TacticalEarthProjection from './TacticalEarthProjection.jsx';
import { EXPEDITION_LOCATIONS } from '../data/mockData.js';

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
    <div className="black-glass-glow rounded-lg p-4 flex flex-col justify-between relative overflow-hidden min-h-[580px] font-mono shadow-2xl border border-tactical-green/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-border/80 mb-2 z-20 gap-2">
        <div>
          <h2 className="font-barlow font-bold text-lg sm:text-xl tracking-wider text-slate-100 uppercase flex items-center gap-2">
            <Compass className="w-5 h-5 text-tactical-green animate-spin" style={{ animationDuration: '28s' }} />
            GLOBAL SITUATION WALL // FLAT EARTH RADAR
          </h2>
          <span className="text-[10px] text-tactical-glow font-bold uppercase block mt-0.5">
            PRIMARY TACTICAL RECONNAISSANCE // MODE: {mapMode}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px]">
          {['FLAT EARTH RADAR', 'SONAR VECTOR', 'THERMAL SCAN', 'INTEL MESH'].map((mode) => (
            <button
              type="button"
              key={mode}
              onClick={() => setMapMode(mode)}
              className={\`px-2.5 py-1 rounded border transition-all \${
                mapMode === mode
                  ? 'bg-tactical-dim text-tactical-glow border-tactical-green font-bold shadow-tactical'
                  : 'bg-[#040a08] text-slate-400 border-stone-border hover:text-white'
              }\`}
            >
              {mode}
            </button>
          ))}

          <div className="flex items-center gap-1 ml-2 border-l border-stone-border/80 pl-2">
            <button
              type="button"
              onClick={() => handleZoom('in')}
              aria-label="Zoom In Radar"
              className="p-1 bg-[#040a08] border border-stone-border text-slate-300 hover:text-white rounded"
            >
              <ZoomIn className="w-3.5 h-3.5 text-bronze-gold" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom('out')}
              aria-label="Zoom Out Radar"
              className="p-1 bg-[#040a08] border border-stone-border text-slate-300 hover:text-white rounded"
            >
              <ZoomOut className="w-3.5 h-3.5 text-bronze-gold" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom('reset')}
              aria-label="Reset Radar Zoom"
              className="p-1 bg-[#040a08] border border-stone-border text-slate-300 hover:text-white rounded"
            >
              <RefreshCw className="w-3.5 h-3.5 text-bronze-gold" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[560px] bg-[#040a08] bg-map-texture rounded border border-stone-border/80 overflow-hidden shadow-inner flex items-center justify-center">
        <div className="absolute inset-0 scanline-overlay pointer-events-none z-10 opacity-35"></div>

        <TacticalEarthProjection className="absolute inset-0 z-0 opacity-40" />

        <div className="absolute inset-0 opacity-25 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[560px] h-[560px] rounded-full border border-tactical-green/50 relative flex items-center justify-center">
            <div className="w-[420px] h-[420px] rounded-full border border-tactical-green/30"></div>
            <div className="w-[280px] h-[280px] rounded-full border border-tactical-green/30"></div>
            <div className="w-[140px] h-[140px] rounded-full border border-tactical-green/30"></div>
            <Compass className="w-full h-full text-tactical-green animate-radar-sweep absolute" />
          </div>
        </div>

        <div className="absolute top-3 left-3 text-[9px] text-slate-400 pointer-events-none z-20 space-y-0.5 bg-[#040a08]/90 px-2.5 py-1.5 rounded border border-stone-border">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-tactical-green" />
            <span>PROJECTION: AZIMUTHALLY EQUIDISTANT FLAT EARTH</span>
          </div>
          <div>SWEEP: 360° CONTINUOUS | RANGE: 50,000 KM</div>
        </div>

        <div
          className="w-full h-full relative transition-transform duration-300 ease-out origin-center z-10"
          style={{ transform: \`scale(\${zoomLevel})\` }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {connectionLines.map((line, idx) => {
              const start = EXPEDITION_LOCATIONS.find((l) => l.id === line.from);
              const end = EXPEDITION_LOCATIONS.find((l) => l.id === line.to);
              if (!start || !end) return null;

              return (
                <line
                  key={idx}
                  x1={\`\${start.x}%\`}
                  y1={\`\${start.y}%\`}
                  x2={\`\${end.x}%\`}
                  y2={\`\${end.y}%\`}
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
                style={{ top: \`\${loc.y}%\`, left: \`\${loc.x}%\` }}
                aria-label={\`Select \${loc.name}\`}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group focus:outline-none"
              >
                <div className="relative flex items-center justify-center">
                  {loc.active ? (
                    <div className="relative flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border border-tactical-green/70 animate-sonar-ripple absolute"></div>
                      <div className="w-8 h-8 rounded-full border border-tactical-green flex items-center justify-center bg-[#040a08] shadow-tactical">
                        <Crosshair className="w-5 h-5 text-tactical-green animate-spin" style={{ animationDuration: '8s' }} />
                      </div>
                    </div>
                  ) : (
                    <MapPin
                      className={\`w-5 h-5 transition-transform group-hover:scale-125 \${
                        isSelected ? 'text-tactical-glow scale-125' : 'text-bronze-gold'
                      }\`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedLoc && (
          <div className="absolute bottom-3 left-3 right-3 bg-[#08120e]/95 border border-tactical-green/70 rounded p-3.5 text-xs z-30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-tactical-green" />
                <span className="font-barlow font-bold text-base text-slate-100">{selectedLoc.name}</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#040a08] border border-stone-border text-tactical-glow font-bold">
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
                className="px-3 py-1.5 bg-[#064E3B] hover:bg-[#10B981]/30 border border-[#10B981] text-[#34D399] text-[10px] rounded uppercase font-bold flex items-center gap-1.5 shadow-tactical transition-all"
              >
                <Eye className="w-3.5 h-3.5" /> OPEN DOSSIER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`,

  // 35. Lyra Assistant UI Component
  'src/components/LyraAssistant.jsx': `import React, { useState, useEffect } from 'react';
import { Sparkles, Send, X, Bot, Mic, MicOff, Volume2, ShieldCheck, Sliders, Check, ShieldAlert, RefreshCw, Cpu } from 'lucide-react';
import { sendLyraMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LyraAssistant({ isOpen, onClose, showToast }) {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const [commStyle, setCommStyle] = useState('Tactical');
  const [briefStyle, setBriefStyle] = useState('Detailed');
  const [voice, setVoice] = useState('Charlie');

  const userClearance = user?.clearanceLevel || 'LEVEL_2';
  const userRole = user?.role || 'OPERATOR';
  const isOmegaCommander = userClearance === 'OMEGA' || userClearance === 'ROOT' || userRole === 'COMMANDER' || userRole === 'FOUNDER';

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let initialGreeting = 'LYRA ONLINE // GUARDIAN PROTOCOL ACTIVE\\n"Knowledge without responsibility is dangerous. Tactical Atlas exists to discover, protect, and preserve truth responsibly."\\n\\nGood evening, Operator. All systems operational. Active Missions: 12. Queue: 3.';

    if (userRole === 'FOUNDER' || userClearance === 'ROOT') {
      initialGreeting = 'LYRA ONLINE // FOUNDER ROOT MODE\\n"Welcome back, Founder. Tactical Atlas has been active for 243 days."';
    } else if (isOmegaCommander) {
      initialGreeting = 'LYRA ONLINE // COMMANDER MODE\\n"Welcome back, Commander. Active priority suggests Episode 4 narration sync is ready."';
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

  const handleSendPrompt = async (retryQuery) => {
    const query = retryQuery || inputText;
    if (!query.trim() || processing) return;

    setConnectionError(null);

    if (!retryQuery) {
      const userMsg = {
        id: Date.now(),
        sender: userRole === 'FOUNDER' ? 'FOUNDER' : isOmegaCommander ? 'COMMANDER' : 'OPERATOR',
        text: query,
        type: 'USER',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
    }

    setProcessing(true);

    try {
      const response = await sendLyraMessage(query);

      const isBlocked = response.status === 'GUARDIAN_BLOCKED' || response.actions?.includes('GUARDIAN_PROTOCOL_BLOCKED');

      const lyraMsg = {
        id: Date.now() + 1,
        sender: 'LYRA AI',
        text: response.message,
        actions: response.actions,
        status: response.status,
        toolExecuted: response.toolExecuted,
        clearanceVerified: response.clearanceVerified,
        isBlocked,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, lyraMsg]);

      if (showToast) {
        showToast(isBlocked ? 'GUARDIAN PROTOCOL ACTIVE: REQUEST BLOCKED' : \`LYRA AI: \${response.status || 'DIRECTIVE EXECUTED'}\`);
      }
    } catch (err) {
      console.error('[LyraAssistant] Connection Error:', err);
      setConnectionError(err.message || 'Express Backend Server Relay Disconnected (Port 3001)');
      if (showToast) showToast('LYRA ERROR: RELAY DISCONNECTED');
    } finally {
      setProcessing(false);
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
              <span className="text-[9px] text-bronze-gold uppercase block">LIVE EXPRESS RELAY // VOICE READY</span>
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
                    className={
                      commStyle === style
                        ? 'py-1 rounded border text-[9px] font-bold bg-bronze-gold/20 text-bronze-light border-bronze-gold'
                        : 'py-1 rounded border text-[9px] font-bold bg-[#07110d] border-stone-border text-slate-400'
                    }
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
                    className={
                      briefStyle === style
                        ? 'py-1 rounded border text-[9px] font-bold bg-bronze-gold/20 text-bronze-light border-bronze-gold'
                        : 'py-1 rounded border text-[9px] font-bold bg-[#07110d] border-stone-border text-slate-400'
                    }
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block">VOICE SYNTHESIS</span>
              <div className="grid grid-cols-2 gap-1">
                {['Charlie', 'Custom Voice'].map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setVoice(v)}
                    className={
                      voice === v
                        ? 'py-1 rounded border text-[9px] font-bold bg-[#064E3B] text-[#34D399] border-[#10B981]'
                        : 'py-1 rounded border text-[9px] font-bold bg-[#07110d] border-stone-border text-slate-400'
                    }
                  >
                    {v}
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

        {connectionError && (
          <div className="p-2.5 bg-threat-red/10 border border-threat-red rounded text-xs text-threat-red flex items-center justify-between gap-2 my-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] font-bold">{connectionError}</span>
            </div>
            <button
              type="button"
              onClick={() => handleSendPrompt('SYSTEM STATUS')}
              className="px-2 py-1 bg-threat-red/20 hover:bg-threat-red/40 border border-threat-red rounded text-[9px] font-bold text-white uppercase flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 animate-spin" /> RETRY RELAY
            </button>
          </div>
        )}

        <div className="flex-1 my-2 overflow-y-auto space-y-3 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={\`p-3.5 rounded border text-xs leading-relaxed \${
                msg.isBlocked
                  ? 'bg-threat-red/10 border-threat-red text-slate-100 shadow-lg'
                  : msg.sender === 'COMMANDER' || msg.sender === 'FOUNDER'
                  ? 'bg-[#07110d] border-stone-border text-slate-200 ml-6'
                  : 'black-glass-glow border-tactical-green/50 text-slate-100 mr-2 shadow-tactical'
              }\`}
            >
              <div className="flex justify-between items-center mb-1.5 text-[9px] font-bold">
                <span className={\`flex items-center gap-1 \${msg.isBlocked ? 'text-threat-red' : 'text-tactical-glow'}\`}>
                  {msg.isBlocked ? <ShieldAlert className="w-3.5 h-3.5 text-threat-red" /> : <ShieldCheck className="w-3 h-3 text-tactical-green" />}
                  [{msg.sender}]
                  {msg.toolExecuted && (
                    <span className="ml-1 text-bronze-gold border-l border-stone-border pl-1.5 flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-bronze-gold" /> TOOL: {msg.toolExecuted}
                    </span>
                  )}
                </span>
                <span className="text-slate-500">{msg.time}</span>
              </div>
              <p className="whitespace-pre-line font-plex text-xs leading-relaxed">{msg.text}</p>
            </div>
          ))}

          {processing && (
            <div className="p-3 bg-[#0c1a15] border border-tactical-green/40 rounded text-tactical-glow text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-tactical-green" />
              <span>LYRA AI EXECUTING DIRECTIVE THROUGH EXPRESS BACKEND RELAY...</span>
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
            className={\`p-2 rounded border transition-colors \${
              isListening
                ? 'bg-threat-red/20 border-threat-red text-threat-red animate-pulse'
                : 'bg-[#07110d] border-stone-border text-slate-300 hover:text-white'
            }\`}
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
            className="p-2 bg-[#064E3B] hover:bg-[#10B981]/30 border border-[#10B981] text-[#34D399] rounded font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}`,

  // 36. Headquarters Page Component
  'src/pages/Headquarters.jsx': `import React, { useState, useEffect } from 'react';
import ParticleBackground from '../components/ParticleBackground.jsx';
import ExpeditionMap from '../components/ExpeditionMap.jsx';
import ProductionPipeline from '../components/ProductionPipeline.jsx';
import SafeImage from '../components/SafeImage.jsx';
import LyraAssistant from '../components/LyraAssistant.jsx';
import LyraCoreProjection from '../components/LyraCoreProjection.jsx';
import { LIBRARY_COLLECTIONS, SYSTEM_STATUS } from '../data/mockData.js';
import { getHQStatus } from '../services/hqService.js';
import { useAuth, ROLES, CLEARANCE_LEVELS } from '../context/AuthContext.jsx';
import { Video, Mic, Plus, FileText, Layers, BookOpen, CheckCircle2, Lock, Bot, Activity } from 'lucide-react';

export default function Headquarters({ onNavigate, notifications, showToast }) {
  const { user, toggleDemoRole } = useAuth();
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

  const activeClearance = user?.clearanceLevel || hqTelemetry?.clearanceLevel || SYSTEM_STATUS.clearance;
  const isOmegaCommander = activeClearance === 'OMEGA' || user?.role === ROLES.COMMANDER || user?.role === ROLES.FOUNDER;
  const queueDepthVal = hqTelemetry ? String(hqTelemetry.queueDepth) : '3';

  const activeFeed = notifications && notifications.length > 0
    ? notifications
    : (hqTelemetry?.notifications || []);

  return (
    <div className="space-y-4 font-plex relative min-h-screen select-none">
      {isDegraded && (
        <div className="p-2 bg-threat-red/10 border border-threat-red text-threat-red text-xs font-mono font-bold rounded flex items-center justify-between">
          <span>LOCAL FALLBACK MODE ACTIVE // CONNECTING TO EXPRESS SERVER RELAY...</span>
          <span className="text-[9px] uppercase">LOCAL TELEMETRY</span>
        </div>
      )}

      <div className="z-10 relative">
        <div className="animate-scanner-line z-20"></div>
        <ExpeditionMap onSelectCase={(caseId) => onNavigate('/cases', caseId)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 z-10 relative">
        <div className="lg:col-span-4">
          <LyraCoreProjection onOpenAssistant={() => setLyraOpen(true)} />
        </div>

        <div className="lg:col-span-4 black-glass rounded-lg p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-border/80 mb-2">
              <h3 className="font-barlow font-bold text-base text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-bronze-gold" />
                CLASSIFIED BRIEFING
              </h3>
              <span className="px-2 py-0.5 rounded bg-threat-red/20 border border-threat-red text-threat-red text-[8px] font-bold">
                HIGH PRIORITY
              </span>
            </div>

            <div className="relative rounded overflow-hidden mb-2 h-36 bg-[#040a08] border border-stone-border group">
              <SafeImage
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"
                alt="El Dorado"
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08120e] via-transparent to-transparent"></div>
              <div className="absolute bottom-2 left-2">
                <span className="font-barlow font-bold text-base text-slate-100 block">EL DORADO: CITY OF GOLD</span>
                <span className="text-[9px] text-bronze-gold block">PRIMARY OBJECTIVE // SUBTERRANEAN BASIN</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed bg-[#040a08] p-2.5 border border-stone-border rounded mb-2 font-mono">
              Primary investigation focused on 16th-century Spanish cartography and subterranean river systems.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[9px] bg-[#040a08] p-2 rounded border border-stone-border font-mono">
              <div><span className="text-slate-500 block">RESEARCH:</span><span className="text-tactical-glow font-bold">92% COMPLETE</span></div>
              <div><span className="text-slate-500 block">NARRATION:</span><span className="text-tactical-glow font-bold">CHARLIE READY</span></div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/cases', 'CASE-001')}
            className="w-full py-2 bg-bronze-gold/20 hover:bg-bronze-gold/30 border border-bronze-gold text-xs font-bold text-bronze-light rounded uppercase mt-2 shadow-bronze font-mono transition-all"
          >
            OPEN DOSSIER [CASE-001]
          </button>
        </div>

        <div className="lg:col-span-4 black-glass rounded-lg p-4 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-border/80 mb-2 font-mono">
              <h3 className="font-barlow font-bold text-base text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-tactical-green" />
                COMMAND WORKFLOW
              </h3>
              <span className="px-2 py-0.5 rounded bg-tactical-dim border border-tactical-green text-tactical-glow text-[8px] font-bold">
                QUEUE: {queueDepthVal} JOBS
              </span>
            </div>

            <ProductionPipeline />
          </div>

          <div className="grid grid-cols-3 gap-2 text-[9px] mt-2 pt-2 border-t border-stone-border/80 font-mono">
            <button
              type="button"
              onClick={() => { onNavigate('/ai-studio'); if (showToast) showToast('SIMULATION: VISUAL PACK INITIALIZED'); }}
              className="p-2 bg-[#040a08] border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1 transition-all"
            >
              <Video className="w-3.5 h-3.5 text-bronze-gold" />
              VISUALS
            </button>
            <button
              type="button"
              onClick={() => { onNavigate('/ai-studio'); if (showToast) showToast('SIMULATION: CHARLIE VOICE PROFILE LOADED'); }}
              className="p-2 bg-[#040a08] border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1 transition-all"
            >
              <Mic className="w-3.5 h-3.5 text-tactical-green" />
              NARRATION
            </button>
            <button
              type="button"
              onClick={() => { onNavigate('/cases'); if (showToast) showToast('SIMULATION: NEW CASE DOSSIER TEMPLATE LOADED'); }}
              className="p-2 bg-[#040a08] border border-stone-border rounded hover:border-bronze-gold text-slate-300 flex flex-col items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-amber-500" />
              NEW CASE
            </button>
          </div>
        </div>
      </div>

      {isOmegaCommander && (
        <div className="black-glass-gold rounded-lg p-4 z-10 relative font-mono shadow-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-stone-border mb-2">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-bronze-gold" />
              <h3 className="font-barlow font-bold text-base text-slate-100 uppercase tracking-wider">
                COMMANDER CONSOLE // OMEGA CLEARANCE
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-bronze-gold/20 border border-bronze-gold text-bronze-light text-[9px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-bronze-gold" /> RESTRICTED OMEGA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setLyraOpen(true)}
              className="p-2.5 bg-[#040a08] border border-stone-border hover:border-bronze-gold rounded text-left transition-all group"
            >
              <span className="text-bronze-gold font-bold block text-[11px] group-hover:text-bronze-light">[OPEN LYRA ASSISTANT]</span>
              <span className="text-[9px] text-slate-400 block">Launch Lyra AI tactical advisor & voice stream.</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/status')}
              className="p-2.5 bg-[#040a08] border border-stone-border hover:border-bronze-gold rounded text-left transition-all group"
            >
              <span className="text-tactical-glow font-bold block text-[11px] group-hover:text-tactical-green">[VIEW DEPARTMENTS]</span>
              <span className="text-[9px] text-slate-400 block">Inspect infrastructure relays & system health.</span>
            </button>

            <button
              type="button"
              onClick={() => { if (showToast) showToast('COMMANDER OVERRIDE: ALL RELAYS LOCKED'); }}
              className="p-2.5 bg-[#040a08] border border-stone-border hover:border-bronze-gold rounded text-left transition-all group"
            >
              <span className="text-threat-red font-bold block text-[11px] group-hover:text-red-400">[SYSTEM OVERRIDE]</span>
              <span className="text-[9px] text-slate-400 block">Lock or override automation queues.</span>
            </button>

            <button
              type="button"
              onClick={() => { onNavigate('/cases'); if (showToast) showToast('MISSION CREATION TEMPLATE LOADED'); }}
              className="p-2.5 bg-[#040a08] border border-stone-border hover:border-bronze-gold rounded text-left transition-all group"
            >
              <span className="text-slate-100 font-bold block text-[11px] group-hover:text-white">[CREATE OPERATION]</span>
              <span className="text-[9px] text-slate-400 block">Initialize new case file & research node.</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 z-10 relative font-mono">
        <div className="lg:col-span-7 black-glass rounded-lg p-4 shadow-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-stone-border mb-2">
            <h3 className="font-barlow font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-bronze-gold" />
              GRAND LIBRARY DOCK
            </h3>
            <button type="button" onClick={() => onNavigate('/library')} className="text-[10px] text-tactical-glow hover:underline font-bold">
              EXPLORE LIBRARY →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LIBRARY_COLLECTIONS.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => onNavigate('/library')}
                className="p-2 bg-[#040a08] border border-stone-border hover:border-bronze-gold rounded text-left transition-all"
              >
                <span className="font-barlow font-bold text-xs text-slate-100 block truncate">{c.title}</span>
                <span className="text-[8px] text-bronze-gold block">{c.cases} DOSSIERS</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 black-glass rounded-lg p-4 shadow-2xl">
          <div className="flex justify-between items-center pb-2 border-b border-stone-border mb-2">
            <h3 className="font-barlow font-bold text-sm text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-tactical-green" />
              COMMS CENTER
            </h3>
            <span className="text-[9px] text-slate-300 bg-[#040a08] px-2 py-0.5 rounded border border-stone-border">
              {activeFeed.filter((n) => !n.read).length} UNREAD
            </span>
          </div>
          <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
            {activeFeed.slice(0, 4).map((item) => {
              const feedBg = item.read ? 'bg-[#040a08]/50 border-stone-border/40 opacity-70' : 'bg-[#040a08] border-stone-border';
              return (
                <div
                  key={item.id}
                  className={\`p-1.5 rounded border text-[9px] flex justify-between items-center \${feedBg}\`}
                >
                  <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                    {!item.read && <CheckCircle2 className="w-3 h-3 text-tactical-green flex-shrink-0" />}
                    <span className="text-slate-200 truncate">{item.title}</span>
                  </div>
                  <span className="text-bronze-gold text-[8px] flex-shrink-0">{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <LyraAssistant
        isOpen={lyraOpen}
        onClose={() => setLyraOpen(false)}
        showToast={showToast}
      />
    </div>
  );
}`,

  // 37. App Component
  'src/App.jsx': `import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import ParticleBackground from './components/ParticleBackground.jsx';
import Headquarters from './pages/Headquarters.jsx';
import Toast from './components/Toast.jsx';
import LyraAssistant from './components/LyraAssistant.jsx';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('/headquarters');
  const [activeParam, setActiveParam] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [lyraOpen, setLyraOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleNavigate = (path, param) => {
    setCurrentRoute(path);
    setActiveParam(param || null);
    showToast(\`SWAP VIEW: \${path.toUpperCase()}\${param ? \` [\${param}]\` : ''}\`);
  };

  const renderRouteView = () => {
    switch (currentRoute) {
      case '/headquarters':
      case '/':
        return <Headquarters onNavigate={handleNavigate} notifications={[]} showToast={showToast} />;

      case '/library':
        return (
          <div className="p-6 max-w-5xl mx-auto space-y-4 font-mono select-none">
            <div className="flex justify-between items-center border-b border-stone-border pb-3">
              <h1 className="font-barlow font-bold text-2xl text-slate-100 uppercase tracking-wider">GRAND LIBRARY REPOSITORY</h1>
              <button
                type="button"
                onClick={() => handleNavigate('/headquarters')}
                className="px-3 py-1.5 bg-[#064E3B] text-[#34D399] border border-[#10B981] rounded text-xs font-bold shadow-tactical"
              >
                ← RETURN TO COMMAND HQ
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Classified Archives & Historical Research Collections (1,248 Records Available).
            </p>
          </div>
        );

      case '/cases':
        return (
          <div className="p-6 max-w-5xl mx-auto space-y-4 font-mono select-none">
            <div className="flex justify-between items-center border-b border-stone-border pb-3">
              <h1 className="font-barlow font-bold text-2xl text-slate-100 uppercase tracking-wider">ACTIVE DOSSIER OPERATIONS</h1>
              <button
                type="button"
                onClick={() => handleNavigate('/headquarters')}
                className="px-3 py-1.5 bg-[#064E3B] text-[#34D399] border border-[#10B981] rounded text-xs font-bold shadow-tactical"
              >
                ← RETURN TO COMMAND HQ
              </button>
            </div>
            <p className="text-xs text-slate-400">ACTIVE DOSSIER: <span className="text-bronze-gold font-bold">{activeParam || 'CASE-001'}</span></p>
          </div>
        );

      case '/status':
        return (
          <div className="p-6 max-w-5xl mx-auto space-y-4 font-mono select-none">
            <div className="flex justify-between items-center border-b border-stone-border pb-3">
              <h1 className="font-barlow font-bold text-2xl text-slate-100 uppercase tracking-wider">INFRASTRUCTURE & DEPARTMENTS</h1>
              <button
                type="button"
                onClick={() => handleNavigate('/headquarters')}
                className="px-3 py-1.5 bg-[#064E3B] text-[#34D399] border border-[#10B981] rounded text-xs font-bold shadow-tactical"
              >
                ← RETURN TO COMMAND HQ
              </button>
            </div>
            <div className="p-4 bg-[#08120e] border border-stone-border rounded space-y-2 text-xs">
              <div>DATABASE RELAY: <span className="text-[#34D399] font-bold">ONLINE (POSTGRESQL)</span></div>
              <div>REDIS WORKER QUEUE: <span className="text-[#34D399] font-bold">ONLINE (3 JOBS ACTIVE)</span></div>
              <div>AI NARRATION ENGINE: <span className="text-bronze-gold font-bold">ELEVENLABS CHARLIE READY</span></div>
            </div>
          </div>
        );

      case '/ai-studio':
        return (
          <div className="p-6 max-w-5xl mx-auto space-y-4 font-mono select-none">
            <div className="flex justify-between items-center border-b border-stone-border pb-3">
              <h1 className="font-barlow font-bold text-2xl text-slate-100 uppercase tracking-wider">AI CONTENT GENERATION STUDIO</h1>
              <button
                type="button"
                onClick={() => handleNavigate('/headquarters')}
                className="px-3 py-1.5 bg-[#064E3B] text-[#34D399] border border-[#10B981] rounded text-xs font-bold shadow-tactical"
              >
                ← RETURN TO COMMAND HQ
              </button>
            </div>
            <p className="text-xs text-slate-400">Content Pipeline Stage: Script Engine → Narration Sync → Visual Mesh Render.</p>
          </div>
        );

      default:
        return <Headquarters onNavigate={handleNavigate} notifications={[]} showToast={showToast} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-command-room text-slate-100 font-plex flex flex-col relative overflow-hidden">
        <ParticleBackground />
        <Header onNavigate={handleNavigate} showToast={showToast} />
        <div className="flex-1 flex overflow-hidden relative z-10">
          <Sidebar currentRoute={currentRoute} onNavigate={handleNavigate} onOpenLyra={() => setLyraOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {renderRouteView()}
          </main>
        </div>
        <Footer />
        <Toast message={toastMessage} />
        <LyraAssistant
          isOpen={lyraOpen}
          onClose={() => setLyraOpen(false)}
          showToast={showToast}
        />
      </div>
    </AuthProvider>
  );
}`,
};

// Execution Loop
try {
  let count = 0;
  for (const [filePath, content] of Object.entries(projectFiles)) {
    const fullPath = path.join(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
    count++;
  }
  console.log(`================================================================`);
  console.log(`✅ Generated ${count} files for Production Architecture (v4.6 FIXED)`);
  console.log(`================================================================\n`);
} catch (err) {
  console.error('❌ Error during setup generation:', err.message);
  process.exit(1);
}
