# Runtime asset directories

The repository currently contains audited GLB assets for the Phase 1 compatibility test. See [`ASSET_MANIFEST.md`](../../ASSET_MANIFEST.md) for exact inventories, sources, licenses, scale notes, complexity, runtime results, and known issues.

- `shop/mini-market/` — Mini Market structure, shelves, and fixtures
- `shop/furniture/` — Furniture Kit
- `products/food-kit/` — the uploaded Food Kit subset
- `characters/male/` and `characters/female/` — animated character packs
- `environment/roads/` — modular roads
- `environment/buildings/` — City Kit Suburban buildings and included extras
- `supermarket/cashier/` — Phase 2B.0 imported checkout counter and cash register
- `supermarket/retail/shopping-basket.glb` — Phase 2B.0 imported entrance basket

The immutable Phase 2B.0 sources remain under `incoming/`; see [`CASHIER_ASSET_IMPORT.md`](../../CASHIER_ASSET_IMPORT.md) for hashes, optimization metrics, validator results, and provenance. Checkout and basket licensing remain **LICENSE VERIFICATION REQUIRED**. Cash-register CC0 evidence is preserved inside its incoming ZIP.

All runtime asset URLs are root-relative and use exact, case-sensitive paths. GLBs reference atlas paths with case-sensitive `Textures/colormap.png`; do not change texture case or location without updating model dependencies. See [`THIRD_PARTY_ASSETS.md`](../../THIRD_PARTY_ASSETS.md) for the local source/license record. Do not add unreviewed marketplace assets.

**No dedicated environment-props pack is installed.** Incidental fences, paths, planter, and trees belong to the Suburban pack.
