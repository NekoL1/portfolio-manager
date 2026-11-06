import { parseDate } from '@ghostfolio/common/helper';
import { Activity } from '@ghostfolio/common/interfaces';

import { eachDayOfInterval, format } from 'date-fns';

import { MwrPortfolioCalculator } from './mwr/portfolio-calculator';
import {
  activityDummyData,
  symbolProfileDummyData
} from './portfolio-calculator-test-utils';
import { RoaiPortfolioCalculator } from './roai/portfolio-calculator';
import { TwrPortfolioCalculator } from './twr/portfolio-calculator';

type CashCheckpoint = {
  accountId: string;
  balance: number;
  currency: string;
  date: string;
  value: number;
};

function checkpoint(date: string, balance: number): CashCheckpoint {
  return {
    accountId: 'cad-account',
    balance,
    currency: 'CAD',
    date,
    value: balance
  };
}

function activity({
  date,
  fee = 0,
  isCash = false,
  price,
  quantity,
  symbol = 'XEQT.TO',
  type = 'BUY'
}: {
  date: string;
  fee?: number;
  isCash?: boolean;
  price: number;
  quantity: number;
  symbol?: string;
  type?: Activity['type'];
}): Activity {
  return {
    ...activityDummyData,
    accountId: 'cad-account',
    currency: 'CAD',
    date: parseDate(date),
    feeInAssetProfileCurrency: fee,
    feeInBaseCurrency: fee,
    quantity,
    SymbolProfile: {
      ...symbolProfileDummyData,
      assetSubClass: isCash ? 'CASH' : 'ETF',
      currency: 'CAD',
      dataSource: 'YAHOO',
      name: symbol,
      symbol
    },
    type,
    unitPriceInAssetProfileCurrency: price
  };
}

const purchase = () =>
  activity({ date: '2026-10-28T12:00:00Z', price: 40, quantity: 673 });
const sale = () =>
  activity({
    date: '2026-10-30T12:00:00Z',
    price: 44.63,
    quantity: 673,
    type: 'SELL'
  });
const reinvestment = () =>
  activity({
    date: '2026-10-31T12:00:00Z',
    price: 46.84,
    quantity: 641,
    symbol: 'QQC.TO'
  });

