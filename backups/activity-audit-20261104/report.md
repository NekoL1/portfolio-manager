# Full activity reconciliation — November 4, 2026

Source captured at 2026-11-05T00:34:01.615Z. This report audits every one of the 294 stored activities using independent decimal arithmetic. No transactions, timestamps, settings, or caches were changed.

## Answer

**The screenshot’s net change reconciles exactly to its displayed current value and the independently reconstructed net funding. All current positions also reconcile at the audit’s captured quotes. The screenshot’s exact individual quotes are unavailable, so its current value cannot be independently reproduced to the cent. Neither number is certified against a brokerage statement.**

The screenshot implies net external funding of C$533,802.01. Independent replay produces C$533,802.01. C$631,164.03 − C$533,802.01317 = C$97,362.02.

## Frozen-price calculation

| Component                              |        CAD |
| -------------------------------------- | ---------: |
| Current securities (32 open positions) | 631,164.72 |
| Reconstructed cash                     |      11.55 |
| Total portfolio value                  | 631,176.27 |
| Net inferred external funding          | 533,802.01 |
| Net gain                               |  97,374.26 |

Quotes in the audit snapshot were refreshed after the screenshot. The C$12.24 difference in current value and gain is equal; net funding is unchanged. Live quote changes are consistent with this difference, but the earlier per-symbol quotes were not preserved. The screenshot alone does not preserve its individual quotes.

Independent second identity (all trades and dividends, fixed FX):

C$631,164.72 securities + C$431,797.39 sale proceeds + C$4,861.91 dividends − C$970,449.77 purchase costs − C$0.00 fees = C$97,374.26 net gain.

## Coverage and checks

- 294 activities: 187 buys, 104 sells, 3 dividends; no drafts or exclusion tags.
- All 96 distinct symbols reconciled: 32 open positions, 63 closed trading positions, and one dividend-only symbol (PSA.TO). Every open quantity and value matches the API to less than C$0.00000001.
- No exact same-day duplicate trade signatures; no transaction/profile currency mismatches; all recorded fees are zero. These checks cannot detect missing broker transactions.
- Every cash movement balances: purchase costs, sale proceeds, dividends, inferred FX conversions, inferred funding, and the saved cash checkpoint.
- TWR and MWR API requests report the same dollar gain and current value. Their return percentages differ by design.

## Native-currency activity totals

| Currency |  Buy costs | Sell proceeds | Dividends | Fees |
| -------- | ---------: | ------------: | --------: | ---: |
| CAD      | 404,310.78 |    152,107.14 |  4,861.91 | 0.00 |
| USD      | 406,417.07 |    200,782.67 |      0.00 | 0.00 |

## Findings that limit broker-level accuracy

1. **Fixed FX:** `libs/common/src/lib/config.ts:79` pins USD/CAD to 1.393 for current values and all historical transactions. This audit uses that rule. Neither the current market FX rate nor actual broker conversion rates are applied.
2. **TD.TO chronology:** 5 shares sold on October 30, 2024 and 23 on November 11, 2024; the only 28-share buy is dated October 11, 2025. Unless these were intentional short sales, a purchase date or opening holding is missing/incorrect. This problem predates randomization. Its recorded lifetime cash profit is C$16.94, but the year-long timing problem changes historical value and return calculations.
3. **CRCL chronology:** on June 5, 2025, the randomized sell timestamp (04:17:43 UTC) precedes the buy (04:45:26 UTC), creating a temporary −10-share position. Recorded lifetime result is −US$125.60 (−C$174.96). Same-day total dollar gain reconciles, but inferred funding and intraday positions are not actual broker chronology.
4. **Cash checkpoint needs confirmation:** the October 14 checkpoint is USD1,372, exactly the proceeds of the recorded 4 NET shares sold at USD343. It was created 17 milliseconds after the NET sale record was created, and before the 6-share IWM purchase at USD272.80 was entered. This suggests it may represent intermediate sale cash rather than a verified end-of-day cash balance. The current ledger replaces C$7,815.99 reconstructed cash with C$1,911.20 and infers a C$5,904.79 withdrawal. This is a data-quality concern, not a confirmed broker withdrawal.
5. **Inferred funding and cash:** the data model does not store a complete deposit/withdrawal/FX-transfer history. It infers deposits for unfunded purchases and consumes other-currency cash in the same account. The October 14, 2026 USD1,372 cash checkpoint is treated as end-of-day authoritative cash.
6. **Recorded income/cost coverage:** only 3 dividend entries totaling C$4,861.91 and zero fees are recorded. Any missing dividends, withholding taxes, interest, fees, transfers, splits, or opening positions remain outside this audit.
7. **ROAI mismatch:** the default ROAI details API reports a different net gain (C$63,096.31 at this captured snapshot). The screenshot’s TWR/MWR dollar gain agrees with the independent cash-flow identities above; the ROAI result does not. This is a separate calculation inconsistency, not a reason to substitute the ROAI number for the screenshot.

## Cash checkpoint reconciliation

| Date       |  Stated cash | Reconstructed cash before checkpoint (CAD) | Inferred external adjustment (CAD) |
| ---------- | -----------: | -----------------------------------------: | ---------------------------------: |
| 2026-10-14 | USD 1,372.00 |                                   7,815.99 |                          -5,904.79 |

## Every symbol, including closed positions

Net gain below is lifetime trading cash flow plus current value and recorded dividends, at fixed FX; it is not an average-cost unrealized gain.

