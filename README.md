# Kirana Dai — Nepali Mega Mart Simulator

A mobile-first Three.js project built with Vite and TypeScript. Phase 2 now begins a persistent Nepali Mega Mart / department-store simulator: the store is the navigable world, not a level surrounded by an open city. The current milestone is the environment and first-person traversal only.

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

## Mega Mart controls

- **Desktop:** Click the store once to focus the embedded game, then use WASD or arrow keys to walk. Drag the scene to look, or click once for pointer-lock mouse look. Press Escape to release the pointer.
- **Mobile:** Use the virtual joystick to walk and drag elsewhere on the scene to look.

The camera retains a 1.64 m human eye height. Movement stays on the store floor and uses lightweight circle-vs-AABB collision with sliding around walls, department fixtures, the checkout workstation, service counters, warehouse racks, and staff furniture.

## Phase 2 environment

- A roughly **24 × 30 m** indoor store replaces the former compact 8 × 6 m kirana and its outdoor road scene.
- A wide central spine and three cross aisles connect long grocery and drinks/snacks aisles to home/daily goods, books/stationery, and electronics arrangements.
- The front contains one detailed imported checkout workstation with distinct customer/cashier sides and future bagging/payment space, plus a separate customer-service counter, carts, and two entrance baskets.
- A rear partition provides physical access to a stocked warehouse and a distinct staff room.
- Department signs use the original fictional **Himal Mega Mart** identity with Nepali/Latin-script wayfinding; no real logo or retailer branding is copied.
- Repeated floor, wall, shelf, product, carton, and fixture geometry is instanced. Mobile keeps the existing DPR cap and omits the desktop shadow pass to reduce duplicate draws.
- Only verified repository GLBs are used. Products are deliberately placed at human scale on shelf or table surfaces.

The installed library has no suitable clothing, shoes, personal-care/cosmetics ranges, broad school-stationery range, toys/gifts, luggage, Nepal-specific packaged staples, pallets, or purpose-built warehouse racking. Those departments are not faked with unrelated props or mannequins. Books provide the current books/stationery zone, but dedicated stationery products remain an asset gap.

There is currently **no** inventory, economy, checkout gameplay, customer or employee AI, hiring, salary, supplier, event, mission, XP, level, reputation, unlocking, or campaign system. The store environment is not presented as a completed game.

## Architecture

- `src/game/` owns the renderer, shared scene, camera, input, lifecycle, and reusable GLTF loading.
- `src/world/MegaMartScene.ts` owns the indoor layout, instanced verified assets, original signs, restrained lighting, diagnostics, and collision layout.
- `src/player/PlayerController.ts` owns first-person locomotion and the inside-store spawn.
- `src/systems/CollisionWorld.ts` provides lightweight collision and sliding.
- `src/ui/` contains lightweight DOM diagnostics and mobile controls isolated from the 3D scene.
- `public/assets/` contains the verified source GLBs and textures.
- `src/game/AssetTestScene.ts` remains development reference code and is not loaded during normal play.

See [ASSET_MANIFEST.md](./ASSET_MANIFEST.md) for asset measurements and selection limits, [THIRD_PARTY_ASSETS.md](./THIRD_PARTY_ASSETS.md) for provenance, [GAME_DESIGN.md](./GAME_DESIGN.md) for direction, and [DEVELOPMENT.md](./DEVELOPMENT.md) before broader changes.
