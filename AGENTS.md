# Architecture rules

- Keep language-option sizing and interaction states inside `LanguageCard`, composed with the shared `Button`; the language page owns only the surrounding layout so presentation does not depend on descendant overrides.
- Extend shared Button variants for the Bubble finish without changing existing variants, so the language screen and unmigrated flows remain compatible.
- Keep points badges in PointsCoin; carry municipality artwork on Town.artUrl from data/territories through territory hooks, with the decorative fallback in TownArt and DEFAULT_TOWN_ART in data/townArt, so presentation never looks up town-specific assets.
- Use useDragScroll for mouse dragging on nested scroll regions; each region owns one axis and suppresses drag-generated clicks while preserving native touch, wheel and keyboard scrolling.
- Use additive Bubble Button variants for consistent hover/press feedback without replacing foreground colors, so navigation remains visible on pointer entry and exit.
- Compose overlays with BubbleSheet inside their portrait frame; AccountBottomTabs and AccountAccessFlow own the shared locked-tab mock OTP flow, with AccountAccessTarget in types, so Home and interiors preserve destinations without data hooks importing presentation.

- Keep reward artwork and card framing in RewardArtwork/RewardCardFrame, and common filtering in FilterChip, so catalogue, redemptions and confirmation cannot drift visually.
- Keep the simulated ledger and redemptions per user in useMockAccountStore behind services/mock/account; every local redemption must atomically add its matching signed transaction.
- Use useLocationContext for municipality-aware views and municipalListings for complete, validated pagination; never modify the verified API contracts to fix callers.
- Compose Lovable-only DeviceShell in App, never product pages; product pages own a height-constrained portrait column supplied by the host.
- Keep pilot point examples in mockPointsConfig; production reward amounts and expiry decisions remain backend-owned.

- Preserve API-provided reward translations in local redemption snapshots, so changing language never rewrites the redeemed item or its cost.

- Use useProfile for reactive profile reads and services/profile for local profile updates; presentation never imports the mock implementation.

- Use useAccount for localized account reads and redeemReward for redemption writes in product presentation; only the service assigns nullable collection codes so swapping production implementations does not require screen edits.

- Product pages and components must consume stable, neutrally named data hooks/services, never mock stores/services or domain fixtures; data layers must not import presentation or contexts, data hooks expose loading/error/reload, and business rules stay outside presentation so production can replace implementations without editing screens (docs/KNOWLEDGE.md §5.1; migration reference: docs/ENCARGOS-LOVABLE.md).

- Use usePointsActions/useHomeActions, useInviteSummary/useInvitations, useInviteRewards and usePointsConfig for product reads; keep invitation aggregation and preview data variants inside the data hooks so production implementations can replace examples without editing presentation.

- Only lib/shareUrl may read window.location.origin; use getShareLink/getCanonicalWebLink, openShareChannel and useInviteLink as stable sharing boundaries so installed-app implementations can replace browser behavior without editing presentation.

- Use useShops/useShop/useShopPromotions for merchant data and scannerService with types/scan for scanning; keep fixtures behind services and hide nullable distances so production can replace data without changing screens.

- Use getTerritory/useTerritory for scope and town ordering, and listScopeNews/listScopeEvents (one request per town, allSettled, home-town dedupe) via useScopeNews/useScopeEvents; town names live only in data, so 1-to-N town scopes need no screen edits.
- Keep the home-town distinction inside CategoryFilterMenu's isHome option flag so every town selector marks the user's own town without per-screen styling or new components.
- Reuse NoticiaCard variants for Home/list news and scope category reads through useScopeCategories; keep town filtering, initial news limits and category counting in lib/scopeListings so grouped screens share tested behavior without changing API contracts.

- Keep explicit preview content in data/sampleScope behind services/scopeContent; source-specific query keys prevent sample/live cache contamination, and sample remains a data source alongside the four screen states.
- Scope listShops through an optional Territory and share filterShops for search/category/town filtering; omit grouped presentation for single-town scopes to preserve the existing view.
- The rewards preview proxy maps only the public GET catalogue's explicit unknown-postal-code 404 to an empty list; preserve other errors and never substitute rewards from another municipality.
