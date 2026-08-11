import {
  BufferGeometry,
  Material,
  Object3D,
  Texture,
} from 'three';

type RenderableObject = Object3D & {
  geometry?: BufferGeometry;
  material?: Material | Material[];
};

/** Releases GPU resources owned by an object hierarchy. */
export function disposeObject3D(root: Object3D): void {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();

  root.traverse((object) => {
    const renderable = object as RenderableObject;

    if (renderable.geometry) {
      geometries.add(renderable.geometry);
    }

    const objectMaterials = Array.isArray(renderable.material)
      ? renderable.material
      : renderable.material
        ? [renderable.material]
        : [];

    for (const material of objectMaterials) {
      materials.add(material);

      for (const value of Object.values(material)) {
        if (value instanceof Texture) {
          textures.add(value);
        }
      }
    }
  });

  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();
}
