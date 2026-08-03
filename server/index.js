import http from 'node:http';

const PORT = 3001;

const server = http.createServer((req, res) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  if (req.url === '/api/health') {
    res.writeHead(200, headers);
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'tactical-atlas',
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (req.url === '/api/lyra/message' && req.method === 'POST') {
    let payload = '';

    req.on('data', (chunk) => {
      payload += chunk;
    });

    req.on('end', () => {
      try {
        const parsed = payload ? JSON.parse(payload) : {};
        const message = parsed.message || '';

        res.writeHead(200, headers);
        res.end(
          JSON.stringify({
            status: 'ok',
            assistant: 'lyra',
            reply: `LYRA ACKNOWLEDGED: ${message || 'NO MESSAGE RECEIVED'}`,
            timestamp: new Date().toISOString(),
          })
        );
      } catch {
        res.writeHead(400, headers);
        res.end(JSON.stringify({ error: 'invalid_json' }));
      }
    });
    return;
  }

  res.writeHead(404, headers);
  res.end(JSON.stringify({ error: 'not_found' }));
});

server.listen(PORT, () => {
  console.log(`Tactical Atlas backend listening on http://localhost:${PORT}`);
});
