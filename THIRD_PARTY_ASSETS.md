# Third-Party Asset Sources and Licenses

**Record verified:** 2026-08-12

**Purpose:** Local provenance record for the assets currently under `public/assets/`. This document is separate from gameplay code and does not approve unlisted future assets.

## License standard

The source packs below were matched using their pack names, model filenames, pack counts, and published creator pages. Their official creator pages identify them as Creative Commons CC0 assets. CC0 license reference: https://creativecommons.org/publicdomain/zero/1.0/

The uploaded GLBs do not embed copyright/license metadata, and the original archive license files were not included. Preserve this record and the source URLs with future distributions.

| Local files | Creator and source pack | Recorded license | Verified source |
|---|---|---|---|
| `public/assets/shop/mini-market/` | Kenney — Mini Market | CC0 | https://kenney.nl/assets/mini-market |
| `public/assets/shop/furniture/` | Kenney — Furniture Kit | CC0 | https://kenney.nl/assets/furniture-kit |
| `public/assets/products/food-kit/` | Kenney — Food Kit; repository contains a 100-model subset | CC0 | https://kenney.nl/assets/food-kit |
| `public/assets/environment/roads/` | Kenney — City Kit (Roads); local GLB conversion contains 72 files | CC0 source verified | https://kenney.nl/assets/city-kit-roads |
| `public/assets/environment/buildings/` | Kenney — City Kit (Suburban) | CC0 | https://kenney.nl/assets/city-kit-suburban |
| `public/assets/characters/male/` | Quaternius — Ultimate Modular Men Pack | CC0 | https://quaternius.com/packs/ultimatemodularcharacters.html |
| `public/assets/characters/female/` | Quaternius — Ultimate Modular Women Pack | CC0 | https://quaternius.com/packs/ultimatemodularwomen.html |

## Exceptions and unresolved provenance

- `public/assets/characters/female/Animated Woman-nIItLV9nxS.glb` has a download-style suffix not documented by the official pack. It remains **LICENSE NEEDS VERIFICATION** and should not be selected while canonical `Animated Woman.glb` exists.
- Three one-byte files named `ee` are not assets and remain rejected in `ASSET_MANIFEST.md`.
- The intended City Kit Roads `Textures/colormap.png` was not supplied. The current road atlas is a provisional byte-identical copy of the verified CC0 City Kit (Suburban) atlas. See `public/assets/environment/roads/Textures/README.md`. This keeps tests visible but does not establish that it is the intended road texture.
- No dedicated environment-props pack is installed. Incidental fences, paths, planter, and trees are part of City Kit (Suburban).

## Integration rule

Before adding or promoting an asset to production use, retain its creator, source URL, license, and any conversion provenance here. If those facts cannot be verified, mark the asset **LICENSE NEEDS VERIFICATION** rather than assuming permission.
