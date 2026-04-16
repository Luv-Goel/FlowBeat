# FlowBeat: AI-Powered Music Intelligence Canvas

FlowBeat is a lean, privacy-first, browser-based music visualizer. It transforms your live local context (microphone or MP3) into an evolving visual performance via real-time logic.

Rather than just moving a spectrum bar to kicks and snares, FlowBeat interprets tracking energy thresholds (RMS), brightness traits (Spectral Centroid), string-pluck densities (ZCR), drop detection thresholds, and multi-frame energy trends — all directly from the local browser environment without uploading any assets to cloud servers.

## Core Features
1. **Zero Latency**: Powered by the native Web Audio API mapped straight to your local graphics hardware.
2. **Browser-Native Intelligence**: Extracts complex real-time metrics with Meyda directly within an internal React context map, without utilizing heavy React re-renders.
3. **Three Signature Visual Modes**:
   - 🌿 **Pulse Garden**: Slow fluid geometry pulsing gently for ambient aesthetics.
   - ⚡ **Neon Rift**: High contrast geometry, color-flashes, and multi-axis drop detection specifically tuned for EDM/Trap. Features a frame-accurate flash system that fires on `energyDelta` spikes and decays smoothly every frame.
   - 🌌 **Aurora Ink**: Shimmering ambient clouds adjusting hue on brightness frequencies.
4. **Offline and 100% Free**: No dependencies on paid APIs or external inference endpoints.
5. **Fullscreen Mode**: One-click immersive fullscreen toggle with automatic state sync (works even when exiting via Escape key).
6. **Transparency / Debug Panel**: The "Explain Visual" panel now shows four live metrics — Energy, Brightness, Noisiness, and Energy Delta — plus a dynamic human-readable interpretation: *Energy is **rising** · High intensity*.

## What's New (Latest Update)

### 🐛 Bug Fixes
- **`THREE.Color` allocation fix in `PulseGarden`**: Eliminated 60 GC-pressure object allocations/sec by introducing a persistent `colorRef` that is mutated in-place via `setHSL()` instead of creating a new `THREE.Color()` every frame across 1200 particles.
- **Removed unused `OrbitControls` import** from `SceneManager.jsx` to eliminate linting warnings.

### ✨ New Features
- **`energyTrend` label in `AudioEngine`**: `processFeatures()` now computes a `'rising'` / `'falling'` / `'steady'` label by comparing the first 15 vs last 15 frames of the 30-frame rolling energy history.
- **Dynamic Inspector Labels**: The Debug panel's interpretation line now reads *Energy is **[trend]** · [intensity]* using the live `energyTrend` and `energy` values, replacing the old static string.
- **Energy Delta bar in Inspector**: A fourth metric bar (red-tinted) visualizes `energyDelta` directly, giving instant visual confirmation of drop events.
- **Fullscreen Toggle**: A `Maximize2`/`Minimize2` button in the control bar calls `requestFullscreen()` / `exitFullscreen()` and listens for `fullscreenchange` events to keep icon state in sync when the user presses Escape.
- **NeonRift Flash System**: `flashRef` tracks a 0–1 flash intensity that spikes to `1.0` on any `energyDelta > 0.05 * sensitivity` event and decays at `× 0.85` each frame (~17 frames to fade). The flash modulates both the box color channel and the octahedron tint for a genuine drop-reactive strobe feel.

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

## Testing Guide (First Real Audio Test)

Once running, test with these track types and expected behaviours:

| Track Type | Expected Behaviour |
|---|---|
| **Lo-fi / Ambient** | Pulse Garden blooms slowly, gentle colour-shift, `energyTrend: steady` |
| **EDM / Trap** | Neon Rift spikes hard on drops, flash fires on kick hits, `energyTrend: rising` during build-ups |
| **Vocal / Indie** | Aurora Ink shows smooth hue drift driven by spectral centroid |

If nothing responds, raise the **Sensitivity** slider (default `1.0` may be too low for quiet recordings). If visuals are oversaturated, lower it toward `0.3`.

## Roadmap

| Feature | Status |
|---|---|
| Audio pipeline | ✅ Complete |
| Visual modes (Pulse Garden, Neon Rift, Aurora Ink) | ✅ Done |
| Performance fixes (Color alloc, dpr cap) | ✅ Done |
| `energyTrend` label + dynamic inspector | ✅ Done |
| Fullscreen toggle | ✅ Done |
| NeonRift flash system | ✅ Done |
| Real audio testing | 🧪 Ready — test now |
| Mode transition polish | 🔜 Next |
| Export / Creator mode | 🔜 Later |
