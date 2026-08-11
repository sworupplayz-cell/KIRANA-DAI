# Kirana Dai — High-Level Game Design

## Premise

**Kirana Dai — Nepali Kirana Shop Simulator** is a mobile-first 3D shop-management game about operating and growing a neighborhood kirana shop in Nepal.

This file establishes direction only. The systems below are not part of the initialization phase.

## Core loop

> Buy stock → arrange shop → open → serve customers → earn money → restock → upgrade → expand.

The loop should remain readable on a phone, satisfying in short sessions, and deep enough to support longer-term shop growth.

## Future systems

Later, separately scoped phases may add:

- shop management
- products and product placement
- inventory and restocking
- customers
- checkout
- economy
- upgrades
- reputation
- events
- shop expansion

## Product principles

- Keep the setting recognizably Nepali and grounded in kirana-shop life.
- Make touch interaction a first-class experience rather than a desktop control port.
- Prefer clear simulation feedback over unnecessary complexity.
- Protect performance on practical mobile hardware.
- Add production-quality GLB/GLTF art intentionally; do not let test geometry become final art.

## Initialization boundary

The current milestone is only a technical foundation: rendering, lifecycle, asset loading, input seams, responsive UI, and a minimal test scene. It intentionally excludes the shop, NPCs, inventory, checkout, money, progression, missions, city, and multiplayer features.
