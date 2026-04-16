# FlowBeat: AI-Powered Music Intelligence Canvas

FlowBeat is a lean, privacy-first, browser-based music visualizer. It transforms your live local context (microphone, uploaded audio, or shared system audio) into an evolving visual performance via real-time logic.

Rather than just moving a spectrum bar to kicks and snares, FlowBeat interprets tracking energy thresholds (RMS), brightness traits (Spectral Centroid), string-pluck densities (ZCR), drop detection thresholds, and multi-frame energy trends — all directly from the local browser environment without uploading any assets to cloud servers.

## Core Features

1. **Zero Latency**: Powered by the native Web Audio API mapped straight to your local graphics hardware.
2. **Browser-Native Intelligence**: Extracts complex real-time metrics with Meyda directly within an internal React context map, without utilizing heavy React re-renders.
3. **Flexible Input Sources**:
   - 🎙️ **Microphone** for live ambient capture
   - 📁 **Audio File Upload** for repeatable testing
   - 🖥️ **System Audio Capture** for PC output / browser tab audio in Chrome and Edge
4. **Four Signature Visual Modes**:
   - 🌿 **Pulse Garden**: Slow fluid particle sphere pulsing gently for ambient aesthetics.
   - ⚡ **Neon Rift**: High-contrast geometry with a per-frame flash system that fires on `energyDelta` spikes — tuned for EDM/Trap drops.
   - 🌌 **Aurora Ink**: A flowing CatmullRom ribbon that reshapes every frame driven by spectral brightness and energy — the most cinematic mode.
   - 📊 **Studio Scope**: 2D Canvas HUD showing live waveform history, RMS bar, energy arc, delta flash ring, and a colour-coded `energyTrend` badge — the producer/debug mode.
5. **Offline and 100% Free**: No dependencies on paid APIs or external inference endpoints.
6. **Fullscreen Mode**: One-click immersive fullscreen toggle with automatic state sync (works even when exiting via Escape key).
7. **Transparency / Debug Panel**: The "Explain Visual" panel shows four live metric bars — Energy, Brightness, Noisiness, Energy Delta — plus a dynamic human-readable interpretation.

## What's New

### ✨ Latest
- **System Audio Capture**: Added `getDisplayMedia()` based capture path for desktop output / tab audio. Users can click **System**, choose a tab/window, and enable **Share audio** to feed non-mic audio directly into the analyzer.
- **Browser Support Messaging**: If `getDisplayMedia` is unavailable, the UI now shows a friendly warning telling users to use Chrome or Edge. If they forget to enable audio sharing, a contextual help banner explains what to do.

## Installation & Running Locally
```bash
# 1. Clone the repository
git clone https://github.com/Luv-Goel/FlowBeat.git

# 2. Enter the directory
cd FlowBeat

# 3. Install dependencies
npm install

# 4. Start the Vite dev server
npm run dev
```

Visit the output URL (normally `http://localhost:5173`).

## System Audio Notes

- Works best in **Chrome** and **Edge**.
- In the screen-share picker, users must enable **Share audio**.
- Firefox and Safari have limited or blocked support for this flow.
- Video is requested only because the browser API requires it; the app stops the video track immediately and uses audio only.

## Testing Guide

| Track Type | Mode | Expected Behaviour |
|---|---|---|
| Lo-fi / Ambient | Pulse Garden | Slow bloom, gentle colour-shift, `energyTrend: steady` |
| EDM / Trap | Neon Rift | Hard spikes on drops, flash glow fires on kick hits, `energyTrend: rising` during build-ups |
| Vocal / Indie | Aurora Ink | Smooth ribbon reshaping, hue drift driven by spectral centroid |
| Any track | Studio Scope | All metrics live — use this to calibrate Sensitivity before switching modes |
| YouTube / Spotify tab | Any | Use **System** input, enable **Share audio**, then verify waveform activity in Studio Scope |

## Roadmap

| Feature | Status |
|---|---|
| Audio pipeline | ✅ Complete |
| Pulse Garden | ✅ Done |
| Neon Rift + flash system | ✅ Done |
| Aurora Ink ribbon | ✅ Done |
| Studio Scope HUD | ✅ Done |
| System audio capture | ✅ Done |
| `energyTrend` label + dynamic inspector | ✅ Done |
| Fullscreen toggle | ✅ Done |
| Spotify integration | 🔜 Next session |
| Theme picker / smoothing slider | 🔜 Next session |
