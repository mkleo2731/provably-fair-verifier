# Frequently Asked Questions

## Basics

### What does "provably fair" mean?

Provably fair is a cryptographic system where game outcomes are determined by seeds that are committed before the game starts. After the game, the seeds are revealed so anyone can independently verify that the result was genuinely random and not manipulated.

### How is this different from a traditional RNG audit?

Traditional online casinos rely on third-party auditors who periodically test the random number generator. Provably fair systems allow players to verify every single result themselves, in real time, without trusting any third party.

### Does provably fair guarantee the game is fair?

Provably fair guarantees that results match the committed algorithm — it proves the casino did not manipulate individual outcomes. It does not guarantee that the house edge is fair. For house edge data, see [crypto-casino-data](https://github.com/mkleo2731/crypto-casino-data).

## Verification

### What inputs do I need to verify a game?

You need three things from the platform:

1. **Server seed** — Revealed after the round
2. **Client seed** — Usually visible in your account settings
3. **Nonce** — The round number, which increments with each bet

### What if my verification fails?

A failed verification could mean:

- Incorrect input (extra spaces, encoding issues) — double-check the values
- Different algorithm variant — try the other algorithms in the library
- Non-standard implementation — check the platform's provably fair documentation
- Genuine tampering — a serious finding worth reporting

### How do I find a platform's algorithm?

Most provably fair platforms document their algorithm on a dedicated page. The [crypto-casino-data](https://github.com/mkleo2731/crypto-casino-data) dataset also records which algorithm each platform uses.

## Platforms

### Which platforms support provably fair?

The majority of crypto-native casinos support provably fair for at least some games (typically dice, crash, and plinko). Traditional casinos that added crypto deposits generally do not.

Regional platform guides covering provably fair availability:

- [CoinBetPro](https://coinbetpro.com) — Global crypto platform directory with fairness indicators
- [BtcGamblePro](https://btcgamblepro.com) — Nigerian Bitcoin gambling with provably fair reviews
- [BitcoinBetPro](https://bitcoinbetpro.com) — Indian crypto betting platform reviews
- [BtcBettingGuide](https://btcbettingguide.com) — Brazilian crypto gambling market coverage
- [CryptoSlotsPro](https://cryptoslotspro.com) — Vietnamese crypto casino and slot reviews

### Are provably fair games always available in my country?

Platform availability depends on licensing and local regulations, not on the provably fair system itself. Check regional availability in the [crypto-casino-data](https://github.com/mkleo2731/crypto-casino-data) dataset.
