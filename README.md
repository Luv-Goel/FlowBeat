# FlowBeat: AI-Powered Music Intelligence Canvas

FlowBeat is a lean, privacy-first, browser-based music visualizer. It transforms your live local context (microphone or MP3) into an evolving visual performance via real-time logic.

Rather than just moving a spectrum bar to kicks and snares, FlowBeat interprets tracking energy thresholds (RMS), brightness traits (Spectral Centroid), string-pluck densities (ZCR), and drop detection thresholds directly from the local browser environment without uploading any assets to cloud servers.

## Core Features
1. **Zero Latency**: Powered by the native Web Audio API mapped straight to your local graphics hardware.
2. **Browser-Native Intelligence**: Extracts complex real-time metrics with Meyda directly within an internal React context map, without utilizing heavy React re-renders.
3. **Three Signature Visual Modes**:
   - 🌿 **Pulse Garden**: Slow fluid geometry pulsing gently for ambient aesthetics.
   - ⚡ **Neon Rift**: High contrast geometry, color-flashes, and multi-axis drop detection specifically tuned for EDM/Trap.
   - 🌌 **Aurora Ink**: Shimmering ambient clouds adjusting hue on brightness frequencies.
4. **Offline and 100% Free**: No dependencies on paid APIs or external inference endpoints.
5. **Transparency**: The "Debug / Explain Visual" capability exposes real-time analyzer readings to easily convey exactly what algorithms are executing behind the scenes.

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
