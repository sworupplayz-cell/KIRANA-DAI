# Development Rules

All contributors and coding agents must follow these rules:

1. Preserve working systems.
2. Inspect existing code before modifying it.
3. Avoid unnecessary rewrites.
4. Keep systems modular with clear ownership and cleanup.
5. Optimize for mobile devices and practical GPU/memory limits.
6. Use real, appropriate GLB/GLTF assets instead of ugly placeholders whenever possible.
7. Verify visual quality in the actual running preview, at representative mobile and desktop aspect ratios.
8. Test collision and gameplay behavior when a change affects either; do not infer behavior from code alone.
9. Never claim a feature works solely because the build succeeds.
10. Test the actual running game and check for runtime/console errors.
11. Commit meaningful changes with a focused message.

## Change workflow

1. Inspect the affected modules and current runtime behavior.
2. Define the smallest coherent change.
3. Implement it without coupling unrelated systems.
4. Run type checking and the production build.
5. Run the game, exercise the changed behavior, resize it, and inspect the browser console.
6. Re-test relevant touch/mobile and desktop input paths.
7. Record known limits honestly before committing.

## Asset guidelines

- Put static source assets under the matching `public/assets/` category.
- Use the central `AssetManager`; do not create independent GLTF loaders throughout the codebase.
- Treat cached source scenes, geometry, materials, and textures as shared resources.
- Compress and validate production assets before integration, and budget textures for mobile memory.
- Do not add random marketplace assets or retain temporary test geometry as final artwork.
