import { describe, it, expect } from 'vitest';

describe('AudioEngine', () => {
  it('should export the audioEngine singleton', async () => {
    const { audioEngine } = await import('../audio/AudioEngine');
    expect(audioEngine).toBeDefined();
    expect(audioEngine.getFeatures).toBeInstanceOf(Function);
    expect(audioEngine.getHistory).toBeInstanceOf(Function);
  });

  it('should return default features before any audio source', async () => {
    const { audioEngine } = await import('../audio/AudioEngine');
    const features = audioEngine.getFeatures();
    expect(features).toHaveProperty('energy');
    expect(features).toHaveProperty('brightness');
    expect(features).toHaveProperty('zcr');
    expect(features).toHaveProperty('energyDelta');
    expect(features).toHaveProperty('energyTrend');
  });

  it('should return a populated history array', async () => {
    const { audioEngine } = await import('../audio/AudioEngine');
    const history = audioEngine.getHistory();
    expect(history.energy).toHaveLength(120);
  });
});

describe('AppContext', () => {
  it('should export MODES with all visualization modes', async () => {
    const { MODES } = await import('../AppContext');
    expect(MODES.PULSE_GARDEN).toBe('Pulse Garden');
    expect(MODES.NEON_RIFT).toBe('Neon Rift');
    expect(MODES.AURORA_INK).toBe('Aurora Ink');
    expect(MODES.STUDIO_SCOPE).toBe('Studio Scope');
    expect(MODES.WAVEFORM).toBe('Waveform');
    expect(MODES.SPECTROGRAM_3D).toBe('Spectrogram 3D');
    expect(MODES.SPOTIFY).toBe('Spotify');
  });

  it('should export COLOR_THEMES with all themes', async () => {
    const { COLOR_THEMES } = await import('../AppContext');
    expect(COLOR_THEMES.NEON).toBeDefined();
    expect(COLOR_THEMES.PASTEL).toBeDefined();
    expect(COLOR_THEMES.FIRE).toBeDefined();
    expect(COLOR_THEMES.MONO).toBeDefined();
  });
});
