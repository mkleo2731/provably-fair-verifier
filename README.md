# Provably Fair Verifier

[![npm version](https://img.shields.io/npm/v/provably-fair-verifier.svg)](https://www.npmjs.com/package/provably-fair-verifier)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D12.0.0-brightgreen.svg)](https://nodejs.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg)](package.json)

A JavaScript/Node.js library for verifying **provably fair** casino game results. Supports dice, coin flip, card draw, and slot machine games using the industry-standard HMAC-SHA256 algorithm.

**Zero dependencies** -- uses only Node.js built-in `crypto` module.

## What is Provably Fair?

Provably fair is a cryptographic system that allows players to verify that game results were not manipulated. The process works like this:

1. **Before the bet**: The server generates a secret seed and publishes its SHA-256 hash (commitment).
2. **Player input**: The player provides (or receives) a client seed and a nonce that increments each bet.
3. **Result generation**: The outcome is computed as `HMAC-SHA256(serverSeed, clientSeed:nonce)`.
4. **Verification**: After the game, the server reveals the seed. The player can recompute the hash and confirm the result matches.

Because the commitment hash is published before the bet, the server cannot change the seed after seeing the player's input.

## Installation

```bash
npm install provably-fair-verifier
```

Or clone and use directly:

```bash
git clone https://github.com/mkleo2731/provably-fair-verifier.git
cd provably-fair-verifier
npm test
```

## Quick Start

```js
const {
  verifyHash,
  verifyDiceRoll,
  verifyCoinFlip,
  verifyCardDraw,
  verifySlotResult,
  createClientSeed,
  hashServerSeed,
  verifyGame,
} = require('provably-fair-verifier');

// 1. Generate a client seed
const clientSeed = createClientSeed();
// => 'a3f1b2c4d5e6f7089012345678abcdef'

// 2. After the game, verify the result with the revealed server seed
const serverSeed = 'server-secret-seed-revealed-after-bet';
const nonce = 42;

const { hash } = verifyHash(serverSeed, clientSeed, nonce);
// => '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'

// 3. Convert to a game result
const dice = verifyDiceRoll(hash, 10000);  // 0-9999 (represents 0.00% - 99.99%)
const coin = verifyCoinFlip(hash);          // 'heads' or 'tails'
const card = verifyCardDraw(hash, 52);      // 0-51 card index
const slot = verifySlotResult(hash, 3, 10); // 3 reels, 10 symbols each
```

## API Reference

### `verifyHash(serverSeed, clientSeed, nonce)`

Compute the HMAC-SHA256 hash that determines the game result.

| Parameter | Type | Description |
|-----------|------|-------------|
| `serverSeed` | `string` | The server's secret seed (revealed after the bet) |
| `clientSeed` | `string` | The player-provided seed |
| `nonce` | `number` | Non-negative integer, increments each bet |

**Returns:** `{ hash: string, hmac: string }` -- The 64-character hex hash.

```js
const { hash } = verifyHash('server-seed', 'client-seed', 0);
// hash: '2d7e...a4f1' (64 hex chars)
```

### `verifyDiceRoll(hash, range?)`

Convert a hash to a dice roll result.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `hash` | `string` | | Hex hash (at least 8 chars) |
| `range` | `number` | `10000` | Upper bound (exclusive) |

**Returns:** `{ roll: number, hash: string }`

```js
const { roll } = verifyDiceRoll(hash, 10000);
// roll: 4231 (represents 42.31%)

const { roll: d6 } = verifyDiceRoll(hash, 6);
// d6: 0-5
```

### `verifyCoinFlip(hash)`

Convert a hash to a coin flip result.

| Parameter | Type | Description |
|-----------|------|-------------|
| `hash` | `string` | Hex hash (at least 8 chars) |

**Returns:** `{ result: string, side: string, raw: number, hash: string }`

```js
const { side } = verifyCoinFlip(hash);
// side: 'heads' or 'tails'
```

### `verifyCardDraw(hash, deckSize?)`

Convert a hash to a card index.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `hash` | `string` | | Hex hash (at least 8 chars) |
| `deckSize` | `number` | `52` | Number of cards in the deck |

**Returns:** `{ cardIndex: number, hash: string }`

```js
const { cardIndex } = verifyCardDraw(hash, 52);
// cardIndex: 0-51
```

### `verifySlotResult(hash, reels?, symbols?)`

Convert a hash to slot machine reel positions. Uses non-overlapping 8-character segments of the hash.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `hash` | `string` | | Hex hash (needs 8 chars per reel) |
| `reels` | `number` | `3` | Number of reels |
| `symbols` | `number` | `10` | Number of symbols per reel |

**Returns:** `{ positions: number[], hash: string }`

```js
const { positions } = verifySlotResult(hash, 5, 12);
// positions: [3, 7, 1, 11, 5] (one per reel, 0-11 each)
```

### `createClientSeed(bytes?)`

Generate a cryptographically secure random client seed.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `bytes` | `number` | `16` | Number of random bytes |

**Returns:** `string` -- Hex-encoded random string (2x the byte count in length).

```js
const seed = createClientSeed();
// '7a9f3c2e1d4b5a6f8e9d0c1b2a3f4e5d' (32 hex chars)
```

### `hashServerSeed(serverSeed)`

Compute the SHA-256 commitment hash of a server seed. Used to verify the server did not change its seed after the bet.

| Parameter | Type | Description |
|-----------|------|-------------|
| `serverSeed` | `string` | The server seed to hash |

**Returns:** `string` -- Hex-encoded SHA-256 hash.

```js
const commitment = hashServerSeed('my-server-seed');
// Compare this with the hash published before the bet
```

### `verifyGame(params)`

Full verification pipeline combining hash generation and optional seed commitment check.

| Parameter | Type | Description |
|-----------|------|-------------|
| `params.serverSeed` | `string` | The revealed server seed |
| `params.clientSeed` | `string` | The client seed used |
| `params.nonce` | `number` | The bet nonce |
| `params.serverSeedHash` | `string?` | Optional: the commitment hash to verify against |

**Returns:** `{ hash: string, seedHashValid: boolean | null }`

```js
const result = verifyGame({
  serverSeed: 'revealed-seed',
  clientSeed: 'my-seed',
  nonce: 1,
  serverSeedHash: 'abc123...', // the hash published before the bet
});

if (result.seedHashValid === false) {
  console.log('WARNING: Server seed does not match commitment!');
}
```

## Full Verification Example

```js
const pf = require('provably-fair-verifier');

// Data from the casino
const serverSeed = '9a1f3c2e4d5b6a7f8e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a';
const clientSeed = 'my-chosen-seed';
const nonce = 100;
const committedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

// Step 1: Verify the server seed matches the commitment
const seedHash = pf.hashServerSeed(serverSeed);
console.log('Seed valid:', seedHash === committedHash);

// Step 2: Compute the game hash
const { hash } = pf.verifyHash(serverSeed, clientSeed, nonce);

// Step 3: Derive the game result
const { roll } = pf.verifyDiceRoll(hash, 10000);
console.log(`Dice result: ${(roll / 100).toFixed(2)}%`);

// Or use verifyGame() for steps 1-2 combined
const game = pf.verifyGame({
  serverSeed,
  clientSeed,
  nonce,
  serverSeedHash: committedHash,
});
console.log('Seed commitment valid:', game.seedHashValid);
```

## How the Math Works

### Hash to Number Conversion

All game functions use the same core conversion:

1. Take the first 8 hex characters of the HMAC-SHA256 hash
2. Parse as a 32-bit unsigned integer (`parseInt(hash.substring(0, 8), 16)`)
3. Apply modulo with the game's range to get the result

For slot machines, each reel uses a different 8-character segment of the hash, ensuring independent reel outcomes.

### Why HMAC-SHA256?

- **Deterministic**: Same inputs always produce the same output
- **Unpredictable**: Cannot guess the output without knowing the server seed
- **Collision-resistant**: Practically impossible to find two inputs with the same output
- **Widely adopted**: Industry standard across provably fair platforms

## Testing

```bash
npm test
```

All tests use Node.js built-in `assert` module. No test frameworks required.

## Resources

- [CoinBetPro.com](https://coinbetpro.com) -- Crypto prediction markets & casino reviews
- [BTCGamblePro.com](https://btcgamblepro.com) -- Bitcoin gambling guide for Nigeria
- [BTCBettingGuide.com](https://btcbettingguide.com) -- Crypto betting guide for Brazil
- [BitcoinBetPro.com](https://bitcoinbetpro.com) -- Bitcoin sports betting for India
- [CryptoSlotsPro.com](https://cryptoslotspro.com) -- Crypto slots & casino guide for Vietnam

## License

[MIT](LICENSE)
