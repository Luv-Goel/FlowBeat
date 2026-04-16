const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
// The popup lands on this URI — must be registered in Spotify dashboard
// Use http://127.0.0.1:5173/ (root, with trailing slash)
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:5173/';
const SCOPES = 'user-read-playback-state user-read-currently-playing';

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

/**
 * Opens the Spotify auth page in a small popup.
 * The popup lands back on REDIRECT_URI with ?code=...
 * index.html detects it's a popup (window.opener exists) and
 * postMessages the code back to the main window, then closes.
 * Main tab never navigates away — dev server stays connected.
 */
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

  const url = `https://accounts.spotify.com/authorize?${params}`;
  const popup = window.open(url, 'spotify_auth', 'width=500,height=700,left=400,top=100');

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(timer);
        reject(new Error('Spotify auth popup was closed by the user.'));
      }
    }, 500);

    const onMessage = async (event) => {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;
      if (!event.data?.spotify_code) return;

      clearInterval(timer);
      window.removeEventListener('message', onMessage);

      try {
        const tokens = await exchangeCodeForToken(event.data.spotify_code);
        resolve(tokens);
      } catch (err) {
        reject(err);
      }
    };

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
