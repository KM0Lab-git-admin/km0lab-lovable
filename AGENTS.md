# Architecture rules

- Keep language-option sizing and interaction states inside `LanguageCard`, composed with the shared `Button`; the language page owns only the surrounding layout so presentation does not depend on descendant overrides.
- Extend shared Button variants for the Bubble finish without changing existing variants, so the language screen and unmigrated flows remain compatible.
- Keep points badges in PointsCoin and municipality artwork lookup in data/townArt, so visual reuse does not alter balances or assume missing local assets.
- Use useDragScroll for mouse dragging on nested scroll regions; each region owns one axis and suppresses drag-generated clicks while preserving native touch, wheel and keyboard scrolling.
- Use additive Bubble Button variants for consistent hover/press feedback without replacing foreground colors, so navigation remains visible on pointer entry and exit.
- Compose Home overlays with BubbleSheet and a portal inside the Home frame, so focus trapping and contextual account prompts do not escape the portrait surface; reuse the mock OTP service and preserve the requested destination.