describe.each([
  { name: 'ROAI', Calculator: RoaiPortfolioCalculator },
  { name: 'TWR', Calculator: TwrPortfolioCalculator },
  { name: 'MWR', Calculator: MwrPortfolioCalculator }
])('$name portfolio cash accounting', ({ Calculator, name }) => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-03T17:00:00Z'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  async function calculate({
    accountBalanceItems = [],
    activities = [],
    price = (symbol, date) => {
      return symbol === 'QQC.TO' ? 46.84 : date <= '2026-10-28' ? 40 : 44.63;
    }
  }: {
    accountBalanceItems?: CashCheckpoint[];
    activities?: Activity[];
    price?: (symbol: string, date: string) => number;
  }) {
    const calculator = new Calculator({
      accountBalanceItems,
      activities,
      configurationService: { get: () => 1000 } as any,
      currency: 'CAD',
      currentRateService: {
        getValues: async ({ dataGatheringItems, dateQuery }) => ({
          dataProviderInfos: [],
          errors: [],
          values: eachDayOfInterval({
            start: dateQuery.gte,
            end: dateQuery.lt
          }).flatMap((date) => {
            return dataGatheringItems.map(({ dataSource, symbol }) => ({
              dataSource,
              date,
              marketPrice: price(symbol, format(date, 'yyyy-MM-dd')),
              symbol
            }));
          })
        })
      } as any,
      exchangeRateDataService: {
        getExchangeRatesByCurrency: async ({ startDate, endDate }) => ({
          USDCAD: Object.fromEntries(
            eachDayOfInterval({ start: startDate, end: endDate }).map(
              (date) => [format(date, 'yyyy-MM-dd'), 1.4]
            )
          ),
          CADCAD: Object.fromEntries(
            eachDayOfInterval({ start: startDate, end: endDate }).map(
              (date) => [format(date, 'yyyy-MM-dd'), 1]
            )
          )
        })
      } as any,
      filters: [],
      portfolioSnapshotService: {} as any,
      redisCacheService: {} as any,
      userId: 'cash-accounting-user'
    });

    const snapshot = await calculator.computeSnapshot();

    // Reuse the real computed snapshot without requiring Redis or a queue worker.
    Object.assign(calculator, { snapshot });
    jest.spyOn(calculator, 'getSnapshot').mockResolvedValue(snapshot);

    const { chart } = await calculator.getPerformance({
      end: parseDate('2026-11-03'),
      start: parseDate('2026-10-26')
    });

    return { calculator, chart, snapshot };
  }

  it.each([
    { description: 'no balance checkpoint', openingBalance: undefined },
    { description: 'an explicit zero checkpoint', openingBalance: 0 },
    { description: 'a partially funded account', openingBalance: 500 },
    { description: 'a fully funded account', openingBalance: 26920 }
  ])(
    'preserves value and gain across trades with $description',
    async ({ openingBalance }) => {
      const accountBalanceItems =
        openingBalance === undefined
          ? []
          : [checkpoint('2026-10-27', openingBalance)];
      const { chart, snapshot } = await calculate({
        accountBalanceItems,
        activities: [purchase(), sale(), reinvestment()]
      });

      for (const [date, cash, securities] of [
        ['2026-10-29', 0, 30035.99],
        ['2026-10-30', 30035.99, 0],
        ['2026-10-31', 11.55, 30024.44],
        ['2026-11-03', 11.55, 30024.44]
      ] as const) {
        const point = snapshot.historicalData.find(
          (item) => item.date === date
        );
        expect(point).toBeDefined();
        expect(point.totalAccountBalance).toBeCloseTo(cash, 8);
        expect(point.valueWithCurrencyEffect).toBeCloseTo(securities, 8);
        expect(point.netWorth).toBeCloseTo(30035.99, 8);
        expect(point.netContributionValueWithCurrencyEffect).toBeCloseTo(
          26920,
          8
        );

        const performance = chart.find((item) => item.date === date);
        expect(performance.valueWithCurrencyEffect).toBeCloseTo(30035.99, 8);
        expect(performance.netPerformanceWithCurrencyEffect).toBeCloseTo(
          3115.99,
          8
        );
      }

      const { chart: unchangedHoldings } = await calculate({
        accountBalanceItems,
        activities: [purchase()]
      });
      // ROAI uses average invested capital, so its percentage can change as
      // proceeds move between securities and cash. Dollar gains must agree.
      if (name !== 'ROAI') {
        expect(
          chart.at(-1).netPerformanceInPercentageWithCurrencyEffect
        ).toBeCloseTo(
          unchangedHoldings.at(-1).netPerformanceInPercentageWithCurrencyEffect,
          8
        );
      }
    }
  );

  it('spends sale cash before treating a purchase shortfall as new money, not profit', async () => {
    const { chart, snapshot } = await calculate({
      activities: [
        activity({ date: '2026-10-28T12:00:00Z', price: 1000, quantity: 10 }),
        activity({
          date: '2026-10-29T12:00:00Z',
          price: 1500,
          quantity: 10,
          type: 'SELL'
        }),
        activity({
          date: '2026-10-30T12:00:00Z',
          price: 1000,
          quantity: 20,
          symbol: 'QQC.TO'
        })
      ],
      price: (symbol, date) =>
        symbol === 'QQC.TO' || date <= '2026-10-28' ? 1000 : 1500
    });

    expect(
      snapshot.historicalData.find(({ date }) => date === '2026-10-29')
    ).toMatchObject({
      netWorth: 15000,
      totalAccountBalance: 15000,
      netContributionValueWithCurrencyEffect: 10000
    });
    expect(snapshot.historicalData.at(-1)).toMatchObject({
      netWorth: 20000,
      totalAccountBalance: 0,
      netContributionValueWithCurrencyEffect: 15000
    });
    expect(
      chart.find(({ date }) => date === '2026-10-29')
        .netPerformanceWithCurrencyEffect
    ).toBe(5000);
    expect(chart.at(-1).netPerformanceWithCurrencyEffect).toBe(5000);
    expect(chart.at(-1).valueWithCurrencyEffect).toBe(20000);
  });

  it('keeps all sale proceeds and realized gain after complete liquidation', async () => {
    const { chart, snapshot } = await calculate({
      accountBalanceItems: [checkpoint('2026-10-27', 26920)],
      activities: [purchase(), sale()]
    });

    expect(snapshot.historicalData.at(-1)).toMatchObject({
      netContributionValueWithCurrencyEffect: 26920,
      netWorth: 30035.99,
      totalAccountBalance: 30035.99,
      valueWithCurrencyEffect: 0
    });
    expect(chart.at(-1).netPerformanceWithCurrencyEffect).toBeCloseTo(
      3115.99,
      8
    );
  });

  it('does not count retained dividends twice and deducts each fee once', async () => {
    const { chart, snapshot } = await calculate({
      accountBalanceItems: [checkpoint('2026-10-27', 2000)],
      activities: [
        activity({
          date: '2026-10-28T12:00:00Z',
          price: 100,
          quantity: 10,
          fee: 5
        }),
        activity({
          date: '2026-10-29T12:00:00Z',
          price: 2,
          quantity: 10,
          type: 'DIVIDEND',
          fee: 2
        }),
        activity({
          date: '2026-10-30T12:00:00Z',
          price: 0,
          quantity: 0,
          type: 'FEE',
          fee: 3
        }),
        activity({
          date: '2026-10-31T12:00:00Z',
          price: 100,
          quantity: 10,
          type: 'SELL',
          fee: 2
        })
      ],
      price: () => 100
    });

    for (const [date, expectedValue, expectedGain] of [
      ['2026-10-28', 1995, -5],
      ['2026-10-29', 2013, 13],
      ['2026-10-30', 2010, 10],
      ['2026-10-31', 2008, 8]
    ] as const) {
      const point = snapshot.historicalData.find((item) => item.date === date);
      expect(point.netWorth).toBeCloseTo(expectedValue, 8);
      expect(point.netContributionValueWithCurrencyEffect).toBe(2000);
      expect(
        chart.find((item) => item.date === date)
          .netPerformanceWithCurrencyEffect
      ).toBeCloseTo(expectedGain, 8);
    }
    expect(snapshot.historicalData.at(-1).totalAccountBalance).toBe(2008);
  });

  it('values cash-only deposits and withdrawals without manufacturing performance', async () => {
    const { calculator, chart, snapshot } = await calculate({
      accountBalanceItems: [
        checkpoint('2026-10-27', 1000),
        checkpoint('2026-10-29', 1500),
        checkpoint('2026-10-31', 1250)
      ]
    });

    for (const [date, balance] of [
      ['2026-10-27', 1000],
      ['2026-10-29', 1500],
      ['2026-10-31', 1250],
      ['2026-11-03', 1250]
    ] as const) {
      expect(
        snapshot.historicalData.find((item) => item.date === date)
      ).toMatchObject({
        netContributionValueWithCurrencyEffect: balance,
        netWorth: balance,
        totalAccountBalance: balance
      });
      expect(
        chart.find((item) => item.date === date)
          .netPerformanceWithCurrencyEffect
      ).toBeCloseTo(0, 8);
    }

    const { chart: range } = await calculator.getPerformance({
      end: parseDate('2026-11-03'),
      start: parseDate('2026-10-29')
    });
    expect(range.at(-1).netPerformanceWithCurrencyEffect).toBeCloseTo(0, 8);
    expect(
      range.at(-1).netPerformanceInPercentageWithCurrencyEffect
    ).toBeCloseTo(0, 8);
  });

  it('does not duplicate balance contributions through synthetic CASH activities', async () => {
    const { chart, snapshot } = await calculate({
      accountBalanceItems: [
        checkpoint('2026-10-27', 1000),
        checkpoint('2026-10-29', 1500),
        checkpoint('2026-10-31', 1250)
      ],
      activities: [
        activity({
          date: '2026-10-27T12:00:00Z',
          isCash: true,
          price: 1,
          quantity: 1000,
          symbol: 'CAD'
        }),
        activity({
          date: '2026-10-29T12:00:00Z',
          isCash: true,
          price: 1,
          quantity: 500,
          symbol: 'CAD'
        }),
        activity({
          date: '2026-10-31T12:00:00Z',
          isCash: true,
          price: 1,
          quantity: 250,
          symbol: 'CAD',
          type: 'SELL'
        })
      ]
    });

    expect(snapshot.historicalData.at(-1)).toMatchObject({
      netContributionValueWithCurrencyEffect: 1250,
      netWorth: 1250,
      totalAccountBalance: 1250
    });
    expect(chart.at(-1).netPerformanceWithCurrencyEffect).toBeCloseTo(0, 8);
  });

  it('uses opening range value and does not move prior gains into a later trading period', async () => {
    const { calculator } = await calculate({
      accountBalanceItems: [checkpoint('2026-10-27', 0)],
      activities: [purchase(), sale(), reinvestment()]
    });

    for (const start of ['2026-10-29', '2026-10-30', '2026-10-31']) {
      const { chart } = await calculator.getPerformance({
        end: parseDate('2026-11-03'),
        start: parseDate(start)
      });
      expect(chart.at(-1).valueWithCurrencyEffect).toBeCloseTo(30035.99, 8);
      expect(chart.at(-1).netPerformanceWithCurrencyEffect).toBeCloseTo(0, 8);
      expect(
        chart.at(-1).netPerformanceInPercentageWithCurrencyEffect
      ).toBeCloseTo(0, 8);
    }
  });

  it('reuses same-day sale proceeds in chronological order even when input order is reversed', async () => {
    const sameDaySale = { ...sale(), date: parseDate('2026-10-30T12:00:00Z') };
    const sameDayBuy = {
      ...reinvestment(),
      date: parseDate('2026-10-30T14:00:00Z')
    };
    const { chart, snapshot } = await calculate({
      activities: [sameDayBuy, purchase(), sameDaySale]
    });

    expect(snapshot.historicalData.at(-1)).toMatchObject({
      netContributionValueWithCurrencyEffect: 26920,
      netWorth: 30035.99,
      totalAccountBalance: 11.55
    });
    expect(chart.at(-1).netPerformanceWithCurrencyEffect).toBeCloseTo(
      3115.99,
      8
    );
  });
  it('settles a trade and its fee in the transaction currency, not the asset currency', async () => {
    const order = activity({
      date: '2026-10-28T12:00:00Z',
      price: 14,
      quantity: 1,
      fee: 1.4
    });
    order.currency = 'USD';
    order.unitPrice = 10;
    order.fee = 1;
    const { chart, snapshot } = await calculate({
      accountBalanceItems: [
        { ...checkpoint('2026-10-27', 100), currency: 'USD', value: 140 }
      ],
      activities: [order],
      price: () => 14
    });
    expect(snapshot.cashBalances).toEqual([
      {
        accountId: 'cad-account',
        currency: 'USD',
        balance: 89,
        balanceInBaseCurrency: 124.6
      }
    ]);
    expect(chart.at(-1).netWorth).toBeCloseTo(138.6, 8);
    expect(chart.at(-1).netPerformanceWithCurrencyEffect).toBeCloseTo(-1.4, 8);
  });
});

describe('ROAI currency attribution', () => {
  it('preserves FX-neutral gains when reconciling portfolio cash flows', async () => {
    const calculator = Object.create(
      RoaiPortfolioCalculator.prototype
    ) as RoaiPortfolioCalculator;
    Object.assign(calculator, {
      getHistoricalDataInRange: async () => [
        {
          date: '2026-10-27',
          netWorth: 100,
          netPerformance: 0,
          netPerformanceWithCurrencyEffect: 0,
          totalInvestment: 100,
          totalInvestmentValueWithCurrencyEffect: 100
        },
        {
          date: '2026-10-28',
          netWorth: 150,
          netPerformance: 20,
          netPerformanceWithCurrencyEffect: 50,
          totalInvestment: 100,
          totalInvestmentValueWithCurrencyEffect: 100
        }
      ],
      getPortfolioCashFlows: async () => []
    });
    const { chart } = await calculator.getPerformance({
      start: parseDate('2026-10-27'),
      end: parseDate('2026-10-28')
    });
    expect(chart.at(-1).netPerformanceWithCurrencyEffect).toBe(50);
    expect(chart.at(-1).netPerformance).toBe(20);
  });
});
