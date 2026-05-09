# Provably Fair Verifier

Independent verification tool for provably fair algorithms used in cryptocurrency gambling platforms. Supports SHA-256, HMAC-SHA512, and common seed-based RNG verification.

## Overview

Provably fair gambling is a system where each game result is determined by a cryptographic algorithm that can be independently verified after the fact. This tool allows players and auditors to verify that a platform's outcomes were generated fairly, without relying on trust alone.

### What This Tool Does

- **Verify individual game results** — Input the server seed, client seed, and nonce to recalculate and verify any game outcome
- **Support multiple algorithms** — SHA-256, HMAC-SHA256, HMAC-SHA512, and common seed combination methods
- **Batch verification** — Verify sequences of game results to detect statistical anomalies
- **Algorithm identification** — Automatically detect which provably fair algorithm a platform uses

## Documentation

| Page | Description |
|------|-------------|
| [Getting Started](Getting-Started.md) | Installation and your first verification |
| [Usage Guide](Usage-Guide.md) | Detailed verification workflows and algorithm reference |
| [FAQ](FAQ.md) | Common questions about provably fair verification |
| [Related Resources](Related-Resources.md) | Platform directories, companion projects, and tools |

## Why Verification Matters

Cryptocurrency casinos operate with less regulatory oversight than traditional gambling. Provably fair systems replace trust with math — but only if players actually verify the results. This tool makes verification accessible.

For background on provably fair gambling and how it works in practice, the guides on [CoinBetPro](https://coinbetpro.com) cover the topic in depth.

## Ecosystem

| Project | Role |
|---------|------|
| [crypto-betting-odds](https://github.com/mkleo2731/crypto-betting-odds) | Odds conversion and payout calculation |
| [crypto-casino-data](https://github.com/mkleo2731/crypto-casino-data) | Platform data including provably fair status |
| **provably-fair-verifier** | Fairness verification (this repo) |
