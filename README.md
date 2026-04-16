# FlowBeat: AI-Powered Music Intelligence Canvas

FlowBeat is a lean, privacy-first, browser-based music visualizer. It transforms your live local context (microphone or MP3) into an evolving visual performance via real-time logic.

Rather than just moving a spectrum bar to kicks and snares, FlowBeat interprets tracking energy thresholds (RMS), brightness traits (Spectral Centroid), string-pluck densities (ZCR), drop detection thresholds, and multi-frame energy trends — all directly from the local browser environment without uploading any assets to cloud servers.

## Core Features

1. **Zero Latency**: Powered by the native Web Audio API mapped straight to your local graphics hardware.
2. **Browser-Native Intelligence**: Extracts complex real-time metrics with Meyda directly within an internal React context map, without utilizing heavy React re-renders.
3. **Four Signature Visual Modes**:
   - 🌿 **Pulse Garden**: Slow fluid particle sphere pulsing gently for ambient aesthetics.
   - ⚡ **Neon Rift**: High-contrast geometry with a per-frame flash system that fires on `energyDelta` spikes — tuned for EDM/Trap drops.
   - 🌌 **Aurora Ink**: A flowing CatmullRom ribbon that reshapes every frame driven by spectral brightness and energy — the most cinematic mode.
   - 📊 **Studio Scope**: 2D Canvas HUD showing live waveform history, RMS bar, energy arc, delta flash ring, and a colour-coded `energyTrend` badge — the producer/debug mode.
4. **Offline and 100% Free**: No dependencies on paid APIs or external inference endpoints.
5. **Fullscreen Mode**: One-click immersive fullscreen toggle with automatic state sync (works even when exiting via Escape key).
6. **Transparency / Debug Panel**: The "Explain Visual" panel shows four live metric bars — Energy, Brightness, Noisiness, Energy Delta — plus a dynamic human-readable interpretation: *Energy is **rising** · High intensity*.

## What's New (Latest Update)

### 🐛 Bug Fixes
- **`NeonRift` material fix**: Switched from `meshBasicMaterial` (no emissive support) to `meshStandardMaterial`. The `emissiveIntensity` property now fires correctly on every drop, giving a real glow flash instead of silently doing nothing.

### ✨ New Features
- **`AuroraInk` full ribbon implementation**: Replaced the wireframe sphere stub with a proper `CatmullRomCurve3` → `TubeGeometry` ribbon rebuilt every frame. Control points flow like ink under `sin`/`cos` waves driven by `brightness` and `energy`. Hue shifts continuously via `t * 0.02` clock drift plus `brightness` offset.
- **`StudioScope` mode**: A 2D Canvas overlay (no Three.js) rendering:
  - Energy waveform history line (purple, full-width)
  - Spectral arc whose radius and sweep angle track brightness and energy
  - Flash ring that fires on `energyDelta` spikes (red glow)
  - RMS bar on the left edge
  - Live numeric readout: Energy, Brightness, ZCR, ΔEnergy
  - Colour-coded `energyTrend` badge (teal = rising, red = falling, grey = steady)
- **Scene lighting boost**: `ambientLight` raised from `0.5` → `1.2`, plus a `pointLight` at `[0, 0, 8]` with intensity `2` — required for `meshStandardMaterial` wireframes to look bright.

## Technology Stack
- **Frontend Framework**: React 18 & Vite
- **Visual Rendering**: Three.js, React-Three-Fiber, React-Three-Postprocessing
- **Audio Extraction**: Web Audio API & Meyda
- **Interface**: Lucide Icons & handcrafted Vanilla CSS (Glassmorphism & Neon themes)

## Installation & Running Locally
Since FlowBeat runs 100% on the frontend, standard Node initialization is all that is required.
```bash
# 1. Clone the repository
git clone https://github.com/Luv-Goel/FlowBeat.git

# 2. Enter the directory
cd FlowBeat

# 3. Install NPM Core Dependencies
npm install

# 4. Start the interactive Vite Developer Server
npm run dev
```

Visit the outputted URL (normally `http://localhost:5173`) and enjoy FlowBeat!

## Testing Guide

| Track Type | Mode | Expected Behaviour |
|---|---|---|
| Lo-fi / Ambient | Pulse Garden | Slow bloom, gentle colour-shift, `energyTrend: steady` |
| EDM / Trap | Neon Rift | Hard spikes on drops, flash glow fires on kick hits, `energyTrend: rising` during build-ups |
| Vocal / Indie | Aurora Ink | Smooth ribbon reshaping, hue drift driven by spectral centroid |
| Any track | Studio Scope | All metrics live — use this to calibrate Sensitivity before switching modes |

If nothing responds, raise the **Sensitivity** slider (default `1.0` may be too low for quiet recordings). If visuals are oversaturated, lower it toward `0.3`.

## Roadmap

| Feature | Status |
|---|---|
| Audio pipeline | ✅ Complete |
| Pulse Garden | ✅ Done |
| Neon Rift + flash system | ✅ Done |
| Aurora Ink ribbon | ✅ Done |
| Studio Scope HUD | ✅ Done |
| `energyTrend` label + dynamic inspector | ✅ Done |
| Fullscreen toggle | ✅ Done |
| Scene lighting (standard material support) | ✅ Done |
| Real audio testing | 🧪 Ready — test now |
| Mode transition polish | 🔜 Next |
| Export / Creator mode | 🔜 Later |
