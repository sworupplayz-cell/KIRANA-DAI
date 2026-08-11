# Kirana Dai Asset Manifest

**Audit date:** 2026-08-11
**Mega Mart integration verified:** 2026-08-12
**Scope:** Repository compatibility audit plus Phase 2 indoor Mega Mart selection; this is not a final-art approval.

## Audit meaning

- **Runtime verified** means the named asset was loaded through the project's `AssetManager`, rendered in an actual Chromium WebGL 2 session, and visually inspected in the temporary test scene.
- **Static audited** means the GLB 2.0 JSON/chunk structure and metadata were parsed successfully, but the asset was not individually rendered in this phase.
- **Conditional** means the model loaded, but a documented dependency or suitability issue remains.
- Approximate dimensions are the GLB's raw scene-space AABB before the non-destructive test-scene scale factor.
- Primitive count is a useful estimate of draw calls for one model. Runtime draw calls can differ because of frustum culling and renderer-managed objects.

## Repository-wide findings

- 393 GLB files (41,218,724 bytes) parsed as valid GLB 2.0 containers with no structural parse failures.
- 406 files / approximately 41 MiB exist under `public/assets/` when textures, marker files, documentation, and three stray one-byte files are included.
- Generators recorded in GLB metadata: 232 `UnityGLTF`, 140 `UniGLTF-1.24`, and 21 `FBX2glTF v0.9.7`.
- No GLB contains copyright or license metadata. Source/license records below therefore rely on matching official pack names, exact model names, and pack counts.
- Three 512×512 PNG color atlases are supplied. Their case/path did not initially match the GLBs' exact `Textures/colormap.png` URI; their repository paths were corrected without editing model data.
- The roads upload did not contain its own atlas. Phase 1 reuses the existing CC0 City Kit (Suburban) atlas as a provisional compatibility fallback because the two City Kit packs share the same palette-atlas layout. The original City Kit (Roads) atlas is still not present and should be restored from the approved source before final environment work.
- All geometry uses manageable low-poly complexity. The animated character files dominate file size, material count, draw calls, and animation data.
- Phase 1.1 migrated the accidental `public/assets/environment/ buildings/` directory to the clean, case-correct `public/assets/environment/buildings/` path. Production requests no longer require an encoded leading space.

## Source and license check

No local pack license files were uploaded. The local filenames and counts match these published packs, whose official source pages document CC0 licensing:

| Local category | Matched source pack | License status | Source |
|---|---|---|---|
| Mini Market | Kenney Mini Market (20 assets) | **CC0 verified at source** | https://kenney.nl/assets/mini-market |
| Furniture | Kenney Furniture Kit (140 assets) | **CC0 verified at source** | https://kenney.nl/assets/furniture-kit |
| Products | Kenney Food Kit (local upload is a 100-model subset) | **CC0 verified at source** | https://kenney.nl/assets/food-kit |
| Roads | Kenney City Kit (Roads); local 72-GLB conversion matches the published conversion inventory | **CC0 source verified**; original atlas missing locally | https://kenney.nl/assets/city-kit-roads |
| Buildings | Kenney City Kit (Suburban) | **CC0 verified at source** | https://kenney.nl/assets/city-kit-suburban |
| Male characters | Quaternius Ultimate Modular Men Pack (11 models, 24 animations each) | **CC0 verified at source** | https://quaternius.com/packs/ultimatemodularcharacters.html |
| Female characters | Quaternius Ultimate Modular Women Pack (10 models, 24 animations each) | **CC0 verified at source** | https://quaternius.com/packs/ultimatemodularwomen.html |

The duplicate-looking `Animated Woman-nIItLV9nxS.glb` has a download-style suffix not documented by the official pack. It is marked **LICENSE NEEDS VERIFICATION** and should not be selected while the canonical `Animated Woman.glb` is available.

## Pack summary

