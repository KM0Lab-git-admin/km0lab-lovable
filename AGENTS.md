# Architecture rules

- Keep language-option sizing and interaction states inside `LanguageCard`, composed with the shared `Button`; the language page owns only the surrounding layout so presentation does not depend on descendant overrides.
- Extend shared Button variants for the Bubble finish without changing existing variants, so the language screen and unmigrated flows remain compatible.
- Keep points badges in PointsCoin and municipality artwork lookup in data/townArt, so visual reuse does not alter balances or assume missing local assets.
- Use useDragScroll for mouse dragging on nested scroll regions; each region owns one axis and suppresses drag-generated clicks while preserving native touch, wheel and keyboard scrolling.
- Use additive Bubble Button variants for consistent hover/press feedback without replacing foreground colors, so navigation remains visible on pointer entry and exit.
- Compose overlays with BubbleSheet inside their portrait frame; AccountBottomTabs and useAccountAccess own the shared locked-tab mock OTP flow so Home and interiors preserve the requested destination without duplicated account logic.

- Keep reward artwork and card framing in RewardArtwork/RewardCardFrame, and common filtering in FilterChip, so catalogue, redemptions and confirmation cannot drift visually.
- Keep the simulated ledger and redemptions per user in useMockAccountStore behind services/mock/account; every local redemption must atomically add its matching signed transaction.
- Use useLocationContext for municipality-aware views and municipalListings for complete, validated pagination; never modify the verified API contracts to fix callers.
- Compose Lovable-only DeviceShell in App, never product pages; product pages own a height-constrained portrait column supplied by the host.
- Keep pilot point examples in mockPointsConfig; production reward amounts and expiry decisions remain backend-owned.

- Preserve API-provided reward translations in local redemption snapshots, so changing language never rewrites the redeemed item or its cost.

- Use useAccount for localized account reads and redeemReward for redemption writes in product presentation; only the service assigns nullable collection codes so swapping production implementations does not require screen edits.

- Product pages and components must consume stable, neutrally named data hooks/services, never mock stores/services or domain fixtures; data layers must not import presentation or contexts, data hooks expose loading/error/reload, and business rules stay outside presentation so production can replace implementations without editing screens (docs/KNOWLEDGE.md §5.1; migration reference: docs/ENCARGOS-LOVABLE.md).
