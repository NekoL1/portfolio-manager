# Cash and portfolio valuation review — 2026-11-04

## Result

The reported sale/reinvestment defect is fixed and the production Docker build
is running in the local `ghostfolio` container. The prior image is retained as
`ghostfolio/ghostfolio:before-cash-accounting-20261104`.

At fixed execution-price marks and without fees:

| Activity               | Securities change (CAD) | Cash change (CAD) | Portfolio value / gain change |
| ---------------------- | ----------------------: | ----------------: | ----------------------------: |
| Sell 673 XEQT at 44.63 |              -30,035.99 |        +30,035.99 |                             0 |
| Buy 641 QQC at 46.84   |              +30,024.44 |        -30,024.44 |                             0 |
| Combined               |                  -11.55 |            +11.55 |                             0 |

## Root causes corrected

- A stored cash checkpoint permanently overrode subsequent trading cash.
- The snapshot worker included synthetic cash purchases while the request-side
  cash-flow calculation used a different input set, so gains did not reconcile
  to contributions and value.
- Overview market value was read separately from holdings, potentially mixing
  valuation times and counting cash as securities; negative cash was hidden.
- Daily returns were overwritten by the price change of remaining positions,
  dropping realized gains from positions sold during the day.
- Cash inclusion was incorrectly linked to the Bitcoin visibility setting.
- First-day TWR skipped fees and market moves when opening value was zero.
- Account/platform totals used stale cash checkpoints instead of the ledger.
- Optional activity-created cash checkpoints could conflict with replay after
  edits or deletions. Trade cash is now automatic.
- Activity changes left old snapshots valid for five seconds. Invalidation now
  runs immediately and activity mutations await it.

## Verification

- 69 focused tests passed across eight suites: cash replay, real calculator
  snapshots, TWR/MWR, transaction-currency conversion, balance inputs, account
  and platform totals, activity creation, and cache invalidation.
- A 200-trade sequence conserves wealth apart from fees.
- Both API and client TypeScript checks passed.
- The full production Docker build passed, including the client templates.
- Read-only replay of the 295 stored activities confirmed the reported trades
  preserve value and gain and leave CAD 11.55 from the pair. No transaction or
  cash-checkpoint records were edited.
- Authenticated checks against the updated live local API reconciled portfolio
  value, summary, holdings sum, and account sum exactly. Dollar gains agree
  between TWR/MWR; value minus contributions minus gain has zero residual.
- The broader legacy calculator suite has 12 failing suites (11 assertion
  failures and one fixture type error). The same failures reproduce on the
  unchanged HEAD baseline; they were not relabeled as passing or rewritten to
  conceal them. Two legacy suites remain skipped.

## Accuracy boundaries

The ledger's explicit assumptions are documented in DEVELOPMENT.md. The data
model does not record all external cash transfers or currency conversions, so
funding may be inferred and checkpoints reconcile at end of day. Daily TWR is
not an exact intraday valuation. The existing MWR solver can use Modified Dietz
when it cannot bracket an IRR root. Market prices and historical FX gaps still
depend on provider data. Questionable pre-existing activity entries require
review before historical totals can be certified against a broker statement.

Changes remain uncommitted in the working tree. Existing activity-dialog layout
edits were preserved.
