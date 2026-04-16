import React, { useEffect, useState } from 'react';
import { Play, Pause, Mic, Monitor, Settings2, Code, FileAudio, Maximize2, Minimize2, Music } from 'lucide-react';
import { useAudioEngine } from '../audio/useAudioEngine';
import { useAppContext, MODES } from '../AppContext';
import { audioEngine } from '../audio/AudioEngine';
import { loginWithSpotify } from '../spotify/SpotifyAuth';
import { useSpotifyNowPlaying } from '../spotify/useSpotifyNowPlaying';

export default function ControlPanel() {
  const {
    isPlaying,
    micDenied,
    systemAudioUnsupported,
    systemAudioHelp,
    togglePlay,
    initMic,
    initFile,
    initSystemAudio,
  } = useAudioEngine();
  const {
    activeMode, setActiveMode,
    sensitivity, setSensitivity,
    smoothing, setSmoothness,
    debugMode, setDebugMode,
    spotifyToken, setSpotifyToken,
    spotifyRefreshToken,
    setAlbumColor,
  } = useAppContext();

  const [features, setFeatures] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [spotifyConnecting, setSpotifyConnecting] = useState(false);
  const [spotifyConnectError, setSpotifyConnectError] = useState(null);

  const { track, albumColor: liveAlbumColor, error: spotifyError } = useSpotifyNowPlaying(
    spotifyToken,
    spotifyRefreshToken,
    (newToken) => setSpotifyToken(newToken),
  );

  useEffect(() => {
    if (liveAlbumColor) setAlbumColor(liveAlbumColor);
  }, [liveAlbumColor, setAlbumColor]);

  useEffect(() => {
    audioEngine.smoothing = smoothing;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) setFeatures(audioEngine.getFeatures());
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) initFile(e.target.files[0]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSmoothness = (e) => {
    const val = parseFloat(e.target.value);
    setSmoothness(val);
    audioEngine.smoothing = val;
  };

  const handleSpotifyConnect = async () => {
    if (spotifyToken) { setActiveMode(MODES.SPOTIFY); return; }
    setSpotifyConnecting(true);
    setSpotifyConnectError(null);
    try {
      const data = await loginWithSpotify();
      setSpotifyToken(data.access_token);
      if (data.refresh_token) {
        // store via context if needed
      }
      setActiveMode(MODES.SPOTIFY);
    } catch (err) {
      setSpotifyConnectError(err.message);
    } finally {
      setSpotifyConnecting(false);
    }
  };

  return (
    <div className="control-panel">
      <div className="control-header">
        <h1 className="logo">FlowBeat</h1>
        <div className="controls-group">
          <button className="btn" onClick={initMic} title="Use Microphone">
            <Mic size={18} /> Mic
          </button>
          <button className="btn" onClick={initSystemAudio} title="Capture System Audio">
            <Monitor size={18} /> System
          </button>
          <label className="btn" title="Upload Audio File">
            <FileAudio size={18} /> File
            <input type="file" accept="audio/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          <button
            className={`btn ${spotifyToken ? 'btn-active' : ''}`}
            onClick={handleSpotifyConnect}
            disabled={spotifyConnecting}
            title={spotifyToken ? 'Switch to Spotify Mode' : 'Connect Spotify'}
            style={{ color: spotifyToken ? '#1DB954' : undefined, opacity: spotifyConnecting ? 0.6 : 1 }}
          >
            <Music size={18} />
            {spotifyConnecting ? 'Connecting…' : spotifyToken ? 'Spotify ✓' : 'Connect Spotify'}
          </button>

          <button className="btn btn-primary" onClick={togglePlay} title="Play / Pause (Space)">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button className="btn" onClick={toggleFullscreen} title="Toggle Fullscreen (F)">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            className={`btn ${debugMode ? 'btn-active' : ''}`}
            onClick={() => setDebugMode(!debugMode)}
            title="Debug Inspector"
          >
            <Code size={18} />
          </button>
        </div>
      </div>

      {micDenied && (
        <div className="mic-denied-banner">
          🎙️ Mic access denied. Please use <strong>File upload</strong> instead.
        </div>
      )}
      {systemAudioUnsupported && (
        <div className="mic-denied-banner" style={{ top: micDenied ? '126px' : '80px' }}>
          ⚠️ Use <strong>Chrome or Edge</strong> for System Audio capture.
        </div>
      )}
      {!systemAudioUnsupported && systemAudioHelp && (
        <div className="mic-denied-banner" style={{ top: micDenied ? '126px' : '80px' }}>
          🔊 {systemAudioHelp}
        </div>
      )}
      {(spotifyError || spotifyConnectError) && (
        <div className="mic-denied-banner">
          🎵 {spotifyError || spotifyConnectError}
        </div>
      )}

      {activeMode === MODES.SPOTIFY && spotifyToken && (
        <div className="now-playing-strip">
          {track ? (
            <>
              {track.album?.images?.[2]?.url && (
                <img
                  src={track.album.images[2].url}
                  alt="Album art"
                  width={36}
                  height={36}
                  style={{ borderRadius: '4px', flexShrink: 0 }}
                />
              )}
              <div className="now-playing-text">
                <span className="now-playing-title">{track.name}</span>
                <span className="now-playing-artist">{track.artists?.map((a) => a.name).join(', ')}</span>
              </div>
            </>
          ) : (
            <span style={{ opacity: 0.5 }}>🎵 Nothing playing on Spotify…</span>
          )}
        </div>
      )}

      <div className="control-bottom">
        <div className="mode-selector">
          {Object.values(MODES).map((mode, i) => (
            <button
              key={mode}
              className={`btn-mode ${activeMode === mode ? 'active' : ''}`}
              onClick={() => setActiveMode(mode)}
              title={`Switch to ${mode} (${i + 1})`}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="slider-group">
          <Settings2 size={16} />
          <input type="range" min="0.1" max="3" step="0.1" value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))} />
          <span>Sensitivity</span>
        </div>
        <div className="slider-group">
          <Settings2 size={16} />
          <input type="range" min="0" max="0.95" step="0.05" value={smoothing}
            onChange={handleSmoothness} />
          <span>Smoothness</span>
        </div>
      </div>

      {debugMode && (
        <div className="inspector-panel">
          <h3>Explain This Visual</h3>
          <div className="metric">
            <span>Energy (RMS):</span>
            <div className="bar"><div className="fill" style={{ width: `${Math.min((features.energy || 0) * 500, 100)}%` }}></div></div>
          </div>
          <div className="metric">
            <span>Brightness (Spectral):</span>
            <div className="bar"><div className="fill" style={{ width: `${Math.min((features.brightness || 0) * 100, 100)}%` }}></div></div>
          </div>
          <div className="metric">
            <span>Noisiness (ZCR):</span>
            <div className="bar"><div className="fill" style={{ width: `${Math.min((features.zcr || 0) / 255 * 100, 100)}%` }}></div></div>
          </div>
          <div className="metric">
            <span>Energy Delta:</span>
            <div className="bar"><div className="fill" style={{ width: `${Math.min((features.energyDelta || 0) * 2000, 100)}%`, background: '#ff4444' }}></div></div>
          </div>
          <div className="interpretation">
            <strong>Interpretation: </strong>
            Energy is <strong>{features.energyTrend || 'steady'}</strong> &middot; {features.energy > 0.15 ? 'High intensity' : 'Mellow'}
            <br />
            {features.brightness > 0.5 ? 'Bright texture (high freq focus).' : 'Dark/Muffled texture.'}
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.5 }}>
            Shortcuts: Space = play · F = fullscreen · 1–5 = modes
          </div>
        </div>
      )}
    </div>
  );
}