| Category | GLBs | Approx. GLB size | Total triangles (all files) | Highest-complexity file | Status |
|---|---:|---:|---:|---|---|
| Mini Market | 20 | 0.74 MiB | 5,893 | `shelf-bags.glb` — 892 tris | Low-poly; representative set runtime verified |
| Furniture | 140 | 1.87 MiB | 26,737 | `washerDryerStacked.glb` — 992 tris | Low-poly; representative set runtime verified |
| Products / Food Kit | 100 | 1.54 MiB | 15,955 | `cake-birthday.glb` — 1,146 tris | Low-poly; eight grocery candidates runtime verified |
| Male characters | 11 | 16.66 MiB | 81,014 | `King.glb` — 11,100 tris | Animated; one suitable character runtime verified |
| Female characters | 10 | 14.97 MiB | 67,975 | `Sci Fi Character.glb` — 8,037 tris | Animated; one suitable character runtime verified |
| Roads | 72 | 1.05 MiB | 12,662 | `road-roundabout.glb` — 1,636 tris | Geometry works; original atlas missing, fallback conditional |
| Buildings / suburban extras | 40 | 2.49 MiB | 30,035 | `building-type-t.glb` — 2,062 tris | Two buildings runtime verified |

## Runtime-tested representative set

The temporary scene contains 26 placements representing 25 unique GLBs. `shelf-boxes.glb` is deliberately instantiated twice to verify request caching and skeleton-safe cloning. Network inspection recorded one GLB request for the two shelf instances.

| Asset | Raw dimensions (X×Y×Z) | Tris | Primitives | Materials | Texture/animation | Compatibility |
|---|---:|---:|---:|---:|---|---|
| `shop/mini-market/wall.glb` | 1.000×1.000×0.600 | 32 | 1 | 1 | External 512² atlas | Runtime verified; scale 2 in gallery |
| `shop/mini-market/wall-corner.glb` | 0.800×1.000×0.800 | 66 | 1 | 1 | External 512² atlas | Runtime verified; aligns visually with wall |
| `shop/mini-market/floor.glb` | 1.000×0.025×1.000 | 24 | 1 | 1 | External 512² atlas | Runtime verified |
| `shop/mini-market/shelf-boxes.glb` | 0.800×0.850×0.700 | 436 | 11 | 1 | External 512² atlas | Runtime verified twice; no clipping/broken geometry observed |
| `shop/mini-market/cash-register.glb` | 0.850×0.595×0.850 | 203 | 1 | 1 | External 512² atlas | Runtime verified; requires its own smaller scale on Furniture Kit counter |
| `shop/furniture/bookcaseOpen.glb` | 0.400×0.880×0.250 | 320 | 1 | 1 | Material colors, unlit | Runtime verified; useful empty shelving candidate |
| `shop/furniture/kitchenBar.glb` | 0.430×0.420×0.210 | 76 | 3 | 3 | Material colors, unlit | Runtime verified as counter candidate |
| `shop/furniture/table.glb` | 0.841×0.327×0.447 | 120 | 1 | 1 | Material colors, unlit | Runtime verified; supports product test arrangement |
| `shop/furniture/chair.glb` | 0.200×0.470×0.200 | 170 | 1 | 1 | Material colors, unlit | Runtime verified |
| `shop/furniture/cardboardBoxClosed.glb` | 0.212×0.281×0.212 | 60 | 2 | 2 | Material colors, unlit | Runtime verified |
| `products/food-kit/can.glb` | 0.300×0.320×0.300 | 156 | 1 | 1 | External 512² atlas | Runtime verified |
| `products/food-kit/can-small.glb` | 0.300×0.161×0.300 | 154 | 2 | 1 | External 512² atlas | Runtime verified |
| `products/food-kit/carton.glb` | 0.230×0.591×0.230 | 94 | 1 | 1 | External 512² atlas | Runtime verified |
| `products/food-kit/bottle-oil.glb` | 0.140×0.622×0.140 | 96 | 1 | 1 | External 512² atlas | Runtime verified |
| `products/food-kit/bottle-ketchup.glb` | 0.144×0.393×0.166 | 96 | 1 | 1 | External 512² atlas | Runtime verified |
| `products/food-kit/candy-bar.glb` | 0.292×0.065×0.075 | 72 | 1 | 1 | External 512² atlas | Runtime verified |
| `products/food-kit/chocolate.glb` | 0.292×0.034×0.146 | 140 | 1 | 1 | External 512² atlas | Runtime verified |
| `products/food-kit/honey.glb` | 0.326×0.316×0.326 | 140 | 1 | 1 | External 512² atlas | Runtime verified |
| `characters/male/Casual Character.glb` | 1.675×1.858×0.455 | 5,776 | 10 | 9 | Material colors; 24 clips | Runtime verified: 62-joint skins, Idle and Walk work |
| `characters/female/Animated Woman.glb` | 1.650×1.852×0.370 | 6,424 | 9 | 7 | Material colors; 24 clips | Runtime verified: 62-joint skins, Idle and Walk work |
| `environment/roads/road-straight.glb` | 1.000×0.020×1.000 | 44 | 1 | 1 | Provisional shared 512² atlas | Runtime verified conditionally |
| `environment/roads/road-bend-sidewalk.glb` | 1.000×0.020×1.000 | 220 | 1 | 1 | Provisional shared 512² atlas | Runtime verified conditionally; edge aligns at common scale |
| `environment/roads/road-crossroad.glb` | 1.000×0.020×1.000 | 116 | 1 | 1 | Provisional shared 512² atlas | Runtime verified conditionally; edge aligns at common scale |
| `environment/buildings/building-type-a.glb` | 1.300×0.834×1.028 | 1,174 | 1 | 1 | External 512² atlas | Runtime verified; compatible with road scale |
| `environment/buildings/building-type-h.glb` | 1.300×0.737×0.916 | 770 | 1 | 1 | External 512² atlas | Runtime verified; compatible with road scale |

