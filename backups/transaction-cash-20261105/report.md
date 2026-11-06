# Transaction-funded cash verification

Captured 2026-11-05T17:23:51.836Z. Replayed all 305 activities with Python Decimal, independently of the application calculator.

| Component              |        CAD |
| ---------------------- | ---------: |
| Securities             | 639,615.03 |
| Available cash         |       0.00 |
| Total portfolio        | 639,615.03 |
| Inferred contributions | 564,921.58 |
| Net gain               |  74,693.45 |

All share quantities and holding values match. Cash, account totals, portfolio summary, and dollar gains from ROAI/TWR/MWR reconcile. Percentage returns intentionally use different methods.

Activities changed since the backup: 0. Activities added since the backup: 0. The obsolete USD1,372 balance checkpoint was removed; its original record is saved in before.json.

From October 28, 2026 inclusive (America/Toronto), 23 buys/sells produce net purchases of C$68,206.21 using the app’s fixed USD/CAD rate of 1.393. This measures buys minus sells, not external deposits.

Validation: 90 focused tests across 9 suites passed; API and client TypeScript checks passed; production Docker build passed. Verification is against recorded activities and captured application quotes, not brokerage records. Full per-activity arithmetic is in reconciliation.json.
