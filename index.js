'use strict';

const crypto = require('crypto');

/**
 * Provably Fair Verifier
 *
 * A library for verifying provably fair casino game results using
 * cryptographic hash functions. Implements the standard HMAC-SHA256
 * scheme used by most provably fair gambling platforms.
 *
 * How provably fair works:
 * 1. Server generates a secret seed and commits its hash before the bet.
 * 2. Player provides (or receives) a client seed.
 * 3. A nonce increments with each bet.
 * 4. The result is derived deterministically from HMAC-SHA256(serverSeed, clientSeed:nonce).
 * 5. After the bet, the server reveals the seed so the player can verify.
 */

/**
 * Generate the HMAC-SHA256 hash from server seed, client seed, and nonce.
 *
 * @param {string} serverSeed - The server's secret seed (revealed after bet).
 * @param {string} clientSeed - The client-provided seed.
 * @param {number} nonce - The bet number / incrementing counter.
 * @returns {{ hash: string, hmac: string }} The hex-encoded HMAC-SHA256 hash.
 */
function verifyHash(serverSeed, clientSeed, nonce) {
  if (typeof serverSeed !== 'string' || serverSeed.length === 0) {
    throw new Error('serverSeed must be a non-empty string');
  }
  if (typeof clientSeed !== 'string' || clientSeed.length === 0) {
    throw new Error('clientSeed must be a non-empty string');
  }
  if (typeof nonce !== 'number' || !Number.isInteger(nonce) || nonce < 0) {
    throw new Error('nonce must be a non-negative integer');
  }

  const message = `${clientSeed}:${nonce}`;
  const hmac = crypto
    .createHmac('sha256', serverSeed)
    .update(message)
    .digest('hex');

  return { hash: hmac, hmac };
}

/**
 * Convert a provably fair hash into a dice roll result.
 *
 * Takes the first 8 hex characters (32 bits) of the hash and maps them
 * to a value within [0, range). This is the standard method used by
 * dice games on provably fair platforms.
 *
 * @param {string} hash - A hex-encoded hash string (at least 8 chars).
 * @param {number} [range=10000] - The upper bound (exclusive). Default 10000 gives 0.00-99.99.
 * @returns {{ roll: number, hash: string }} The dice result and the hash used.
 */
function verifyDiceRoll(hash, range) {
  if (typeof hash !== 'string' || hash.length < 8) {
    throw new Error('hash must be a hex string of at least 8 characters');
  }
  if (range === undefined || range === null) {
    range = 10000;
  }
  if (typeof range !== 'number' || !Number.isInteger(range) || range < 1) {
    throw new Error('range must be a positive integer');
  }

  // Take the first 8 hex characters → 32-bit unsigned integer
  const value = parseInt(hash.substring(0, 8), 16);
  const roll = value % range;

  return { roll, hash };
}

/**
 * Convert a provably fair hash into a coin flip result.
 *
 * Uses the first 8 hex characters to determine heads or tails.
 * Even → heads, odd → tails.
 *
 * @param {string} hash - A hex-encoded hash string (at least 8 chars).
 * @returns {{ result: string, side: string, raw: number, hash: string }}
 */
function verifyCoinFlip(hash) {
  if (typeof hash !== 'string' || hash.length < 8) {
    throw new Error('hash must be a hex string of at least 8 characters');
  }

  const value = parseInt(hash.substring(0, 8), 16);
  const side = value % 2 === 0 ? 'heads' : 'tails';

  return { result: side, side, raw: value, hash };
}

/**
 * Convert a provably fair hash into a card index for drawing from a deck.
 *
 * @param {string} hash - A hex-encoded hash string (at least 8 chars).
 * @param {number} [deckSize=52] - The number of cards in the deck.
 * @returns {{ cardIndex: number, hash: string }}
 */
