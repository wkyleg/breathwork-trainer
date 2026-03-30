# Breathwork Trainer

[![Deploy](https://github.com/wkyleg/breathwork-trainer/actions/workflows/deploy.yml/badge.svg)](https://github.com/wkyleg/breathwork-trainer/actions/workflows/deploy.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](tsconfig.json)

**[Try It Live](https://wkyleg.github.io/breathwork-trainer/)** | [Elata Biosciences](https://elata.bio) | [Elata SDK Docs](https://docs.elata.bio/sdk/overview)

A breathwork training app with live biometric feedback. Follow paced breathing protocols while EEG and webcam heart rate sensors track how your nervous system responds in real time. Pick a protocol, breathe, and watch your body calm down.

## Features

- **Guided breathing protocols** -- Box Breathing (Navy SEAL stress control), 4-7-8 (Dr. Andrew Weil relaxation method), Resonance Breathing (6 breaths/min for optimal HRV), and fully custom patterns
- **Real-time EEG integration** via Muse headband (Web Bluetooth) using the [Elata SDK](https://docs.elata.bio/sdk/overview)
- **Webcam heart rate (rPPG)** -- heart rate and HRV via facial video analysis, no wearables needed
- **Live biometric display** -- EEG band powers, heart rate, HRV, calmness score, and arousal level update in real time during each session
- **Session analytics** -- post-session charts showing how your brain and cardiovascular system responded to each breathing pattern
- **Calibration flow** -- baseline measurement before each session for accurate before/after comparison
- **Audio guidance** -- Tone.js-powered audio cues for inhale, hold, and exhale phases
- **Animated breathing orb** -- smooth Framer Motion visualization that guides your breath pace

## How It Works

1. **Choose** -- Pick a breathing protocol or create your own custom pattern
2. **Calibrate** -- The app records a short physiological baseline
3. **Breathe** -- Follow the animated breathing orb while live biometrics display on screen
4. **Review** -- See detailed post-session charts correlating your breath cycles with neural and cardiovascular data

## Tech Stack

- **React 19** + **TypeScript** (strict mode) -- component-based UI
- **Vite 6** -- fast dev server with WASM and top-level await support
- **Zustand** -- lightweight state management
- **Framer Motion** -- smooth breathing orb animations
- **Tone.js** -- Web Audio synthesis for breath phase cues
- **Recharts** -- data visualization for post-session analysis
- **Tailwind CSS 4** -- utility-first responsive styling
- **Vitest** + **jsdom** -- unit tests
- **Biome** -- formatting and linting
- **Elata SDK** -- `@elata-biosciences/eeg-web`, `eeg-web-ble`, `rppg-web`

## Quick Start

```bash
pnpm install
pnpm dev          # dev server on http://localhost:5173
pnpm build        # tsc + vite build -> dist/
pnpm preview      # serve production build
pnpm test         # vitest (watch mode)
pnpm typecheck    # tsc --noEmit
pnpm lint         # biome check (read-only)
pnpm format       # biome format --write
```

## Neurotech Devices

| Device | Protocol | Browser Support |
|--------|----------|----------------|
| Webcam (rPPG heart rate) | getUserMedia | All modern browsers |
| Muse S headband (EEG) | Web Bluetooth | Chrome, Edge, Brave |

Connect devices on the home screen before starting, or skip to breathe without sensors. The app works fully without any hardware.

## Breathing Protocols

| Protocol | Pattern | Purpose |
|----------|---------|---------|
| Box Breathing | 4s in, 4s hold, 4s out, 4s hold | Acute stress control, used by Navy SEALs and first responders |
| 4-7-8 | 4s in, 7s hold, 8s out | Deep relaxation and sleep preparation |
| Resonance | 5s in, 5s out | Optimal HRV and autonomic nervous system coherence |
| Custom | User-defined | Build your own inhale/hold/exhale durations |

## Repository Structure

```
src/
├── pages/
│   ├── HomePage.tsx         # Protocol selection
│   ├── CalibratePage.tsx    # Baseline measurement
│   ├── SessionPage.tsx      # Active breathing session + live biometrics
│   ├── SummaryPage.tsx      # Post-session charts and analysis
│   └── SettingsPage.tsx     # Device and protocol configuration
├── components/
│   ├── BreathingOrb.tsx     # Animated breath guide (Framer Motion)
│   ├── DeviceConnect.tsx    # Webcam + EEG connection UI
│   ├── NeuroPanel.tsx       # Live neuro metrics display
│   ├── SignalQuality.tsx    # Signal strength indicator
│   └── Tooltip.tsx          # Info tooltips
├── lib/
│   ├── protocols.ts         # Breathing protocol definitions
│   ├── breathAudio.ts       # Tone.js audio cue generation
│   └── settingsStore.ts     # Zustand settings persistence
├── neuro/                   # EEG + rPPG provider integration
└── test/                    # Test setup and mocks
```

## Deployment

Pushes to `main` trigger the CI/CD pipeline which runs lint, typecheck, and tests, then deploys to GitHub Pages.

## Related Projects

Breathwork Trainer is part of the [Elata Biosciences](https://elata.bio) neurotech app ecosystem. Other apps in the series:

- **[Monkey Mind: Inner Invaders](https://github.com/wkyleg/monkey-mind)** -- Brain-reactive arcade game with 140+ levels and EEG-driven gameplay
- **[Neuro Chess](https://github.com/wkyleg/neuro-chess)** -- Chess vs Stockfish with real-time neural composure tracking
- **[NeuroFlight](https://github.com/wkyleg/neuroflight)** -- 3D flight sim with AI dogfighting and EEG/rPPG biofeedback
- **[Reaction Trainer](https://github.com/wkyleg/reaction-trainer)** -- Stress-modulated reaction speed game with biometric difficulty scaling

All apps use the [Elata Bio SDK](https://github.com/Elata-Biosciences/elata-bio-sdk) for EEG and rPPG integration.

## License

[ISC](LICENSE) -- Copyright (c) 2024-2026 Elata Biosciences
