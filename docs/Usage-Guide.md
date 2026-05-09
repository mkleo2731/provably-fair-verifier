# Usage Guide

## Algorithm Reference

### HMAC-SHA256

The most common provably fair algorithm. Uses the server seed as the HMAC key and combines the client seed with the nonce as the message.

```javascript
const { Verifier } = require('provably-fair-verifier');

const result = Verifier.verify({
  algorithm: 'hmac-sha256',
  serverSeed: 'server_secret_value',
  clientSeed: 'player_chosen_seed',
  nonce: 1,
});

console.log(result.hash);      // Full HMAC-SHA256 output
console.log(result.gameValue); // Derived game value (e.g., dice roll)
```

### HMAC-SHA512

Used by platforms that need more bits of entropy for generating multiple game values from a single hash.

```javascript
const result = Verifier.verify({
  algorithm: 'hmac-sha512',
  serverSeed: 'server_secret',
  clientSeed: 'client_seed',
  nonce: 100,
});
```

### SHA-256 (Simple Hash)

Some platforms use a simpler approach where the server seed is hashed directly.

```javascript
const result = Verifier.verify({
  algorithm: 'sha256',
  serverSeed: 'server_secret',
  nonce: 1,
});
```

## Game-Specific Verification

### Dice Games

```javascript
const { DiceVerifier } = require('provably-fair-verifier');

const roll = DiceVerifier.verify({
  serverSeed: '...',
  clientSeed: '...',
  nonce: 42,
  range: [0, 99.99]
});

console.log(roll.value);  // e.g., 43.27
console.log(roll.valid);  // true
```

### Card Games

```javascript
const { CardVerifier } = require('provably-fair-verifier');

const hand = CardVerifier.verify({
  serverSeed: '...',
  clientSeed: '...',
  nonce: 1,
  deckSize: 52,
  cardsDealt: 5
});

console.log(hand.cards);   // ['Ah', 'Kd', '7s', '2c', 'Jh']
console.log(hand.valid);   // true
```

## Batch Verification

Verify a sequence of rounds to check for statistical anomalies:

```javascript
const { BatchVerifier } = require('provably-fair-verifier');

const rounds = Array.from({ length: 1000 }, (_, i) => ({
  serverSeed: 'server_seed_abc',
  clientSeed: 'my_seed',
  nonce: i + 1,
}));

const report = BatchVerifier.analyze(rounds, {
  algorithm: 'hmac-sha256',
  gameType: 'dice',
  range: [0, 99.99]
});

console.log(report.totalRounds);     // 1000
console.log(report.allValid);        // true
console.log(report.distribution);    // statistical distribution analysis
console.log(report.chiSquared);      // chi-squared test result
console.log(report.fairnessScore);   // 0-100 score
```

## Calculating Crypto Payouts

After verifying a game result, calculate payouts using the [crypto-betting-odds](https://github.com/mkleo2731/crypto-betting-odds) library, or use the online [Crypto Profit Calculator](https://coinbetpro.com/tools/crypto-profit-calculator) for quick calculations.

## Platform-Specific Notes

Different platforms implement provably fair slightly differently. The [crypto-casino-data](https://github.com/mkleo2731/crypto-casino-data) dataset documents the specific algorithm used by each platform.