## SHOP

### Mini Market pack

The uploaded Mini Market pack contains all 20 named GLBs and one 512×512 color atlas. The test found correct geometry, normals, atlas colors, and upright Y-up orientation after fixing the atlas directory's case. Raw pack units are intentionally miniature; a scale near 2 was required beside 1.85 m characters. `shelf-boxes.glb` includes its boxes as eleven separate meshes/primitives, so an empty shelf asset would be preferable for a scalable stocking system if one is later supplied.

### Furniture pack

The Furniture Kit contains 140 GLBs. It has no texture dependency; its one or more material colors use `KHR_materials_unlit`. Tested furniture was visually intact and grounded. A consistent scale around 2 made the tested table/chair/bookcase reasonable beside the character pack. The pack is broad, but only shop-relevant furniture should enter the first playable scene.

## PRODUCTS

The uploaded Food Kit is a 100-model subset ending at `leek.glb`, not the full current 200-model pack. All models reference `Textures/colormap.png`; the supplied atlas was one directory too high and had lowercase `textures`, which was corrected. The eight runtime-tested grocery candidates rendered with the atlas, remained upright, and were placed on the real table asset without visible clipping. A scale factor of 0.4 produced plausible shelf/table sizes. Their shapes are generic stylized food rather than Nepal-specific branded products.

## MALE CHARACTERS

`Casual Character.glb` was selected because its clothing is more suitable for a shop/customer test than the fantasy, tactical, or occupational alternatives. It contains four skinned meshes, ten primitives, nine materials, four skins sharing a 62-joint rig, and 24 animation clips. The exact `CharacterArmature|Idle` (1.667 s) and `CharacterArmature|Walk` (1.333 s) clips were run through `AnimationMixer` and alternated every four seconds. Both were visually observed changing pose without broken joints or obvious deformation. The computed rest bounds place the feet within roughly 0.002 units of Y=0; runtime grounding aligned them to the floor. No image texture is used; appearance comes from PBR material colors.

## FEMALE CHARACTERS

`Animated Woman.glb` was selected as the most neutral tested candidate. It contains four skinned meshes, nine primitives, seven materials, four skins sharing a 62-joint rig, and 24 clips. `CharacterArmature|Idle` (2.083 s) and `CharacterArmature|Walk` (1.667 s) both ran through `AnimationMixer` and were visually observed without broken joints or obvious deformation. Runtime grounding corrected the raw minimum Y of approximately -0.009. No image texture is used; appearance comes from PBR material colors.

