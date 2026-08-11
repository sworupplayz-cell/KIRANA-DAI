import { MathUtils, Vector3 } from 'three';

export interface CollisionRect {
  label: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CollisionBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CollisionResult {
  position: Vector3;
  collidedWith: string[];
}

/** Lightweight XZ circle-vs-AABB collision with axis-separated sliding. */
export class CollisionWorld {
  private readonly colliders: CollisionRect[] = [];

  constructor(private readonly bounds: CollisionBounds) {}

  add(rect: CollisionRect): void {
    this.colliders.push(rect);
  }

  getColliderCount(): number {
    return this.colliders.length;
  }

  resolve(
    position: Vector3,
    displacement: Vector3,
    radius: number,
    target = new Vector3(),
  ): CollisionResult {
    target.copy(position);
    const collided = new Set<string>();
    const distance = Math.hypot(displacement.x, displacement.z);
    const steps = Math.max(1, Math.ceil(distance / Math.max(0.08, radius * 0.45)));
    const stepX = displacement.x / steps;
    const stepZ = displacement.z / steps;

    for (let step = 0; step < steps; step += 1) {
      const nextX = MathUtils.clamp(
        target.x + stepX,
        this.bounds.minX + radius,
        this.bounds.maxX - radius,
      );
      if (nextX !== target.x + stepX) collided.add('Exterior boundary');
      if (this.canOccupy(nextX, target.z, radius, collided)) target.x = nextX;

      const nextZ = MathUtils.clamp(
        target.z + stepZ,
        this.bounds.minZ + radius,
        this.bounds.maxZ - radius,
      );
      if (nextZ !== target.z + stepZ) collided.add('Exterior boundary');
      if (this.canOccupy(target.x, nextZ, radius, collided)) target.z = nextZ;
    }

    target.y = 0;
    return { position: target, collidedWith: [...collided] };
  }

  private canOccupy(
    x: number,
    z: number,
    radius: number,
    collided: Set<string>,
  ): boolean {
    let clear = true;
    for (const collider of this.colliders) {
      const closestX = MathUtils.clamp(x, collider.minX, collider.maxX);
      const closestZ = MathUtils.clamp(z, collider.minZ, collider.maxZ);
      const dx = x - closestX;
      const dz = z - closestZ;
      if (dx * dx + dz * dz >= radius * radius) continue;
      collided.add(collider.label);
      clear = false;
    }
    return clear;
  }
}
