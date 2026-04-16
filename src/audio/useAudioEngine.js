import { useState, useEffect } from 'react';
import { audioEngine } from './AudioEngine';

export function useAudioEngine() {
  const [isPlaying, setIsPlaying] = useState(audioEngine.isPlaying);
  const [micDenied, setMicDenied] = useState(false);
  const [systemAudioUnsupported, setSystemAudioUnsupported] = useState(false);
  const [systemAudioHelp, setSystemAudioHelp] = useState('');

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
      setMicDenied(true);
    }
  };

  const initSystemAudio = async () => {
    setSystemAudioUnsupported(false);
    setSystemAudioHelp('');

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setSystemAudioUnsupported(true);
      return;
    }

    try {
      await audioEngine.initSystemAudio();
    } catch (err) {
      if (err.message?.includes('NO_AUDIO')) {
        setSystemAudioHelp('Share a tab/window with audio enabled and check “Share audio”.');
      } else if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        setSystemAudioHelp('System audio capture was cancelled or blocked. Try again and allow audio sharing.');
      } else {
        setSystemAudioHelp('System audio capture failed. Chrome or Edge works best for this feature.');
      }
      throw err;
    }
  };

  const initFile = async (file) => {
    const url = URL.createObjectURL(file);
    await audioEngine.initFile(url);
  };

  const togglePlay = () => { audioEngine.togglePlay(); };

  return {
    isPlaying,
    micDenied,
    systemAudioUnsupported,
    systemAudioHelp,
    initMic,
    initFile,
    initSystemAudio,
    togglePlay,
  };
}
