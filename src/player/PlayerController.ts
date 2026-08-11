import { MathUtils, Vector2, Vector3 } from 'three';
import type { CollisionWorld } from '../systems/CollisionWorld';

const PLAYER_RADIUS = 0.28;
const WALK_SPEED = 2.65;

export interface PlayerDiagnostics {
  position: readonly [number, number, number];
  velocity: readonly [number, number];
  radius: number;
  speed: number;
  collisions: readonly string[];
}

/** Human-scale first-person locomotion with acceleration and collision sliding. */
export class PlayerController {
  readonly position = new Vector3(0, 0, 13.1);
  private readonly velocity = new Vector2();
  private readonly displacement = new Vector3();
  private readonly resolvedPosition = new Vector3();
  private lastCollisions: string[] = [];

  constructor(private readonly collisionWorld: CollisionWorld) {}

  update(deltaSeconds: number, movement: Vector2, yaw: number): void {
    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = -Math.sin(yaw);
    const targetX = (rightX * movement.x + forwardX * movement.y) * WALK_SPEED;
    const targetZ = (rightZ * movement.x + forwardZ * movement.y) * WALK_SPEED;
    const smoothing = movement.lengthSq() > 0 ? 14 : 18;

    this.velocity.x = MathUtils.damp(
      this.velocity.x,
      targetX,
      smoothing,
      deltaSeconds,
    );
    this.velocity.y = MathUtils.damp(
      this.velocity.y,
      targetZ,
      smoothing,
      deltaSeconds,
    );

    this.displacement.set(
      this.velocity.x * deltaSeconds,
      0,
      this.velocity.y * deltaSeconds,
    );
    const beforeX = this.position.x;
    const beforeZ = this.position.z;
    const result = this.collisionWorld.resolve(
      this.position,
      this.displacement,
      PLAYER_RADIUS,
      this.resolvedPosition,
    );
    this.position.copy(result.position);
    this.lastCollisions = result.collidedWith;

    if (Math.abs(this.position.x - beforeX) < Math.abs(this.displacement.x) * 0.2) {
      this.velocity.x = 0;
    }
    if (Math.abs(this.position.z - beforeZ) < Math.abs(this.displacement.z) * 0.2) {
      this.velocity.y = 0;
    }
  }

  getDiagnostics(): PlayerDiagnostics {
    return {
      position: [this.position.x, this.position.y, this.position.z],
      velocity: [this.velocity.x, this.velocity.y],
      radius: PLAYER_RADIUS,
      speed: this.velocity.length(),
      collisions: this.lastCollisions,
    };
  }
}
