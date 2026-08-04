import http from 'node:http';
import departmentsHandler from '../api/departments.js';
import healthHandler from '../api/health.js';
import lyraHandler from '../api/lyra.js';

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
    if (request.method === 'OPTIONS') {
      response.status(204).end();
      return;
    }
    if (pathname === '/api/health') return healthHandler(request, response);
    if (pathname === '/api/departments') return departmentsHandler(request, response);
    if (pathname === '/api/lyra') {
      request.body = await readJsonBody(request);
      return await lyraHandler(request, response);
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
