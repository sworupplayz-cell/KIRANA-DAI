# Supermercado Pack — Conversion and Verification Report

- **Import date:** 2026-08-12
- **Status:** 29 FBX inspected; 29 genuinely converted; 0 rejected
- **Runtime integration status:** verified assets only; not added to the Mega Mart scene

## Source archive

- Repository source: `public/assets/Supermercado.zip`
- Original size: 1,832,166 bytes
- SHA-256: `4ed4b74950df528a41f198feff1eea89fb9e61ab71ac88beb03d37bf7f53c44d`
- Git blob: `f5bacd14c5ac034b59837624dd7775a511ff4c06`
- Archive integrity: `unzip -t` passed
- Contents: 29 Autodesk binary FBX files under `Supermercado/`
- Additional files: none; no textures, README, source URL, creator record, or license file were supplied

The original ZIP is retained byte-for-byte and was not edited. FBX extraction and conversion occurred under a temporary working directory; original FBX files were not copied into runtime folders.

## Conversion pipeline

1. `FBX2glTF 0.9.7` performed genuine FBX → binary glTF 2.0 conversion with PBR metallic/roughness material translation and broken-normal repair enabled.
2. `glTF Transform 4.4.2` applied lossless resource deduplication, unused-resource pruning, and bitwise-identical vertex welding.
3. Unused UV attributes, empty leaf nodes, and unused samplers were removed because the pack contains no textures.
4. The unusually dense shopping cart received a conservative, error-bounded simplification: target ratio `0.75`, error limit `0.0005` (0.05% of mesh radius), and locked borders. Visual comparison preserved the cart silhouette, basket lattice, wheels, handle, materials, and normals.
5. Every final GLB passed glTF validation with zero errors and zero warnings.

The exporter reported one empty `Take 001` animation in each FBX. Each contained zero channels and was correctly omitted rather than writing useless animation data.

## Optimization result

| Measurement | Initial converted GLBs | Final GLBs | Change |
|---|---:|---:|---:|
| Combined bytes | 2,308,948 | 1,598,000 | −30.8% |
| Triangles | 66,304 | 59,854 | −9.7% |
| Meshes / primitives | 66 | 66 | preserved |
| Material definitions used | 61 | 61 | preserved; no redundant equivalents found |
| Textures / images | 0 | 0 | none supplied |
| UV-bearing assets | 29 | 0 | unused UV data removed |

Only the shopping cart triangle count changed, from 26,408 to 19,958 triangles. All other models preserve their converted triangle counts. No texture resizing was needed: there are no embedded or external images, so texture resolution is **not applicable**.

## Infrastructure metrics

Dimensions are converted source-space X×Y×Z bounds in metres. The pack's source scale varies by model; integration must use documented per-model uniform placement scales rather than baking guessed real-world dimensions into these files.

| Final repository file | Tris | Meshes / draw calls | Materials | Dimensions (m) | Bytes |
|---|---:|---:|---:|---:|---:|
| `public/assets/supermarket/structure/door.glb` | 972 | 2 | 2 | 0.353×0.379×0.029 | 26,792 |
| `public/assets/supermarket/retail/cashier.glb` | 2,580 | 4 | 4 | 0.518×0.158×0.064 | 88,832 |
| `public/assets/supermarket/retail/shopping-cart.glb` | 19,958 | 5 | 4 | 0.199×0.471×0.375 | 432,500 |
| `public/assets/supermarket/retail/shelf-marker.glb` | 1,476 | 1 | 1 | 0.502×0.381×0.290 | 51,084 |
| `public/assets/supermarket/retail/shelf-marker-2.glb` | 1,692 | 2 | 1 | 0.128×0.062×0.110 | 56,784 |
| `public/assets/supermarket/retail/shelf-marker-3.glb` | 444 | 2 | 2 | 0.055×0.066×0.075 | 17,356 |
| `public/assets/supermarket/retail/shelf-marker-4.glb` | 1,766 | 2 | 2 | 0.558×0.391×0.130 | 59,360 |
| `public/assets/supermarket/refrigeration/freezer.glb` | 4,250 | 3 | 3 | 0.558×0.391×0.102 | 130,572 |
| `public/assets/supermarket/refrigeration/freezer-2.glb` | 3,110 | 3 | 3 | 0.841×0.303×0.735 | 98,812 |

The shopping cart remains the pack's dominant mobile cost. One cart is five draws when cloned normally. If later repeated, it should be limited or batched by primitive with the existing instancing approach; ten visible carts would still process approximately 199,580 cart triangles. `shelf-marker.glb` is the best broad-repeat shelf candidate at one draw and 1,476 triangles. The other shelf variants cost two draws each.