## ROADS

The 72 road GLBs are modular 1×1 source tiles. `road-straight`, `road-bend-sidewalk`, and `road-crossroad` were placed at the same scale with edge centers exactly one scaled tile apart; their geometry aligned. Materials and atlas colors rendered after provisionally sharing the compatible City Kit (Suburban) palette. This does **not** replace the missing original road atlas in the source audit. Roads remain conditional until the intended approved atlas is supplied or the shared-atlas choice is explicitly accepted.

## BUILDINGS

`building-type-a` and `building-type-h` loaded upright, grounded, and textured from the corrected `environment/buildings/` path. At the same 3.5 test scale as the road tiles, their footprints and stylized proportions were visually compatible with the roads. The pack is low-poly (the most complex uploaded building is 2,062 triangles).

The same uploaded Suburban pack also includes driveways, fences, paths, a planter, and two trees. These are pack extras, not a dedicated environment-props pack.

## RECOMMENDED FOR THE INDOOR MEGA MART

The Phase 2 environment selects measured, category-appropriate assets rather than loading whole packs:

- Structure: instanced `mini-market/floor.glb`, `wall.glb`, and `wall-corner.glb`.
- Long aisles and warehouse: instanced `furniture/bookcaseOpen.glb`; low home/book islands use `bookcaseOpenLow.glb`.
- Cold/fresh fixtures: `freezer.glb`, `freezers-standing.glb`, `display-fruit.glb`, and `display-bread.glb`.
- Front of store: restrained quantities of `kitchenBar.glb`, `cash-register.glb`, carts, and baskets.
- Grocery and snacks: generic Food Kit bags, cans, cartons, oil, honey, sauce, candy, chocolate, cookies, bread, and tea cups.
- Home and electronics: measured Furniture/Food Kit appliances, cutting boards, knife blocks, tables, laptop, screen, radio, and speakers.
- Books: `books.glb` on dedicated shelves and low displays. Dedicated stationery products are not installed.
- Back of store: open/closed cartons, reused open shelving, and appropriate staff desk/chair/screen/bin furniture.

`mini-market/shelf-boxes.glb`, `shelf-bags.glb`, and `shelf-end.glb` are not used for long repeated aisles because they cost approximately 11, 9, and 8 primitives per fixture. Animated characters are also omitted: no customer or employee system belongs to this milestone.

## MISSING STORE CATEGORIES

No suitable verified range is installed for clothing, shoes, personal care, cosmetics, broad school stationery/notebooks, toys/gifts, luggage, Nepal-specific packaged staples or branding, warehouse pallets, purpose-built warehouse racking, or dedicated supermarket ceiling/wayfinding fixtures. The environment does not represent these with unrelated props, generated substitutes, or placeholder mannequins.

## FUTURE / OPTIONAL ASSET WORK

- Acquire and audit appropriate missing department stock only under a separately approved asset scope.
- Add Nepal-specific generic packaging only with clear provenance and original fictional branding.
- Replace reused bookcases in the warehouse if audited pallet/rack assets become available.
- Keep road, building, suburban prop, and character packs out of the active indoor milestone unless a later feature specifically requires them.

## REJECTED / PROBLEMATIC

- `public/assets/products/food-kit/ee`, `public/assets/shop/furniture/ee`, and `public/assets/shop/mini-market/ee`: one byte each, not assets; reject.
- `characters/female/Animated Woman-nIItLV9nxS.glb`: likely a duplicate/download variant; **LICENSE NEEDS VERIFICATION** and redundant while the canonical file exists.
- All road GLBs: original `Textures/colormap.png` was not included. Geometry is usable, but final material approval is blocked; the current shared Suburban atlas is explicitly provisional.
- Repeating many character instances without batching/LOD: each tested character costs 9–10 draw calls, 7–9 materials, four skinned meshes, a 62-joint rig, and a 1.4–1.5 MiB download. This is inappropriate for a large mobile crowd without a later optimization plan.
- Repeating `shelf-boxes.glb` at scale: eleven meshes/draw calls per shelf and baked-in box contents reduce stocking flexibility. Suitable for a small test, not yet approved for hundreds of dynamic shelves.

