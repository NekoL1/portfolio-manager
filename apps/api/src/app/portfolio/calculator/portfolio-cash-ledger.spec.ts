import { endOfDay, parseISO } from 'date-fns';

import { calculatePortfolioCashLedger } from './portfolio-cash-ledger';

const activity = (overrides: Record<string, unknown> = {}) => ({
  accountId: 'a',
  currency: 'CAD',
  date: '2026-01-01T12:00:00.000Z',
  fee: 0,
  quantity: 1,
  type: 'BUY',
  unitPrice: 100,
  ...overrides
});

const calculate = (
  overrides: Partial<Parameters<typeof calculatePortfolioCashLedger>[0]> = {}
) =>
  calculatePortfolioCashLedger({
    activities: [],
    balances: [],
    dates: ['2026-01-01', '2026-01-02', '2026-01-03'],
    exchangeRates: {},
    targetCurrency: 'CAD',
    ...overrides
  });

describe('portfolio cash ledger', () => {
  it('retains the exact XEQT sale proceeds and spends them on QQC without new contributions', () => {
    const result = calculate({
      activities: [
        activity({ quantity: 673, unitPrice: 30 }),
        activity({
          date: '2026-01-02T12:00:00.000Z',
          type: 'SELL',
          quantity: 673,
          unitPrice: 44.63
        }),
        activity({
          date: '2026-01-03T12:00:00.000Z',
          quantity: 641,
          unitPrice: 46.84
        })
      ]
    });

    expect(result.cashByDate['2026-01-02'].toNumber()).toBe(30035.99);
    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(11.55);
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(20190);
    expect(result.cashFlows).toEqual([
      { amount: 20190, date: '2026-01-01T12:00:00.000Z' }
    ]);
    expect(
      result.cashByDate['2026-01-03']
        .plus(30024.44)
        .minus(result.contributionsByDate['2026-01-03'])
        .toNumber()
    ).toBe(9845.99);
  });

  it('does not retroactively fund earlier buys with later sale proceeds', () => {
    const result = calculate({
      activities: [
        activity({ unitPrice: 20000 }),
        activity({
          date: '2026-01-02T12:00:00Z',
          type: 'SELL',
          unitPrice: 10000
        })
      ]
    });
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(20000);
    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(10000);
  });

  it('uses 30000 of sale proceeds for 35000 of later purchases and adds only 5000', () => {
    const result = calculate({
      activities: [
        activity({ unitPrice: 30000 }),
        activity({
          date: '2026-01-02T09:00:00Z',
          type: 'SELL',
          unitPrice: 30000
        }),
        activity({ date: '2026-01-02T10:00:00Z', unitPrice: 20000 }),
        activity({ date: '2026-01-03T12:00:00Z', unitPrice: 15000 })
      ]
    });
    expect(result.cashByDate['2026-01-02'].toNumber()).toBe(10000);
    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(0);
    expect(result.cashFlows.map(({ amount }) => amount)).toEqual([30000, 5000]);
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(35000);
  });

  it('retains all proceeds after full liquidation and charges sale fees once', () => {
    const result = calculate({
      activities: [
        activity({ fee: 2 }),
        activity({
          date: '2026-01-02T12:00:00.000Z',
          type: 'SELL',
          unitPrice: 150,
          fee: 3
        })
      ]
    });

    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(147);
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(102);
    expect(
      result.cashByDate['2026-01-03']
        .minus(result.contributionsByDate['2026-01-03'])
        .toNumber()
    ).toBe(45);
  });

  it('reconciles end-of-day checkpoints as external flows, then keeps subsequent trading cash', () => {
    const result = calculate({
      activities: [
        activity(),
        activity({
          date: '2026-01-03T12:00:00.000Z',
          type: 'SELL',
          unitPrice: 150
        })
      ],
      balances: [
        { accountId: 'a', currency: 'CAD', date: '2026-01-02', value: 20 }
      ]
    });

    expect(result.cashByDate['2026-01-02'].toNumber()).toBe(20);
    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(170);
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(120);
    expect(result.cashFlows[1]).toEqual({
      amount: 20,
      date: endOfDay(parseISO('2026-01-02')).toISOString()
    });
  });

  it('treats a zero balance checkpoint as a withdrawal without removing realized gains', () => {
    const result = calculate({
      activities: [
        activity(),
        activity({
          date: '2026-01-02T12:00:00.000Z',
          type: 'SELL',
          unitPrice: 150
        })
      ],
      balances: [
        { accountId: 'a', currency: 'CAD', date: '2025-12-31', value: 0 },
        { accountId: 'a', currency: 'CAD', date: '2026-01-03', value: 0 }
      ]
    });

    expect(result.cashByDate['2026-01-02'].toNumber()).toBe(150);
    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(0);
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(-50);
    expect(result.cashFlows.at(-1)?.amount).toBe(-150);
  });

  it('retains income, subtracts its fees and only uses the fee amount of fee activities', () => {
    const result = calculate({
      activities: [
        activity({ type: 'DIVIDEND', unitPrice: 10, fee: 1 }),
        activity({ type: 'INTEREST', unitPrice: 5, fee: 0.5 }),
        activity({ type: 'FEE', unitPrice: 1000, quantity: 10, fee: 2 }),
        activity({ type: 'LIABILITY', unitPrice: 99999 })
      ]
    });

    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(11.5);
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(0);
    expect(result.cashFlows).toEqual([]);
  });

  it('keeps an unfunded fee as a loss instead of creating a contribution', () => {
    const result = calculate({
      activities: [activity({ type: 'FEE', fee: 5 })]
    });
    expect(result.cashByDate['2026-01-01'].toNumber()).toBe(-5);
    expect(result.contributionsByDate['2026-01-01'].toNumber()).toBe(0);
  });

  it('does not fund a purchase using sale proceeds from a different account', () => {
    const result = calculate({
      activities: [
        activity({ type: 'SELL' }),
        activity({ accountId: 'b', date: '2026-01-02T12:00:00.000Z' })
      ]
    });

    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(100);
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(100);
  });

  it('revalues retained foreign cash on every valuation date without rewriting contributions', () => {
    const result = calculate({
      activities: [activity({ type: 'SELL', currency: 'USD' })],
      exchangeRates: {
        USDCAD: { '2026-01-01': 1.3, '2026-01-02': 1.4, '2026-01-03': 1.5 }
      }
    });

    expect(result.cashByDate['2026-01-01'].toNumber()).toBe(130);
    expect(result.cashByDate['2026-01-02'].toNumber()).toBe(140);
    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(150);
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(0);
  });

  it('infers a same-account currency conversion before requiring external funding', () => {
    const result = calculate({
      activities: [
        activity({ type: 'SELL', currency: 'USD' }),
        activity({ date: '2026-01-02T12:00:00.000Z', unitPrice: 135 })
      ],
      exchangeRates: {
        USDCAD: { '2026-01-01': 1.3, '2026-01-02': 1.4, '2026-01-03': 1.5 }
      }
    });

    expect(result.cashByDate['2026-01-02'].toNumber()).toBeCloseTo(5, 10);
    expect(result.cashByDate['2026-01-03'].toNumber()).toBeCloseTo(
      (5 / 1.4) * 1.5,
      10
    );
    expect(result.cashFlows).toEqual([]);
  });

  it('uses same-currency cash before converting other cash', () => {
    const result = calculate({
      activities: [
        activity({ type: 'SELL', currency: 'USD' }),
        activity({ type: 'SELL', unitPrice: 50 }),
        activity({ date: '2026-01-02T12:00:00.000Z', unitPrice: 40 })
      ],
      exchangeRates: {
        USDCAD: { '2026-01-01': 1.3, '2026-01-02': 1.4, '2026-01-03': 1.5 }
      }
    });

    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(160);
  });

  it('reconciles all currencies in one account while preserving other accounts', () => {
    const result = calculate({
      activities: [
        activity({ type: 'SELL', currency: 'USD' }),
        activity({ type: 'SELL', unitPrice: 10 }),
        activity({ accountId: 'b', type: 'SELL', unitPrice: 20 })
      ],
      balances: [
        { accountId: 'a', currency: 'CAD', date: '2026-01-02', value: 155 },
        { accountId: 'b', currency: 'CAD', date: '2026-01-02', value: 30 }
      ],
      exchangeRates: {
        USDCAD: { '2026-01-01': 1.3, '2026-01-02': 1.4, '2026-01-03': 1.5 }
      }
    });

    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(185);
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(15);
  });

  it('includes event dates and replays unsorted input chronologically', () => {
    const result = calculate({
      dates: ['2026-01-03'],
      activities: [
        activity({
          date: '2026-01-02T12:00:00.000Z',
          type: 'SELL',
          unitPrice: 150
        }),
        activity()
      ]
    });

    expect(Object.keys(result.cashByDate)).toEqual([
      '2026-01-01',
      '2026-01-02',
      '2026-01-03'
    ]);
    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(150);
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(100);
  });

  it('supports cash-only and account-less histories', () => {
    const result = calculate({
      activities: [
        activity({
          accountId: undefined,
          date: '2026-01-02T12:00:00.000Z',
          unitPrice: 25
        })
      ],
      balances: [{ currency: 'CAD', date: '2026-01-01', value: 100 }]
    });

    expect(result.cashByDate['2026-01-03'].toNumber()).toBe(75);
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(100);
  });

  it('rejects missing FX rather than silently valuing different currencies equally', () => {
    expect(() =>
      calculate({ activities: [activity({ currency: 'USD' })] })
    ).toThrow(/exchange rate/i);
  });
  it('groups late-evening activities by the same local calendar day as chart points', () => {
    const date = new Date(2026, 0, 1, 23, 30).toISOString();
    const result = calculate({ activities: [activity({ date })] });

    expect(result.contributionsByDate['2026-01-01'].toNumber()).toBe(100);
    expect(result.cashFlows).toEqual([{ amount: 100, date }]);
  });

  it('exposes reconciled native and base currency cash by account for consistent summaries', () => {
    const result = calculate({
      activities: [
        activity({ type: 'SELL', currency: 'USD' }),
        activity({ accountId: 'b', type: 'SELL', unitPrice: 20 }),
        activity({ accountId: undefined, type: 'INTEREST', unitPrice: 10 })
      ],
      exchangeRates: { USDCAD: { '2026-01-01': 1.3, '2026-01-03': 1.5 } }
    });

    expect(result.cashBalances).toEqual([
      {
        accountId: 'a',
        currency: 'USD',
        balance: 100,
        balanceInBaseCurrency: 150
      },
      {
        accountId: 'b',
        currency: 'CAD',
        balance: 20,
        balanceInBaseCurrency: 20
      },
      {
        accountId: undefined,
        currency: 'CAD',
        balance: 10,
        balanceInBaseCurrency: 10
      }
    ]);
    expect(
      result.cashBalances.reduce(
        (sum, item) => sum + item.balanceInBaseCurrency,
        0
      )
    ).toBe(result.cashByDate['2026-01-03'].toNumber());
  });

  it('carries prior FX over a holiday and never borrows a future rate', () => {
    const result = calculate({
      activities: [activity({ type: 'SELL', currency: 'USD' })],
      exchangeRates: { USDCAD: { '2025-12-31': 1.3, '2026-01-03': 1.5 } }
    });
    expect(result.cashByDate['2026-01-02'].toNumber()).toBe(130);
    expect(() =>
      calculate({
        activities: [activity({ type: 'SELL', currency: 'USD' })],
        exchangeRates: { USDCAD: { '2026-01-03': 1.5 } }
      })
    ).toThrow(/exchange rate/i);
  });
  it('conserves wealth through a long sequence of purchases and sales, charging only fees', () => {
    let seed = 17;
    let held = 0;
    let fees = 0;
    const trades = [];
    for (let i = 0; i < 200; i++) {
      seed = (seed * 16807) % 2147483647;
      const quantity = (seed % 7) + 1;
      const sell = held >= quantity && seed % 2 === 0;
      held += sell ? -quantity : quantity;
      fees += 0.25;
      trades.push(
        activity({
          date: new Date(Date.UTC(2026, 0, 2, 12, i)).toISOString(),
          quantity,
          unitPrice: 23.75,
          fee: 0.25,
          type: sell ? 'SELL' : 'BUY'
        })
      );
    }
    const result = calculate({
      activities: trades,
      balances: [
        { accountId: 'a', currency: 'CAD', date: '2026-01-01', value: 100000 }
      ]
    });
    expect(result.cashByDate['2026-01-03'].plus(held * 23.75).toNumber()).toBe(
      100000 - fees
    );
    expect(result.contributionsByDate['2026-01-03'].toNumber()).toBe(100000);
    expect(result.cashFlows).toHaveLength(1);
  });
});
