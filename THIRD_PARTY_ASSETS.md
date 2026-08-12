# Third-Party Asset Sources and Licenses

**Record verified:** 2026-08-12

**Purpose:** Local provenance record for the assets currently under `public/assets/`. This document is separate from gameplay code and does not approve unlisted future assets.

## License standard

The source packs below were matched using their pack names, model filenames, pack counts, and published creator pages. Their official creator pages identify them as Creative Commons CC0 assets. CC0 license reference: https://creativecommons.org/publicdomain/zero/1.0/

Most legacy uploaded GLBs do not embed copyright/license metadata, and their original archive license files were not included. The Phase 2B.0 register ZIP is the documented exception and retains its CC0 source notes. Preserve this record, included evidence, and source URLs with future distributions.

| Local files | Creator and source pack | Recorded license | Verified source |
|---|---|---|---|
| `public/assets/shop/mini-market/` | Kenney — Mini Market | CC0 | https://kenney.nl/assets/mini-market |
| `public/assets/shop/furniture/` | Kenney — Furniture Kit | CC0 | https://kenney.nl/assets/furniture-kit |
| `public/assets/products/food-kit/` | Kenney — Food Kit; repository contains a 100-model subset | CC0 | https://kenney.nl/assets/food-kit |
| `public/assets/environment/roads/` | Kenney — City Kit (Roads); local GLB conversion contains 72 files | CC0 source verified | https://kenney.nl/assets/city-kit-roads |
| `public/assets/environment/buildings/` | Kenney — City Kit (Suburban) | CC0 | https://kenney.nl/assets/city-kit-suburban |
| `public/assets/characters/male/` | Quaternius — Ultimate Modular Men Pack | CC0 | https://quaternius.com/packs/ultimatemodularcharacters.html |
| `public/assets/characters/female/` | Quaternius — Ultimate Modular Women Pack | CC0 | https://quaternius.com/packs/ultimatemodularwomen.html |
| `public/assets/Supermercado.zip`, `public/assets/supermarket/`, and `public/assets/products/supermarket-pack/` | User-supplied Supermercado pack; creator and original source not identified | **LICENSE VERIFICATION REQUIRED** | No source or license file was included |
| `public/assets/incoming/Checkout+Counter.fbx`, `public/assets/supermarket/cashier/checkout-counter.glb` | Incoming checkout source; embedded path mentions CGTrader but no creator/license evidence is included | **LICENSE VERIFICATION REQUIRED** | No verifiable source/license record supplied |
| `public/assets/incoming/cash_register_01_free_cc0_glb_v1.zip`, `public/assets/supermarket/cashier/cash-register.glb` | Poly Haven “Cash Register 01” by Joe Seabuhr; source notes retained inside the immutable ZIP | **CC0 evidence included with source** | https://polyhaven.com/a/CashRegister_01 |
| `public/assets/incoming/dezyne_3d-shopping-basket-431.glb`, `public/assets/supermarket/retail/shopping-basket.glb` | Incoming Dezyne 3D shopping-basket source; no creator/license evidence is included | **LICENSE VERIFICATION REQUIRED** | No verifiable source/license record supplied |

## Phase 2B.0 cashier import provenance

The three incoming source files remain unchanged under `public/assets/incoming/`. Their technical derivatives are the single checkout/register runtime files under `public/assets/supermarket/cashier/` and the single basket runtime file under `public/assets/supermarket/retail/`.

The cash-register ZIP contains both `cash_register_01_cc0_clip_ready_v1.glb` and `README_CC0_SOURCE.md`. That included record names Poly Haven, asset author Joe Seabuhr, the source URL above, and CC0. The ZIP itself remains the preserved license evidence; only the required model was extracted outside the repository for optimization.

The checkout FBX contains no embedded author or license and only an original local metadata path (`G:\CGTrader\Checkout-kaspian\Checkout Counter.fbx`). A local path does not establish provenance. The basket GLB has no license metadata or accompanying evidence. Both therefore remain **LICENSE VERIFICATION REQUIRED**, and conversion does not alter that status. See `CASHIER_ASSET_IMPORT.md` for exact hashes, inspection, conversion, validation, and runtime results.

## Supermercado conversion provenance

The repository archive `public/assets/Supermercado.zip` contains 29 binary FBX files and no textures, README, author record, source URL, or license document. Embedded FBX metadata does not establish ownership or usage rights, and no reliable exact source match was identified. The archive's SHA-256 is `4ed4b74950df528a41f198feff1eea89fb9e61ab71ac88beb03d37bf7f53c44d`.

The runtime GLBs under `public/assets/supermarket/` and `public/assets/products/supermarket-pack/` are technical conversions of that archive. Conversion does not change or establish the source license. These assets must remain marked **LICENSE VERIFICATION REQUIRED** and must not be represented as CC0. See `SUPERMARKET_ASSET_IMPORT.md` for the conversion and validation record.

## Exceptions and unresolved provenance

- `public/assets/characters/female/Animated Woman-nIItLV9nxS.glb` has a download-style suffix not documented by the official pack. It remains **LICENSE NEEDS VERIFICATION** and should not be selected while canonical `Animated Woman.glb` exists.
- Three one-byte files named `ee` are not assets and remain rejected in `ASSET_MANIFEST.md`.
- The intended City Kit Roads `Textures/colormap.png` was not supplied. The current road atlas is a provisional byte-identical copy of the verified CC0 City Kit (Suburban) atlas. See `public/assets/environment/roads/Textures/README.md`. This keeps tests visible but does not establish that it is the intended road texture.
- No dedicated environment-props pack is installed. Incidental fences, paths, planter, and trees are part of City Kit (Suburban).

## Integration rule

Before adding or promoting an asset to production use, retain its creator, source URL, license, and any conversion provenance here. If those facts cannot be verified, mark the asset **LICENSE NEEDS VERIFICATION** rather than assuming permission.
