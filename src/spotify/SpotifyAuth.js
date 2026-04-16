const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = 'http://127.0.0.1:5173/';
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

  console.log('[FlowBeat] Opening Spotify auth popup, redirect_uri:', REDIRECT_URI);
  const url = `https://accounts.spotify.com/authorize?${params}`;
  const popup = window.open(url, 'spotify_auth', 'width=500,height=700,left=400,top=100');

  return new Promise((resolve, reject) => {
    let settled = false;

    // Poll for popup closed — but give a 1.5s grace window after
    // window.close() is called, so the postMessage always wins the race.
    const timer = setInterval(() => {
      if (popup && popup.closed && !settled) {
        // Wait 1.5s before rejecting, in case postMessage is still in flight
        setTimeout(() => {
          if (!settled) {
            settled = true;
            clearInterval(timer);
            reject(new Error('Spotify auth popup was closed.'));
          }
        }, 1500);
        clearInterval(timer); // stop polling once we detect close
      }
    }, 500);

    const onMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data?.spotify_code && !event.data?.spotify_error) return;

      // Message received — settle immediately, cancel the closed-rejection
      settled = true;
      clearInterval(timer);
      window.removeEventListener('message', onMessage);

      if (event.data.spotify_error) {
        reject(new Error(`Spotify denied access: ${event.data.spotify_error}`));
        return;
      }

      console.log('[FlowBeat] Got auth code from popup, exchanging for token...');
      try {
        const tokens = await exchangeCodeForToken(event.data.spotify_code);
        console.log('[FlowBeat] Token exchange success!');
        resolve(tokens);
      } catch (err) {
        console.error('[FlowBeat] Token exchange failed:', err);
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
