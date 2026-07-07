# MSME Financial Health Card

A bank-grade, consent-driven, explainable MSME Financial Health Card platform designed to integrate into IDBI Bank's existing interface.

## Architecture

- **frontend/** — Next.js application with typed, data-driven components
- **backend/** — Express API with state machines, scoring, and audit stores
- **shared/** — Common types, enums, and fixtures shared across the stack

## Principles

- Explainability over opacity
- Consent safety as a hard invariant
- Auditability at every state transition
- Bank-native UX (professional, not consumer fintech)
- Modular design for embedding into host shells

## Development

```bash
npm run install:all
npm run dev
```

## License

Proprietary — IDBI Bank
