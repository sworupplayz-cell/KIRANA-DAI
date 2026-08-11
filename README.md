# Kirana Dai — Nepali Kirana Shop Simulator

A mobile-first Three.js game foundation built with Vite and TypeScript. This repository currently contains only the development foundation and a minimal renderer/input test scene; it does **not** contain the shop simulation systems yet.

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+
- A browser with WebGL 2 support

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

The development and preview servers bind to `0.0.0.0` for device and hosted-preview testing.

## Foundation test controls

- **Desktop:** WASD or arrow keys move the development marker. Drag with the mouse to orbit the camera and use the wheel to zoom.
- **Mobile:** Use the virtual joystick to move the marker. Drag the scene to orbit and pinch to zoom.

These controls and the marker exist only to verify the foundation.

## Architecture

- `src/game/` owns the renderer, scene, camera, input, lifecycle, and reusable GLTF loading.
- `src/ui/` contains lightweight DOM UI isolated from the 3D scene.
- `src/player/`, `src/world/`, `src/entities/`, and `src/systems/` are reserved module boundaries for later phases.
- `public/assets/` is organized for source GLB/GLTF files, textures, characters, products, and environment content.

Read [GAME_DESIGN.md](./GAME_DESIGN.md) for direction and [DEVELOPMENT.md](./DEVELOPMENT.md) before changing the game.
