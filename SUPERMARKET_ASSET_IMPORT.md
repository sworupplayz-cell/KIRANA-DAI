# Supermercado Pack — Import Audit

Status: **audited; conversion/import pending**

Source archive supplied for this task: `Supermercado(2).zip`

The archive contains 29 FBX models and no separate texture files:

## Supermarket infrastructure

- `cashier.fbx` → `supermarket/retail/cashier.glb`
- `ShopingCar.fbx` → `supermarket/retail/shopping-cart.glb`
- `shelfMarker.fbx` → `supermarket/retail/shelf-marker.glb`
- `shelfMarker2.fbx` → `supermarket/retail/shelf-marker-2.glb`
- `shelfMarker3.fbx` → `supermarket/retail/shelf-marker-3.glb`
- `shelfMarker4.fbx` → `supermarket/retail/shelf-marker-4.glb`
- `Door.fbx` → `supermarket/structure/door.glb`
- `Frezer.fbx` → `supermarket/refrigeration/freezer.glb`
- `Frezer2.fbx` → `supermarket/refrigeration/freezer-2.glb`

## Product models

The following are candidates for `products/supermarket-pack/`:

`Apple.fbx`, `banana.fbx`, `Bread.fbx`, `cheese.fbx`, `ChickenLeg.fbx`, `chocolate.fbx`, `coffee.fbx`, `Eggs.fbx`, `fish.fbx`, `fish2.fbx`, `grapes.fbx`, `IceCream.fbx`, `Juice.fbx`, `lettuce.fbx`, `meat.fbx`, `Milk.fbx`, `Pasta.fbx`, `Soap.fbx`, `toaster.fbx`, `tomate.fbx`.

## Important compatibility finding

The supplied files are **binary FBX**, not GLB/glTF. They contain embedded FBX material definitions, but the archive contains no separate image/texture files. The existing game runtime intentionally loads GLB/GLTF through `AssetManager.ts`; therefore the FBX files must be converted and visually verified before becoming runtime assets.

Do not put the original FBX files into the production runtime asset folders.

## Performance policy

- Do not import every product into the main scene.
- Reuse converted shelf, freezer, cashier, and cart resources.
- Use the existing `AssetManager` cache.
- Measure triangles, meshes, materials, and draw calls after conversion.
- Do not replace the existing Kenney Food Kit until the new product models have been verified.

## Required next conversion tests

Convert and test these first:

1. `cashier.fbx`
2. `ShopingCar.fbx`
3. `Frezer.fbx`
4. `shelfMarker.fbx`
5. `Door.fbx`
6. `Apple.fbx`
7. `Bread.fbx`
8. `Milk.fbx`

Only after those eight render correctly in the existing Three.js pipeline should the remaining models be converted.

## Current repository rule

No Mega Mart environment should be built as part of this audit. The asset foundation must be verified first.
