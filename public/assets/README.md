# Asset directories

Assets are intentionally absent during project initialization.

Add reviewed, optimized runtime files to the matching directory:

- `shop/` — shop structure, fixtures, and furnishings
- `products/` — products and packaging
- `characters/male/` and `characters/female/` — character models and animations
- `environment/` — surroundings and environmental props
- `textures/` — shared textures that are not packaged inside a GLB

Use root-relative URLs such as `/assets/products/example.glb` with `AssetManager`. Keep filenames stable and lowercase, document licenses, and validate file size, texture dimensions, materials, animation clips, pivots, and scale before integration.