## Mobile performance observation

The Phase 1.1 desktop baseline rendered 70 draw calls and 17,429 triangles for the representative scene; the asset-only traversal counted 67 meshes, 56 unique geometries, 42 unique material objects, 18 runtime texture objects, and 17,415 triangles. Two `AnimationMixer` instances were active. The duplicate shelf shares its cached source, but each separately loaded textured GLB creates its own texture object even when several resolve to the same atlas URL. A 390×844 mobile emulation at device DPR 3 correctly capped the backing buffer to 585×1266 (DPR 1.5) and displayed the touch joystick.

The cleanup preview observed approximately 13 FPS at 1280×800 and 12 FPS at 390×844. Earlier Phase 1 observations varied between 10 and 15 FPS. These FPS values are **not representative of phone hardware** because Chromium used SwiftShader software WebGL and screenshot readbacks caused explicit GPU-stall warnings. The production-preview smoke test produced no console errors, page errors, or failed requests. Draw-call/material pressure from characters is the main concern; triangle count and 512² atlas sizes are modest.

## Environment props status

**No environment-props pack is currently installed.**

The incidental fences, paths, planter, and trees belong to City Kit (Suburban); they do not constitute a dedicated environment-props pack and are not loaded by the indoor world. No new third-party or generated 3D prop assets were added. The ceiling, rear partitions, circulation markers, light panels, and original wayfinding signs are lightweight code-owned environmental elements.

## Phase 2 Mega Mart integration

The active Phase 2 world is one approximately 24×30 m indoor Mega Mart. It replaces the old 8×6 m kirana shell, road tile, neighboring building, planter, and tree. The normal runtime loads no road, suburban-building, exterior-prop, or character GLBs.

The plan uses a wide central spine and three cross aisles rather than one undivided room. Grocery and drinks/snacks use long back-to-back shelf runs; home/daily uses lower islands; books/stationery combines low displays and a wall run; electronics uses separated display tables. The front has four checkout lanes, customer service, carts, and baskets. A rear partition has separate, traversable warehouse and staff openings. Fictional **Himal Mega Mart** signs use original Nepali/Latin-script labels and share one canvas atlas.

All broad repeats use `InstancedMesh`. The integrated model set includes modular floor/wall pieces, scalable one-primitive bookcases, Food Kit shelf facings, restrained Mini Market fixtures, home/electronics displays, books, and deliberately grounded cartons. Mobile preserves the 1.5 DPR cap and disables the duplicate desktop shadow pass while keeping the same lighting/material design.

Collision uses a 0.28 m player circle against named XZ rectangles and indoor bounds. The layout protects the central spine, department approach aisles, checkout gaps, warehouse opening, and staff doorway while blocking walls, shelf runs, counters, cold fixtures, warehouse racks/cartons, and staff furniture. The spawn is inside at `(0, 0, 13.1)` with a 1.64 m camera eye height.

The final production build loaded all **41/41 selected GLB URLs** with no asset failures. Scene traversal counted **641 model placements**, **89 renderable mesh objects**, **89 geometries**, **66 material objects**, **26 runtime texture objects**, **65,356 authored triangles**, zero animation mixers, and 47 colliders. The high placement-to-mesh ratio comes from instanced floor, walls, shelf bays, shelf stock, cartons, counters, and repeated fixtures.

At the initial 1280×800 desktop view, production diagnostics sampled up to **135 calls / 95,703 rendered triangles** with the single desktop shadow pass. At approximately 390×844 mobile emulation, the backing buffer was correctly capped at **585×1266** (DPR 1.5) and sampled **59 calls / 59,684 rendered triangles** without the optional shadow pass. Packaged Chromium reported approximately 20–22 FPS under software WebGL; this is a smoke-test signal, not a physical-phone benchmark. Desktop and mobile runs had no console errors, page errors, failed asset requests, or missing textures.

## Complete uploaded GLB inventory

