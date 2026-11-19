# Architecture rules

- Keep language-option sizing and interaction states inside `LanguageCard`, composed with the shared `Button`; the language page owns only the surrounding layout so presentation does not depend on descendant overrides.
- Extend shared Button variants for the Bubble finish without changing existing variants, so the language screen and unmigrated flows remain compatible.
- Keep points badges in PointsCoin and municipality artwork lookup in data/townArt, so visual reuse does not alter balances or assume missing local assets.
