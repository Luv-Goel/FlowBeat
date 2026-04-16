import React, { useEffect, useState, useRef } from 'react';
import {
  Play, Pause, Mic, Monitor, Settings2, Code,
  FileAudio, Maximize2, Minimize2, Music, Circle, Square
} from 'lucide-react';
import { useAudioEngine } from '../audio/useAudioEngine';
import { useAppContext, MODES, COLOR_THEMES } from '../AppContext';
import { audioEngine } from '../audio/AudioEngine';
import { loginWithSpotify } from '../spotify/SpotifyAuth';
import { useSpotifyNowPlaying } from '../spotify/useSpotifyNowPlaying';
import { useRecorder } from '../capture/useRecorder';

export default function ControlPanel({ canvasRef }) {
  const {
    isPlaying, micDenied, systemAudioUnsupported, systemAudioHelp,
    togglePlay, initMic, initFile, initSystemAudio,
  } = useAudioEngine();

  const {
    activeMode, setActiveMode,
    sensitivity, setSensitivity,
    smoothing, setSmoothness,
    debugMode, setDebugMode,
    colorTheme, setColorTheme,
    spotifyToken, setSpotifyToken,
    spotifyRefreshToken, setSpotifyRefreshToken,
    setAlbumColor,
  } = useAppContext();

  const [features, setFeatures] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [spotifyConnecting, setSpotifyConnecting] = useState(false);
  const [toast, setToast] = useState(null);
  const [fileMode, setFileMode] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0, percent: 0 });

  const { startRecording, stopRecording, isRecording } = useRecorder();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const { track, albumColor: liveAlbumColor, error: spotifyError } = useSpotifyNowPlaying(
    spotifyToken, spotifyRefreshToken,
    (newToken) => setSpotifyToken(newToken),
  );

  useEffect(() => { if (liveAlbumColor) setAlbumColor(liveAlbumColor); }, [liveAlbumColor, setAlbumColor]);
  useEffect(() => { audioEngine.smoothing = smoothing; }, []); // eslint-disable-line

  // Feature polling
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) setFeatures(audioEngine.getFeatures());
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Progress bar polling (file mode only)
  useEffect(() => {
    if (!fileMode) return;
    const interval = setInterval(() => {
      setProgress(audioEngine.getProgress());
    }, 250);
    return () => clearInterval(interval);
  }, [fileMode]);

  // Fullscreen sync
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      initFile(e.target.files[0]);
      setFileMode(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSmoothness = (e) => {
    const val = parseFloat(e.target.value);
    setSmoothness(val);
    audioEngine.smoothing = val;
  };

  const handleSeek = (e) => {
    audioEngine.seek(parseFloat(e.target.value));
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
      showToast('⬇️ Recording saved as .webm');
    } else {
      startRecording(canvasRef?.current);
      showToast('🔴 Recording started…', 'info');
    }
  };

  const handleSpotifyConnect = async () => {
    if (spotifyToken) { setActiveMode(MODES.SPOTIFY); return; }
    setSpotifyConnecting(true);
    try {
      const data = await loginWithSpotify();
      setSpotifyToken(data.access_token);
      if (data.refresh_token) setSpotifyRefreshToken(data.refresh_token);
      setActiveMode(MODES.SPOTIFY);
      showToast('🎵 Spotify connected! Switched to Spotify mode.');
    } catch (err) {
      console.error('[FlowBeat] Spotify connect error:', err);
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      setSpotifyConnecting(false);
    }
  };

  const themeColors = {
    NEON:   '#818cf8',
    PASTEL: '#f9a8d4',
    FIRE:   '#f97316',
    MONO:   '#9ca3af',
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="control-panel">

      {toast && (
        <div className="toast" style={{
          background: toast.type === 'error' ? 'rgba(220,38,38,0.9)'
            : toast.type === 'info' ? 'rgba(59,130,246,0.9)'
            : 'rgba(29,185,84,0.9)',
        }}>
          {toast.msg}
        </div>
      )}

      <div className="control-header">
        <h1 className="logo">FlowBeat</h1>
        <div className="controls-group">

          <button className="btn" onClick={initMic} title="Microphone">
            <Mic size={18} /> Mic
          </button>
          <button className="btn" onClick={initSystemAudio} title="System Audio">
            <Monitor size={18} /> System
          </button>
          <label className="btn" title="Upload File">
            <FileAudio size={18} /> File
            <input type="file" accept="audio/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          <button
            className={`btn ${spotifyToken ? 'btn-active' : ''}`}
            onClick={handleSpotifyConnect}
            disabled={spotifyConnecting}
            title={spotifyToken ? 'Switch to Spotify Mode' : 'Connect Spotify'}
            style={{
              color: spotifyToken ? '#1DB954' : undefined,
              opacity: spotifyConnecting ? 0.6 : 1,
              borderColor: spotifyToken ? 'rgba(29,185,84,0.5)' : undefined,
            }}
          >
            <Music size={18} />
            {spotifyConnecting ? 'Connecting…' : spotifyToken ? 'Spotify ✓' : 'Connect Spotify'}
          </button>

          <button className="btn btn-primary" onClick={togglePlay} title="Play/Pause (Space)">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Record button */}
          <button
            className={`btn ${isRecording ? 'btn-recording' : ''}`}
            onClick={handleRecord}
            title={isRecording ? 'Stop Recording' : 'Record Clip'}
          >
            {isRecording ? <Square size={16} fill="#fff" /> : <Circle size={16} />}
            {isRecording ? 'Stop' : 'Rec'}
          </button>

          <button className="btn" onClick={toggleFullscreen} title="Fullscreen (F)">
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

      {/* Banners */}
      {micDenied && (
        <div className="mic-denied-banner">🎙️ Mic access denied. Use <strong>File</strong> instead.</div>
      )}
      {systemAudioUnsupported && (
        <div className="mic-denied-banner" style={{ top: micDenied ? '126px' : '80px' }}>
          ⚠️ Use <strong>Chrome or Edge</strong> for System Audio.
        </div>
      )}
      {spotifyError && (
        <div className="mic-denied-banner">🎵 {spotifyError}</div>
      )}

      {/* Now Playing strip */}
      {activeMode === MODES.SPOTIFY && spotifyToken && (
        <div className="now-playing-strip">
          {track ? (
            <>
              {track.album?.images?.[2]?.url && (
                <img src={track.album.images[2].url} alt="Album art"
                  width={36} height={36} style={{ borderRadius: '4px', flexShrink: 0 }} />
              )}
              <div className="now-playing-text">
                <span className="now-playing-title">{track.name}</span>
                <span className="now-playing-artist">{track.artists?.map((a) => a.name).join(', ')}</span>
              </div>
            </>
          ) : (
            <span style={{ opacity: 0.6 }}>🎵 Nothing playing on Spotify right now…</span>
          )}
        </div>
      )}

      <div className="control-bottom">
        <div className="mode-selector">
          {Object.values(MODES).map((mode, i) => (
            <button key={mode}
              className={`btn-mode ${activeMode === mode ? 'active' : ''}`}
              onClick={() => setActiveMode(mode)}
              title={`${mode} (${i + 1})`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Color theme swatches */}
        <div className="theme-swatches">
          {Object.entries(COLOR_THEMES).map(([key, theme]) => (
            <button
              key={key}
              className={`swatch ${colorTheme.name === theme.name ? 'swatch-active' : ''}`}
              style={{ background: themeColors[key] }}
              onClick={() => setColorTheme(theme)}
              title={theme.name}
            />
          ))}
        </div>

        <div className="slider-group">
          <Settings2 size={16} />
          <input type="range" min="0.1" max="3" step="0.1" value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))} />
          <span>Sens</span>
        </div>
        <div className="slider-group">
          <Settings2 size={16} />
          <input type="range" min="0" max="0.95" step="0.05" value={smoothing}
            onChange={handleSmoothness} />
          <span>Smooth</span>
        </div>
      </div>

      {/* File seek bar */}
      {fileMode && (
        <div className="seek-bar-row">
          <span className="seek-time">{formatTime(progress.current)}</span>
          <input
            type="range" min="0" max="100" step="0.1"
            value={progress.percent}
            onChange={handleSeek}
            className="seek-slider"
          />
          <span className="seek-time">{formatTime(progress.duration)}</span>
        </div>
      )}

      {debugMode && (
        <div className="inspector-panel">
          <h3>Explain This Visual</h3>
          <div className="metric">
            <span>Energy (RMS):</span>
            <div className="bar"><div className="fill" style={{ width: `${Math.min((features.energy || 0) * 500, 100)}%` }} /></div>
          </div>
          <div className="metric">
            <span>Brightness:</span>
            <div className="bar"><div className="fill" style={{ width: `${Math.min((features.brightness || 0) * 100, 100)}%` }} /></div>
          </div>
          <div className="metric">
            <span>Noisiness:</span>
            <div className="bar"><div className="fill" style={{ width: `${Math.min((features.zcr || 0) / 255 * 100, 100)}%` }} /></div>
          </div>
          <div className="metric">
            <span>Energy Delta:</span>
            <div className="bar"><div className="fill" style={{ width: `${Math.min((features.energyDelta || 0) * 2000, 100)}%`, background: '#ff4444' }} /></div>
          </div>
          <div className="interpretation">
            <strong>Interpretation: </strong>
            Energy is <strong>{features.energyTrend || 'steady'}</strong> · {features.energy > 0.15 ? 'High intensity' : 'Mellow'}
            <br />{features.brightness > 0.5 ? 'Bright texture (high freq).' : 'Dark/muffled texture.'}
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.5 }}>
            Space = play · F = fullscreen · 1–5 = modes
          </div>
        </div>
      )}
    </div>
  );
}
