# Contributing to FlowBeat

First off, thanks for taking the time to contribute! 🎉

FlowBeat is an open-source, AI-powered music visualizer. Every contribution — whether it's a bug fix, a new visualization mode, documentation improvement, or a feature request — makes this project better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Adding a New Visualization Mode](#adding-a-new-visualization-mode)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

Be respectful, inclusive, and constructive. We have zero tolerance for harassment or toxic behaviour. If someone makes you feel unsafe or unwelcome, please open an issue or reach out directly.

## Getting Started

1. **Fork** the repo on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/your-username/FlowBeat.git
   cd FlowBeat
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Start** the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser.

## Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-cool-visual
   ```
2. Make your changes. The project structure:
   ```
   src/
     audio/          # AudioEngine — Web Audio API analysis
     visuals/modes/  # Three.js visualization modes
     ui/             # Control panel & UI components
     spotify/        # Spotify integration
     capture/        # Screen recording
     components/     # Canvas-based overlay components
   ```
3. Test manually by running `npm run dev` and selecting your mode.
4. Lint your code:
   ```bash
   npm run lint
   ```
5. Build to make sure everything compiles:
   ```bash
   npm run build
   ```
6. Commit and push, then open a Pull Request.

## Adding a New Visualization Mode

There are two ways to add visualizations:

### 1. Three.js Mode (3D, rendered in the WebGL canvas)

1. Create a new file in `src/visuals/modes/YourMode.jsx`
2. Use `useFrame` from `@react-three/fiber` to update on every frame
3. Import `audioEngine` from `../../audio/AudioEngine` and call `audioEngine.getFeatures()` for audio data
4. Import `useAppContext` for `sensitivity` and `colorTheme`
5. Add your mode to `MODES` in `src/AppContext.jsx`
6. Import and add your mode in `src/visuals/SceneManager.jsx`'s `<ActiveMode />` switch

### 2. Canvas 2D Mode (overlay, rendered on a 2D `<canvas>`)

1. Create a new file in `src/components/YourVisual.jsx`
2. Use `requestAnimationFrame` for your render loop and `CanvasRenderingContext2D` API for drawing
3. Import `audioEngine` from `../audio/AudioEngine` for audio data
4. Import `useAppContext` for `sensitivity` and `colorTheme`
5. Add your mode to `MODES` in `src/AppContext.jsx`
6. Add `<YourVisual />` conditional render in `src/App.jsx` (like StudioScope)

### 3. Wire it up

- Add a keyboard shortcut in `App.jsx` (e.g., `e.key === '6'`)
- The mode button automatically appears in the control panel since it iterates over `MODES`

## Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for JS/JSX strings
- **Semicolons**: Required
- **Naming**: `camelCase` for variables/functions, `PascalCase` for components
- **Imports**: Group by: React → libraries → internal modules
- **Avoid** premature optimization — readability first
- **JSX**: Self-close tags without children, spread props sparingly
- **Audio Engine**: Don't import `audioEngine` directly in UI components if you can use `useAppContext` or the hook instead — but for visual modes, direct import is expected

We use ESLint — run `npm run lint` before committing.

## Commit Messages

We follow conventional commits loosely:

```
feat: add waveform visualization mode
fix: correct energy value in NeonRift colours
docs: update README with deployment guide
refactor: extract audio processing to AudioEngine
chore: update dependencies
```

Keep messages concise but descriptive. Use the body for additional context if needed.

## Pull Request Process

1. Update the README.md if your change affects user-facing behaviour.
2. Make sure `npm run build` passes without errors.
3. Include screenshots or a short video if you're adding a new visual mode — it helps reviewers see what you built!
4. At least one maintainer must review and approve before merging.
5. Squash-merge preferred for clean history.

## Reporting Issues

Open an issue with:

- A clear, specific title
- Steps to reproduce (if bug)
- Expected vs actual behaviour
- Browser and OS version
- Screenshots or console logs if relevant

Feature requests are welcome too — prefix the title with `[FR]`.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
