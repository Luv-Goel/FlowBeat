import { useState, useEffect } from 'react';
import { audioEngine } from './AudioEngine';

export function useAudioEngine() {
  const [isPlaying, setIsPlaying] = useState(audioEngine.isPlaying);
  const [micDenied, setMicDenied] = useState(false);  // NEW

  useEffect(() => {
    audioEngine.onStateChange = (state) => {
      setIsPlaying(state.isPlaying);
    };
    return () => { audioEngine.onStateChange = null; };
  }, []);

  const initMic = async () => {
    setMicDenied(false);
    try {
      await audioEngine.initMic();
    } catch (err) {
      setMicDenied(true);  // surface to UI
    }
  };

  const initFile = async (file) => {
    const url = URL.createObjectURL(file);
    await audioEngine.initFile(url);
  };

  const togglePlay = () => { audioEngine.togglePlay(); };

  return { isPlaying, micDenied, initMic, initFile, togglePlay };
}
