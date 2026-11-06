import { PerformanceCalculationType } from '@ghostfolio/common/types/performance-calculation-type.type';

import { Big } from 'big.js';

import { PortfolioService } from './portfolio.service';

describe('PortfolioService valuation', () => {
  const user = {
    settings: {
      settings: {
        baseCurrency: 'CAD',
        emergencyFund: 100,
        performanceCalculationType: PerformanceCalculationType.TWR,
        showBitcoin: false
      }
    }
  };

  function createService() {
    const chart = [
      {
        date: '2026-11-02',
        netWorth: 1000,
        totalAccountBalance: 0,
        valueWithCurrencyEffect: 1000
      },
      {
        date: '2026-11-03',
        netPerformance: 100,
        netPerformanceInPercentage: 0.1,
        netPerformanceInPercentageWithCurrencyEffect: 0.1,
        netPerformanceWithCurrencyEffect: 100,
        netWorth: 1100,
        totalAccountBalance: 1100,
        totalInvestment: 1000,
        totalInvestmentValueWithCurrencyEffect: 1000,
        valueWithCurrencyEffect: 1100
      }
    ];
    const accountBalanceService = {
      getAccountBalanceItems: jest
        .fn()
        .mockResolvedValue([{ date: '2026-11-03', value: 1100 }])
    };
    const activitiesService = {
      getActivities: jest.fn().mockResolvedValue({ activities: [] }),
      getActivitiesForPortfolioCalculator: jest.fn().mockResolvedValue({
        activities: [{ type: 'SELL' }]
      })
    };
    const calculator = {
      getDividendInBaseCurrency: jest.fn().mockResolvedValue(new Big(0)),
      getFeesInBaseCurrency: jest.fn().mockResolvedValue(new Big(0)),
      getInterestInBaseCurrency: jest.fn().mockResolvedValue(new Big(0)),
      getLiabilitiesInBaseCurrency: jest.fn().mockResolvedValue(new Big(0)),
      getPerformance: jest.fn().mockResolvedValue({ chart }),
      getSnapshot: jest.fn().mockResolvedValue({
        currentValueInBaseCurrency: new Big(0),
        errors: [],
        hasErrors: false,
        historicalData: chart,
        // The position has been sold. Its remaining-quantity market move is
        // zero, although the sale realized a gain during the selected day.
        positions: [{ marketChange: 0 }],
        totalInvestment: new Big(1000),
        totalInvestmentWithCurrencyEffect: new Big(1000)
      }),
      getStartDate: jest.fn().mockReturnValue(new Date('2026-11-02'))
    };
    const calculatorFactory = {
      createCalculator: jest.fn().mockReturnValue(calculator)
    };
    const service = new PortfolioService(
      accountBalanceService as any,
      {
        getCashDetails: jest.fn().mockResolvedValue({
          balanceInBaseCurrency: 75
        })
      } as any,
      activitiesService as any,
      null,
      calculatorFactory as any,
      null,
      null,
      null,
      {
        validateImpersonationId: jest.fn().mockResolvedValue(undefined)
      } as any,
      { user } as any,
      null,
      null,
      { user: jest.fn().mockResolvedValue(user) } as any
    );

    return {
      accountBalanceService,
      activitiesService,
      calculator,
      calculatorFactory,
      chart,
      service
    };
  }

  it.each([PerformanceCalculationType.TWR, PerformanceCalculationType.MWR])(
    'preserves realized daily gain from the %s calculator after the holding is sold',
    async (calculationType) => {
      const { chart, service } = createService();

      const result = await service.getPerformance({
        calculationType,
        dateRange: '1d',
        impersonationId: undefined,
        userId: 'user'
      });

      expect(result.performance).toMatchObject({
        currentNetWorth: 1100,
        currentValueInBaseCurrency: 1100,
        netPerformance: 100,
        netPerformancePercentage: 0.1,
        netPerformancePercentageWithCurrencyEffect: 0.1,
        netPerformanceWithCurrencyEffect: 100
      });
      expect(result.chart).toEqual(chart);
      expect(result.chart.at(-1).netPerformanceWithCurrencyEffect).toBe(100);
    }
  );

  it('reconciles QQC remaining cost and realized gain when stored trade prices are unusually high', () => {
    const { service } = createService();
    const trades = [
      { type: 'BUY', quantity: 25, unitPrice: 39.77 },
      { type: 'BUY', quantity: 197, unitPrice: 46.94 },
      { type: 'BUY', quantity: 632, unitPrice: 47.48 },
      { type: 'BUY', quantity: 71, unitPrice: 46.94 },
      { type: 'SELL', quantity: 46.86, unitPrice: 632 },
      { type: 'BUY', quantity: 46.86, unitPrice: 642 },
      { type: 'BUY', quantity: 641, unitPrice: 46.84 }
    ];
    const summary = (service as any).getHoldingLotSummary({
      activities: trades.map((trade, index) => ({
        ...trade,
        currency: 'CAD',
        date: new Date(Date.UTC(2026, 10, 3, 15, index)),
        fee: 0,
        feeInBaseCurrency: 0,
        SymbolProfile: { currency: 'CAD', symbol: 'QQC.TO' },
        unitPriceInAssetProfileCurrency: trade.unitPrice,
        value: new Big(trade.quantity).mul(trade.unitPrice).toNumber(),
        valueInBaseCurrency: new Big(trade.quantity)
          .mul(trade.unitPrice)
          .toNumber()
      })),
      exchangeRatesByCurrency: {},
      userCurrency: 'CAD'
    });
    const marketValue = summary.remainingQuantity.mul('47.18');
    const unrealized = marketValue.minus(summary.remainingCostInBaseCurrency);
    const realized = summary.matchedProceedsInBaseCurrency.minus(
      summary.matchedCostInBaseCurrency
    );
    const netPurchases = trades.reduce(
      (total, trade) =>
        total.plus(
          new Big(trade.quantity)
            .mul(trade.unitPrice)
            .mul(trade.type === 'BUY' ? 1 : -1)
        ),
      new Big(0)
    );

    expect(summary.remainingQuantity.toString()).toBe('1566');
    expect(summary.remainingCostInBaseCurrency.toString()).toBe('101669.7316');
    expect(marketValue.toString()).toBe('73883.88');
    expect(unrealized.toString()).toBe('-27785.8516');
    expect(
      unrealized.div(summary.remainingCostInBaseCurrency).mul(100).toFixed(2)
    ).toBe('-27.33');
    expect(realized.toString()).toBe('27595.1616');
    expect(realized.plus(unrealized).toString()).toBe('-190.69');
    expect(realized.plus(unrealized).eq(marketValue.minus(netPurchases))).toBe(
      true
    );
  });

  it('includes cash balances when Bitcoin is hidden, even with no securities', async () => {
    const {
      accountBalanceService,
      activitiesService,
      calculatorFactory,
      service
    } = createService();
    activitiesService.getActivitiesForPortfolioCalculator.mockResolvedValue({
      activities: []
    });

    const result = await service.getPerformance({
      impersonationId: undefined,
      userId: 'user'
    });

    expect(accountBalanceService.getAccountBalanceItems).toHaveBeenCalled();
    expect(calculatorFactory.createCalculator).toHaveBeenCalledWith(
      expect.objectContaining({
        accountBalanceItems: [{ date: '2026-11-03', value: 1100 }],
        includeBitcoin: false
      })
    );
    expect(result.performance.currentValueInBaseCurrency).toBe(1100);
  });

  it('uses ledger cash in the summary while preserving excluded account balances', async () => {
    const { calculator, service } = createService();

    const summary = await (service as any).getSummary({
      balanceInBaseCurrency: 0,
      emergencyFundHoldingsValueInBaseCurrency: 0,
      filteredValueInBaseCurrency: new Big(1100),
      impersonationId: undefined,
      portfolioCalculator: calculator,
      userCurrency: 'CAD',
      userId: 'user'
    });

    expect(summary).toMatchObject({
      cash: 1000,
      currentValueInBaseCurrency: 0,
      excludedAccountsAndActivities: 75,
      netPerformanceWithCurrencyEffect: 100,
      totalValueInBaseCurrency: 1175
    });
  });
  it('reconciles account and platform totals to holdings plus ledger cash', async () => {
    const service = Object.create(PortfolioService.prototype) as any;
    Object.assign(service, {
      accountService: {
        getAccounts: async () => [
          {
            id: 'a',
            name: 'Account',
            currency: 'CAD',
            balance: 9999,
            isExcluded: false,
            platformId: 'p',
            platform: { name: 'Broker' }
          }
        ]
      },
      exchangeRateDataService: { toCurrency: (value) => value }
    });
    const result = await service.getValueOfAccountsAndPlatforms({
      activities: [
        {
          accountId: 'a',
          type: 'BUY',
          quantity: 673,
          SymbolProfile: { symbol: 'XEQT.TO' }
        },
        {
          accountId: 'a',
          type: 'SELL',
          quantity: 673,
          SymbolProfile: { symbol: 'XEQT.TO' }
        },
        {
          accountId: 'a',
          type: 'BUY',
          quantity: 641,
          SymbolProfile: { symbol: 'QQC.TO' }
        },
        {
          accountId: 'a',
          type: 'BUY',
          quantity: 9999,
          SymbolProfile: { symbol: 'CAD', assetSubClass: 'CASH' }
        }
      ],
      cashBalances: [
        {
          accountId: 'a',
          currency: 'CAD',
          balance: 11.55,
          balanceInBaseCurrency: 11.55
        }
      ],
      portfolioItemsNow: {
        'XEQT.TO': { marketPriceInBaseCurrency: 44.63 },
        'QQC.TO': { marketPriceInBaseCurrency: 46.84 },
        CAD: { marketPriceInBaseCurrency: 1 }
      },
      userCurrency: 'CAD',
      userId: 'user'
    });
    expect(result.accounts.a.balance).toBe(11.55);
    expect(result.accounts.a.valueInBaseCurrency).toBe(30035.99);
    expect(result.platforms.p.valueInBaseCurrency).toBe(30035.99);
  });

  it('builds currency allocations from ledger cash including negative balances', () => {
    const service = Object.create(PortfolioService.prototype) as any;
    const positions = service.getCashPositions({
      cashBalances: [
        {
          accountId: 'a',
          currency: 'CAD',
          balance: -5,
          balanceInBaseCurrency: -5
        },
        {
          accountId: 'b',
          currency: 'USD',
          balance: 100,
          balanceInBaseCurrency: 140
        }
      ],
      cashDetails: { accounts: [], balanceInBaseCurrency: 0 },
      userCurrency: 'CAD',
      value: new Big(1135)
    });
    expect(positions.CAD.investmentWithCurrencyEffect).toBe(-5);
    expect(positions.USD.investmentWithCurrencyEffect).toBe(140);
    expect(positions.CAD.valueInBaseCurrency).toBe(-5);
    expect(positions.USD.valueInBaseCurrency).toBe(140);
    expect(positions.USD.allocationInPercentage).toBeCloseTo(140 / 1135, 12);
  });
  it('does not report aggregated sale cash as an unrealized gain', () => {
    const service = Object.create(PortfolioService.prototype) as any;
    const positions = service.getCashPositions({
      cashBalances: [
        {
          accountId: 'a',
          currency: 'CAD',
          balance: 10000,
          balanceInBaseCurrency: 10000
        },
        {
          accountId: 'b',
          currency: 'CAD',
          balance: 20000,
          balanceInBaseCurrency: 20000
        }
      ],
      cashDetails: { accounts: [], balanceInBaseCurrency: 0 },
      userCurrency: 'CAD',
      value: new Big(30000)
    });
    const cash = positions.CAD;
    expect(cash.valueInBaseCurrency).toBe(30000);
    expect(
      cash.valueInBaseCurrency - (cash.investmentWithCurrencyEffect ?? 0)
    ).toBe(0);
    expect(cash.netPerformanceWithCurrencyEffect).toBe(0);
  });
});
