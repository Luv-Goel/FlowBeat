import { useState, useEffect } from 'react';
import { audioEngine } from './AudioEngine';

export function useAudioEngine() {
  const [isPlaying, setIsPlaying] = useState(audioEngine.isPlaying);

  useEffect(() => {
    // Listen to play/pause state changes
    audioEngine.onStateChange = (state) => {
      setIsPlaying(state.isPlaying);
    };

    return () => {
      audioEngine.onStateChange = null;
    };
  }, []);

  const initMic = async () => {
    await audioEngine.initMic();
  };

  const initFile = (file) => {
    const url = URL.createObjectURL(file);
    audioEngine.initFile(url);
  };

  const togglePlay = () => {
    audioEngine.togglePlay();
  };

  return {
    isPlaying,
    initMic,
    initFile,
    togglePlay,
  };
}
