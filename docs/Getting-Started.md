# Getting Started

## Installation

```bash
npm install provably-fair-verifier
```

Or clone the repository:

```bash
git clone https://github.com/mkleo2731/provably-fair-verifier.git
cd provably-fair-verifier
npm install
```

## Your First Verification

### Step 1: Collect the Inputs

After a game round, the platform reveals:

- **Server seed** — A secret value committed before the game, revealed after
- **Client seed** — Your chosen seed (or the platform's default)
- **Nonce** — The round number or incrementing counter

### Step 2: Run the Verification

```javascript
const { Verifier } = require('provably-fair-verifier');

const result = Verifier.verify({
  algorithm: 'hmac-sha256',
  serverSeed: 'a1b2c3d4e5f6...',
  clientSeed: 'my_custom_seed',
  nonce: 42,
  expectedResult: '7d3f8a...'
});

console.log(result.valid);     // true or false
console.log(result.computed);  // the independently calculated hash
console.log(result.match);     // whether computed matches expected
```

### Step 3: Interpret the Result

- `valid: true` — The game result matches the cryptographic calculation. The outcome was determined by the committed seeds, not manipulated.
- `valid: false` — The result does not match. This could indicate tampering, a different algorithm than expected, or incorrect input values.

## Supported Platforms

This tool works with any platform that uses standard provably fair algorithms. To check which platforms support provably fair verification, see the [crypto-casino-data](https://github.com/mkleo2731/crypto-casino-data) dataset.

Regional platform guides with provably fair filtering:

- [CoinBetPro](https://coinbetpro.com) — Global platform comparison with fairness indicators
- [CryptoSlotsPro](https://cryptoslotspro.com) — Vietnamese crypto casino reviews with provably fair status
- [BtcGamblePro](https://btcgamblepro.com) — Nigerian Bitcoin casino reviews with verification guides
