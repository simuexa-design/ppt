# ECG Guardian · Interactive Web Presentation

An animated 16:9 web presentation showcasing **ECG Guardian** (Explainable Multi-Label ECG Arrhythmia Classification), styled to match the platform's deep clinical green, warm parchment, and phosphor CRT telemetry interface.

Lead Researcher & Cardiologist: **Dr. Sonali Patel**

---

## Tech Stack & Features

- **Three.js (WebGL):** Real-time 3D cardiac dipole P-QRS-T particle ribbon and ambient telemetry particles that react smoothly across slide transitions.
- **Anime.js:** Choreographed slide reveals, SVG heartbeat trace drawing, and metric roll-up animations.
- **Zero-Config Vercel Deployment:** Pure static HTML/CSS/JS bundle with `vercel.json` and `.vercelignore` configured for instant CDN deployment (`Framework Preset: Other`, `Output Directory: .`).
- **Interactive Controls:**
  - Mouse wheel / trackpad scrolling across slides
  - `→` / `Space` / `PageDown`: Next slide
  - `←` / `Backspace` / `PageUp`: Previous slide
  - `Tab` / `G` / `O`: Slide Overview Grid
  - `F`: Fullscreen mode
  - `P`: Browser Print / Save as PDF (`ECG_Guardian_Presentation_Deck.pdf` also included at root `/ECG_Guardian_Presentation_Deck.pdf`)
  - Click any screenshot to open full-size Lightbox zoom
