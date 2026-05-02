import {
  activityDummyData,
  symbolProfileDummyData,
  userDummyData
} from '@ghostfolio/api/app/portfolio/calculator/portfolio-calculator-test-utils';
import { PortfolioCalculatorFactory } from '@ghostfolio/api/app/portfolio/calculator/portfolio-calculator.factory';
import { CurrentRateService } from '@ghostfolio/api/app/portfolio/current-rate.service';
import { CurrentRateServiceMock } from '@ghostfolio/api/app/portfolio/current-rate.service.mock';
import { RedisCacheService } from '@ghostfolio/api/app/redis-cache/redis-cache.service';
import { RedisCacheServiceMock } from '@ghostfolio/api/app/redis-cache/redis-cache.service.mock';
import { ConfigurationService } from '@ghostfolio/api/services/configuration/configuration.service';
import { ExchangeRateDataService } from '@ghostfolio/api/services/exchange-rate-data/exchange-rate-data.service';
import { PortfolioSnapshotService } from '@ghostfolio/api/services/queues/portfolio-snapshot/portfolio-snapshot.service';
import { PortfolioSnapshotServiceMock } from '@ghostfolio/api/services/queues/portfolio-snapshot/portfolio-snapshot.service.mock';
import { parseDate } from '@ghostfolio/common/helper';
import { Activity } from '@ghostfolio/common/interfaces';
import { PerformanceCalculationType } from '@ghostfolio/common/types/performance-calculation-type.type';

jest.mock('@ghostfolio/api/app/portfolio/current-rate.service', () => {
  return {
    CurrentRateService: jest.fn().mockImplementation(() => {
      return CurrentRateServiceMock;
    })
  };
});

jest.mock(
  '@ghostfolio/api/services/queues/portfolio-snapshot/portfolio-snapshot.service',
  () => {
    return {
      PortfolioSnapshotService: jest.fn().mockImplementation(() => {
        return PortfolioSnapshotServiceMock;
      })
    };
  }
);

jest.mock('@ghostfolio/api/app/redis-cache/redis-cache.service', () => {
  return {
    RedisCacheService: jest.fn().mockImplementation(() => {
      return RedisCacheServiceMock;
    })
  };
});

describe('MwrPortfolioCalculator', () => {
  let configurationService: ConfigurationService;
  let currentRateService: CurrentRateService;
  let exchangeRateDataService: ExchangeRateDataService;
  let portfolioCalculatorFactory: PortfolioCalculatorFactory;
  let portfolioSnapshotService: PortfolioSnapshotService;
  let redisCacheService: RedisCacheService;

  beforeEach(() => {
    configurationService = new ConfigurationService();
    currentRateService = new CurrentRateService(null, null, null, null);
    exchangeRateDataService = new ExchangeRateDataService(
      null,
      null,
      null,
      null
    );
    portfolioSnapshotService = new PortfolioSnapshotService(null);
    redisCacheService = new RedisCacheService(null, null);
    portfolioCalculatorFactory = new PortfolioCalculatorFactory(
      configurationService,
      currentRateService,
      exchangeRateDataService,
      portfolioSnapshotService,
      redisCacheService
    );
  });

  it('keeps contributions flat after sells, reuses sale cash for later buys and includes realized cash in return', async () => {
    jest.useFakeTimers().setSystemTime(parseDate('2021-12-18').getTime());

    const activities: Activity[] = [
      {
        ...activityDummyData,
        currency: 'CHF',
        date: new Date('2021-11-22'),
        feeInAssetProfileCurrency: 0,
        feeInBaseCurrency: 0,
        quantity: 2,
        SymbolProfile: {
          ...symbolProfileDummyData,
          currency: 'CHF',
          dataSource: 'YAHOO',
          name: 'iShares Swiss Dividend ETF',
          symbol: 'BALN.SW'
        },
        type: 'BUY',
        unitPriceInAssetProfileCurrency: 100
      },
      {
        ...activityDummyData,
        currency: 'CHF',
        date: new Date('2021-11-30'),
        feeInAssetProfileCurrency: 0,
        feeInBaseCurrency: 0,
        quantity: 1,
        SymbolProfile: {
          ...symbolProfileDummyData,
          currency: 'CHF',
          dataSource: 'YAHOO',
          name: 'iShares Swiss Dividend ETF',
          symbol: 'BALN.SW'
        },
        type: 'SELL',
        unitPriceInAssetProfileCurrency: 150
      },
      {
        ...activityDummyData,
        currency: 'CHF',
        date: new Date('2021-12-12'),
        feeInAssetProfileCurrency: 0,
        feeInBaseCurrency: 0,
        quantity: 1,
        SymbolProfile: {
          ...symbolProfileDummyData,
          currency: 'CHF',
          dataSource: 'YAHOO',
          name: 'iShares Swiss Dividend ETF',
          symbol: 'BALN.SW'
        },
        type: 'BUY',
        unitPriceInAssetProfileCurrency: 140
      }
    ];

    const portfolioCalculator = portfolioCalculatorFactory.createCalculator({
      activities,
      calculationType: PerformanceCalculationType.MWR,
      currency: 'CHF',
      userId: userDummyData.id
    });

    const portfolioSnapshot = await portfolioCalculator.computeSnapshot();

    expect(
      portfolioSnapshot.historicalData.find(({ date }) => {
        return date === '2021-11-22';
      })
    ).toMatchObject({
      netContributionValueWithCurrencyEffect: 200
    });

    expect(
      portfolioSnapshot.historicalData.find(({ date }) => {
        return date === '2021-11-30';
      })
    ).toMatchObject({
      netContributionValueWithCurrencyEffect: 200
    });

    expect(
      portfolioSnapshot.historicalData.find(({ date }) => {
        return date === '2021-12-12';
      })
    ).toMatchObject({
      netContributionValueWithCurrencyEffect: 200
    });

    expect(portfolioSnapshot.historicalData.at(-1)).toMatchObject({
      netContributionValueWithCurrencyEffect: 200,
      netWorth: 307.8
    });

    const cashFlows = await (portfolioCalculator as any).getPortfolioCashFlows({
      end: parseDate('2021-12-18'),
      start: parseDate('2021-11-21')
    });

    expect(cashFlows).toEqual([
      {
        amount: 200,
        date: '2021-11-22T00:00:00.000Z'
      }
    ]);

    expect(
      portfolioSnapshot.historicalData.at(-1).netWorth -
        portfolioSnapshot.historicalData.at(-1)
          .netContributionValueWithCurrencyEffect
    ).toBeCloseTo(107.8, 6);
  });
});
