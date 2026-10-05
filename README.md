# Contract-Shield

Next-generation contract security and vulnerability auditor for Web3 smart contracts (Solidity, Vyper, Rust) and commercial legal agreements (NDAs, MSAs, SaaS SLAs, Employment contracts).

## Features
- **Smart Contract Security Scanner**: Detects SWC-107 Reentrancy, AMM spot oracle manipulation, flash loan attack vectors, access control flaws, and unchecked token transfers.
- **Legal Agreement Shield**: Audits predatory non-compete clauses, overbroad IP assignments, uncapped indemnification, and auto-renewal traps.
- **Interactive Exploit Simulator**: Dynamic step-by-step adversary attack execution sandbox.
- **Shielded Remediation Diff**: Side-by-side comparison of vulnerable code and secure, shielded replacement patches.
- **Cryptographic Verification Proof**: Generates certified verification hashes and downloadable Markdown audit reports.
- **Dual Engine**: Leverages Google Gemini (`gemini-3.8-flash`) combined with deterministic fallback static analysis for 100% availability.

## Running Locally

```bash
npm install
npm run dev
```

App starts at `http://0.0.0.0:3000`.
