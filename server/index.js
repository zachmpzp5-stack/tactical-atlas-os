import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import departmentsHandler from '../api/departments.js';
import healthHandler from '../api/health.js';
import lyraHandler from '../api/lyra.js';
import lyraChatHandler from '../api/lyra/chat.js';
import lyraVoiceHandler from '../api/lyra/voice.js';
import commanderAuthHandler from '../api/auth/commander.js';
import accountsHandler from '../api/accounts.js';
import commandHandler from '../api/command.js';

const DEFAULT_PORT = Number(process.env.PORT || 3001);
const MAX_BODY_BYTES = 16_384;
const DESKTOP_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://images.unsplash.com",
  "media-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
].join('; ');
const MIME_TYPES = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
});

function adaptResponse(response) {
  response.status = (statusCode) => {
    response.statusCode = statusCode;
    return response;
  };
  response.json = (payload) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(payload));
  };
  response.send = (payload) => response.end(payload);
  return response;
}

async function readJsonBody(request) {
  let payload = '';
  for await (const chunk of request) {
    payload += chunk;
    if (Buffer.byteLength(payload) > MAX_BODY_BYTES) throw new Error('payload_too_large');
  }
  return payload ? JSON.parse(payload) : {};
}

function sendStaticFile(response, file) {
  const extension = path.extname(file).toLowerCase();
  response.statusCode = 200;
  response.setHeader('Content-Type', MIME_TYPES[extension] || 'application/octet-stream');
  response.setHeader('Content-Security-Policy', DESKTOP_CONTENT_SECURITY_POLICY);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  fs.createReadStream(file).pipe(response);
}

function serveDesktopAsset(response, pathname, staticRoot) {
  if (!staticRoot) return false;
  const root = path.resolve(staticRoot);
  const requested = path.resolve(root, `.${decodeURIComponent(pathname)}`);
  if (requested !== root && !requested.startsWith(`${root}${path.sep}`)) return false;
  if (fs.existsSync(requested) && fs.statSync(requested).isFile()) {
    sendStaticFile(response, requested);
    return true;
  }
  if (path.extname(pathname)) return false;
  const index = path.join(root, 'index.html');
  if (!fs.existsSync(index)) return false;
  sendStaticFile(response, index);
  return true;
}

export function createAtlasServer({ staticRoot = null } = {}) {
  return http.createServer(async (request, rawResponse) => {
    const response = adaptResponse(rawResponse);
    const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const pathname = requestUrl.pathname;

    try {
      request.query = Object.fromEntries(requestUrl.searchParams);
      if (request.method === 'OPTIONS') {
        response.status(204).end();
        return;
      }
      if (pathname === '/api/health') return healthHandler(request, response);
      if (pathname === '/api/departments') return departmentsHandler(request, response);
      if (
        ['/api/accounts/status', '/api/accounts/start', '/api/accounts/disconnect'].includes(
          pathname
        )
      ) {
        request.query.route = pathname.split('/').at(-1);
        if (request.method === 'POST') request.body = await readJsonBody(request);
        return accountsHandler(request, response);
      }
      const accountCallback = pathname.match(
        /^\/api\/accounts\/(twitch|youtube|tiktok|discord|microsoft|x|linkedin|facebook|instagram|steam)\/callback$/
      );
      if (accountCallback) {
        request.query.route = 'callback';
        request.query.provider = accountCallback[1];
        return accountsHandler(request, response);
      }
      const commandRoutes = [
        [/^\/api\/missions$/, 'missions'],
        [/^\/api\/missions\/([^/]+)\/transition$/, 'mission-transition', 'missionId'],
        [/^\/api\/missions\/([^/]+)\/objectives$/, 'mission-objectives', 'missionId'],
        [/^\/api\/missions\/([^/]+)\/evidence$/, 'mission-evidence', 'missionId'],
        [/^\/api\/missions\/([^/]+)$/, 'mission-detail', 'missionId'],
        [/^\/api\/tain\/search$/, 'tain-search'],
        [
          /^\/api\/memory\/candidates\/([^/]+)\/decision$/,
          'memory-candidate-decision',
          'candidateId',
        ],
        [/^\/api\/memory\/candidates$/, 'memory-candidates'],
        [/^\/api\/memory\/conflicts$/, 'memory-conflicts'],
        [/^\/api\/memory\/([^/]+)$/, 'memory-action', 'memoryId'],
        [/^\/api\/proposals\/([^/]+)\/decision$/, 'proposal-decision', 'actionId'],
        [/^\/api\/proposals$/, 'proposals'],
        [/^\/api\/integrations\/sync$/, 'integration-sync'],
        [/^\/api\/integrations\/sync-history$/, 'integration-sync-history'],
        [/^\/api\/integrations\/records$/, 'integration-records'],
        [/^\/api\/audit\/integrity$/, 'audit-integrity'],
      ];
      const matchedCommand = commandRoutes
        .map(([pattern, route, parameter]) => ({
          match: pathname.match(pattern),
          route,
          parameter,
        }))
        .find((entry) => entry.match);
      if (matchedCommand) {
        request.query.route = matchedCommand.route;
        if (matchedCommand.parameter)
          request.query[matchedCommand.parameter] = matchedCommand.match[1];
        if (request.method === 'POST') request.body = await readJsonBody(request);
        return commandHandler(request, response);
      }
      if (
        pathname === '/api/lyra' ||
        pathname === '/api/lyra/chat' ||
        pathname === '/api/lyra/voice' ||
        pathname === '/api/auth/commander'
      ) {
        request.body = await readJsonBody(request);
        if (pathname === '/api/lyra/voice') return await lyraVoiceHandler(request, response);
        if (pathname === '/api/auth/commander')
          return await commanderAuthHandler(request, response);
        return await (pathname === '/api/lyra' ? lyraHandler : lyraChatHandler)(request, response);
      }
      if (request.method === 'GET' && serveDesktopAsset(response, pathname, staticRoot)) return;
      response.status(404).json({ error: 'not_found' });
    } catch (error) {
      response
        .status(error.message === 'payload_too_large' ? 413 : 400)
        .json({ error: 'invalid_request' });
    }
  });
}

export function startAtlasServer({ port = DEFAULT_PORT, staticRoot = null } = {}) {
  const server = createAtlasServer({ staticRoot });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);
      const address = server.address();
      const origin = `http://127.0.0.1:${address.port}`;
      console.log(`Tactical Atlas local API ready at ${origin}`);
      resolve({ server, origin });
    });
  });
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) startAtlasServer();
