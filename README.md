# FlowBeat ðŸŽµ

<div align="center">

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript)]()
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Dependencies](https://img.shields.io/badge/dependencies-zero-lightgrey)]()

**AI-powered music visualizer â€” real-time audio analysis in your browser. Zero cloud dependencies.**

</div>

---

## Overview

FlowBeat is a browser-based music visualizer that performs real-time audio analysis entirely on the client side. No data leaves your machine â€” all processing happens locally through the Web Audio API.

## Features

- ðŸŽ¨ **Real-time visualization** â€” Dynamic visuals that respond to audio
- ðŸ”Š **Web Audio API** â€” Client-side audio analysis (FFT, waveform, frequency bands)
- ðŸš« **Zero cloud** â€” All processing happens locally in your browser
- ðŸŽšï¸ **Multiple visual modes** â€” Switch between visualization styles
- ðŸŽ® **Interactive controls** â€” Adjust sensitivity, colors, and effects
- ðŸ”„ **Responsive** â€” Adapts to any screen size
- ðŸ“‚ **Local files** â€” Upload your own tracks

## Visualization Modes

| Mode | Description |
|------|-------------|
| Spectrum | Frequency bar visualization |
| Waveform | Live audio waveform display |
| Particles | Audio-reactive particle system |
| Circular | Radial frequency visualization |
| Hybrid | Combined visual modes |

## Quick Start

```bash
# Clone and open
git clone https://github.com/Luv-Goel/FlowBeat.git
cd FlowBeat

# Serve locally (any HTTP server works)
python -m http.server 8000
# Or: npx serve .
# Or: live-server .

# Open in browser
# http://localhost:8000
```

## Architecture

```
FlowBeat/
â”œâ”€â”€ index.html       # Main entry point
â”œâ”€â”€ js/
â”‚   â””â”€â”€ ...          # Audio processing & visualization
â”œâ”€â”€ css/
â”‚   â””â”€â”€ ...          # Styling
â””â”€â”€ assets/          # Static resources
```

## License

MIT â€” see [LICENSE](LICENSE).
