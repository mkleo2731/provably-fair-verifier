'use strict';

const assert = require('assert');
const {
  verifyHash,
  verifyDiceRoll,
  verifyCoinFlip,
  verifyCardDraw,
  verifySlotResult,
  createClientSeed,
  hashServerSeed,
  verifyGame,
} = require('./index');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  PASS: ${name}`);
  } catch (err) {
    failed++;
    console.log(`  FAIL: ${name}`);
    console.log(`        ${err.message}`);
  }
}

console.log('\nProvably Fair Verifier - Test Suite\n');

// ─── verifyHash ──────────────────────────────────────────────

console.log('verifyHash:');

test('produces a 64-char hex string', () => {
  const { hash } = verifyHash('server-seed-123', 'client-seed-abc', 0);
  assert.strictEqual(hash.length, 64);
  assert.ok(/^[0-9a-f]{64}$/.test(hash), 'hash should be hex');
});

test('is deterministic for the same inputs', () => {
  const a = verifyHash('seed1', 'clientA', 5);
  const b = verifyHash('seed1', 'clientA', 5);
  assert.strictEqual(a.hash, b.hash);
});

test('produces different hashes for different nonces', () => {
  const a = verifyHash('seed1', 'clientA', 0);
  const b = verifyHash('seed1', 'clientA', 1);
  assert.notStrictEqual(a.hash, b.hash);
});

test('produces different hashes for different server seeds', () => {
  const a = verifyHash('seedA', 'client', 0);
  const b = verifyHash('seedB', 'client', 0);
  assert.notStrictEqual(a.hash, b.hash);
});

test('produces different hashes for different client seeds', () => {
  const a = verifyHash('seed', 'clientA', 0);
  const b = verifyHash('seed', 'clientB', 0);
  assert.notStrictEqual(a.hash, b.hash);
});

test('throws on empty serverSeed', () => {
  assert.throws(() => verifyHash('', 'client', 0), /serverSeed/);
});

test('throws on empty clientSeed', () => {
  assert.throws(() => verifyHash('server', '', 0), /clientSeed/);
});

test('throws on negative nonce', () => {
  assert.throws(() => verifyHash('server', 'client', -1), /nonce/);
});

test('throws on non-integer nonce', () => {
  assert.throws(() => verifyHash('server', 'client', 1.5), /nonce/);
});

// ─── verifyDiceRoll ──────────────────────────────────────────

console.log('\nverifyDiceRoll:');

test('returns a roll within default range [0, 10000)', () => {
  const hash = verifyHash('server', 'client', 0).hash;
  const { roll } = verifyDiceRoll(hash);
  assert.ok(roll >= 0 && roll < 10000, `roll ${roll} out of range`);
});

test('returns a roll within custom range', () => {
  const hash = verifyHash('server', 'client', 0).hash;
  const { roll } = verifyDiceRoll(hash, 6);
  assert.ok(roll >= 0 && roll < 6, `roll ${roll} out of range [0,6)`);
});

test('is deterministic', () => {
  const hash = verifyHash('abc', 'xyz', 42).hash;
  const a = verifyDiceRoll(hash, 100);
  const b = verifyDiceRoll(hash, 100);
  assert.strictEqual(a.roll, b.roll);
});

test('throws on short hash', () => {
  assert.throws(() => verifyDiceRoll('abcdef', 10), /at least 8/);
});

test('throws on invalid range', () => {
  assert.throws(() => verifyDiceRoll('abcdef01', 0), /positive integer/);
});

// ─── verifyCoinFlip ──────────────────────────────────────────

console.log('\nverifyCoinFlip:');

test('returns heads or tails', () => {
  const hash = verifyHash('server', 'client', 0).hash;
  const { side } = verifyCoinFlip(hash);
  assert.ok(side === 'heads' || side === 'tails', `unexpected side: ${side}`);
});

test('result matches side', () => {
  const hash = verifyHash('server', 'client', 0).hash;
  const { result, side } = verifyCoinFlip(hash);
  assert.strictEqual(result, side);
});

test('is deterministic', () => {
  const hash = verifyHash('s', 'c', 1).hash;
  const a = verifyCoinFlip(hash);
  const b = verifyCoinFlip(hash);
  assert.strictEqual(a.side, b.side);
});

test('throws on short hash', () => {
  assert.throws(() => verifyCoinFlip('abc'), /at least 8/);
});

// ─── verifyCardDraw ──────────────────────────────────────────

console.log('\nverifyCardDraw:');

test('returns card index within default deck (52)', () => {
  const hash = verifyHash('server', 'client', 0).hash;
  const { cardIndex } = verifyCardDraw(hash);
  assert.ok(cardIndex >= 0 && cardIndex < 52, `cardIndex ${cardIndex} out of range`);
});

test('returns card index within custom deck size', () => {
  const hash = verifyHash('server', 'client', 0).hash;
  const { cardIndex } = verifyCardDraw(hash, 13);
  assert.ok(cardIndex >= 0 && cardIndex < 13, `cardIndex ${cardIndex} out of range`);
});

test('is deterministic', () => {
  const hash = verifyHash('x', 'y', 0).hash;
  const a = verifyCardDraw(hash, 52);
  const b = verifyCardDraw(hash, 52);
  assert.strictEqual(a.cardIndex, b.cardIndex);
});

test('throws on invalid deckSize', () => {
  assert.throws(() => verifyCardDraw('abcdef01', 0), /positive integer/);
});

// ─── verifySlotResult ────────────────────────────────────────

console.log('\nverifySlotResult:');

test('returns correct number of reel positions (default 3)', () => {
  const hash = verifyHash('server', 'client', 0).hash;
  const { positions } = verifySlotResult(hash);
  assert.strictEqual(positions.length, 3);
});

test('all positions are within symbol range (default 10)', () => {
  const hash = verifyHash('server', 'client', 0).hash;
  const { positions } = verifySlotResult(hash);
  positions.forEach((pos, i) => {
    assert.ok(pos >= 0 && pos < 10, `reel ${i}: position ${pos} out of range`);
  });
});

test('works with custom reels and symbols', () => {
  const hash = verifyHash('server', 'client', 0).hash;
  const { positions } = verifySlotResult(hash, 5, 7);
  assert.strictEqual(positions.length, 5);
  positions.forEach((pos, i) => {
    assert.ok(pos >= 0 && pos < 7, `reel ${i}: position ${pos} out of range`);
  });
});

test('is deterministic', () => {
  const hash = verifyHash('server', 'client', 0).hash;
  const a = verifySlotResult(hash, 3, 10);
  const b = verifySlotResult(hash, 3, 10);
  assert.deepStrictEqual(a.positions, b.positions);
});

test('throws if hash is too short for number of reels', () => {
  assert.throws(() => verifySlotResult('abcdef01', 5, 10), /at least/);
});

test('throws on invalid reels', () => {
  assert.throws(() => verifySlotResult('a'.repeat(64), 0, 10), /positive integer/);
});

test('throws on invalid symbols', () => {
  assert.throws(() => verifySlotResult('a'.repeat(64), 3, 0), /positive integer/);
});

// ─── createClientSeed ────────────────────────────────────────

console.log('\ncreateClientSeed:');

test('generates a 32-char hex string by default (16 bytes)', () => {
  const seed = createClientSeed();
  assert.strictEqual(seed.length, 32);
  assert.ok(/^[0-9a-f]{32}$/.test(seed), 'should be hex');
});

test('generates different seeds on each call', () => {
  const a = createClientSeed();
  const b = createClientSeed();
  assert.notStrictEqual(a, b);
});

test('respects custom byte length', () => {
  const seed = createClientSeed(8);
  assert.strictEqual(seed.length, 16); // 8 bytes = 16 hex chars
});

test('throws on invalid bytes', () => {
  assert.throws(() => createClientSeed(0), /positive integer/);
});

// ─── hashServerSeed ──────────────────────────────────────────

console.log('\nhashServerSeed:');

test('returns a 64-char hex hash', () => {
  const hash = hashServerSeed('my-secret-seed');
  assert.strictEqual(hash.length, 64);
  assert.ok(/^[0-9a-f]{64}$/.test(hash));
});

test('is deterministic', () => {
  const a = hashServerSeed('seed');
  const b = hashServerSeed('seed');
  assert.strictEqual(a, b);
});

test('different seeds produce different hashes', () => {
  const a = hashServerSeed('seed1');
  const b = hashServerSeed('seed2');
  assert.notStrictEqual(a, b);
});

test('throws on empty string', () => {
  assert.throws(() => hashServerSeed(''), /non-empty/);
});

// ─── verifyGame ──────────────────────────────────────────────

console.log('\nverifyGame:');

test('returns hash and null seedHashValid when no commitment hash provided', () => {
  const result = verifyGame({
    serverSeed: 'server',
    clientSeed: 'client',
    nonce: 0,
  });
  assert.strictEqual(result.hash.length, 64);
  assert.strictEqual(result.seedHashValid, null);
});

test('validates server seed hash correctly (valid)', () => {
  const serverSeed = 'my-server-seed';
  const commitment = hashServerSeed(serverSeed);
  const result = verifyGame({
    serverSeed,
    clientSeed: 'my-client-seed',
    nonce: 1,
    serverSeedHash: commitment,
  });
  assert.strictEqual(result.seedHashValid, true);
});

test('detects tampered server seed hash', () => {
  const result = verifyGame({
    serverSeed: 'real-seed',
    clientSeed: 'client',
    nonce: 0,
    serverSeedHash: 'aaaa' + 'b'.repeat(60),
  });
  assert.strictEqual(result.seedHashValid, false);
});

// ─── Integration ─────────────────────────────────────────────

console.log('\nIntegration:');

test('full verification flow: hash → dice → coin → card → slot', () => {
  const serverSeed = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const clientSeed = 'player-seed-2024';
  const nonce = 42;

  // Step 1: Compute hash
  const { hash } = verifyHash(serverSeed, clientSeed, nonce);
  assert.strictEqual(hash.length, 64);

  // Step 2: Derive game results from the same hash
  const dice = verifyDiceRoll(hash, 10000);
  assert.ok(dice.roll >= 0 && dice.roll < 10000);

  const coin = verifyCoinFlip(hash);
  assert.ok(coin.side === 'heads' || coin.side === 'tails');

  const card = verifyCardDraw(hash, 52);
  assert.ok(card.cardIndex >= 0 && card.cardIndex < 52);

  const slot = verifySlotResult(hash, 3, 10);
  assert.strictEqual(slot.positions.length, 3);

  // Step 3: All results should be deterministic
  const { hash: hash2 } = verifyHash(serverSeed, clientSeed, nonce);
  assert.strictEqual(hash, hash2);
  assert.strictEqual(verifyDiceRoll(hash2, 10000).roll, dice.roll);
});

test('known vector: HMAC-SHA256 matches expected output', () => {
  // Verify against a known HMAC-SHA256 computation
  const crypto = require('crypto');
  const serverSeed = 'test-server-seed';
  const clientSeed = 'test-client-seed';
  const nonce = 0;

  const expected = crypto
    .createHmac('sha256', serverSeed)
    .update(`${clientSeed}:${nonce}`)
    .digest('hex');

  const { hash } = verifyHash(serverSeed, clientSeed, nonce);
  assert.strictEqual(hash, expected);
});

// ─── Summary ─────────────────────────────────────────────────

console.log('\n─────────────────────────────────');
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failed > 0) {
  console.log('\nSome tests failed!\n');
  process.exit(1);
} else {
  console.log('\nAll tests passed!\n');
  process.exit(0);
}
