import { RoaiPortfolioCalculator } from './roai/portfolio-calculator';

describe('Portfolio calculator initialization', () => {
  it('does not enqueue a snapshot job when a worker is already computing it', async () => {
    const addJobToQueue = jest.fn(() => new Promise(() => {}));
    const calculator = new RoaiPortfolioCalculator({
      accountBalanceItems: [],
      activities: [],
      configurationService: {} as any,
      currency: 'USD',
      currentRateService: {} as any,
      exchangeRateDataService: {} as any,
      filters: [],
      portfolioSnapshotService: { addJobToQueue } as any,
      redisCacheService: {
        get: async () => undefined,
        getPortfolioSnapshotKey: () => 'snapshot'
      } as any,
      userId: 'user'
    });

    const snapshot = await calculator.computeSnapshot();
    expect(snapshot.activitiesCount).toBe(0);
    expect(addJobToQueue).not.toHaveBeenCalled();
  });
});

describe('Portfolio calculation request reuse', () => {
  it('loads historical exchange rates once for concurrent ranges with the same end date', async () => {
    const getExchangeRatesByCurrency = jest.fn(async () => ({}));
    const calculator = new RoaiPortfolioCalculator({
      accountBalanceItems: [],
      activities: [],
      configurationService: {} as any,
      currency: 'USD',
      currentRateService: {} as any,
      exchangeRateDataService: { getExchangeRatesByCurrency } as any,
      filters: [],
      portfolioSnapshotService: {} as any,
      redisCacheService: {} as any,
      userId: 'user'
    });
    const end = new Date('2024-03-02T23:59:59.999Z');
    await Promise.all([
      (calculator as any).getPortfolioCashFlows({
        end,
        start: new Date('2024-01-01')
      }),
      (calculator as any).getPortfolioCashFlows({
        end: new Date(end),
        start: new Date('2024-02-01')
      })
    ]);
    expect(getExchangeRatesByCurrency).toHaveBeenCalledTimes(1);
    await (calculator as any).getPortfolioCashFlows({
      end: new Date('2024-03-03'),
      start: new Date('2024-01-01')
    });
    expect(getExchangeRatesByCurrency).toHaveBeenCalledTimes(2);
  });
});
