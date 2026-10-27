const https = require('https');
const http = require('http');

/**
 * Vercel Serverless Function: /api/check-domain
 * Performs genuine server-side TLS and HTTPS handshake inspection
 * for the PermissionLens Website Analyzer without violating browser CORS.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'Query parameter "url" is required.' });
  }

  let parsedTarget;
  try {
    let raw = targetUrl.trim();
    if (!/^https?:\/\//i.test(raw)) {
      raw = 'https://' + raw;
    }
    parsedTarget = new URL(raw);
  } catch (e) {
    return res.status(400).json({ success: false, error: 'Invalid URL format: ' + e.message });
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
  const sendResponse = (statusCode, payload) => {
    if (hasResponded) return;
    hasResponded = true;
    res.status(statusCode).json(payload);
  };

  const startTime = Date.now();
  const probeReq = clientModule.request(requestOptions, (probeRes) => {
    const responseTimeMs = Date.now() - startTime;
    const headers = probeRes.headers || {};
    const hasHsts = Boolean(headers['strict-transport-security']);
    const hasCsp = Boolean(headers['content-security-policy']);
    const serverHeader = headers['server'] || null;

    sendResponse(200, {
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
    sendResponse(200, {
      success: false,
      url: parsedTarget.href,
      origin: parsedTarget.origin,
      hostname: parsedTarget.hostname,
      isSecure: isHttps,
      error: 'Connection timed out after 3500ms while probing target domain.'
    });
  });

  probeReq.on('error', (err) => {
    sendResponse(200, {
      success: false,
      url: parsedTarget.href,
      origin: parsedTarget.origin,
      hostname: parsedTarget.hostname,
      isSecure: isHttps,
      error: err.message || 'Network resolution failed for this target origin.'
    });
  });

  probeReq.end();
};
