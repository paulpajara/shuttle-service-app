/**
 * notifications.service.js
 *
 * Simple helper to send push notifications via the Expo Push API.
 * This does NOT require server keys. Clients (mobile apps) must register
 * their Expo push tokens with the server using /api/notifications/register.
 *
 * NOTE: For production, consider batching, retry logic, and storing tokens.
 */

const fetch = require('node-fetch');

/**
 * sendExpoPush
 * @param {string|string[]} tokens - Expo push token or array of tokens
 * @param {object} message - { title, body, data }
 */
async function sendExpoPush(tokens, message = {}) {
  if (!tokens) return;
  const tokenList = Array.isArray(tokens) ? tokens : [tokens];

  const valid = tokenList.filter(t => typeof t === 'string' && t.startsWith('ExponentPushToken['));
  if (!valid.length) return;

  const body = valid.map(token => ({
    to: token,
    sound: 'default',
    title: message.title || '',
    body: message.body || '',
    data: message.data || {}
  }));

  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const json = await res.json();
    // For debugging, return the response body
    return json;
  } catch (err) {
    console.error('Expo push send error', err);
    throw err;
  }
}

module.exports = { sendExpoPush };
