/**
 * PermissionLens - Localhost HTTP Web Server
 * Zero dependencies. Serves the Dashboard, Popup, and Sidepanel on localhost.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const https = require('https');

// Global safety against unhandled socket resets
process.on('uncaughtException', (err) => {
  if (err && (err.code === 'ECONNRESET' || err.code === 'EPIPE')) {
    // Gracefully handle client disconnects
    return;
  }
  console.error('[Server Uncaught Exception]:', err);
});

const server = http.createServer((req, res) => {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let requestUrl;
  try {
    requestUrl = new URL(req.url, `http://localhost:${PORT}`);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  let reqPath = decodeURIComponent(requestUrl.pathname);

  // API Route: Honest HTTPS / Domain security verification
  if (reqPath === '/api/check-domain') {
    const targetUrl = requestUrl.searchParams.get('url');
    if (!targetUrl || typeof targetUrl !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Query parameter "url" is required.' }));
      return;
    }

    let parsedTarget;
    try {
      let raw = targetUrl.trim();
      if (!/^https?:\/\//i.test(raw)) {
        raw = 'https://' + raw;
      }
      parsedTarget = new URL(raw);
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid URL format: ' + e.message }));
      return;
    }

    const isHttps = parsedTarget.protocol === 'https:';
    const clientModule = isHttps ? https : http;
    const requestOptions = {
      method: 'HEAD',
      hostname: parsedTarget.hostname,
      port: parsedTarget.port || (isHttps ? 443 : 80),
      path: parsedTarget.pathname || '/',
      timeout: 3500,
      headers: {
        'User-Agent': 'PermissionLens/1.0 (Security & Privacy Inspector; Team Voltalgo)'
      }
    };

    let hasResponded = false;
    const sendProbeResponse = (statusCode, data) => {
      if (hasResponded) return;
      hasResponded = true;
      try {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (err) {
        // Ignored if socket closed
      }
    };

    const startTime = Date.now();
    const probeReq = clientModule.request(requestOptions, (probeRes) => {
      const responseTimeMs = Date.now() - startTime;
      const headers = probeRes.headers || {};
      const hasHsts = Boolean(headers['strict-transport-security']);
      const hasCsp = Boolean(headers['content-security-policy']);
      const serverHeader = headers['server'] || null;

      sendProbeResponse(200, {
        success: true,
        url: parsedTarget.href,
        origin: parsedTarget.origin,
        hostname: parsedTarget.hostname,
        protocol: parsedTarget.protocol,
        isSecure: isHttps,
        statusCode: probeRes.statusCode,
        statusMessage: probeRes.statusMessage,
        responseTimeMs: responseTimeMs,
        securityHeaders: {
          hasHsts,
          hstsValue: headers['strict-transport-security'] || null,
          hasCsp,
          serverHeader
        },
        notice: isHttps 
          ? 'TLS/HTTPS connection verified. Cross-origin restrictions prevent reading target Chrome site settings without the Chrome Extension.'
          : 'Warning: Insecure HTTP connection detected. Data in transit is unencrypted.'
      });
    });

    probeReq.on('timeout', () => {
      probeReq.destroy();
      sendProbeResponse(200, {
        success: false,
        url: parsedTarget.href,
        origin: parsedTarget.origin,
        hostname: parsedTarget.hostname,
        isSecure: isHttps,
        error: 'Connection timed out after 3500ms while probing target domain.'
      });
    });

    probeReq.on('error', (err) => {
      sendProbeResponse(200, {
        success: false,
        url: parsedTarget.href,
        origin: parsedTarget.origin,
        hostname: parsedTarget.hostname,
        isSecure: isHttps,
        error: err.message || 'Network resolution failed for this target origin.'
      });
    });

    probeReq.end();
    return;
  }

  // Routing shortcuts
  if (reqPath === '/' || reqPath === '/dashboard') {
    reqPath = '/dashboard/dashboard.html';
  } else if (reqPath === '/popup') {
    reqPath = '/popup/popup.html';
  } else if (reqPath === '/sidepanel') {
    reqPath = '/sidepanel/sidepanel.html';
  }

  let filePath = path.join(ROOT_DIR, reqPath);

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Multi-directory fallback resolution:
  // If the file is not found directly in ROOT_DIR, inspect subdirectories
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const cleanSubPath = reqPath.startsWith('/') ? reqPath.slice(1) : reqPath;
    const candidates = [
      path.join(ROOT_DIR, 'dashboard', cleanSubPath),
      path.join(ROOT_DIR, 'popup', cleanSubPath),
      path.join(ROOT_DIR, 'sidepanel', cleanSubPath),
      path.join(ROOT_DIR, 'shared', cleanSubPath),
      path.join(ROOT_DIR, 'icons', cleanSubPath)
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        filePath = candidate;
        break;
      }
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #173B63;">404 Not Found</h2>
          <p>Requested file not found: <code>${reqPath}</code></p>
          <p><a href="/" style="color: #2F6DB2; font-weight: 600;">Go to PermissionLens Dashboard</a></p>
        </div>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  const localUrl = `http://localhost:${PORT}`;
  console.log('====================================================');
  console.log('     PermissionLens Localhost Server is Active!     ');
  console.log('====================================================');
  console.log(`\n  🚀 Dashboard:   ${localUrl}`);
  console.log(`  📱 Popup View:  ${localUrl}/popup`);
  console.log(`  ⚡ Side Panel:  ${localUrl}/sidepanel\n`);
  console.log('Press Ctrl + C in the terminal to stop the server.\n');

  // Automatically open the URL in the default browser
  const openCmd = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
  spawn(openCmd, [localUrl], { shell: true, stdio: 'ignore' }).unref();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Port ${PORT} is in use, trying port ${PORT + 1}...`);
    server.listen(PORT + 1);
  } else {
    console.error('Server error:', err);
  }
});