### Mini Market (20 GLB)
- `bottle-return.glb`, `cash-register.glb`, `character-employee.glb`, `column.glb`, `display-bread.glb`, `display-fruit.glb`, `fence-door-rotate.glb`, `fence.glb`
- `floor.glb`, `freezer.glb`, `freezers-standing.glb`, `shelf-bags.glb`, `shelf-boxes.glb`, `shelf-end.glb`, `shopping-basket.glb`, `shopping-cart.glb`
- `wall-corner.glb`, `wall-door-rotate.glb`, `wall-window.glb`, `wall.glb`

### Furniture (140 GLB)
- `bathroomCabinet.glb`, `bathroomCabinetDrawer.glb`, `bathroomMirror.glb`, `bathroomSink.glb`, `bathroomSinkSquare.glb`, `bathtub.glb`, `bear.glb`, `bedBunk.glb`
- `bedDouble.glb`, `bedSingle.glb`, `bench.glb`, `benchCushion.glb`, `benchCushionLow.glb`, `bookcaseClosed.glb`, `bookcaseClosedDoors.glb`, `bookcaseClosedWide.glb`
- `bookcaseOpen.glb`, `bookcaseOpenLow.glb`, `books.glb`, `cabinetBed.glb`, `cabinetBedDrawer.glb`, `cabinetBedDrawerTable.glb`, `cabinetTelevision.glb`, `cabinetTelevisionDoors.glb`
- `cardboardBoxClosed.glb`, `cardboardBoxOpen.glb`, `ceilingFan.glb`, `chair.glb`, `chairCushion.glb`, `chairDesk.glb`, `chairModernCushion.glb`, `chairModernFrameCushion.glb`
- `chairRounded.glb`, `coatRack.glb`, `coatRackStanding.glb`, `computerKeyboard.glb`, `computerMouse.glb`, `computerScreen.glb`, `desk.glb`, `deskCorner.glb`
- `doorway.glb`, `doorwayFront.glb`, `doorwayOpen.glb`, `dryer.glb`, `floorCorner.glb`, `floorCornerRound.glb`, `floorFull.glb`, `floorHalf.glb`
- `hoodLarge.glb`, `hoodModern.glb`, `kitchenBar.glb`, `kitchenBarEnd.glb`, `kitchenBlender.glb`, `kitchenCabinet.glb`, `kitchenCabinetCornerInner.glb`, `kitchenCabinetCornerRound.glb`
- `kitchenCabinetDrawer.glb`, `kitchenCabinetUpper.glb`, `kitchenCabinetUpperCorner.glb`, `kitchenCabinetUpperDouble.glb`, `kitchenCabinetUpperLow.glb`, `kitchenCoffeeMachine.glb`, `kitchenFridge.glb`, `kitchenFridgeBuiltIn.glb`
- `kitchenFridgeLarge.glb`, `kitchenFridgeSmall.glb`, `kitchenMicrowave.glb`, `kitchenSink.glb`, `kitchenStove.glb`, `kitchenStoveElectric.glb`, `lampRoundFloor.glb`, `lampRoundTable.glb`
- `lampSquareCeiling.glb`, `lampSquareFloor.glb`, `lampSquareTable.glb`, `lampWall.glb`, `laptop.glb`, `loungeChair.glb`, `loungeChairRelax.glb`, `loungeDesignChair.glb`
- `loungeDesignSofa.glb`, `loungeDesignSofaCorner.glb`, `loungeSofa.glb`, `loungeSofaCorner.glb`, `loungeSofaLong.glb`, `loungeSofaOttoman.glb`, `paneling.glb`, `pillow.glb`
- `pillowBlue.glb`, `pillowBlueLong.glb`, `pillowLong.glb`, `plantSmall1.glb`, `plantSmall2.glb`, `plantSmall3.glb`, `pottedPlant.glb`, `radio.glb`
- `rugDoormat.glb`, `rugRectangle.glb`, `rugRound.glb`, `rugRounded.glb`, `rugSquare.glb`, `shower.glb`, `showerRound.glb`, `sideTable.glb`
- `sideTableDrawers.glb`, `speaker.glb`, `speakerSmall.glb`, `stairs.glb`, `stairsCorner.glb`, `stairsOpen.glb`, `stairsOpenSingle.glb`, `stoolBar.glb`
- `stoolBarSquare.glb`, `table.glb`, `tableCloth.glb`, `tableCoffee.glb`, `tableCoffeeGlass.glb`, `tableCoffeeGlassSquare.glb`, `tableCoffeeSquare.glb`, `tableCross.glb`
- `tableCrossCloth.glb`, `tableGlass.glb`, `tableRound.glb`, `televisionAntenna.glb`, `televisionModern.glb`, `televisionVintage.glb`, `toaster.glb`, `toilet.glb`
- `toiletSquare.glb`, `trashcan.glb`, `wall.glb`, `wallCorner.glb`, `wallCornerRond.glb`, `wallDoorway.glb`, `wallDoorwayWide.glb`, `wallHalf.glb`
- `wallWindow.glb`, `wallWindowSlide.glb`, `washer.glb`, `washerDryerStacked.glb`

