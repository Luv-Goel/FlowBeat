import React, { useEffect, useState } from 'react';
import { Play, Pause, Mic, Music, Settings2, Code, FileAudio } from 'lucide-react';
import { useAudioEngine } from '../audio/useAudioEngine';
import { useAppContext, MODES } from '../AppContext';
import { audioEngine } from '../audio/AudioEngine';

export default function ControlPanel() {
  const { isPlaying, micDenied, togglePlay, initMic, initFile } = useAudioEngine();
  const { activeMode, setActiveMode, sensitivity, setSensitivity, debugMode, setDebugMode } = useAppContext();
  const [features, setFeatures] = useState({});

  useEffect(() => {
    // Polling features for the UI
    const interval = setInterval(() => {
      if (isPlaying) {
        setFeatures(audioEngine.getFeatures());
      }
    }, 100); // 100ms update for UI is smooth enough

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      initFile(e.target.files[0]);
    }
  };

  return (
    <div className="control-panel">
      {/* Top Header Controls */}
      <div className="control-header">
        <h1 className="logo">FlowBeat</h1>
        <div className="controls-group">
          <button className="btn" onClick={initMic} title="Use Microphone">
            <Mic size={18} /> Mic
          </button>
          
          <label className="btn" title="Upload Audio">
            <FileAudio size={18} /> File
            <input type="file" accept="audio/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          <button className={`btn btn-primary`} onClick={togglePlay}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />} 
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

      {/* Mode Selector & Sensitivity */}
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

      {/* AI Inspector / Debug View */}
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
          
          <div className="interpretation">
            <strong>Interpretation: </strong>
            {(features.energy > 0.15) ? 'High energy detected. Expect dramatic visual pulses and motion.' : 'Mellow track currently. Visuals are in relaxed state.'}
            <br />
            {(features.brightness > 0.5) ? 'Bright texture detected (high freq focus).' : 'Dark/Muffled texture detected.'}
          </div>
        </div>
      )}
    </div>
  );
}