## Product metrics

All product GLBs are under `public/assets/products/supermarket-pack/`.

| Final file | Tris | Meshes / draw calls | Materials | Dimensions (m) | Bytes |
|---|---:|---:|---:|---:|---:|
| `apple.glb` | 338 | 2 | 2 | 0.032×0.035×0.032 | 9,940 |
| `banana.glb` | 516 | 2 | 2 | 0.022×0.018×0.005 | 21,396 |
| `bread.glb` | 852 | 2 | 2 | 0.024×0.024×0.035 | 35,968 |
| `cheese.glb` | 4,194 | 1 | 1 | 0.031×0.025×0.061 | 88,400 |
| `chicken-leg.glb` | 1,328 | 2 | 2 | 0.013×0.028×0.017 | 29,468 |
| `chocolate.glb` | 542 | 2 | 2 | 0.106×0.013×0.052 | 16,024 |
| `coffee.glb` | 808 | 2 | 2 | 0.076×0.162×0.040 | 19,200 |
| `eggs.glb` | 3,876 | 2 | 2 | 0.152×0.052×0.127 | 78,272 |
| `fish.glb` | 236 | 1 | 1 | 0.461×0.186×0.159 | 11,104 |
| `fish-2.glb` | 332 | 3 | 3 | 0.674×0.266×0.307 | 18,788 |
| `grapes.glb` | 1,704 | 2 | 2 | 0.018×0.027×0.026 | 38,400 |
| `ice-cream.glb` | 304 | 2 | 2 | 0.066×0.057×0.066 | 10,852 |
| `juice.glb` | 792 | 3 | 3 | 0.011×0.011×0.023 | 25,676 |
| `lettuce.glb` | 1,248 | 2 | 2 | 0.186×0.118×0.180 | 33,576 |
| `meat.glb` | 2,290 | 2 | 2 | 0.060×0.005×0.040 | 53,360 |
| `milk.glb` | 312 | 3 | 3 | 0.028×0.066×0.027 | 12,420 |
| `pasta.glb` | 1,744 | 2 | 2 | 0.025×0.013×0.136 | 57,972 |
| `soap.glb` | 584 | 1 | 1 | 0.025×0.015×0.044 | 18,532 |
| `toaster.glb` | 1,068 | 4 | 1 | 0.030×0.015×0.014 | 38,356 |
| `tomato.glb` | 538 | 2 | 2 | 0.012×0.016×0.012 | 18,204 |

`cheese.glb` is the most expensive product at 4,194 triangles; `fish.glb` is the least expensive at 236. Products should be introduced selectively and instanced by model where repeated. They are not loaded into the active game scene by this import.

## Runtime verification

`supermarket-assets.html` is an isolated production verification page. It uses the existing `src/game/AssetManager.ts`; no second loading architecture or FBX runtime loader was created.

- The required representative set — cashier, shopping cart, shelf marker, freezer, door, Apple, Bread, and Milk — loaded 8/8 on desktop and 8/8 at 390×844 mobile.
- Additional isolated batches rendered the remaining 21 models. Across the batches, all 29 unique GLB URLs loaded and rendered through `AssetManager` with recognizable geometry, preserved material colors, correct Y-up orientation, intact normals, and no missing textures.
- No batch loads all twenty products simultaneously, and the active Mega Mart scene loads none of this pack.
- Representative desktop verification: 31 calls and 30,834 rendered triangles; approximately 43 FPS under packaged-Chromium software WebGL.
- Representative mobile verification: 29 calls and 29,992 rendered triangles; approximately 53 FPS under the same software renderer; 390×844 CSS viewport with DPR capped to a 585×1266 buffer.
- All-batch production-preview checks produced zero console errors, page errors, failed requests, or failed GLB responses.
- The unchanged active game also passed production smoke tests: 41/41 existing assets, no console/network failures, 135 calls / 95,703 triangles at 1280×800 desktop, and 59 calls / 59,684 triangles at 390×844 mobile.

Software-rendered Chromium FPS is a regression signal, not a physical-phone benchmark.

## License status

**LICENSE VERIFICATION REQUIRED**

The ZIP contains no license, creator, source URL, or README. Embedded FBX metadata did not establish ownership or usage rights, and web searches did not identify a reliable exact source match. The converted assets are technically verified but must not be described as CC0 or promoted for production distribution until provenance and license terms are supplied and recorded in `THIRD_PARTY_ASSETS.md`.
