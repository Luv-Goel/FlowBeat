const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = 'http://127.0.0.1:5173/';
const SCOPES = 'user-read-playback-state user-read-currently-playing';

// Accept messages from both 127.0.0.1 and localhost — Vite may serve on either,
// and the popup always uses 127.0.0.1 (the redirect_uri), causing an origin mismatch.
const ALLOWED_ORIGINS = new Set([
  'http://127.0.0.1:5173',
  'http://localhost:5173',
]);

async function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function loginWithSpotify() {
  const verifier = await generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  sessionStorage.setItem('spotify_verifier', verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  console.log('[FlowBeat] Opening Spotify popup, redirect_uri:', REDIRECT_URI);
  window.open(
    `https://accounts.spotify.com/authorize?${params}`,
    'spotify_auth',
    'width=500,height=700,left=400,top=100'
  );

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      window.removeEventListener('message', onMessage);
      clearInterval(pollTimer);
      reject(new Error('Spotify auth timed out. Please try again.'));
    }, 120_000);

    // Fallback: poll sessionStorage in case postMessage still fails
    const pollTimer = setInterval(async () => {
      const fallbackCode = sessionStorage.getItem('spotify_callback_code');
      if (fallbackCode) {
        sessionStorage.removeItem('spotify_callback_code');
        clearInterval(pollTimer);
        clearTimeout(timeout);
        window.removeEventListener('message', onMessage);
        console.log('[FlowBeat] Got code via sessionStorage fallback, exchanging...');
        try {
          const tokens = await exchangeCodeForToken(fallbackCode);
          console.log('[FlowBeat] Token exchange success (fallback) ✓');
          resolve(tokens);
        } catch (err) {
          reject(err);
        }
      }
    }, 500);

    async function onMessage(event) {
      // Allow both 127.0.0.1:5173 and localhost:5173
      if (!ALLOWED_ORIGINS.has(event.origin)) {
        console.log('[FlowBeat] Ignored message from origin:', event.origin);
        return;
      }
      if (!event.data?.spotify_code && !event.data?.spotify_error) return;

      clearTimeout(timeout);
      clearInterval(pollTimer);
      window.removeEventListener('message', onMessage);

      if (event.data.spotify_error) {
        reject(new Error(`Spotify denied: ${event.data.spotify_error}`));
        return;
      }

      console.log('[FlowBeat] Got code via postMessage, exchanging...');
      try {
        const tokens = await exchangeCodeForToken(event.data.spotify_code);
        console.log('[FlowBeat] Token exchange success ✓');
        resolve(tokens);
      } catch (err) {
        reject(err);
      }
    }

    window.addEventListener('message', onMessage);
  });
}

export async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem('spotify_verifier');
  if (!verifier) throw new Error('No PKCE verifier found in session.');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error_description || 'Token exchange failed');
  }

  return res.json();
}

export async function refreshAccessToken(refreshToken) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error('Token refresh failed');
  return res.json();
}
