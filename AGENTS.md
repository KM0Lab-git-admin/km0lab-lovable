# Architecture rules

- Keep language-option sizing and interaction states inside `LanguageCard`, composed with the shared `Button`; the language page owns only the surrounding layout so presentation does not depend on descendant overrides.