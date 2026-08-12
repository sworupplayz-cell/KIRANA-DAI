# Phase 2B.1 — Cashier Workstation Polish and Interaction

- **Baseline:** `c3e4cf38a4093d576a51004367e120d8fa81c33e`
- **Verification date:** 2026-08-12
- **Scope:** one polished checkout workstation and the first register interaction foundation; no billing gameplay

## Issues found in Phase 2B.0

The imported assets were valid and correctly cached, but their first production composition still read as an asset-placement foundation rather than a finished workstation:

- The checkout counter used non-uniform scale (`0.86 × 0.72 × 1.02`), which changed its authored proportions.
- The register's earlier orientation did not consistently present its controls to the cashier side.
- A solid bagging block and two large filled floor rectangles looked like layout placeholders.
- The counter, scanner, register, and bagging end did not share enough small connective detail.
- Two baskets were restrained in quantity but had no holder to make the arrangement feel intentional.
- There was no interaction prompt, interaction state, mobile action control, camera transition, or safe movement lock.

No rewrite was required. `AssetManager`, `PlayerController`, `CameraManager`, `InputManager`, `CollisionWorld`, `VirtualJoystick`, renderer ownership, responsive resize, and DPR behavior were retained and extended only where needed.

## Workstation composition

The same required runtime assets remain in use:

- `public/assets/supermarket/cashier/checkout-counter.glb`
- `public/assets/supermarket/cashier/cash-register.glb`
- `public/assets/supermarket/retail/shopping-basket.glb`

The checkout now uses a uniform scale of `0.76`, producing approximately `0.626 × 1.672 × 1.010 m` after its 90-degree placement rotation. The register uses a uniform scale of `0.46`, is grounded at counter height, and is rotated to face the staff side. Its keypad is centred in the interaction camera and remains clear of the scanner and receipt surface.

Twenty purposeful detail boxes are divided across five instanced groups, all sharing one unit-cube geometry:

- dark conveyor inset, under-bagging storage, register cable, and entrance basket-holder frame;
- metal scanner platform, bagging surface/rail, receipt tray, and counter divider;
- one subtly emissive scanner-glass inset;
- one cashier anti-fatigue mat;
- one three-piece customer queue arrow.

Two already-loaded Food Kit products stage the item-drop belt. No new texture, light, shader, GLB, post-process, particle system, physics system, or animation system was added. Small details do not cast shadows.

The physical sequence is now readable as customer queue/item drop → conveyor → scanner → register/cashier → receipt/bagging area. The customer side remains east of the counter, while the cashier has open legroom and a marked standing area to the west. Two imported baskets remain in an organized holder by the entrance/customer-service approach.

## Interaction foundation

`CashierInteractionUI` is a small DOM control layer; it contains buttons only and never opens a native keyboard.

- The prompt is available only within `1.3 m` of the staff-side interaction point `(5.35, 0, 10.92)`. The counter keeps customer-side players outside that radius.
- Desktop activation uses **E** or **Enter**. Desktop exit uses **E** or **Escape**.
- Mobile uses reachable **Use Register** and **Exit** buttons to the right of the joystick.
- The active panel displays only `CASH REGISTER`, `Cashier station ready`, and a next-phase notice. There is no POS or billing implementation.

The interaction state is `idle → entering → active → exiting → idle`. Entering and exiting use a 0.7-second smoothstep transition. The player's safe pre-interaction position and camera yaw/pitch are saved. During interaction, locomotion and free look are paused, the player is moved only within the clear staff strip, and the camera settles at yaw `−π/2`, pitch `−0.31` toward the register. Exit smoothly restores the exact saved player position and orientation, clears stale keyboard/joystick movement, and re-enables mouse/touch look.

Diagnostics expose interaction state, prompt visibility, register distance, transition progress, and whether camera look is enabled.

## Collision and access

Collision remains circle-vs-AABB with the existing `0.28 m` player radius. No mesh collision was introduced.

- Counter AABB: X `6.16–6.84`, Z `9.72–11.46`.
- Bagging/storage AABB: X `6.14–6.86`, Z `11.42–11.97`.
- Customer-side contact was recorded at approximately `(7.206, 0, 10.801)`.
- Cashier-side contact was recorded at approximately `(5.791, 0, 10.736)`.
- The interaction anchor is safely west of both colliders.
- Automated desktop traversal entered/exited the interaction, approached from both sides, and moved around the front end to `(7.736, 0, 12.623)` without collision.
- Automated mobile traversal exited and used the joystick to walk to approximately `(5.692, 0, 13.049)`; the prompt correctly disappeared and no collision was reported.

The cashier remains able to enter around either end, stand naturally, and leave. The store exit and future customer lane remain unobstructed.

## Desktop and mobile verification

Production preview loaded 42/42 GLB URLs with zero asset failures.

### Desktop — 1280×800

- Prompt appeared on the staff side with text `Use Register`.
- E entered the active state; E exited it.
- Active position was exactly `(5.35, 0, 10.92)` with register-facing camera and no clipping.
- Exit restored the saved position and yaw/pitch; mouse drag continued to work.
- Customer approach, cashier approach, diagonal, close-register, normal eye-height, and front approach views were inspected.
- Canvas client/backing size: `1280×800`.
- No body or canvas overflow.

### Mobile — 390×844

- The virtual joystick was used to reach the register and to walk away after exit.
- Prompt bounds were X `234–374`; joystick bounds were X `16–128`, so controls did not overlap.
- The active panel measured `240×162.75 px`, remained inside the viewport, and left the joystick clear.
- Touch activation, Exit button, restored touch look, prompt dismissal, and post-exit movement all worked.
- Canvas client size: `390×844`; backing buffer: `585×1266`, preserving the DPR 1.5 cap.
- Body dimensions remained exactly `390×844`; no overflow or accidental touch lock occurred.

Across desktop and mobile runs there were zero console warnings/errors, page errors, failed requests, HTTP error responses, or missing assets.

## Performance comparison

Scene diagnostics are stable measurements; render calls and FPS vary with view and visibility.

| Diagnostic | Phase 2B.0 | Phase 2B.1 | Delta |
|---|---:|---:|---:|
| Loaded GLB URLs | 42 | 42 | 0 |
| Model placements | 629 | 631 | +2 staged products |
| Mesh objects | 96 | 98 | +2 net |
| Geometries | 96 | 94 | −2 through shared detail geometry |
| Materials | 69 | 73 | +4 |
| Scene textures | 30 | 30 | 0 |
| Authored triangles | 88,423 | 88,855 | +432 |
| Colliders | 45 | 45 | 0 |
| Animation mixers | 0 | 0 | 0 |

At the matched initial entrance view, Phase 2B.1 sampled 136 calls / 117,231 rendered triangles on desktop versus approximately 136 / 116,895 in Phase 2B.0. Mobile sampled 56 calls / 58,181 triangles versus approximately 55 / 57,833. The close register state sampled 87 calls / 110,646 desktop and 24 calls / 52,756 mobile because fewer aisles were visible.

Packaged headless Chromium used software WebGL. Observed screenshot-run rates were approximately 11–17 FPS desktop and 11–12 FPS mobile. These values are regression signals only and are not physical-device FPS claims.

## Explicit exclusions

This phase does not implement scanning, barcodes, customer NPCs, queues, payments, cash/change, receipts, a calculator, POS software, inventory/economy, salary/hiring, missions, or progression. The active state is deliberately a lightweight readiness test for the next cashier-gameplay phase.
