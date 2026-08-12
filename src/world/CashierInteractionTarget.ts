export interface CashierInteractionTarget {
  /** Safe player position on the staff side of the counter. */
  playerPosition: readonly [number, number, number];
  /** First-person orientation looking toward the register controls. */
  yaw: number;
  pitch: number;
  /** Prompt radius around the staff-side position. */
  activationRadius: number;
}

export interface CashierInteractionScene {
  getCashierInteractionTarget(): CashierInteractionTarget;
}