### Products / Food Kit (100 GLB)
- `advocado-half.glb`, `apple-half.glb`, `apple.glb`, `avocado.glb`, `bacon-raw.glb`, `bacon.glb`, `bag-flat.glb`, `bag.glb`
- `banana.glb`, `barrel.glb`, `beet.glb`, `bottle-ketchup.glb`, `bottle-musterd.glb`, `bottle-oil.glb`, `bowl-broth.glb`, `bowl-cereal.glb`
- `bowl-soup.glb`, `bowl.glb`, `bread.glb`, `broccoli.glb`, `burger-cheese-double.glb`, `burger-cheese.glb`, `burger-double.glb`, `burger.glb`
- `cabbage.glb`, `cake-birthday.glb`, `cake-slicer.glb`, `cake.glb`, `can-open.glb`, `can-small.glb`, `can.glb`, `candy-bar-wrapper.glb`
- `candy-bar.glb`, `carrot.glb`, `carton-small.glb`, `carton.glb`, `cauliflower.glb`, `celery-stick.glb`, `cheese-cut.glb`, `cheese-slicer.glb`
- `cheese.glb`, `cherries.glb`, `chinese.glb`, `chocolate-wrapper.glb`, `chocolate.glb`, `chopstic-decorative.glb`, `chopstick.glb`, `cocktail.glb`
- `coconut-half.glb`, `coconut.glb`, `cookie-chocolate.glb`, `cookie.glb`, `cooking-fork.glb`, `cooking-knife-chopping.glb`, `cooking-knife.glb`, `cooking-spatula.glb`
- `cooking-spoon.glb`, `corn-dog.glb`, `corn.glb`, `croissant.glb`, `cup-coffee.glb`, `cup-saucer.glb`, `cup-tea.glb`, `cup.glb`
- `cupcake.glb`, `cutting-board-japanese.glb`, `cutting-board-round.glb`, `cutting-board.glb`, `dim-sum.glb`, `donut-chocolate.glb`, `donut-sprinkles.glb`, `donut.glb`
- `egg-cooked.glb`, `egg-cup.glb`, `egg-half.glb`, `egg.glb`, `eggplant.glb`, `fish-bones.glb`, `fish.glb`, `frappe.glb`
- `fries-empty.glb`, `fries.glb`, `frikandel-speciaal.glb`, `frying-pan-lid.glb`, `frying-pan.glb`, `ginger-bread-cutter.glb`, `ginger-bread.glb`, `glass-wine.glb`
- `glass.glb`, `grapes.glb`, `honey.glb`, `hot-dog-raw.glb`, `hot-dog.glb`, `ice-cream-cne.glb`, `ice-cream-cup.glb`, `ice-cream-scoop-chocolate.glb`
- `ice-cream-scoop-mint.glb`, `ice-cream.glb`, `knife-block.glb`, `leek.glb`

