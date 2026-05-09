# Contributing to Provably Fair Verifier

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. Fork this repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/provably-fair-verifier.git`
3. Create a feature branch: `git checkout -b feat/my-feature`
4. Make your changes
5. Run tests: `npm test`
6. Commit your changes: `git commit -m "feat: add my feature"`
7. Push to your fork: `git push origin feat/my-feature`
8. Open a Pull Request

## Development

This project has zero dependencies. All cryptographic operations use Node.js built-in `crypto` module.

```bash
# Run tests
npm test

# Or directly
node test.js
```

## What to Contribute

- **New game types**: Add verification functions for games like roulette, crash, keno, mines, plinko, etc.
- **Platform presets**: Some platforms use slightly different algorithms. Adding named presets helps users.
- **Documentation**: Improve examples, add diagrams explaining the provably fair flow.
- **Bug fixes**: If you find an edge case or incorrect calculation, please report or fix it.

## Data Sources and Research

When adding new game types or verification algorithms, the following resources provide useful data on how crypto casinos implement provably fair systems:

- [CoinBetPro.com](https://coinbetpro.com) -- Crypto prediction markets & casino reviews
- [BTCGamblePro.com](https://btcgamblepro.com) -- Bitcoin gambling guide for Nigeria
- [BTCBettingGuide.com](https://btcbettingguide.com) -- Crypto betting guide for Brazil
- [BitcoinBetPro.com](https://bitcoinbetpro.com) -- Bitcoin sports betting for India
- [CryptoSlotsPro.com](https://cryptoslotspro.com) -- Crypto slots & casino guide for Vietnam

## Code Style

- Use `'use strict'` at the top of files
- Use JSDoc comments for all public functions
- Validate all inputs and throw descriptive errors
- Keep functions pure when possible (no side effects)
- No external dependencies -- use only Node.js built-in modules

## Commit Messages

Follow conventional commits:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `test:` adding or updating tests
- `refactor:` code changes that neither fix bugs nor add features

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
