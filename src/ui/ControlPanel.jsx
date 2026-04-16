import React, { useEffect, useState } from 'react';
import { Play, Pause, Mic, Monitor, Settings2, Code, FileAudio, Maximize2, Minimize2 } from 'lucide-react';
import { useAudioEngine } from '../audio/useAudioEngine';
import { useAppContext, MODES } from '../AppContext';
import { audioEngine } from '../audio/AudioEngine';

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
  const { activeMode, setActiveMode, sensitivity, setSensitivity, debugMode, setDebugMode } = useAppContext();
  const [features, setFeatures] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setFeatures(audioEngine.getFeatures());
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      initFile(e.target.files[0]);
    }
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

  return (
    <div className="control-panel">
      <div className="control-header">
        <h1 className="logo">FlowBeat</h1>
        <div className="controls-group">
          <button className="btn" onClick={initMic} title="Use Microphone">
            <Mic size={18} /> Mic
          </button>

          <button className="btn" onClick={initSystemAudio} title="Capture System Audio (PC Output)">
            <Monitor size={18} /> System
          </button>
          
          <label className="btn" title="Upload Audio">
            <FileAudio size={18} /> File
            <input type="file" accept="audio/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          <button className={`btn btn-primary`} onClick={togglePlay}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button className="btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          
          <button className={`btn ${debugMode ? 'btn-active' : ''}`} onClick={() => setDebugMode(!debugMode)} title="Debug / Explain Visual">
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

      <div className="control-bottom">
        <div className="mode-selector">
          {Object.values(MODES).map((mode) => (
            <button 
              key={mode} 
              className={`btn-mode ${activeMode === mode ? 'active' : ''}`}
              onClick={() => setActiveMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
        
        <div className="slider-group">
          <Settings2 size={16} />
          <input 
            type="range" 
            min="0.1" 
            max="3" 
            step="0.1" 
            value={sensitivity} 
            onChange={(e) => setSensitivity(parseFloat(e.target.value))} 
          />
          <span>Sensitivity</span>
        </div>
      </div>

      {debugMode && (
        <div className="inspector-panel">
          <h3>Explain This Visual</h3>
          <div className="metric">
            <span>Energy (RMS):</span>
            <div className="bar"><div className="fill" style={{width: `${Math.min((features.energy || 0) * 100 * 5, 100)}%`}}></div></div>
          </div>
          <div className="metric">
            <span>Brightness (Spectral):</span>
            <div className="bar"><div className="fill" style={{width: `${Math.min((features.brightness || 0) * 100, 100)}%`}}></div></div>
          </div>
          <div className="metric">
            <span>Noisiness (ZCR):</span>
            <div className="bar"><div className="fill" style={{width: `${Math.min((features.zcr || 0) / 255 * 100, 100)}%`}}></div></div>
          </div>
          <div className="metric">
            <span>Energy Delta:</span>
            <div className="bar"><div className="fill" style={{width: `${Math.min((features.energyDelta || 0) * 100 * 20, 100)}%`, background: '#ff4444'}}></div></div>
          </div>
          
          <div className="interpretation">
            <strong>Interpretation: </strong>
            Energy is <strong>{features.energyTrend || 'steady'}</strong> &middot; {features.energy > 0.15 ? 'High intensity' : 'Mellow'}
            <br />
            {(features.brightness > 0.5) ? 'Bright texture detected (high freq focus).' : 'Dark/Muffled texture detected.'}
          </div>
        </div>
      )}
    </div>
  );
}
