import React, { useRef, useEffect } from 'react';
import { audioEngine } from '../../audio/AudioEngine';
import { useAppContext } from '../../AppContext';

export default function StudioScope() {
  const canvasRef = useRef();
  const rafRef = useRef();
  const { sensitivity } = useAppContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const features = audioEngine.getFeatures();
      const history = audioEngine.getHistory();

      // Dark background with subtle fade trail
      ctx.fillStyle = 'rgba(5, 5, 5, 0.6)';
      ctx.fillRect(0, 0, W, H);

      // --- Energy waveform history (bottom 30% of screen) ---
      const waveH = H * 0.28;
      const waveY = H * 0.68;
      const energyHistory = history.energy;
      const barW = W / energyHistory.length;

      ctx.beginPath();
      ctx.strokeStyle = '#aa00ff';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#aa00ff';
      ctx.shadowBlur = 8;
      energyHistory.forEach((val, i) => {
        const x = i * barW;
        const y = waveY + waveH / 2 - val * sensitivity * waveH * 3;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- Spectral centroid arc (centre of screen) ---
      const cx = W / 2;
      const cy = H / 2;
      const baseR = Math.min(W, H) * 0.18;
      const arcR = baseR + features.brightness * baseR * 0.6;
      const arcAngle = features.energy * sensitivity * Math.PI * 1.5;

      ctx.beginPath();
      ctx.arc(cx, cy, arcR, -Math.PI / 2, -Math.PI / 2 + arcAngle);
      ctx.strokeStyle = `hsl(${180 + features.brightness * 120}, 90%, 65%)`;
      ctx.lineWidth = 3;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- Energy delta flash ring ---
      if (features.energyDelta > 0.04 * sensitivity) {
        const flashAlpha = Math.min(features.energyDelta * sensitivity * 8, 1);
        ctx.beginPath();
        ctx.arc(cx, cy, arcR + 20, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 80, 80, ${flashAlpha})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff5050';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // --- RMS bar (left edge) ---
      const barHeight = H * 0.5;
      const barX = 48;
      const rmsH = features.energy * sensitivity * barHeight * 4;
      const clampedH = Math.min(rmsH, barHeight);
      ctx.fillStyle = `hsl(${270 + features.energy * 60}, 80%, 55%)`;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 12;
      ctx.fillRect(barX, H / 2 + barHeight / 2 - clampedH, 10, clampedH);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(barX, H / 2 - barHeight / 2, 10, barHeight);

      // --- HUD text labels ---
      ctx.font = '600 13px \'Outfit\', sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('RMS', barX - 4, H / 2 + barHeight / 2 + 20);

      // energyTrend badge
      const trend = features.energyTrend || 'steady';
      const trendColor = trend === 'rising' ? '#00ffcc' : trend === 'falling' ? '#ff4466' : '#aaaaaa';
      ctx.font = '700 14px \'Outfit\', sans-serif';
      ctx.fillStyle = trendColor;
      ctx.shadowColor = trendColor;
      ctx.shadowBlur = 8;
      ctx.fillText(`▲ ${trend.toUpperCase()}`, cx - 28, cy - arcR - 24);
      ctx.shadowBlur = 0;

      // Energy + Brightness readout
      ctx.font = '500 12px \'Outfit\', sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText(`Energy  ${(features.energy || 0).toFixed(4)}`, cx + arcR + 16, cy - 10);
      ctx.fillText(`Bright  ${(features.brightness || 0).toFixed(3)}`, cx + arcR + 16, cy + 10);
      ctx.fillText(`ZCR     ${(features.zcr || 0).toFixed(1)}`, cx + arcR + 16, cy + 30);
      ctx.fillText(`ΔEnergy ${(features.energyDelta || 0).toFixed(4)}`, cx + arcR + 16, cy + 50);

      // Mode label
      ctx.font = '700 11px \'Outfit\', sans-serif';
      ctx.fillStyle = 'rgba(170, 0, 255, 0.6)';
      ctx.fillText('STUDIO SCOPE  //  FlowBeat', 24, H - 24);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [sensitivity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
