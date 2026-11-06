# Transaction-funded cash implementation plan

**Goal:** Implement the user-approved mechanism: sales retain temporary cash; later buys consume it; only purchase shortfalls add new contributions; deposits never create gains.

**Architecture:** Keep the existing chronological, per-account cash ledger. Do not net purchases against future sales or force balances to zero. Remove the single obsolete USD1,372 checkpoint after backing it up. Explicit verified manual balances remain supported, but trades never create them. Use net worth minus opening net worth minus external flows for portfolio dollar gains across ROAI, TWR, and MWR. Cash rows must not label principal as profit.

**Tech stack:** NestJS, Prisma/PostgreSQL, Bull/Redis, Angular, big.js, Jest, Docker.

## Implementation and validation

- [x] Extend `portfolio-cash-ledger.spec.ts` with earlier buys/later sales and purchase-shortfall funding examples. These protect the accepted existing ledger behavior.
- [x] Extend `portfolio-cash-accounting.spec.ts` to check ROAI dollar results alongside TWR/MWR; cover additional purchases consuming cash and adding only the shortfall as funding. Preserve different percentage-return definitions.
- [x] Extend `portfolio.service.spec.ts` to require cash value and base-currency basis to match for aggregated cash, so Holdings does not show cash principal as a gain.
- [x] Run the new tests and observe failures in ROAI reconciliation and cash basis.
- [x] Update `PortfolioCalculator.getPerformance` to derive portfolio dollar changes from opening value and dated external flows; include cash in portfolio performance values. Keep ROAI's average-investment percentage denominator.
- [x] Populate and aggregate `investmentWithCurrencyEffect` on generated cash positions. Update cache version to avoid reusing legacy calculations.
- [x] Run focused accounting, activity, balance, and cache tests; run API and client type checks and the production Docker build.
- [x] Save a full backup of the obsolete checkpoint and current activities, remove only that checkpoint through the authenticated application API, and deploy the tested local image.
- [x] Verify live holdings, account totals, summary, and TWR/MWR/ROAI dollar gains; independently replay all current activities with decimal arithmetic. Preserve the existing fixed exchange-rate policy and purchase-date corrections.

Existing staged edits belong to the ongoing accounting work and must be preserved. Validation uses a local copy outside iCloud with installed dependencies because on-demand dependency downloads can block execution. No new transactions or fabricated cash adjustments are required.

## Verified result

Deployed the production image `ghostfolio/ghostfolio:transaction-cash-20261105` locally on November 5. All 90 focused tests in 9 suites, API/client type checks, and production Docker build passed. The healthy live container runs the tested image. Independent Decimal replay of all 305 activities reconciles share quantities, holdings values, accounts, cash, and ROAI/TWR/MWR dollar gains. Cash is zero. No existing transaction fields changed during this update. The obsolete balance checkpoint backup, live snapshot, and full reconciliation are in `backups/transaction-cash-20261105/`.
