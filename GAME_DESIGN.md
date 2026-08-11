# Kirana Dai — High-Level Game Design

## Premise

**Kirana Dai — Nepali Mega Mart Simulator** is a mobile-first, first-person store simulation set inside one large, persistent fictional Nepali department store.

The store itself is the primary world. The design does not depend on an open city, traditional levels, XP, campaign stages, artificial unlock gates, missions, or reputation grinding. New simulation depth should make the same physical store more meaningful rather than replace it with disconnected levels.

## Persistent-store direction

A future operational loop may involve receiving appropriate stock, arranging departments, serving shoppers, maintaining the store, and improving its physical operation. Every such system requires its own later scope, interaction design, persistence model, and mobile-performance review.

This direction is not permission to add empty architecture or placeholder management screens now.

## Current Phase 2 boundary

The current milestone provides only:

- one large but mobile-conscious indoor Mega Mart
- inside spawn and first-person physical traversal
- wide main circulation and smaller secondary aisles
- visibly different grocery, drinks/snacks, home/daily, books/stationery, and electronics zones
- checkout, customer service, warehouse, and staff spaces
- original fictional Nepali-style wayfinding
- verified local low-poly fixtures and recognizable stock
- lightweight collision, desktop controls, camera look, and mobile joystick

The current milestone explicitly excludes inventory, money/economy, functional checkout, customer behavior, employee behavior, hiring, salaries, suppliers, dynamic events, missions, levels, XP, progression, reputation, and campaign systems.

## Product principles

- Keep the setting recognizably Nepali through original language, color, and store identity without copying real brands.
- Treat the store as a coherent place with human-scale routes, clear department identity, and persistent spatial memory.
- Make touch interaction a first-class experience rather than a desktop control port.
- Prefer clear simulation feedback over unnecessary meta-progression.
- Protect performance on practical mobile hardware through instancing, shared resources, restrained lighting, capped DPR, and measured asset selection.
- Use only audited assets that fit the represented category. Record missing categories instead of filling them with unrelated props, generated substitutes, or placeholder mannequins.
- Add architecture only when a current feature needs it; avoid empty future-system classes and directories.

## Known art gaps

The repository does not yet contain suitable ranges for clothing, shoes, personal care/cosmetics, broad school stationery, toys/gifts, luggage, Nepal-specific packaged staples, pallets, or dedicated supermarket warehouse racking. These are asset requirements, not invitations to mislabel existing furniture.