| Symbol    | Entries | Net quantity | Quote (native) | Current value CAD |  Buys CAD | Sells CAD | Dividends CAD | Lifetime gain CAD |
| --------- | ------: | -----------: | -------------: | ----------------: | --------: | --------: | ------------: | ----------------: |
| ACWV      |       1 |     329.1579 |         131.37 |         60,235.37 | 55,012.86 |      0.00 |          0.00 |          5,222.51 |
| ADBE      |       4 |            0 |              — |              0.00 |  4,138.85 |  3,838.62 |          0.00 |           -300.23 |
| AGX       |       2 |            0 |              — |              0.00 |    244.60 |    969.53 |          0.00 |            724.93 |
| AMD       |       6 |            0 |              — |              0.00 | 11,966.67 | 10,343.16 |          0.00 |         -1,623.50 |
| ASML      |       4 |            0 |              — |              0.00 |  4,823.16 |  5,992.63 |          0.00 |          1,169.47 |
| AVGO.TO   |       2 |            0 |              — |              0.00 |  2,567.00 |  3,680.16 |          0.00 |          1,113.16 |
| BKR       |       3 |           50 |          49.87 |          3,473.45 |  3,919.21 |      0.00 |          0.00 |           -445.76 |
| BRK-B     |       2 |            0 |              — |              0.00 |  6,818.87 |  7,605.78 |          0.00 |            786.91 |
| BRK.NE    |       8 |         1294 |          41.83 |         54,128.02 | 57,025.80 | 12,342.86 |          0.00 |          9,445.08 |
| BTCX-B.NE |       3 |       974.41 |          16.27 |         15,853.65 | 12,419.21 |      0.00 |          0.00 |          3,434.44 |
| BTCX-B.TO |       2 |            0 |              — |              0.00 |  9,108.76 | 10,028.40 |          0.00 |            919.64 |
| CAVA      |       2 |            0 |              — |              0.00 |  4,760.68 |  4,119.25 |          0.00 |           -641.42 |
| CELH      |       2 |            0 |              — |              0.00 |    696.78 |    952.81 |          0.00 |            256.03 |
| CGDV      |       5 |    1032.6594 |          49.57 |         71,306.17 | 67,067.43 |      0.00 |          0.00 |          4,238.75 |
| CLS.NE    |       2 |            0 |              — |              0.00 |    307.30 |  1,048.00 |          0.00 |            740.70 |
| CNR.TO    |       2 |            0 |              — |              0.00 |  4,610.10 |  4,677.90 |          0.00 |             67.80 |
| CRCL      |       2 |            0 |              — |              0.00 |  1,337.28 |  1,162.32 |          0.00 |           -174.96 |
| CRDO      |       2 |            0 |              — |              0.00 |    299.51 |    787.74 |          0.00 |            488.23 |
| CRM.TO    |       1 |           91 |          17.23 |          1,567.93 |  2,564.38 |      0.00 |          0.00 |           -996.45 |
| DOCU      |       2 |            0 |              — |              0.00 |    384.84 |    201.22 |          0.00 |           -183.63 |
| DUOL      |       4 |            0 |              — |              0.00 |  4,727.42 |  3,312.02 |          0.00 |         -1,415.40 |
| DXPE      |       2 |            0 |              — |              0.00 |    281.94 |    412.11 |          0.00 |            130.16 |
| DXYZ      |       3 |            0 |              — |              0.00 |  1,346.06 |  1,181.28 |          0.00 |           -164.78 |
| EAT       |       2 |            0 |              — |              0.00 |    402.66 |    402.86 |          0.00 |              0.20 |
| EEMV      |       1 |       208.67 |          71.81 |         20,873.54 | 18,955.07 |      0.00 |          0.00 |          1,918.47 |
| ENB.TO    |       2 |          208 |          68.02 |         14,148.16 | 13,964.88 |      0.00 |          0.00 |            183.28 |
| ETHA      |       2 |            0 |              — |              0.00 |  1,432.70 |  1,057.59 |          0.00 |           -375.11 |
| FINN.NE   |       3 |            0 |              — |              0.00 | 12,052.80 | 12,942.72 |          0.00 |            889.92 |
| FOTO      |       2 |          210 |          13.41 |          3,922.83 |  5,022.74 |      0.00 |          0.00 |         -1,099.91 |
| FRSH      |       2 |            0 |              — |              0.00 |    288.69 |    150.69 |          0.00 |           -137.99 |
| GOOG.TO   |       4 |            0 |              — |              0.00 |  7,297.20 | 13,597.34 |          0.00 |          6,300.14 |
| GS        |       2 |            0 |              — |              0.00 |  9,636.77 | 15,427.70 |          0.00 |          5,790.92 |
| HIMS      |       2 |            0 |              — |              0.00 |  1,361.80 |    708.20 |          0.00 |           -653.60 |
| HOOD      |       3 |            0 |              — |              0.00 |  2,987.15 |  3,232.04 |          0.00 |            244.89 |
| IAT       |       2 |            0 |              — |              0.00 | 15,987.60 | 16,164.00 |          0.00 |            176.40 |
| IBIT      |       9 |          346 |          45.33 |         21,848.06 | 72,642.80 | 54,665.69 |          0.00 |          3,870.95 |
| IEFA      |       1 |     178.5674 |          98.48 |         24,496.35 | 21,966.62 |      0.00 |          0.00 |          2,529.73 |
| IGV       |       4 |          136 |         103.56 |         19,619.23 | 24,919.71 |  5,847.76 |          0.00 |            547.28 |
| INTA      |       2 |            0 |              — |              0.00 |    281.41 |     99.67 |          0.00 |           -181.74 |
| IONQ      |       4 |            0 |              — |              0.00 |  2,285.58 |  2,040.13 |          0.00 |           -245.45 |
| ISRG      |       1 |            2 |          482.1 |          1,343.13 |    994.60 |      0.00 |          0.00 |            348.53 |
| IWM       |       3 |            6 |         284.02 |          2,373.84 | 13,179.31 | 13,085.08 |          0.00 |          2,279.60 |
| LLY       |       2 |            0 |              — |              0.00 |  2,362.53 |  2,061.31 |          0.00 |           -301.22 |
| LMND      |       2 |            0 |              — |              0.00 |  2,053.28 |  2,227.96 |          0.00 |            174.68 |
| LRN       |       2 |            0 |              — |              0.00 |    308.74 |    254.36 |          0.00 |            -54.38 |
| LULU      |       4 |            0 |              — |              0.00 |  4,119.94 |  4,663.54 |          0.00 |            543.60 |
| MELI      |       2 |            0 |              — |              0.00 |  2,524.12 |  2,571.48 |          0.00 |             47.36 |
| MSFT      |       6 |           59 |          555.8 |         45,679.53 | 37,188.73 |  4,138.88 |          0.00 |         12,629.69 |
| MSFT.TO   |       3 |          326 |          38.72 |         12,622.72 |  9,443.84 |      0.00 |          0.00 |          3,178.88 |
| MU        |       4 |            0 |              — |              0.00 |  6,433.22 |  5,574.93 |          0.00 |           -858.30 |
| NET       |       2 |            0 |              — |              0.00 |  1,108.83 |  1,911.20 |          0.00 |            802.37 |
| NOW       |       6 |           40 |         108.81 |          6,062.89 |  5,944.54 |      0.00 |          0.00 |            118.35 |
| NU        |       3 |            0 |              — |              0.00 |  1,943.63 |  2,331.88 |          0.00 |            388.26 |
| NVDA      |       6 |            0 |              — |              0.00 | 15,753.94 | 27,549.08 |          0.00 |         11,795.14 |
| NVDA.TO   |       2 |            0 |              — |              0.00 |  4,337.80 |  7,880.20 |          0.00 |          3,542.40 |
| OPFI      |       2 |            0 |              — |              0.00 |    326.17 |    302.97 |          0.00 |            -23.20 |
| OSCR      |       2 |            0 |              — |              0.00 |    901.97 |  1,239.77 |          0.00 |            337.80 |
| PANW      |       5 |            0 |              — |              0.00 | 16,651.75 | 24,148.71 |          0.00 |          7,496.96 |
| PANW.NE   |       2 |            0 |              — |              0.00 |  5,043.06 |  6,510.24 |          0.00 |          1,467.18 |
| PANW.TO   |       2 |            0 |              — |              0.00 |  4,581.72 |  5,049.00 |          0.00 |            467.28 |
| PATH      |       3 |            0 |              — |              0.00 |    994.14 |    838.20 |          0.00 |           -155.95 |
| PLTR      |       2 |            0 |              — |              0.00 |  1,270.17 |  1,573.23 |          0.00 |            303.06 |
| PRLB      |       2 |            0 |              — |              0.00 |    278.88 |    478.50 |          0.00 |            199.62 |
| PSA.TO    |       3 |            0 |              — |              0.00 |      0.00 |      0.00 |      4,861.91 |          4,861.91 |
| PYPL      |       3 |           28 |           60.2 |          2,348.04 |  6,028.89 |  2,229.54 |          0.00 |         -1,451.30 |
| PYPL.TO   |       1 |          600 |           4.27 |          2,562.00 |  3,090.00 |      0.00 |          0.00 |           -528.00 |
| QCN.TO    |       1 |      23.5726 |          222.4 |          5,242.55 |  4,371.30 |      0.00 |          0.00 |            871.24 |
| QQC.TO    |       6 |         1576 |          47.18 |         74,355.68 | 74,074.57 |      0.00 |          0.00 |            281.11 |
| QQQM      |       2 |           24 |         284.92 |          9,525.45 |  9,539.19 |      0.00 |          0.00 |            -13.75 |
| QUBT      |       2 |            0 |              — |              0.00 |    151.56 |    209.99 |          0.00 |             58.43 |
| RKLB      |       2 |            0 |              — |              0.00 |  1,439.87 |  1,363.40 |          0.00 |            -76.48 |
| SE        |       3 |            0 |              — |              0.00 |  7,279.79 |  3,800.86 |          0.00 |         -3,478.93 |
| SEZL      |       4 |            0 |              — |              0.00 |  3,705.10 |  4,474.34 |          0.00 |            769.24 |
| SFM       |       2 |            0 |              — |              0.00 |    140.01 |    107.26 |          0.00 |            -32.75 |
| SKYY      |       1 |           14 |         156.69 |          3,055.77 |  2,532.92 |      0.00 |          0.00 |            522.85 |
| SNOW      |       7 |            0 |              — |              0.00 |  9,201.99 | 10,912.93 |          0.00 |          1,710.94 |
| SOFI      |       6 |          115 |          17.38 |          2,784.19 |  3,274.20 |    889.29 |          0.00 |            399.28 |
| SOUN      |       8 |            0 |              — |              0.00 |  9,559.60 | 11,737.59 |          0.00 |          2,177.98 |
| SPCX      |       2 |            0 |              — |              0.00 |  2,068.60 |  2,608.74 |          0.00 |            540.14 |
| TD.TO     |       3 |            0 |              — |              0.00 |  2,200.80 |  2,217.74 |          0.00 |             16.94 |
| TEM       |       2 |            0 |              — |              0.00 |  1,824.27 |  1,382.13 |          0.00 |           -442.14 |
| TILV.TO   |       2 |            0 |              — |              0.00 |  5,332.48 |  5,214.72 |          0.00 |           -117.76 |
| TMDX      |       2 |            0 |              — |              0.00 |    752.22 |    475.85 |          0.00 |           -276.37 |
| TSLA.TO   |       4 |            0 |              — |              0.00 |  7,283.40 |  7,282.28 |          0.00 |             -1.12 |
| TWLO      |       2 |            0 |              — |              0.00 |    477.51 |    821.84 |          0.00 |            344.34 |
| UNH.TO    |       4 |            0 |              — |              0.00 | 19,964.05 | 18,946.53 |          0.00 |         -1,017.52 |
| URBN      |       2 |            0 |              — |              0.00 |    309.52 |    393.88 |          0.00 |             84.36 |
| VFV.TO    |       2 |            0 |              — |              0.00 | 10,082.82 | 10,653.06 |          0.00 |            570.24 |
| VOO       |       1 |      11.4727 |         704.78 |         11,263.42 |  9,920.82 |      0.00 |          0.00 |          1,342.60 |
| VST       |       5 |           14 |         120.29 |          2,345.90 |  5,510.71 |  2,656.73 |          0.00 |           -508.08 |
| XEQT.TO   |      13 |     872.5421 |           45.4 |         39,613.41 | 63,491.17 | 30,035.99 |          0.00 |          6,158.23 |
| XSU.TO    |      11 |         1156 |          53.02 |         61,291.12 | 59,443.07 |      0.00 |          0.00 |          1,848.05 |
| ZS        |       1 |            9 |         224.44 |          2,813.80 |  2,095.81 |      0.00 |          0.00 |            717.99 |
| ZVST.NE   |       3 |          300 |          6.595 |          1,978.50 |  2,306.50 |      0.00 |          0.00 |           -328.00 |
| ZXLV.TO   |       1 |          251 |          37.67 |          9,455.17 |  7,346.77 |      0.00 |          0.00 |          2,108.40 |
| bitcoin   |       2 |   0.20441313 |          80685 |         22,974.85 | 29,990.44 |      0.00 |          0.00 |         -7,015.59 |

## All 294 activities

Dates below are UTC. Gross values use exact stored quantity × unit price. Running quantities and cash include each row in timestamp/ID order, with cash checkpoints applied at day end. Full precision, activity IDs, and inferred currency transfers are saved in `reconciliation.json`.