function verifyCardDraw(hash, deckSize) {
  if (typeof hash !== 'string' || hash.length < 8) {
    throw new Error('hash must be a hex string of at least 8 characters');
  }
  if (deckSize === undefined || deckSize === null) {
    deckSize = 52;
  }
  if (typeof deckSize !== 'number' || !Number.isInteger(deckSize) || deckSize < 1) {
    throw new Error('deckSize must be a positive integer');
  }

  const value = parseInt(hash.substring(0, 8), 16);
  const cardIndex = value % deckSize;

  return { cardIndex, hash };
}

/**
 * Convert a provably fair hash into slot machine reel positions.
 *
 * Divides the hash into segments, one per reel, and maps each segment
 * to a symbol index. Uses non-overlapping 8-char segments of the hash.
 *
 * @param {string} hash - A hex-encoded hash string. Must be long enough for all reels (8 chars per reel).
 * @param {number} [reels=3] - The number of reels on the slot machine.
 * @param {number} [symbols=10] - The number of symbols per reel.
 * @returns {{ positions: number[], hash: string }}
 */
function verifySlotResult(hash, reels, symbols) {
  if (typeof hash !== 'string') {
    throw new Error('hash must be a hex string');
  }
  if (reels === undefined || reels === null) {
    reels = 3;
  }
  if (symbols === undefined || symbols === null) {
    symbols = 10;
  }
  if (typeof reels !== 'number' || !Number.isInteger(reels) || reels < 1) {
    throw new Error('reels must be a positive integer');
  }
  if (typeof symbols !== 'number' || !Number.isInteger(symbols) || symbols < 1) {
    throw new Error('symbols must be a positive integer');
  }

  const requiredLength = reels * 8;
  if (hash.length < requiredLength) {
    throw new Error(
      `hash must be at least ${requiredLength} hex characters for ${reels} reels (8 chars per reel)`
    );
  }

  const positions = [];
  for (let i = 0; i < reels; i++) {
    const segment = hash.substring(i * 8, (i + 1) * 8);
    const value = parseInt(segment, 16);
    positions.push(value % symbols);
  }

  return { positions, hash };
}

/**
 * Generate a cryptographically secure random client seed.
 *
 * @param {number} [bytes=16] - Number of random bytes (output will be hex, so 2x chars).
 * @returns {string} A hex-encoded random string.
 */
function createClientSeed(bytes) {
  if (bytes === undefined || bytes === null) {
    bytes = 16;
  }
  if (typeof bytes !== 'number' || !Number.isInteger(bytes) || bytes < 1) {
    throw new Error('bytes must be a positive integer');
  }

  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Compute the SHA-256 hash of a server seed.
 * Platforms publish this commitment hash before the game so players
 * can later verify the seed was not changed.
 *
 * @param {string} serverSeed - The server seed to hash.
 * @returns {string} Hex-encoded SHA-256 hash.
 */
function hashServerSeed(serverSeed) {
  if (typeof serverSeed !== 'string' || serverSeed.length === 0) {
    throw new Error('serverSeed must be a non-empty string');
  }

  return crypto.createHash('sha256').update(serverSeed).digest('hex');
}

/**
 * Full verification pipeline: given game parameters, recompute and verify the result.
 *
 * @param {Object} params
 * @param {string} params.serverSeed - The revealed server seed.
 * @param {string} params.clientSeed - The client seed used.
 * @param {number} params.nonce - The nonce / bet number.
 * @param {string} [params.serverSeedHash] - The committed hash (optional, for verification).
 * @returns {{ hash: string, seedHashValid: boolean|null }}
 */
function verifyGame(params) {
  const { serverSeed, clientSeed, nonce, serverSeedHash } = params;

  const { hash } = verifyHash(serverSeed, clientSeed, nonce);

  let seedHashValid = null;
  if (serverSeedHash) {
    const computed = hashServerSeed(serverSeed);
    seedHashValid = computed === serverSeedHash;
  }

  return { hash, seedHashValid };
}

module.exports = {
  verifyHash,
  verifyDiceRoll,
  verifyCoinFlip,
  verifyCardDraw,
  verifySlotResult,
  createClientSeed,
  hashServerSeed,
  verifyGame,
};
