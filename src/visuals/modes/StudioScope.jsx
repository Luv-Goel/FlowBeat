import React, { useRef, useEffect } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { useAppContext } from '../../AppContext';

export default function StudioScope() {
  const canvasRef = useRef();
  const rafRef    = useRef();
  const { sensitivity, colorTheme } = useAppContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const features = audioEngine.getFeatures();
      // Use getHistory() — always returns 120-length array, never empty
      const energyHistory = audioEngine.getHistory().energy;

      // Accent hue driven by colorTheme
      const accentHue = Math.round(((0.75 + colorTheme.hueShift) % 1 + 1) % 1 * 360);
      const accentSat = Math.round(colorTheme.satMult * 100);
      const accentColor  = `hsl(${accentHue}, ${accentSat}%, 55%)`;
      const accentGlow   = `hsl(${accentHue}, ${accentSat}%, 55%)`;
      const accentArc    = `hsl(${Math.round(((0.5 + colorTheme.hueShift + features.brightness * 0.15) % 1) * 360)}, ${accentSat}%, 65%)`;

      // Background fade
      ctx.fillStyle = 'rgba(5, 5, 5, 0.6)';
      ctx.fillRect(0, 0, W, H);

      // --- Energy waveform history (bottom strip) ---
      const waveH = H * 0.28;
      const waveY = H * 0.68;
      const barW  = W / energyHistory.length;

      ctx.beginPath();
      ctx.strokeStyle = accentColor;
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = accentGlow;
      ctx.shadowBlur  = 8;
      energyHistory.forEach((val, i) => {
        const x = i * barW;
        const y = waveY + waveH / 2 - val * sensitivity * waveH * 3;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- Spectral centroid arc (centre) ---
      const cx = W / 2;
      const cy = H / 2;
      const baseR    = Math.min(W, H) * 0.18;
      const arcR     = baseR + features.brightness * baseR * 0.6;
      const arcAngle = features.energy * sensitivity * Math.PI * 1.5;

      ctx.beginPath();
      ctx.arc(cx, cy, arcR, -Math.PI / 2, -Math.PI / 2 + arcAngle);
      ctx.strokeStyle = accentArc;
      ctx.lineWidth   = 3;
      ctx.shadowColor = accentArc;
      ctx.shadowBlur  = 16;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      // --- Energy delta flash ring ---
      if (features.energyDelta > 0.04 * sensitivity) {
        const flashAlpha = Math.min(features.energyDelta * sensitivity * 8, 1);
        ctx.beginPath();
        ctx.arc(cx, cy, arcR + 20, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 80, 80, ${flashAlpha})`;
        ctx.lineWidth   = 2;
        ctx.shadowColor = '#ff5050';
        ctx.shadowBlur  = 20;
        ctx.stroke();
        ctx.shadowBlur  = 0;
      }

      // --- RMS bar (left edge) ---
      const barHeight = H * 0.5;
      const barX      = 48;
      const rmsH      = Math.min(features.energy * sensitivity * barHeight * 4, barHeight);
      ctx.fillStyle   = accentColor;
      ctx.shadowColor = accentGlow;
      ctx.shadowBlur  = 12;
      ctx.fillRect(barX, H / 2 + barHeight / 2 - rmsH, 10, rmsH);
      ctx.shadowBlur  = 0;
      ctx.fillStyle   = 'rgba(255,255,255,0.1)';
      ctx.fillRect(barX, H / 2 - barHeight / 2, 10, barHeight);

      // --- HUD labels ---
      ctx.font      = '600 13px \'Inter\', sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('RMS', barX - 4, H / 2 + barHeight / 2 + 20);

      const trend      = features.energyTrend || 'steady';
      const trendColor = trend === 'rising' ? '#00ffcc' : trend === 'falling' ? '#ff4466' : '#aaaaaa';
      ctx.font        = '700 14px \'Inter\', sans-serif';
      ctx.fillStyle   = trendColor;
      ctx.shadowColor = trendColor;
      ctx.shadowBlur  = 8;
      ctx.fillText(`▲ ${trend.toUpperCase()}`, cx - 28, cy - arcR - 24);
      ctx.shadowBlur  = 0;

      ctx.font      = '500 12px \'Inter\', sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(`Energy  ${(features.energy || 0).toFixed(4)}`,      cx + arcR + 16, cy - 10);
      ctx.fillText(`Bright  ${(features.brightness || 0).toFixed(3)}`,  cx + arcR + 16, cy + 10);
      ctx.fillText(`ZCR     ${(features.zcr || 0).toFixed(1)}`,         cx + arcR + 16, cy + 30);
      ctx.fillText(`ΔEnergy ${(features.energyDelta || 0).toFixed(4)}`, cx + arcR + 16, cy + 50);

      ctx.font      = '700 11px \'Inter\', sans-serif';
      ctx.fillStyle = accentColor;
      ctx.fillText('STUDIO SCOPE  //  FlowBeat', 24, H - 24);

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
