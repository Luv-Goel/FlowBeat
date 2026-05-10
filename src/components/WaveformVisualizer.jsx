import React, { useRef, useEffect } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { useAppContext } from '../AppContext';

/**
 * WaveformVisualizer — real-time audio waveform rendered on a 2D Canvas.
 * Shows the raw time-domain signal as a smooth, scrolling waveform line
 * with glow effects and frequency-band coloring.
 */
export default function WaveformVisualizer() {
  const canvasRef = useRef();
  const rafRef    = useRef();
  const { sensitivity, colorTheme } = useAppContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width  = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    // Rolling waveform buffer — keeps N frames of time-domain samples
    const WAVE_WIDTH = 240;    // horizontal resolution
    const SAMPLE_RATE = 512;   // samples per frame
    let waveBuffer = new Float32Array(WAVE_WIDTH * SAMPLE_RATE);
    let writeIdx = 0;

    const draw = () => {
      const W  = canvas.width / (window.devicePixelRatio || 1);
      const H  = canvas.height / (window.devicePixelRatio || 1);
      const dpr = window.devicePixelRatio || 1;

      const features = audioEngine.getFeatures();

      // Derive accent color from colorTheme
      const accentHue = Math.round((((0.75 + colorTheme.hueShift) % 1) + 1) % 1 * 360);
      const accentSat = Math.round(colorTheme.satMult * 100);

      // --- Grab raw time-domain data from the analyser ---
      const analyser = audioEngine.analyser;
      if (analyser) {
        const bufLen = analyser.frequencyBinCount;
        const timeData = new Uint8Array(bufLen);
        analyser.getByteTimeDomainData(timeData);

        // Write into rolling buffer
        for (let i = 0; i < bufLen; i++) {
          waveBuffer[writeIdx * SAMPLE_RATE + (i % SAMPLE_RATE)] = (timeData[i] - 128) / 128;
        }
        writeIdx = (writeIdx + 1) % WAVE_WIDTH;
      }

      // --- Fade background (trail effect) ---
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, W, H);

      // --- Draw the waveform ---
      const centerY   = H / 2;
      const amplitude = Math.min(H * 0.35, 200) * sensitivity;
      const stepX     = W / WAVE_WIDTH;

      // Multiple passes for glow: wider, blurrier lines underneath
      const glowLayers = [
        { width: 6, alpha: 0.08, blur: 20 },
        { width: 3, alpha: 0.15, blur: 12 },
        { width: 1.5, alpha: 1.0, blur: 0 },
      ];

      for (let layer = 0; layer < glowLayers.length; layer++) {
        const { width, alpha, blur } = glowLayers[layer];
        ctx.beginPath();
        ctx.lineWidth   = width;
        ctx.strokeStyle = `hsla(${accentHue + (layer * 15)}, ${accentSat}%, ${55 + layer * 10}%, ${alpha})`;
        ctx.shadowColor = `hsl(${accentHue}, ${accentSat}%, 60%)`;
        ctx.shadowBlur  = blur;

        let first = true;
        for (let x = 0; x < WAVE_WIDTH; x++) {
          // Read from buffer in chronological order
          const bufIdx = (writeIdx + x) % WAVE_WIDTH;
          let sum = 0;
          for (let s = 0; s < SAMPLE_RATE; s++) {
            sum += Math.abs(waveBuffer[bufIdx * SAMPLE_RATE + s]);
          }
          const avgEnergy = sum / SAMPLE_RATE;

          // Also pick a single sample for the "wiggle"
          const sample = waveBuffer[bufIdx * SAMPLE_RATE];
          const y = centerY + sample * amplitude * (0.5 + avgEnergy * 0.5);

          const px = x * stepX;
          if (first) {
            ctx.moveTo(px, y);
            first = false;
          } else {
            ctx.lineTo(px, y);
          }
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // --- Energy envelope (fill below waveform) ---
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      for (let x = 0; x < WAVE_WIDTH; x++) {
        const bufIdx = (writeIdx + x) % WAVE_WIDTH;
        const sample = waveBuffer[bufIdx * SAMPLE_RATE];
        const y = centerY + sample * amplitude * 0.8;
        ctx.lineTo(x * stepX, y);
      }
      ctx.lineTo(W, centerY);
      ctx.closePath();
      ctx.fillStyle = `hsla(${accentHue + 30}, ${accentSat}%, 50%, 0.06)`;
      ctx.fill();

      // --- Frequency band indicators (subtle bars at bottom) ---
      if (analyser) {
        const freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);

        const bandCount = 32;
        const bandW     = W / bandCount;
        const barMaxH   = 40;

        for (let i = 0; i < bandCount; i++) {
          const startBin = Math.floor((i / bandCount) * freqData.length);
          const endBin   = Math.floor(((i + 1) / bandCount) * freqData.length);
          let bandSum = 0;
          for (let b = startBin; b < endBin; b++) bandSum += freqData[b];
          const avg = bandSum / (endBin - startBin) / 255;

          const barH = avg * barMaxH * sensitivity;
          ctx.fillStyle = `hsla(${accentHue + i * 5}, ${accentSat}%, ${40 + avg * 40}%, ${0.15 + avg * 0.35})`;
          ctx.fillRect(i * bandW, H - barH, bandW - 1, barH);
        }
      }

      // --- HUD label ---
      ctx.font      = '700 13px "Inter", sans-serif';
      ctx.fillStyle = `hsla(${accentHue}, ${accentSat}%, 60%, 0.5)`;
      ctx.shadowColor = `hsl(${accentHue}, ${accentSat}%, 50%)`;
      ctx.shadowBlur  = 6;
      ctx.fillText('WAVEFORM  //  FlowBeat', 18, H - 18);
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [sensitivity, colorTheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 1, pointerEvents: 'none',
      }}
    />
  );
}
