# FlowBeat 🎵

<div align="center">

[![CI](https://github.com/Luv-Goel/FlowBeat/actions/workflows/ci.yml/badge.svg)](https://github.com/Luv-Goel/FlowBeat/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)]()
[![Three.js](https://img.shields.io/badge/Three.js-r184-000000?logo=three.js)]()
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

**AI-powered music visualizer — real-time audio analysis with waveform, spectrogram, particle, and 3D visualizations. Zero cloud dependencies, everything runs in the browser.**

</div>

---

## ✨ Features

- 🎨 **7 visualization modes** — Waveform, Spectrogram 3D, Particle Garden, Neon Rift, Aurora Ink, Studio Scope, and Spotify Mode
- 🔊 **Multiple audio sources** — Microphone, uploaded files, system audio (tab/window capture), and Spotify playback
- 🎚️ **Real-time audio analysis** — RMS energy, spectral centroid, zero-crossing rate, energy delta, and trend detection via Web Audio API
- 🎮 **Interactive controls** — Adjust sensitivity, smoothing, and color themes (Neon, Pastel, Fire, Mono)
- 🎬 **Screen recording** — Capture your visualizations directly in the browser (saves as `.webm`)
- 🎯 **Keyboard shortcuts** — Quick mode switching, fullscreen, and playback controls
- 🌐 **Zero cloud** — All processing happens locally in your browser. No data ever leaves your machine.
- 🎵 **Spotify integration** — Connect your Spotify account and visualize currently playing tracks with album-art-driven colors
- 📱 **Responsive** — Adapts to any screen size

## 🖼️ Screenshots

> *(Screenshots coming soon — contributions welcome!)*

| Mode | Preview |
|------|---------|
| **Pulse Garden** | Energy-reactive particle system with blooming spheres |
| **Neon Rift** | Rotating wireframe geometries driven by audio energy |
| **Aurora Ink** | Flowing aurora-like ribbons responding to brightness |
| **Studio Scope** | Oscilloscope-style analyzer with waveform history and spectral arc |
| **Waveform** | Smooth scrolling waveform display with frequency band indicators |
| **Spectrogram 3D** | Three-dimensional frequency waterfall rendered with colored bars |
| **Spotify** | Album-art-driven visualization synced to your Spotify playback |

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/Luv-Goel/FlowBeat.git
cd FlowBeat

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## 📦 Deployment

### GitHub Pages

The project includes a CI workflow (`.github/workflows/ci.yml`) that builds the app on every push. To deploy to GitHub Pages:

1. Push to `main` or `master`
2. Go to your repo **Settings → Pages**
3. Under "Source", select **GitHub Actions**
4. The build artifact is automatically uploaded by the CI workflow
5. Optionally, add a deployment job to the CI workflow for auto-deployment

### Vercel / Netlify

Deploy with zero configuration:

- **Vercel**: Import repo → framework preset **Vite** → deploy
- **Netlify**: Import repo → build command `npm run build` → publish directory `dist`

### Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t flowbeat .
docker run -p 8080:80 flowbeat
```

## 🎮 Usage

### Audio Sources

| Source | How |
|--------|-----|
| **Microphone** | Click the **Mic** button — grants mic access and visualizes live audio |
| **Upload File** | Click **File** and select an audio file (.mp3, .wav, .ogg, .flac) |
| **System Audio** | Click **System** — shares a browser tab/window with audio |
| **Spotify** | Click **Connect Spotify** and authorize — visualizes your current playback |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `F` | Toggle fullscreen |
| `1` | Pulse Garden |
| `2` | Neon Rift |
| `3` | Aurora Ink |
| `4` | Studio Scope |
| `5` | Waveform |
| `6` | Spectrogram 3D |
| `7` | Spotify Mode |

### Controls

- **Sensitivity** slider — boosts audio reactivity across all visual modes
- **Smoothing** slider — controls the analyser's smoothing time constant
- **Color themes** — Neon (default), Pastel, Fire, Mono — affect all visual modes
- **Record** — captures the canvas as a `.webm` video file

## 🏗️ Architecture

```
FlowBeat/
├── .github/workflows/ci.yml   # CI pipeline
├── public/                     # Static assets
├── src/
│   ├── audio/
│   │   ├── AudioEngine.js      # Core audio analysis (Web Audio API)
│   │   └── useAudioEngine.js   # React hook wrapping AudioEngine
│   ├── visuals/
│   │   ├── SceneManager.jsx     # R3F Canvas + mode routing
│   │   └── modes/
│   │       ├── PulseGarden.jsx  # Particle system
│   │       ├── NeonRift.jsx     # Wireframe geometries
│   │       ├── AuroraInk.jsx    # Flowing ribbons
│   │       ├── StudioScope.jsx  # Oscilloscope overlay
│   │       └── SpotifyMode.jsx  # Spotify-driven visuals
│   ├── components/
│   │   ├── WaveformVisualizer.jsx  # Canvas waveform display
│   │   └── Spectrogram3D.jsx      # 3D frequency waterfall
│   ├── ui/
│   │   └── ControlPanel.jsx    # Main UI controls
│   ├── spotify/                # Spotify auth & API client
│   ├── capture/                # Screen recording (MediaRecorder)
│   ├── App.jsx                 # Root component
│   ├── AppContext.jsx          # Global state (mode, theme, settings)
│   └── main.jsx                # Entry point
├── package.json
└── vite.config.js
```

### Data Flow

1. **AudioEngine** reads raw audio data via the Web Audio API's `AnalyserNode`
2. On every animation frame, it computes: RMS energy, spectral centroid (brightness), ZCR, energy delta, and energy trend
3. Rolling history (120 frames) is maintained for smooth visualizations
4. **SceneManager* creates an R3F `<Canvas>` with post-processing (bloom) and renders the active 3D mode
5. **Canvas overlay modes** (StudioScope, WaveformVisualizer) render on separate 2D canvases layered on top
6. **ControlPanel** provides UI to switch modes, adjust settings, and select audio sources
7. All modes access the same audio features via `audioEngine.getFeatures()` and respond to `sensitivity`/`colorTheme` from AppContext

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **Three.js / R3F** | 3D rendering engine |
| **@react-three/postprocessing** | Bloom & post-processing effects |
| **Web Audio API** | Real-time audio analysis |
| **Meyda** | Audio feature extraction (available as dep) |
| **MediaRecorder API** | Canvas recording |
| **lucide-react** | UI icons |

## 🧑‍💻 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

Key points:
- Add new visualization modes easily — see the contributing guide for templates
- Run `npm run lint` and `npm run build` before committing
- Include screenshots for visual changes

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

Made with ❤️ by [Luv Goel](https://github.com/Luv-Goel)

</div>
