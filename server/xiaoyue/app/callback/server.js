'use strict';

const http = require('node:http');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const TOKEN = process.env.WECOM_CALLBACK_TOKEN;
const AES_KEY_TEXT = process.env.WECOM_CALLBACK_AES_KEY;
const CORP_ID = process.env.WECOM_CORP_ID;

if (!TOKEN || !AES_KEY_TEXT || !CORP_ID) {
  throw new Error('Missing required WeCom callback environment variables');
}

const AES_KEY = Buffer.from(AES_KEY_TEXT + '=', 'base64');
if (AES_KEY.length !== 32) throw new Error('Invalid EncodingAESKey');

function signature(timestamp, nonce, encrypted) {
  return crypto.createHash('sha1')
    .update([TOKEN, timestamp, nonce, encrypted].sort().join(''))
    .digest('hex');
}

function validSignature(received, timestamp, nonce, encrypted) {
  const expected = Buffer.from(signature(timestamp, nonce, encrypted));
  const actual = Buffer.from(received || '');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', AES_KEY, AES_KEY.subarray(0, 16));
  decipher.setAutoPadding(false);
  let plain = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final()
  ]);
  const padding = plain[plain.length - 1];
  if (padding < 1 || padding > 32) throw new Error('Invalid padding');
  plain = plain.subarray(0, plain.length - padding);
  const messageLength = plain.readUInt32BE(16);
  const message = plain.subarray(20, 20 + messageLength).toString('utf8');
  const receiverId = plain.subarray(20 + messageLength).toString('utf8');
  if (receiverId !== CORP_ID) throw new Error('CorpID mismatch');
  return message;
}

function xmlValue(xml, tag) {
  const expression = new RegExp(
    `<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([\\s\\S]*?)<\\/${tag}>`
  );
  const match = xml.match(expression);
  return match ? (match[1] ?? match[2]) : '';
}

function send(res, status, body) {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'x-content-type-options': 'nosniff'
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') return send(res, 200, 'ok');
  if (url.pathname !== '/wecom/archive/events') return send(res, 404, 'not found');

  const timestamp = url.searchParams.get('timestamp') || '';
  const nonce = url.searchParams.get('nonce') || '';
  const receivedSignature = url.searchParams.get('msg_signature') || '';

  if (req.method === 'GET') {
    try {
      const echo = url.searchParams.get('echostr') || '';
      if (!validSignature(receivedSignature, timestamp, nonce, echo)) {
        return send(res, 403, 'invalid signature');
      }
      return send(res, 200, decrypt(echo));
    } catch {
      return send(res, 403, 'verification failed');
    }
  }

  if (req.method === 'POST') {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        const encrypted = xmlValue(body, 'Encrypt');
        if (!encrypted || !validSignature(receivedSignature, timestamp, nonce, encrypted)) {
          return send(res, 403, 'invalid signature');
        }
        const eventXml = decrypt(encrypted);
        const eventType = xmlValue(eventXml, 'Event');
        if (eventType === 'msgaudit_notify') {
          console.log(JSON.stringify({event: eventType, receivedAt: new Date().toISOString()}));
        }
        return send(res, 200, 'success');
      } catch {
        return send(res, 400, 'invalid event');
      }
    });
    return;
  }

  return send(res, 405, 'method not allowed');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`WeCom callback listening on port ${PORT}`);
});