### Male characters (11 GLB)
- `Adventurer.glb`, `Astronaut.glb`, `Beach Character.glb`, `Business Man.glb`, `Casual Character.glb`, `Farmer.glb`, `Hoodie Character.glb`, `King.glb`
- `Punk.glb`, `Swat.glb`, `Worker.glb`

### Female characters (10 GLB)
- `Adventurer.glb`, `Animated Woman-nIItLV9nxS.glb`, `Animated Woman.glb`, `Medieval.glb`, `Punk.glb`, `Sci Fi Character.glb`, `Soldier.glb`, `Suit.glb`
- `Witch.glb`, `Worker.glb`

### Roads (72 GLB)
- `bridge-pillar-wide.glb`, `bridge-pillar.glb`, `construction-barrier.glb`, `construction-cone.glb`, `construction-light.glb`, `light-curved-cross.glb`, `light-curved-double.glb`, `light-curved.glb`
- `light-square-cross.glb`, `light-square-double.glb`, `light-square.glb`, `road-bend-barrier.glb`, `road-bend-sidewalk.glb`, `road-bend-square-barrier.glb`, `road-bend-square.glb`, `road-bend.glb`
- `road-bridge.glb`, `road-crossing.glb`, `road-crossroad-barrier.glb`, `road-crossroad-line.glb`, `road-crossroad-path.glb`, `road-crossroad.glb`, `road-curve-barrier.glb`, `road-curve-intersection-barrier.glb`
- `road-curve-intersection.glb`, `road-curve-pavement.glb`, `road-curve.glb`, `road-driveway-double-barrier.glb`, `road-driveway-double.glb`, `road-driveway-single-barrier.glb`, `road-driveway-single.glb`, `road-end-barrier.glb`
- `road-end-round-barrier.glb`, `road-end-round.glb`, `road-end.glb`, `road-intersection-barrier.glb`, `road-intersection-line.glb`, `road-intersection-path.glb`, `road-intersection.glb`, `road-roundabout-barrier.glb`
- `road-roundabout.glb`, `road-side-barrier.glb`, `road-side-entry-barrier.glb`, `road-side-entry.glb`, `road-side-exit-barrier.glb`, `road-side-exit.glb`, `road-side.glb`, `road-slant-barrier.glb`
- `road-slant-curve-barrier.glb`, `road-slant-curve.glb`, `road-slant-flat-curve.glb`, `road-slant-flat-high.glb`, `road-slant-flat.glb`, `road-slant-high-barrier.glb`, `road-slant-high.glb`, `road-slant.glb`
- `road-split-barrier.glb`, `road-split.glb`, `road-square-barrier.glb`, `road-square.glb`, `road-straight-barrier-end.glb`, `road-straight-barrier-half.glb`, `road-straight-barrier.glb`, `road-straight-half.glb`
- `road-straight.glb`, `sign-highway-detailed.glb`, `sign-highway-wide.glb`, `sign-highway.glb`, `tile-high.glb`, `tile-low.glb`, `tile-slant.glb`, `tile-slantHigh.glb`

### Buildings (40 GLB)
- `building-type-a.glb`, `building-type-b.glb`, `building-type-c.glb`, `building-type-d.glb`, `building-type-e.glb`, `building-type-f.glb`, `building-type-g.glb`, `building-type-h.glb`
- `building-type-i.glb`, `building-type-j.glb`, `building-type-k.glb`, `building-type-l.glb`, `building-type-m.glb`, `building-type-n.glb`, `building-type-o.glb`, `building-type-p.glb`
- `building-type-q.glb`, `building-type-r.glb`, `building-type-s.glb`, `building-type-t.glb`, `building-type-u.glb`, `driveway-long.glb`, `driveway-short.glb`, `fence-1x2.glb`
- `fence-1x3.glb`, `fence-1x4.glb`, `fence-2x2.glb`, `fence-2x3.glb`, `fence-3x2.glb`, `fence-3x3.glb`, `fence-low.glb`, `fence.glb`
- `path-long.glb`, `path-short.glb`, `path-stones-long.glb`, `path-stones-messy.glb`, `path-stones-short.glb`, `planter.glb`, `tree-large.glb`, `tree-small.glb`
