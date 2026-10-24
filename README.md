# ODDLY.

*The ordinary, made interesting.*

ODDLY. is an experimental product showcase that turns three familiar objects into distinct interactive experiences. It is a portfolio project about visual storytelling, procedural 3D, and the small interactions that make an ordinary object worth a closer look—not an online store.

## Experiences

- **AURA** — A futuristic water bottle presented through a cinematic scroll story. Explore its construction, switch between three finishes, and adjust the water level in an interactive sectional view.
- **CHRONOS** — A procedural skeleton watch with browser-local live time, manual time exploration, animated mechanical components, scroll-driven movement and anatomy studies, and selectable finishes and macro views. Its movement is an illustrative mechanical model, not a reproduction of a real watch caliber.
- **LOOP** — A kinetic marble apparatus with helix and orbital routes, portals, a magnetic platform, a transfer disc, and a reverse-gravity chamber. A shared simulation drives multiple marbles and the playground's route, release, tempo, playback, and FLOW/CHAOS controls.

## Tech stack

- React and TypeScript
- Vite
- Three.js and React Three Fiber for procedural 3D scenes
- GSAP and ScrollTrigger for presentation and scroll motion
- React Router for product routes
- Project CSS for layout, visual design, and lightweight collection previews

The homepage previews use CSS and SVG animation; they do not load three additional full product scenes. Tailwind CSS is not part of the current project.

## Features

- Modular procedural bottle, watch, and marble-machine geometry
- Scroll-driven product storytelling and technical annotations
- Interactive finishes, time controls, water level, and machine controls
- Deterministic curve-following marble simulation with shared-mechanism occupancy
- Responsive layouts, keyboard-operable controls, reduced-motion handling, and WebGL fallbacks
- A shared navigation bar and animated, visibility-aware collection previews

## Getting started

Requires Node.js **20.19+ within the 20.x line, or 22.12+**, and npm (the installed Vite version's supported Node ranges). A browser with WebGL support is needed for the 3D scenes.

```bash
git clone https://github.com/darelvj/interactive-product-lab.git
cd interactive-product-lab
npm ci
npm run dev
```

Open the local URL printed by Vite. For a production build and local preview:

```bash
npm run build
npm run preview
```

Run the browser-free LOOP simulation checks with `npm run test:loop`. The build script runs TypeScript validation before bundling. There is currently no separate lint script or required environment file.

## Project structure

```text
src/
  App.tsx               Home and product routes
  main.tsx              React entry point
  components/           Shared navigation and collection previews
  data/                 Product metadata
  pages/Aura/           Bottle model and experience
  pages/Chronos/        Watch model and experience
  pages/Loop/           Machine, track graph, simulation, and controls
  styles.css            Shared styling
tests/                   LOOP simulation checks
```

## Screenshots and live demo

- **Screenshots:** To be added after the first visual review.
- **Live demo:** Deployment URL to be added when the site is published.

## Project status

ODDLY. is an evolving portfolio experiment. The three experiences are implemented and continue to be refined; there is no backend, account system, or checkout flow.
