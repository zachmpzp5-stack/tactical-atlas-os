import http from 'node:http';
import departmentsHandler from '../api/departments.js';
import healthHandler from '../api/health.js';
import lyraHandler from '../api/lyra.js';
import lyraChatHandler from '../api/lyra/chat.js';
import lyraVoiceHandler from '../api/lyra/voice.js';
import commanderAuthHandler from '../api/auth/commander.js';
import accountsHandler from '../api/accounts.js';
import commandHandler from '../api/command.js';

const PORT = Number(process.env.PORT || 3001);
const MAX_BODY_BYTES = 16_384;

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

const server = http.createServer(async (request, rawResponse) => {
  const response = adaptResponse(rawResponse);
  const pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;

  try {
    request.query = Object.fromEntries(new URL(request.url, `http://${request.headers.host || 'localhost'}`).searchParams);
    if (request.method === 'OPTIONS') {
      response.status(204).end();
      return;
    }
    if (pathname === '/api/health') return healthHandler(request, response);
    if (pathname === '/api/departments') return departmentsHandler(request, response);
    if (['/api/accounts/status','/api/accounts/start','/api/accounts/disconnect'].includes(pathname)) {
      request.query.route = pathname.split('/').at(-1);
      if (request.method === 'POST') request.body = await readJsonBody(request);
      return accountsHandler(request, response);
    }
    const accountCallback = pathname.match(/^\/api\/accounts\/(twitch|youtube|tiktok|discord|microsoft|x|linkedin|facebook|instagram|steam)\/callback$/);
    if (accountCallback) {
      request.query.route = 'callback'; request.query.provider = accountCallback[1];
      return accountsHandler(request, response);
    }
    const commandRoutes = [
      [/^\/api\/missions$/, 'missions'],
      [/^\/api\/missions\/([^/]+)\/transition$/, 'mission-transition', 'missionId'],
      [/^\/api\/missions\/([^/]+)\/objectives$/, 'mission-objectives', 'missionId'],
      [/^\/api\/missions\/([^/]+)\/evidence$/, 'mission-evidence', 'missionId'],
      [/^\/api\/missions\/([^/]+)$/, 'mission-detail', 'missionId'],
      [/^\/api\/tain\/search$/, 'tain-search'],
      [/^\/api\/memory\/candidates\/([^/]+)\/decision$/, 'memory-candidate-decision', 'candidateId'],
      [/^\/api\/memory\/candidates$/, 'memory-candidates'],
      [/^\/api\/memory\/conflicts$/, 'memory-conflicts'],
      [/^\/api\/memory\/([^/]+)$/, 'memory-action', 'memoryId'],
      [/^\/api\/proposals\/([^/]+)\/decision$/, 'proposal-decision', 'actionId'],
      [/^\/api\/proposals$/, 'proposals'],
      [/^\/api\/integrations\/sync$/, 'integration-sync'],
      [/^\/api\/integrations\/sync-history$/, 'integration-sync-history'],
      [/^\/api\/integrations\/records$/, 'integration-records']
    ];
    const matchedCommand = commandRoutes.map(([pattern, route, parameter]) => ({ match: pathname.match(pattern), route, parameter })).find((entry) => entry.match);
    if (matchedCommand) {
      request.query.route = matchedCommand.route;
      if (matchedCommand.parameter) request.query[matchedCommand.parameter] = matchedCommand.match[1];
      if (request.method === 'POST') request.body = await readJsonBody(request);
      return commandHandler(request, response);
    }
    if (pathname === '/api/lyra' || pathname === '/api/lyra/chat' || pathname === '/api/lyra/voice' || pathname === '/api/auth/commander') {
      request.body = await readJsonBody(request);
      if (pathname === '/api/lyra/voice') return await lyraVoiceHandler(request, response);
      if (pathname === '/api/auth/commander') return await commanderAuthHandler(request, response);
      return await (pathname === '/api/lyra' ? lyraHandler : lyraChatHandler)(request, response);
    }
    response.status(404).json({ error: 'not_found' });
  } catch (error) {
    response
      .status(error.message === 'payload_too_large' ? 413 : 400)
      .json({ error: 'invalid_request' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Tactical Atlas local API ready at http://127.0.0.1:${PORT}`);
});