| #   | UTC timestamp            | Symbol    | Type     |   Quantity | Unit price | Currency | Gross native | Gross CAD | Running shares | Cash after CAD | Inferred deposit CAD |
| --- | ------------------------ | --------- | -------- | ---------: | ---------: | -------- | -----------: | --------: | -------------: | -------------: | -------------------: |
| 1   | 2024-09-02T04:34:48.000Z | NVDA      | BUY      |         40 |     124.45 | USD      |     4,978.00 |  6,934.35 |             40 |           0.00 |             6,934.35 |
| 2   | 2024-09-02T04:59:37.000Z | PANW      | BUY      |         32 |    172.015 | USD      |     5,504.48 |  7,667.74 |             32 |           0.00 |             7,667.74 |
| 3   | 2024-09-05T04:38:55.000Z | BTCX-B.NE | BUY      |        833 |      10.79 | CAD      |     8,988.07 |  8,988.07 |            833 |           0.00 |             8,988.07 |
| 4   | 2024-09-16T04:16:35.000Z | NVDA      | BUY      |         28 |     124.12 | USD      |     3,475.36 |  4,841.18 |             68 |           0.00 |             4,841.18 |
| 5   | 2024-10-03T04:57:01.000Z | MU        | BUY      |         25 |     102.33 | USD      |     2,558.25 |  3,563.64 |             25 |           0.00 |             3,563.64 |
| 6   | 2024-10-05T04:20:19.000Z | NVDA      | BUY      |         24 |        119 | USD      |     2,856.00 |  3,978.41 |             92 |           0.00 |             3,978.41 |
| 7   | 2024-10-15T04:45:21.000Z | SOUN      | BUY      |        228 |       5.43 | USD      |     1,238.04 |  1,724.59 |            228 |           0.00 |             1,724.59 |
| 8   | 2024-10-19T04:47:45.000Z | BTCX-B.TO | BUY      |        488 |    18.6655 | CAD      |     9,108.76 |  9,108.76 |            488 |           0.00 |             9,108.76 |
| 9   | 2024-10-21T04:25:10.000Z | ADBE      | BUY      |          5 |     497.57 | USD      |     2,487.85 |  3,465.58 |              5 |           0.00 |             3,465.58 |
| 10  | 2024-10-22T04:41:10.000Z | LULU      | BUY      |          8 |      262.2 | USD      |     2,097.60 |  2,921.96 |              8 |           0.00 |             2,921.96 |
| 11  | 2024-10-23T04:36:58.000Z | SOUN      | BUY      |        228 |       4.89 | USD      |     1,114.92 |  1,553.08 |            456 |           0.00 |             1,553.08 |
| 12  | 2024-10-24T04:51:33.000Z | CNR.TO    | BUY      |         30 |     153.67 | CAD      |     4,610.10 |  4,610.10 |             30 |           0.00 |             4,610.10 |
| 13  | 2024-10-25T04:36:22.000Z | ADBE      | BUY      |          1 |     483.33 | USD      |       483.33 |    673.28 |              6 |           0.00 |               673.28 |
| 14  | 2024-10-28T04:23:15.000Z | AMD       | BUY      |         14 |      158.7 | USD      |     2,221.80 |  3,094.97 |             14 |           0.00 |             3,094.97 |
| 15  | 2024-10-30T04:05:36.000Z | ASML      | BUY      |          4 |     694.11 | USD      |     2,776.44 |  3,867.58 |              4 |           0.00 |             3,867.58 |
| 16  | 2024-10-30T04:09:51.000Z | LLY       | BUY      |          2 |        848 | USD      |     1,696.00 |  2,362.53 |              2 |           0.00 |             2,362.53 |
| 17  | 2024-10-30T04:48:01.000Z | TD.TO     | SELL     |          5 |      77.25 | CAD      |       386.25 |    386.25 |             -5 |         386.25 |                 0.00 |
| 18  | 2024-10-30T04:55:05.000Z | AMD       | BUY      |         20 |     150.32 | USD      |     3,006.40 |  4,187.92 |             34 |           0.00 |             3,801.67 |
| 19  | 2024-11-04T05:40:05.000Z | AMD       | BUY      |         20 |   142.7186 | USD      |     2,854.37 |  3,976.14 |             54 |           0.00 |             3,976.14 |
| 20  | 2024-11-05T05:10:13.000Z | MSFT      | BUY      |         11 |     416.68 | USD      |     4,583.48 |  6,384.79 |             11 |           0.00 |             6,384.79 |
| 21  | 2024-11-11T05:17:27.000Z | CNR.TO    | SELL     |         30 |     155.93 | CAD      |     4,677.90 |  4,677.90 |              0 |       4,677.90 |                 0.00 |
| 22  | 2024-11-11T05:18:56.000Z | LMND      | BUY      |         44 |       33.5 | USD      |     1,474.00 |  2,053.28 |             44 |       2,624.62 |                 0.00 |
| 23  | 2024-11-11T05:19:40.000Z | TD.TO     | SELL     |         23 |      79.63 | CAD      |     1,831.49 |  1,831.49 |            -28 |       4,456.11 |                 0.00 |
| 24  | 2024-11-11T05:33:47.000Z | CAVA      | BUY      |         23 |     148.59 | USD      |     3,417.57 |  4,760.68 |             23 |           0.00 |               304.57 |
| 25  | 2024-11-19T05:36:55.000Z | IBIT      | BUY      |        173 |      57.32 | USD      |     9,916.36 | 13,813.49 |            173 |           0.00 |            13,813.49 |
| 26  | 2024-11-27T05:21:00.000Z | PLTR      | BUY      |         14 |      65.13 | USD      |       911.82 |  1,270.17 |             14 |           0.00 |             1,270.17 |
| 27  | 2024-11-27T05:55:49.000Z | VST       | BUY      |          5 |      154.8 | USD      |       774.00 |  1,078.18 |              5 |           0.00 |             1,078.18 |
| 28  | 2024-11-27T05:58:23.000Z | AVGO.TO   | BUY      |         68 |      37.75 | CAD      |     2,567.00 |  2,567.00 |             68 |           0.00 |             2,567.00 |
| 29  | 2024-12-03T05:43:12.000Z | IONQ      | BUY      |         20 |      32.56 | USD      |       651.20 |    907.12 |             20 |           0.00 |               907.12 |
| 30  | 2024-12-05T05:11:59.000Z | PYPL      | BUY      |         28 |     86.571 | USD      |     2,423.99 |  3,376.62 |             28 |           0.00 |             3,376.62 |
| 31  | 2024-12-06T05:06:56.000Z | PATH      | BUY      |         34 |      14.58 | USD      |       495.72 |    690.54 |             34 |           0.00 |               690.54 |
| 32  | 2024-12-06T05:10:43.000Z | UNH.TO    | BUY      |        370 |      26.99 | CAD      |     9,986.30 |  9,986.30 |            370 |           0.00 |             9,986.30 |
| 33  | 2024-12-06T05:22:26.000Z | PATH      | BUY      |         15 |      14.53 | USD      |       217.95 |    303.60 |             49 |           0.00 |               303.60 |
| 34  | 2024-12-06T05:24:59.000Z | CRM.TO    | BUY      |         91 |      28.18 | CAD      |     2,564.38 |  2,564.38 |             91 |           0.00 |             2,564.38 |
| 35  | 2024-12-06T05:34:06.000Z | DUOL      | BUY      |          6 |     368.95 | USD      |     2,213.70 |  3,083.68 |              6 |           0.00 |             3,083.68 |
| 36  | 2024-12-06T05:43:36.000Z | UNH.TO    | BUY      |        373 |      26.75 | CAD      |     9,977.75 |  9,977.75 |            743 |           0.00 |             9,977.75 |
| 37  | 2024-12-09T05:53:16.000Z | RKLB      | BUY      |         45 |      22.97 | USD      |     1,033.65 |  1,439.87 |             45 |           0.00 |             1,439.87 |
| 38  | 2024-12-11T05:26:30.000Z | SNOW      | BUY      |         20 |      171.2 | USD      |     3,424.00 |  4,769.63 |             20 |           0.00 |             4,769.63 |
| 39  | 2024-12-11T05:29:38.000Z | TSLA.TO   | BUY      |        100 |      37.06 | CAD      |     3,706.00 |  3,706.00 |            100 |           0.00 |             3,706.00 |
| 40  | 2024-12-11T05:32:39.000Z | UNH.TO    | SELL     |        373 |      25.51 | CAD      |     9,515.23 |  9,515.23 |            370 |       9,515.23 |                 0.00 |
| 41  | 2024-12-11T05:38:12.000Z | CAVA      | SELL     |         23 |     128.57 | USD      |     2,957.11 |  4,119.25 |              0 |      13,634.48 |                 0.00 |
| 42  | 2024-12-11T05:44:41.000Z | AMD       | SELL     |         54 |     128.89 | USD      |     6,960.06 |  9,695.36 |              0 |      23,329.85 |                 0.00 |
| 43  | 2024-12-13T05:02:28.000Z | AMD       | BUY      |          4 |        127 | USD      |       508.00 |    707.64 |              4 |      22,622.20 |                 0.00 |
| 44  | 2024-12-13T05:34:40.000Z | ADBE      | SELL     |          1 |        463 | USD      |       463.00 |    644.96 |              5 |      23,267.16 |                 0.00 |
| 45  | 2024-12-17T05:46:47.000Z | GOOG.TO   | BUY      |        124 |       32.8 | CAD      |     4,067.20 |  4,067.20 |            124 |      19,199.96 |                 0.00 |
| 46  | 2024-12-17T05:55:10.000Z | ADBE      | SELL     |          5 |     458.53 | USD      |     2,292.65 |  3,193.66 |              0 |      22,393.62 |                 0.00 |
| 47  | 2024-12-17T05:59:10.000Z | QUBT      | BUY      |          8 |       13.6 | USD      |       108.80 |    151.56 |              8 |      22,242.07 |                 0.00 |
| 48  | 2024-12-18T05:14:38.000Z | IGV       | BUY      |         36 |      101.6 | USD      |     3,657.60 |  5,095.04 |             36 |      17,147.03 |                 0.00 |
| 49  | 2024-12-18T05:31:14.000Z | PANW.TO   | BUY      |        198 |      23.14 | CAD      |     4,581.72 |  4,581.72 |            198 |      12,565.31 |                 0.00 |
| 50  | 2024-12-19T05:24:28.000Z | QUBT      | SELL     |          8 |    18.8435 | USD      |       150.75 |    209.99 |              0 |      12,775.30 |                 0.00 |
| 51  | 2024-12-19T05:46:01.000Z | MU        | SELL     |         25 |       86.1 | USD      |     2,152.50 |  2,998.43 |              0 |      15,773.73 |                 0.00 |
| 52  | 2024-12-20T05:01:13.000Z | VST       | SELL     |          5 |        132 | USD      |       660.00 |    919.38 |              0 |      16,693.11 |                 0.00 |
| 53  | 2024-12-20T05:03:29.000Z | LMND      | SELL     |         44 |      36.35 | USD      |     1,599.40 |  2,227.96 |              0 |      18,921.08 |                 0.00 |
| 54  | 2024-12-20T05:06:29.000Z | SOUN      | BUY      |        100 |      20.29 | USD      |     2,029.00 |  2,826.40 |            556 |      16,094.68 |                 0.00 |
| 55  | 2024-12-20T05:06:39.000Z | BTCX-B.TO | SELL     |        488 |      20.55 | CAD      |    10,028.40 | 10,028.40 |              0 |      26,123.08 |                 0.00 |
| 56  | 2024-12-20T05:13:41.000Z | RKLB      | SELL     |         45 |      21.75 | USD      |       978.75 |  1,363.40 |              0 |      27,486.48 |                 0.00 |
| 57  | 2024-12-20T05:14:23.000Z | AMD       | SELL     |          4 |     116.26 | USD      |       465.04 |    647.80 |              0 |      28,134.28 |                 0.00 |
| 58  | 2024-12-20T05:15:40.000Z | SNOW      | SELL     |         20 |     157.97 | USD      |     3,159.40 |  4,401.04 |              0 |      32,535.32 |                 0.00 |
| 59  | 2024-12-20T05:19:06.000Z | PATH      | SELL     |         49 |      12.28 | USD      |       601.72 |    838.20 |              0 |      33,373.52 |                 0.00 |
| 60  | 2024-12-20T05:23:43.000Z | LULU      | SELL     |          8 |     362.98 | USD      |     2,903.84 |  4,045.05 |              0 |      37,418.57 |                 0.00 |
| 61  | 2024-12-20T05:39:41.000Z | ASML      | SELL     |          4 |     697.49 | USD      |     2,789.96 |  3,886.41 |              0 |      41,304.98 |                 0.00 |
| 62  | 2024-12-20T05:40:03.000Z | IBIT      | SELL     |        173 |       55.2 | USD      |     9,549.60 | 13,302.59 |              0 |      54,607.58 |                 0.00 |
| 63  | 2024-12-20T05:45:21.000Z | SOUN      | SELL     |        228 |      17.89 | USD      |     4,078.92 |  5,681.94 |            328 |      60,289.51 |                 0.00 |
| 64  | 2024-12-20T05:50:01.000Z | IONQ      | SELL     |         20 |      35.96 | USD      |       719.20 |  1,001.85 |              0 |      61,291.36 |                 0.00 |
| 65  | 2024-12-20T05:51:38.000Z | DUOL      | SELL     |          6 |     319.95 | USD      |     1,919.70 |  2,674.14 |              0 |      63,965.50 |                 0.00 |
| 66  | 2024-12-22T05:17:48.000Z | UNH.TO    | SELL     |        370 |      25.49 | CAD      |     9,431.30 |  9,431.30 |              0 |      73,396.80 |                 0.00 |
| 67  | 2024-12-23T05:17:25.000Z | DXYZ      | BUY      |         15 |      64.42 | USD      |       966.30 |  1,346.06 |             15 |      72,050.74 |                 0.00 |
| 68  | 2024-12-23T05:22:27.000Z | bitcoin   | BUY      |    0.03324 |  104002.39 | USD      |     3,457.04 |  4,815.66 |        0.03324 |      67,235.09 |                 0.00 |
| 69  | 2024-12-23T05:42:49.000Z | PLTR      | SELL     |         14 |      80.67 | USD      |     1,129.38 |  1,573.23 |              0 |      68,808.31 |                 0.00 |
| 70  | 2024-12-23T05:43:00.000Z | SNOW      | BUY      |         10 |     159.93 | USD      |     1,599.30 |  2,227.82 |             10 |      66,580.49 |                 0.00 |
| 71  | 2024-12-25T05:15:30.000Z | SOUN      | BUY      |        128 |      19.38 | USD      |     2,480.64 |  3,455.53 |            456 |      63,124.96 |                 0.00 |
| 72  | 2024-12-26T05:15:56.000Z | IONQ      | BUY      |         22 |      44.98 | USD      |       989.56 |  1,378.46 |             22 |      61,746.50 |                 0.00 |
| 73  | 2024-12-27T05:25:13.000Z | VFV.TO    | BUY      |         66 |     152.77 | CAD      |    10,082.82 | 10,082.82 |             66 |      51,663.68 |                 0.00 |
| 74  | 2024-12-27T05:50:32.000Z | SNOW      | BUY      |          4 |      158.9 | USD      |       635.60 |    885.39 |             14 |      50,778.29 |                 0.00 |
| 75  | 2024-12-28T05:49:37.000Z | SOUN      | SELL     |        228 |       5.45 | USD      |     1,242.60 |  1,730.94 |            228 |      52,509.23 |                 0.00 |
| 76  | 2025-01-01T05:51:37.000Z | PSA.TO    | DIVIDEND |    2261.91 |          1 | CAD      |     2,261.91 |  2,261.91 |              0 |      54,771.14 |                 0.00 |
| 77  | 2025-01-05T05:25:30.000Z | bitcoin   | BUY      | 0.17117313 |  105579.36 | USD      |    18,072.35 | 25,174.78 |     0.20441313 |      29,596.36 |                 0.00 |
| 78  | 2025-01-05T05:30:58.000Z | IBIT      | BUY      |         43 |       60.5 | USD      |     2,601.50 |  3,623.89 |             43 |      25,972.47 |                 0.00 |
| 79  | 2025-01-05T05:33:29.000Z | BTCX-B.NE | BUY      |        127 |      18.67 | CAD      |     2,371.09 |  2,371.09 |            960 |      23,601.38 |                 0.00 |
| 80  | 2025-01-06T05:02:39.000Z | EAT       | BUY      |          2 |     144.53 | USD      |       289.06 |    402.66 |              2 |      23,198.72 |                 0.00 |
| 81  | 2025-01-06T05:04:56.000Z | DOCU      | BUY      |          3 |      92.09 | USD      |       276.27 |    384.84 |              3 |      22,813.87 |                 0.00 |
| 82  | 2025-01-06T05:18:51.000Z | DUOL      | BUY      |          4 |        295 | USD      |     1,180.00 |  1,643.74 |              4 |      21,170.13 |                 0.00 |
| 83  | 2025-01-06T05:20:27.000Z | OPFI      | BUY      |         21 |      11.15 | USD      |       234.15 |    326.17 |             21 |      20,843.96 |                 0.00 |
| 84  | 2025-01-06T05:21:29.000Z | DXPE      | BUY      |          2 |      101.2 | USD      |       202.40 |    281.94 |              2 |      20,562.02 |                 0.00 |
| 85  | 2025-01-06T05:32:13.000Z | PRLB      | BUY      |          5 |      40.04 | USD      |       200.20 |    278.88 |              5 |      20,283.14 |                 0.00 |
| 86  | 2025-01-06T05:35:41.000Z | FRSH      | BUY      |         12 |      17.27 | USD      |       207.24 |    288.69 |             12 |      19,994.46 |                 0.00 |
| 87  | 2025-01-06T05:38:19.000Z | CRDO      | BUY      |          3 |      71.67 | USD      |       215.01 |    299.51 |              3 |      19,694.95 |                 0.00 |
| 88  | 2025-01-06T05:56:36.000Z | CLS.NE    | BUY      |          2 |     153.65 | CAD      |       307.30 |    307.30 |              2 |      19,387.65 |                 0.00 |
| 89  | 2025-01-06T05:57:03.000Z | URBN      | BUY      |          4 |      55.55 | USD      |       222.20 |    309.52 |              4 |      19,078.12 |                 0.00 |
| 90  | 2025-01-06T05:57:37.000Z | LRN       | BUY      |          2 |     110.82 | USD      |       221.64 |    308.74 |              2 |      18,769.38 |                 0.00 |
| 91  | 2025-01-06T05:58:24.000Z | MU        | BUY      |         20 |        103 | USD      |     2,060.00 |  2,869.58 |             20 |      15,899.80 |                 0.00 |
| 92  | 2025-01-07T05:04:27.000Z | TWLO      | BUY      |          3 |    114.263 | USD      |       342.79 |    477.51 |              3 |      15,422.29 |                 0.00 |
| 93  | 2025-01-07T05:09:24.000Z | AGX       | BUY      |          1 |     175.59 | USD      |       175.59 |    244.60 |              1 |      15,177.70 |                 0.00 |
| 94  | 2025-01-07T05:40:38.000Z | INTA      | BUY      |          3 |      67.34 | USD      |       202.02 |    281.41 |              3 |      14,896.28 |                 0.00 |
| 95  | 2025-01-08T05:14:54.000Z | SOUN      | SELL     |        128 |       15.7 | USD      |     2,009.60 |  2,799.37 |            100 |      17,695.66 |                 0.00 |
| 96  | 2025-01-14T05:59:43.000Z | LLY       | SELL     |          2 |     739.88 | USD      |     1,479.76 |  2,061.31 |              0 |      19,756.96 |                 0.00 |
| 97  | 2025-01-15T05:36:35.000Z | MELI      | BUY      |          1 |       1812 | USD      |     1,812.00 |  2,524.12 |              1 |      17,232.85 |                 0.00 |
| 98  | 2025-01-23T05:51:21.000Z | DXYZ      | SELL     |          8 |      64.99 | USD      |       519.92 |    724.25 |              7 |      17,957.09 |                 0.00 |
| 99  | 2025-01-27T05:06:01.000Z | VST       | BUY      |          8 |      154.5 | USD      |     1,236.00 |  1,721.75 |              8 |      16,235.35 |                 0.00 |
| 100 | 2025-01-29T05:24:25.000Z | TSLA.TO   | SELL     |        100 |      35.35 | CAD      |     3,535.00 |  3,535.00 |              0 |      19,770.35 |                 0.00 |
| 101 | 2025-02-05T05:49:07.000Z | NU        | BUY      |        100 |      11.08 | USD      |     1,108.00 |  1,543.44 |            100 |      18,226.90 |                 0.00 |
| 102 | 2025-02-05T05:56:46.000Z | NU        | BUY      |         24 |      11.97 | USD      |       287.28 |    400.18 |            124 |      17,826.72 |                 0.00 |
| 103 | 2025-02-06T05:22:06.000Z | SOFI      | BUY      |         40 |      12.48 | USD      |       499.20 |    695.39 |             40 |      17,131.34 |                 0.00 |
| 104 | 2025-02-08T05:50:46.000Z | IONQ      | SELL     |         22 |      33.88 | USD      |       745.36 |  1,038.29 |              0 |      18,169.62 |                 0.00 |
| 105 | 2025-02-14T05:02:28.000Z | SOUN      | SELL     |        100 |      10.95 | USD      |     1,095.00 |  1,525.34 |              0 |      19,694.96 |                 0.00 |
| 106 | 2025-02-14T05:30:47.000Z | HOOD      | BUY      |         16 |      65.25 | USD      |     1,044.00 |  1,454.29 |             16 |      18,240.66 |                 0.00 |
| 107 | 2025-02-15T05:19:25.000Z | IGV       | BUY      |        116 |     106.04 | USD      |    12,300.64 | 17,134.79 |            152 |       1,105.87 |                 0.00 |
| 108 | 2025-02-20T05:02:10.000Z | HOOD      | BUY      |         20 |      55.02 | USD      |     1,100.40 |  1,532.86 |             36 |           0.00 |               426.98 |
| 109 | 2025-02-21T05:39:54.000Z | TSLA.TO   | BUY      |        124 |      28.85 | CAD      |     3,577.40 |  3,577.40 |            124 |           0.00 |             3,577.40 |
| 110 | 2025-02-25T05:41:57.000Z | IBIT      | BUY      |        215 |      47.22 | USD      |    10,152.30 | 14,142.15 |            258 |           0.00 |            14,142.15 |
| 111 | 2025-02-27T05:32:02.000Z | IGV       | BUY      |         20 |      96.55 | USD      |     1,931.00 |  2,689.88 |            172 |           0.00 |             2,689.88 |
| 112 | 2025-03-03T05:57:44.000Z | NVDA.TO   | BUY      |        164 |      26.45 | CAD      |     4,337.80 |  4,337.80 |            164 |           0.00 |             4,337.80 |
| 113 | 2025-03-06T05:13:36.000Z | CELH      | BUY      |         20 |      25.01 | USD      |       500.20 |    696.78 |             20 |           0.00 |               696.78 |
| 114 | 2025-03-10T04:09:43.000Z | IBIT      | BUY      |        367 |       44.4 | USD      |    16,294.80 | 22,698.66 |            625 |           0.00 |            22,698.66 |
| 115 | 2025-05-20T04:43:01.000Z | GOOG.TO   | BUY      |        125 |      25.84 | CAD      |     3,230.00 |  3,230.00 |            249 |           0.00 |             3,230.00 |
| 116 | 2025-05-23T04:14:03.000Z | IBIT      | SELL     |        104 |      61.82 | USD      |     6,429.28 |  8,955.99 |            521 |       8,955.99 |                 0.00 |
| 117 | 2025-05-23T04:14:43.000Z | TSLA.TO   | SELL     |        124 |      30.22 | CAD      |     3,747.28 |  3,747.28 |              0 |      12,703.27 |                 0.00 |
| 118 | 2025-05-23T04:37:07.000Z | AVGO.TO   | SELL     |         68 |      54.12 | CAD      |     3,680.16 |  3,680.16 |              0 |      16,383.43 |                 0.00 |
| 119 | 2025-05-23T04:37:33.000Z | MU        | SELL     |         20 |      92.48 | USD      |     1,849.60 |  2,576.49 |              0 |      18,959.92 |                 0.00 |
| 120 | 2025-05-23T04:38:19.000Z | HOOD      | SELL     |         36 |      64.45 | USD      |     2,320.20 |  3,232.04 |              0 |      22,191.96 |                 0.00 |
| 121 | 2025-05-23T04:47:23.000Z | VST       | SELL     |          8 |      155.9 | USD      |     1,247.20 |  1,737.35 |              0 |      23,929.31 |                 0.00 |
| 122 | 2025-05-23T04:48:25.000Z | SNOW      | SELL     |         14 |     199.98 | USD      |     2,799.72 |  3,900.01 |              0 |      27,829.32 |                 0.00 |
| 123 | 2025-06-05T04:17:43.000Z | CRCL      | SELL     |         10 |      83.44 | USD      |       834.40 |  1,162.32 |            -10 |      28,991.64 |                 0.00 |
| 124 | 2025-06-05T04:45:26.000Z | CRCL      | BUY      |         10 |         96 | USD      |       960.00 |  1,337.28 |              0 |      27,654.36 |                 0.00 |
| 125 | 2025-06-06T04:51:06.000Z | OSCR      | BUY      |         50 |      12.95 | USD      |       647.50 |    901.97 |             50 |      26,752.39 |                 0.00 |
| 126 | 2025-06-12T04:12:27.000Z | IBIT      | BUY      |         43 |       60.5 | USD      |     2,601.50 |  3,623.89 |            564 |      23,128.50 |                 0.00 |
| 127 | 2025-06-12T04:53:42.000Z | BRK-B     | BUY      |         10 |     489.51 | USD      |     4,895.10 |  6,818.87 |             10 |      16,309.63 |                 0.00 |
| 128 | 2025-07-15T04:16:15.000Z | BRK.NE    | BUY      |         84 |      35.38 | CAD      |     2,971.92 |  2,971.92 |             84 |      13,337.71 |                 0.00 |
| 129 | 2025-08-01T04:04:46.000Z | PANW      | BUY      |         36 |     179.15 | USD      |     6,449.40 |  8,984.01 |             68 |       4,353.69 |                 0.00 |
| 130 | 2025-08-05T04:02:20.000Z | ASML      | BUY      |          1 |     685.99 | USD      |       685.99 |    955.58 |              1 |       3,398.11 |                 0.00 |
| 131 | 2025-09-06T04:26:35.000Z | LULU      | BUY      |          4 |        215 | USD      |       860.00 |  1,197.98 |              4 |       2,200.13 |                 0.00 |
| 132 | 2025-09-07T04:18:34.000Z | BRK.NE    | BUY      |        881 |      36.07 | CAD      |    31,777.67 | 31,777.67 |            965 |           0.00 |            29,577.54 |
| 133 | 2025-09-16T04:01:53.000Z | VFV.TO    | SELL     |         66 |     161.41 | CAD      |    10,653.06 | 10,653.06 |              0 |      10,653.06 |                 0.00 |
| 134 | 2025-09-16T04:36:32.000Z | IWM       | BUY      |         33 |      237.1 | USD      |     7,824.30 | 10,899.25 |             33 |           0.00 |               246.19 |
| 135 | 2025-10-06T04:02:29.000Z | PANW.TO   | SELL     |        198 |       25.5 | CAD      |     5,049.00 |  5,049.00 |              0 |       5,049.00 |                 0.00 |
| 136 | 2025-10-06T04:16:27.000Z | IGV       | SELL     |         36 |     116.61 | USD      |     4,197.96 |  5,847.76 |            136 |      10,896.76 |                 0.00 |
| 137 | 2025-10-06T04:21:52.000Z | SFM       | BUY      |          1 |     100.51 | USD      |       100.51 |    140.01 |              1 |      10,756.75 |                 0.00 |
| 138 | 2025-10-06T04:25:07.000Z | PANW.NE   | BUY      |        198 |      25.47 | CAD      |     5,043.06 |  5,043.06 |            198 |       5,713.69 |                 0.00 |
| 139 | 2025-10-11T04:21:58.000Z | TD.TO     | BUY      |         28 |       78.6 | CAD      |     2,200.80 |  2,200.80 |              0 |       3,512.89 |                 0.00 |
| 140 | 2025-10-15T04:06:59.000Z | PYPL      | BUY      |         28 |         68 | USD      |     1,904.00 |  2,652.27 |             56 |         860.62 |                 0.00 |
| 141 | 2025-10-20T04:03:00.000Z | EEMV      | BUY      |     208.67 |      65.21 | USD      |    13,607.37 | 18,955.07 |         208.67 |           0.00 |            18,094.45 |
| 142 | 2025-10-22T04:18:00.000Z | SE        | BUY      |         31 |     168.58 | USD      |     5,225.98 |  7,279.79 |             31 |           0.00 |             7,279.79 |
| 143 | 2025-10-25T04:00:24.000Z | IEFA      | BUY      |   178.5674 |      88.31 | USD      |    15,769.29 | 21,966.62 |       178.5674 |           0.00 |            21,966.62 |
| 144 | 2025-10-25T04:19:04.000Z | SEZL      | BUY      |         31 |       85.8 | USD      |     2,659.80 |  3,705.10 |             31 |           0.00 |             3,705.10 |
| 145 | 2025-10-25T04:32:31.000Z | QCN.TO    | BUY      |    23.5726 |     185.44 | CAD      |     4,371.30 |  4,371.30 |        23.5726 |           0.00 |             4,371.30 |
| 146 | 2025-10-25T04:33:13.000Z | VOO       | BUY      |    11.4727 |     620.77 | USD      |     7,121.91 |  9,920.82 |        11.4727 |           0.00 |             9,920.82 |
| 147 | 2025-10-25T04:35:03.000Z | ACWV      | BUY      |   329.1579 |     119.98 | USD      |    39,492.36 | 55,012.86 |       329.1579 |           0.00 |            55,012.86 |
| 148 | 2025-10-28T04:30:54.000Z | ETHA      | BUY      |         34 |      30.25 | USD      |     1,028.50 |  1,432.70 |             34 |           0.00 |             1,432.70 |
| 149 | 2025-11-06T05:38:20.000Z | HIMS      | BUY      |         20 |      48.88 | USD      |       977.60 |  1,361.80 |             20 |           0.00 |             1,361.80 |
| 150 | 2025-11-06T05:49:35.000Z | TEM       | BUY      |         20 |      65.48 | USD      |     1,309.60 |  1,824.27 |             20 |           0.00 |             1,824.27 |
| 151 | 2025-12-15T05:18:20.000Z | ETHA      | SELL     |         34 |      22.33 | USD      |       759.22 |  1,057.59 |              0 |       1,057.59 |                 0.00 |
| 152 | 2025-12-15T05:47:20.000Z | IBIT      | SELL     |        478 |      48.67 | USD      |    23,264.26 | 32,407.11 |             86 |      33,464.71 |                 0.00 |
| 153 | 2025-12-16T05:16:40.000Z | TMDX      | BUY      |          5 |        108 | USD      |       540.00 |    752.22 |              5 |      32,712.49 |                 0.00 |
| 154 | 2025-12-17T05:13:39.000Z | PYPL.TO   | BUY      |        600 |       5.15 | CAD      |     3,090.00 |  3,090.00 |            600 |      29,622.49 |                 0.00 |
| 155 | 2025-12-20T05:22:27.000Z | PSA.TO    | DIVIDEND |       2000 |          1 | CAD      |     2,000.00 |  2,000.00 |              0 |      31,622.49 |                 0.00 |
| 156 | 2025-12-28T05:51:30.000Z | DXYZ      | SELL     |          7 |      46.87 | USD      |       328.09 |    457.03 |              0 |      32,079.52 |                 0.00 |
| 157 | 2026-01-05T05:27:22.000Z | XEQT.TO   | BUY      |         36 |       40.3 | CAD      |     1,450.80 |  1,450.80 |             36 |      30,628.72 |                 0.00 |
| 158 | 2026-01-07T05:15:59.000Z | GS        | BUY      |         12 |      576.5 | USD      |     6,918.00 |  9,636.77 |             12 |      20,991.94 |                 0.00 |
| 159 | 2026-01-15T05:27:46.000Z | IAT       | BUY      |        201 |       57.1 | USD      |    11,477.10 | 15,987.60 |            201 |       5,004.34 |                 0.00 |
| 160 | 2026-01-21T05:05:20.000Z | XSU.TO    | BUY      |        447 |      50.39 | CAD      |    22,524.33 | 22,524.33 |            447 |           0.00 |            17,519.99 |
| 161 | 2026-01-21T05:45:41.000Z | XSU.TO    | BUY      |        140 |         50 | CAD      |     7,000.00 |  7,000.00 |            587 |           0.00 |             7,000.00 |
| 162 | 2026-02-10T05:30:07.000Z | XSU.TO    | BUY      |         60 |         50 | CAD      |     3,000.00 |  3,000.00 |            647 |           0.00 |             3,000.00 |
| 163 | 2026-03-02T05:47:55.000Z | XEQT.TO   | BUY      |    18.4524 |         42 | CAD      |       775.00 |    775.00 |        54.4524 |           0.00 |               775.00 |
| 164 | 2026-03-06T05:23:48.000Z | XEQT.TO   | BUY      |    35.5588 |    40.4063 | CAD      |     1,436.80 |  1,436.80 |        90.0112 |           0.00 |             1,436.80 |
| 165 | 2026-03-06T05:58:06.000Z | QQC.TO    | BUY      |         25 |      39.77 | CAD      |       994.25 |    994.25 |             25 |           0.00 |               994.25 |
| 166 | 2026-03-10T04:50:48.000Z | CGDV      | BUY      |    106.313 |      43.66 | USD      |     4,641.63 |  6,465.78 |        106.313 |           0.00 |             6,465.78 |
| 167 | 2026-03-23T04:04:42.000Z | XEQT.TO   | BUY      |         75 |      39.51 | CAD      |     2,963.25 |  2,963.25 |       165.0112 |           0.00 |             2,963.25 |
| 168 | 2026-03-23T04:48:21.000Z | XEQT.TO   | BUY      |        357 |      39.35 | CAD      |    14,047.95 | 14,047.95 |       522.0112 |           0.00 |            14,047.95 |
| 169 | 2026-04-02T04:26:14.000Z | XEQT.TO   | BUY      |    19.1766 |      40.42 | CAD      |       775.12 |    775.12 |       541.1878 |           0.00 |               775.12 |
| 170 | 2026-04-06T04:39:08.000Z | XEQT.TO   | BUY      |    35.3543 |      40.64 | CAD      |     1,436.80 |  1,436.80 |       576.5421 |           0.00 |             1,436.80 |
| 171 | 2026-04-08T16:18:25.633Z | XEQT.TO   | BUY      |        276 |      41.67 | CAD      |    11,500.92 | 11,500.92 |       852.5421 |           0.00 |            11,500.92 |
| 172 | 2026-04-08T16:24:44.207Z | XEQT.TO   | BUY      |        241 |      41.67 | CAD      |    10,042.47 | 10,042.47 |      1093.5421 |           0.00 |            10,042.47 |
| 173 | 2026-04-10T00:22:39.658Z | XEQT.TO   | BUY      |        149 |      41.58 | CAD      |     6,195.42 |  6,195.42 |      1242.5421 |           0.00 |             6,195.42 |
| 174 | 2026-04-10T04:06:15.000Z | CGDV      | BUY      |    22.3464 |    44.7499 | USD      |     1,000.00 |  1,393.00 |       128.6594 |           0.00 |             1,393.00 |
| 175 | 2026-04-17T04:25:04.000Z | TILV.TO   | BUY      |        256 |      20.83 | CAD      |     5,332.48 |  5,332.48 |            256 |           0.00 |             5,332.48 |
| 176 | 2026-04-21T04:02:36.000Z | XEQT.TO   | BUY      |        160 |      42.45 | CAD      |     6,792.00 |  6,792.00 |      1402.5421 |           0.00 |             6,792.00 |
| 177 | 2026-04-21T04:32:52.000Z | XEQT.TO   | BUY      |        143 |      42.48 | CAD      |     6,074.64 |  6,074.64 |      1545.5421 |           0.00 |             6,074.64 |
| 178 | 2026-04-21T04:46:59.000Z | GOOG.TO   | SELL     |        125 |      54.06 | CAD      |     6,757.50 |  6,757.50 |            124 |       6,757.50 |                 0.00 |
| 179 | 2026-04-23T04:45:56.000Z | BRK.NE    | BUY      |        647 |      34.43 | CAD      |    22,276.21 | 22,276.21 |           1612 |           0.00 |            15,518.71 |
| 180 | 2026-04-24T04:26:03.000Z | TILV.TO   | SELL     |        256 |      20.37 | CAD      |     5,214.72 |  5,214.72 |              0 |       5,214.72 |                 0.00 |
| 181 | 2026-04-24T21:08:35.963Z | FINN.NE   | BUY      |        432 |       27.9 | CAD      |    12,052.80 | 12,052.80 |            432 |           0.00 |             6,838.08 |
| 182 | 2026-04-24T21:17:33.414Z | CGDV      | BUY      |        380 |      46.11 | USD      |    17,521.80 | 24,407.87 |       508.6594 |           0.00 |            24,407.87 |
| 183 | 2026-04-24T21:51:51.596Z | GOOG.TO   | SELL     |        124 |      55.16 | CAD      |     6,839.84 |  6,839.84 |              0 |       6,839.84 |                 0.00 |
| 184 | 2026-04-24T21:52:21.198Z | IAT       | SELL     |        201 |      57.73 | USD      |    11,603.73 | 16,164.00 |              0 |      23,003.84 |                 0.00 |
| 185 | 2026-04-28T16:34:35.260Z | OSCR      | SELL     |         50 |       17.8 | USD      |       890.00 |  1,239.77 |              0 |      24,243.61 |                 0.00 |
| 186 | 2026-05-02T01:34:51.507Z | GS        | SELL     |         12 |     922.93 | USD      |    11,075.16 | 15,427.70 |              0 |      39,671.30 |                 0.00 |
| 187 | 2026-05-02T02:10:09.996Z | CGDV      | BUY      |        242 |    46.7174 | USD      |    11,305.61 | 15,748.72 |       750.6594 |      23,922.59 |                 0.00 |
| 188 | 2026-05-02T02:38:14.745Z | PSA.TO    | DIVIDEND |        600 |          1 | CAD      |       600.00 |    600.00 |              0 |      24,522.59 |                 0.00 |
| 189 | 2026-05-07T04:54:08.000Z | PANW      | SELL     |         18 |     194.12 | USD      |     3,494.16 |  4,867.36 |             50 |      29,389.95 |                 0.00 |
| 190 | 2026-05-07T16:45:25.741Z | NVDA      | SELL     |         24 |      212.4 | USD      |     5,097.60 |  7,100.96 |             68 |      36,490.91 |                 0.00 |
| 191 | 2026-05-07T16:57:31.513Z | NVDA      | SELL     |         40 |     213.33 | USD      |     8,533.20 | 11,886.75 |             28 |      48,377.66 |                 0.00 |
| 192 | 2026-05-07T17:13:33.837Z | NVDA.TO   | SELL     |        164 |      48.05 | CAD      |     7,880.20 |  7,880.20 |              0 |      56,257.86 |                 0.00 |
| 193 | 2026-05-07T18:33:36.994Z | CELH      | SELL     |         20 |       34.2 | USD      |       684.00 |    952.81 |              0 |      57,210.67 |                 0.00 |
| 194 | 2026-05-07T18:37:43.623Z | TEM       | SELL     |         20 |      49.61 | USD      |       992.20 |  1,382.13 |              0 |      58,592.80 |                 0.00 |
| 195 | 2026-05-07T18:37:46.559Z | DXPE      | SELL     |          2 |     147.92 | USD      |       295.84 |    412.11 |              0 |      59,004.91 |                 0.00 |
| 196 | 2026-05-07T18:40:14.228Z | INTA      | SELL     |          3 |      23.85 | USD      |        71.55 |     99.67 |              0 |      59,104.58 |                 0.00 |
| 197 | 2026-05-07T18:41:54.143Z | PRLB      | SELL     |          5 |       68.7 | USD      |       343.50 |    478.50 |              0 |      59,583.07 |                 0.00 |
| 198 | 2026-05-07T18:42:54.191Z | MELI      | SELL     |          1 |       1846 | USD      |     1,846.00 |  2,571.48 |              0 |      62,154.55 |                 0.00 |
| 199 | 2026-05-07T18:43:17.190Z | SEZL      | SELL     |          6 |     103.17 | USD      |       619.02 |    862.29 |             25 |      63,016.85 |                 0.00 |
| 200 | 2026-05-07T18:43:21.476Z | OPFI      | SELL     |         21 |    10.3569 | USD      |       217.49 |    302.97 |              0 |      63,319.82 |                 0.00 |
| 201 | 2026-05-07T18:43:55.943Z | SEZL      | SELL     |         12 |      103.2 | USD      |     1,238.40 |  1,725.09 |             13 |      65,044.91 |                 0.00 |
| 202 | 2026-05-07T18:44:52.812Z | DOCU      | SELL     |          3 |      48.15 | USD      |       144.45 |    201.22 |              0 |      65,246.13 |                 0.00 |
| 203 | 2026-05-07T18:46:42.091Z | TWLO      | SELL     |          3 |     196.66 | USD      |       589.98 |    821.84 |              0 |      66,067.97 |                 0.00 |
| 204 | 2026-05-07T18:51:40.642Z | EAT       | SELL     |          2 |      144.6 | USD      |       289.20 |    402.86 |              0 |      66,470.82 |                 0.00 |
| 205 | 2026-05-07T18:53:24.442Z | CRDO      | SELL     |          3 |      188.5 | USD      |       565.50 |    787.74 |              0 |      67,258.57 |                 0.00 |
| 206 | 2026-05-07T18:58:33.643Z | FRSH      | SELL     |         12 |      9.015 | USD      |       108.18 |    150.69 |              0 |      67,409.26 |                 0.00 |
| 207 | 2026-05-07T19:02:12.057Z | SOFI      | SELL     |         40 |      15.96 | USD      |       638.40 |    889.29 |              0 |      68,298.55 |                 0.00 |
| 208 | 2026-05-07T19:14:06.324Z | SEZL      | SELL     |         13 |      104.2 | USD      |     1,354.60 |  1,886.96 |              0 |      70,185.51 |                 0.00 |
| 209 | 2026-05-07T19:14:37.242Z | AGX       | SELL     |          1 |        696 | USD      |       696.00 |    969.53 |              0 |      71,155.04 |                 0.00 |
| 210 | 2026-05-07T19:15:07.608Z | URBN      | SELL     |          4 |      70.69 | USD      |       282.76 |    393.88 |              0 |      71,548.92 |                 0.00 |
| 211 | 2026-05-07T19:18:45.890Z | HIMS      | SELL     |         20 |      25.42 | USD      |       508.40 |    708.20 |              0 |      72,257.12 |                 0.00 |
| 212 | 2026-05-07T19:20:58.921Z | FINN.NE   | SELL     |        187 |      29.96 | CAD      |     5,602.52 |  5,602.52 |            245 |      77,859.64 |                 0.00 |
| 213 | 2026-05-07T19:23:35.193Z | DUOL      | SELL     |          4 |     114.48 | USD      |       457.92 |    637.88 |              0 |      78,497.53 |                 0.00 |
| 214 | 2026-05-07T19:23:59.486Z | CLS.NE    | SELL     |          2 |        524 | CAD      |     1,048.00 |  1,048.00 |              0 |      79,545.53 |                 0.00 |
| 215 | 2026-05-07T19:24:01.191Z | FINN.NE   | SELL     |        245 |      29.96 | CAD      |     7,340.20 |  7,340.20 |              0 |      86,885.73 |                 0.00 |
| 216 | 2026-05-07T19:28:47.008Z | LRN       | SELL     |          2 |       91.3 | USD      |       182.60 |    254.36 |              0 |      87,140.09 |                 0.00 |
| 217 | 2026-05-07T19:37:17.775Z | ASML      | SELL     |          1 |       1512 | USD      |     1,512.00 |  2,106.22 |              0 |      89,246.30 |                 0.00 |
| 218 | 2026-05-08T15:43:26.421Z | TMDX      | SELL     |          5 |      68.32 | USD      |       341.60 |    475.85 |              0 |      89,722.15 |                 0.00 |
| 219 | 2026-05-12T01:32:02.355Z | NVDA      | SELL     |         28 |      219.5 | USD      |     6,146.00 |  8,561.38 |              0 |      98,283.53 |                 0.00 |
| 220 | 2026-05-14T14:31:46.132Z | MSFT      | BUY      |         28 |      404.2 | USD      |    11,317.60 | 15,765.42 |             39 |      82,518.11 |                 0.00 |
| 221 | 2026-05-14T16:13:59.992Z | SE        | SELL     |         20 |      88.17 | USD      |     1,763.40 |  2,456.42 |             11 |      84,974.53 |                 0.00 |
| 222 | 2026-05-14T16:18:01.221Z | SE        | SELL     |         11 |      87.74 | USD      |       965.14 |  1,344.44 |              0 |      86,318.97 |                 0.00 |
| 223 | 2026-05-14T16:25:25.505Z | SKYY      | BUY      |         14 |     129.88 | USD      |     1,818.32 |  2,532.92 |             14 |      83,786.05 |                 0.00 |
| 224 | 2026-05-15T14:57:28.235Z | MSFT      | BUY      |         20 |     424.49 | USD      |     8,489.80 | 11,826.29 |             59 |      71,959.76 |                 0.00 |
| 225 | 2026-05-18T04:21:28.000Z | NOW       | BUY      |         24 |     105.05 | USD      |     2,521.20 |  3,512.03 |             24 |      68,447.73 |                 0.00 |
| 226 | 2026-05-18T04:23:41.000Z | ZS        | BUY      |          9 |     167.17 | USD      |     1,504.53 |  2,095.81 |              9 |      66,351.92 |                 0.00 |
| 227 | 2026-05-18T04:29:45.000Z | NET       | BUY      |          4 |        199 | USD      |       796.00 |  1,108.83 |              4 |      65,243.09 |                 0.00 |
| 228 | 2026-05-18T04:31:16.000Z | SNOW      | BUY      |          6 |     157.83 | USD      |       946.98 |  1,319.14 |              6 |      63,923.95 |                 0.00 |
| 229 | 2026-05-22T04:07:58.000Z | SFM       | SELL     |          1 |         77 | USD      |        77.00 |    107.26 |              0 |      64,031.21 |                 0.00 |
| 230 | 2026-05-22T21:25:09.445Z | IWM       | SELL     |         33 |     284.65 | USD      |     9,393.45 | 13,085.08 |              0 |      77,116.28 |                 0.00 |
| 231 | 2026-05-27T04:20:37.000Z | ZXLV.TO   | BUY      |        251 |      29.27 | CAD      |     7,346.77 |  7,346.77 |            251 |      69,769.51 |                 0.00 |
| 232 | 2026-05-29T14:52:27.505Z | NOW       | BUY      |          2 |     115.91 | USD      |       231.82 |    322.93 |             26 |      69,446.59 |                 0.00 |
| 233 | 2026-06-01T04:11:51.000Z | ZVST.NE   | BUY      |         80 |       7.69 | CAD      |       615.20 |    615.20 |             80 |      68,831.39 |                 0.00 |
| 234 | 2026-06-01T04:40:58.000Z | NOW       | BUY      |          4 |        130 | USD      |       520.00 |    724.36 |             30 |      68,107.03 |                 0.00 |
| 235 | 2026-06-03T04:35:46.000Z | LULU      | SELL     |          4 |        111 | USD      |       444.00 |    618.49 |              0 |      68,725.52 |                 0.00 |
| 236 | 2026-06-03T17:55:52.446Z | PANW.NE   | SELL     |        198 |      32.88 | CAD      |     6,510.24 |  6,510.24 |              0 |      75,235.76 |                 0.00 |
| 237 | 2026-06-05T15:04:46.710Z | PANW      | SELL     |         18 |        276 | USD      |     4,968.00 |  6,920.42 |             32 |      82,156.18 |                 0.00 |
| 238 | 2026-06-05T15:21:34.510Z | PANW      | SELL     |         32 |      277.3 | USD      |     8,873.60 | 12,360.92 |              0 |      94,517.11 |                 0.00 |
| 239 | 2026-06-05T15:49:50.529Z | CGDV      | BUY      |        282 |       48.5 | USD      |    13,677.00 | 19,052.06 |      1032.6594 |      75,465.05 |                 0.00 |
| 240 | 2026-06-10T04:51:11.000Z | MSFT      | BUY      |          4 |    383.495 | USD      |     1,533.98 |  2,136.83 |             63 |      73,328.21 |                 0.00 |
| 241 | 2026-06-11T04:42:22.000Z | MSFT      | BUY      |          2 |        386 | USD      |       772.00 |  1,075.40 |             65 |      72,252.82 |                 0.00 |
| 242 | 2026-06-12T04:25:06.000Z | SPCX      | BUY      |         11 |        135 | USD      |     1,485.00 |  2,068.60 |             11 |      70,184.21 |                 0.00 |
| 243 | 2026-06-13T04:39:02.000Z | SPCX      | SELL     |         11 |     170.25 | USD      |     1,872.75 |  2,608.74 |              0 |      72,792.95 |                 0.00 |
| 244 | 2026-06-22T04:27:58.000Z | NU        | SELL     |        124 |       13.5 | USD      |     1,674.00 |  2,331.88 |              0 |      75,124.84 |                 0.00 |
| 245 | 2026-06-22T04:42:54.000Z | MSFT.TO   | BUY      |        100 |       25.7 | CAD      |     2,570.00 |  2,570.00 |            100 |      72,554.84 |                 0.00 |
| 246 | 2026-06-24T04:38:11.000Z | NOW       | BUY      |          4 |       94.8 | USD      |       379.20 |    528.23 |             34 |      72,026.61 |                 0.00 |
| 247 | 2026-06-25T04:53:51.000Z | NOW       | BUY      |          1 |      90.22 | USD      |        90.22 |    125.68 |             35 |      71,900.93 |                 0.00 |
| 248 | 2026-06-26T04:29:08.000Z | MSFT.TO   | BUY      |        107 |      25.75 | CAD      |     2,755.25 |  2,755.25 |            207 |      69,145.68 |                 0.00 |
| 249 | 2026-07-17T04:20:35.000Z | ISRG      | BUY      |          2 |        357 | USD      |       714.00 |    994.60 |              2 |      68,151.08 |                 0.00 |
| 250 | 2026-07-17T04:20:44.000Z | SOFI      | BUY      |         14 |      16.22 | USD      |       227.08 |    316.32 |             14 |      67,834.76 |                 0.00 |
| 251 | 2026-07-28T04:32:56.000Z | SOFI      | BUY      |          8 |      16.18 | USD      |       129.44 |    180.31 |             22 |      67,654.45 |                 0.00 |
| 252 | 2026-08-02T04:16:26.000Z | ZVST.NE   | BUY      |         90 |       7.67 | CAD      |       690.30 |    690.30 |            170 |      66,964.15 |                 0.00 |
| 253 | 2026-08-20T04:18:55.000Z | IBIT      | BUY      |        260 |       40.7 | USD      |    10,582.00 | 14,740.73 |            346 |      52,223.42 |                 0.00 |
| 254 | 2026-08-22T13:38:22.254Z | NOW       | BUY      |          5 |        105 | USD      |       525.00 |    731.32 |             40 |      51,492.10 |                 0.00 |
| 255 | 2026-08-22T13:38:33.865Z | BTCX-B.NE | BUY      |      14.41 |    73.5634 | CAD      |     1,060.05 |  1,060.05 |         974.41 |      50,432.05 |                 0.00 |
| 256 | 2026-08-26T04:00:36.000Z | ZVST.NE   | BUY      |        130 |        7.7 | CAD      |     1,001.00 |  1,001.00 |            300 |      49,431.05 |                 0.00 |
| 257 | 2026-08-26T04:11:01.000Z | MSFT      | SELL     |          6 |      495.2 | USD      |     2,971.20 |  4,138.88 |             59 |      53,569.93 |                 0.00 |
| 258 | 2026-08-26T04:45:31.000Z | MSFT.TO   | BUY      |        119 |      34.61 | CAD      |     4,118.59 |  4,118.59 |            326 |      49,451.34 |                 0.00 |
| 259 | 2026-09-03T04:12:46.000Z | XSU.TO    | BUY      |          2 |      54.98 | CAD      |       109.96 |    109.96 |            649 |      49,341.38 |                 0.00 |
| 260 | 2026-09-11T04:03:45.000Z | FOTO      | BUY      |         35 |      18.02 | USD      |       630.70 |    878.57 |             35 |      48,462.82 |                 0.00 |
| 261 | 2026-09-11T04:10:57.000Z | XSU.TO    | BUY      |        147 |       54.2 | CAD      |     7,967.40 |  7,967.40 |            796 |      40,495.42 |                 0.00 |
| 262 | 2026-09-11T04:37:43.000Z | BKR       | BUY      |         10 |      58.95 | USD      |       589.50 |    821.17 |             10 |      39,674.24 |                 0.00 |
| 263 | 2026-09-14T04:42:07.000Z | FOTO      | BUY      |        175 |         17 | USD      |     2,975.00 |  4,144.18 |            210 |      35,530.07 |                 0.00 |
| 264 | 2026-09-14T04:50:07.000Z | BKR       | BUY      |         20 |         57 | USD      |     1,140.00 |  1,588.02 |             30 |      33,942.05 |                 0.00 |
| 265 | 2026-09-16T04:51:12.000Z | ENB.TO    | BUY      |        148 |      67.56 | CAD      |     9,998.88 |  9,998.88 |            148 |      23,943.17 |                 0.00 |
| 266 | 2026-09-22T04:09:03.000Z | XSU.TO    | BUY      |        125 |         54 | CAD      |     6,750.00 |  6,750.00 |            921 |      17,193.17 |                 0.00 |
| 267 | 2026-09-23T04:08:28.000Z | SOFI      | BUY      |         87 |      16.15 | USD      |     1,405.05 |  1,957.23 |            109 |      15,235.93 |                 0.00 |
| 268 | 2026-09-25T19:18:30.871Z | ENB.TO    | BUY      |         60 |       66.1 | CAD      |     3,966.00 |  3,966.00 |            208 |      11,269.93 |                 0.00 |
| 269 | 2026-10-07T04:20:33.000Z | XSU.TO    | BUY      |         58 |      51.81 | CAD      |     3,004.98 |  3,004.98 |            979 |       8,264.95 |                 0.00 |
| 270 | 2026-10-14T04:27:35.000Z | BRK.NE    | SELL     |         70 |      37.89 | CAD      |     2,652.30 |  2,652.30 |           1542 |      10,917.25 |                 0.00 |
| 271 | 2026-10-14T04:44:00.000Z | XSU.TO    | BUY      |         54 |       50.6 | CAD      |     2,732.40 |  2,732.40 |           1033 |       8,184.85 |                 0.00 |
| 272 | 2026-10-14T14:11:37.236Z | NET       | SELL     |          4 |        343 | USD      |     1,372.00 |  1,911.20 |              0 |      10,096.05 |                 0.00 |
| 273 | 2026-10-14T14:13:36.450Z | IWM       | BUY      |          6 |      272.8 | USD      |     1,636.80 |  2,280.06 |              6 |       7,815.99 |                 0.00 |
| 274 | 2026-10-15T04:55:32.000Z | BKR       | BUY      |         20 |       54.2 | USD      |     1,084.00 |  1,510.01 |             50 |         401.18 |                 0.00 |
| 275 | 2026-10-16T04:00:51.000Z | BRK.NE    | SELL     |         46 |      38.13 | CAD      |     1,753.98 |  1,753.98 |           1496 |       2,155.16 |                 0.00 |
| 276 | 2026-10-16T04:05:25.000Z | BRK.NE    | SELL     |         15 |      38.15 | CAD      |       572.25 |    572.25 |           1481 |       2,727.41 |                 0.00 |
| 277 | 2026-10-16T04:17:04.000Z | XSU.TO    | BUY      |         34 |      50.67 | CAD      |     1,722.78 |  1,722.78 |           1067 |       1,004.63 |                 0.00 |
| 278 | 2026-10-16T04:54:19.000Z | XSU.TO    | BUY      |         12 |       50.6 | CAD      |       607.20 |    607.20 |           1079 |         397.43 |                 0.00 |
| 279 | 2026-10-20T04:13:28.000Z | SNOW      | SELL     |          6 |      312.5 | USD      |     1,875.00 |  2,611.88 |              0 |       3,009.31 |                 0.00 |
| 280 | 2026-10-21T04:53:47.000Z | SOFI      | BUY      |          6 |      14.95 | USD      |        89.70 |    124.95 |            115 |       2,884.36 |                 0.00 |
| 281 | 2026-10-23T04:10:17.000Z | VST       | BUY      |         14 |        139 | USD      |     1,946.00 |  2,710.78 |             14 |         173.58 |                 0.00 |
| 282 | 2026-10-31T03:39:51.872Z | BRK-B     | SELL     |         10 |        546 | USD      |     5,460.00 |  7,605.78 |              0 |       7,779.36 |                 0.00 |
| 283 | 2026-10-31T03:47:39.089Z | QQC.TO    | BUY      |         71 |      46.94 | CAD      |     3,332.74 |  3,332.74 |             96 |       4,446.62 |                 0.00 |
| 284 | 2026-10-31T03:50:09.389Z | QQQM      | BUY      |          5 |     283.36 | USD      |     1,416.80 |  1,973.60 |              5 |       2,473.02 |                 0.00 |
| 285 | 2026-10-31T03:51:38.938Z | XSU.TO    | BUY      |         77 |      52.26 | CAD      |     4,024.02 |  4,024.02 |           1156 |           0.00 |             1,551.00 |
| 286 | 2026-10-31T03:54:59.523Z | QQC.TO    | BUY      |        632 |      47.48 | CAD      |    30,007.36 | 30,007.36 |            728 |           0.00 |            30,007.36 |
| 287 | 2026-10-31T04:03:38.523Z | BRK.NE    | SELL     |         84 |      39.42 | CAD      |     3,311.28 |  3,311.28 |           1397 |       3,311.28 |                 0.00 |
| 288 | 2026-10-31T04:04:51.058Z | BRK.NE    | SELL     |        103 |      39.35 | CAD      |     4,053.05 |  4,053.05 |           1294 |       7,364.33 |                 0.00 |
| 289 | 2026-10-31T04:06:35.442Z | PYPL      | SELL     |         28 |    57.1619 | USD      |     1,600.53 |  2,229.54 |             28 |       9,593.87 |                 0.00 |
| 290 | 2026-10-31T04:16:05.774Z | QQQM      | BUY      |         19 |     285.85 | USD      |     5,431.15 |  7,565.59 |             24 |       2,028.28 |                 0.00 |
| 291 | 2026-10-31T04:18:04.373Z | QQC.TO    | BUY      |        197 |      46.94 | CAD      |     9,247.18 |  9,247.18 |            925 |           0.00 |             7,218.90 |
| 292 | 2026-11-03T05:00:00.000Z | QQC.TO    | BUY      |         10 |      46.86 | CAD      |       468.60 |    468.60 |            935 |           0.00 |               468.60 |
| 293 | 2026-11-03T15:46:05.931Z | XEQT.TO   | SELL     |        673 |      44.63 | CAD      |    30,035.99 | 30,035.99 |       872.5421 |      30,035.99 |                 0.00 |
| 294 | 2026-11-03T15:46:18.229Z | QQC.TO    | BUY      |        641 |      46.84 | CAD      |    30,024.44 | 30,024.44 |           1576 |          11.55 |                 0.00 |
