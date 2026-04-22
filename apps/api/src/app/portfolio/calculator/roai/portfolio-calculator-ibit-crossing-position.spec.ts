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

describe('PortfolioCalculator', () => {
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

  it('resets the cost basis when a position flips from short back to long', async () => {
    jest.useFakeTimers().setSystemTime(parseDate('2026-03-10').getTime());

    const activities: Activity[] = [
      {
        ...activityDummyData,
        currency: 'USD',
        date: parseDate('2025-01-04'),
        fee: 0,
        feeInAssetProfileCurrency: 0,
        feeInBaseCurrency: 0,
        quantity: 43,
        SymbolProfile: {
          ...symbolProfileDummyData,
          currency: 'USD',
          dataSource: 'MANUAL',
          name: 'iShares Bitcoin Trust ETF',
          symbol: 'IBIT'
        },
        type: 'BUY',
        unitPrice: 42.13,
        unitPriceInAssetProfileCurrency: 42.13
      },
      {
        ...activityDummyData,
        currency: 'USD',
        date: parseDate('2025-05-23'),
        fee: 0,
        feeInAssetProfileCurrency: 0,
        feeInBaseCurrency: 0,
        quantity: 104,
        SymbolProfile: {
          ...symbolProfileDummyData,
          currency: 'USD',
          dataSource: 'MANUAL',
          name: 'iShares Bitcoin Trust ETF',
          symbol: 'IBIT'
        },
        type: 'SELL',
        unitPrice: 61.82,
        unitPriceInAssetProfileCurrency: 61.82
      },
      {
        ...activityDummyData,
        currency: 'USD',
        date: parseDate('2025-06-12'),
        fee: 0,
        feeInAssetProfileCurrency: 0,
        feeInBaseCurrency: 0,
        quantity: 43,
        SymbolProfile: {
          ...symbolProfileDummyData,
          currency: 'USD',
          dataSource: 'MANUAL',
          name: 'iShares Bitcoin Trust ETF',
          symbol: 'IBIT'
        },
        type: 'BUY',
        unitPrice: 60.5,
        unitPriceInAssetProfileCurrency: 60.5
      },
      {
        ...activityDummyData,
        currency: 'USD',
        date: parseDate('2025-12-15'),
        fee: 0,
        feeInAssetProfileCurrency: 0,
        feeInBaseCurrency: 0,
        quantity: 478,
        SymbolProfile: {
          ...symbolProfileDummyData,
          currency: 'USD',
          dataSource: 'MANUAL',
          name: 'iShares Bitcoin Trust ETF',
          symbol: 'IBIT'
        },
        type: 'SELL',
        unitPrice: 48.67,
        unitPriceInAssetProfileCurrency: 48.67
      },
      {
        ...activityDummyData,
        currency: 'USD',
        date: parseDate('2026-02-25'),
        fee: 0,
        feeInAssetProfileCurrency: 0,
        feeInBaseCurrency: 0,
        quantity: 215,
        SymbolProfile: {
          ...symbolProfileDummyData,
          currency: 'USD',
          dataSource: 'MANUAL',
          name: 'iShares Bitcoin Trust ETF',
          symbol: 'IBIT'
        },
        type: 'BUY',
        unitPrice: 47.22,
        unitPriceInAssetProfileCurrency: 47.22
      },
      {
        ...activityDummyData,
        currency: 'USD',
        date: parseDate('2026-03-10'),
        fee: 0,
        feeInAssetProfileCurrency: 0,
        feeInBaseCurrency: 0,
        quantity: 367,
        SymbolProfile: {
          ...symbolProfileDummyData,
          currency: 'USD',
          dataSource: 'MANUAL',
          name: 'iShares Bitcoin Trust ETF',
          symbol: 'IBIT'
        },
        type: 'BUY',
        unitPrice: 44.4,
        unitPriceInAssetProfileCurrency: 44.4
      }
    ];

    const portfolioCalculator = portfolioCalculatorFactory.createCalculator({
      activities,
      calculationType: PerformanceCalculationType.ROAI,
      currency: 'USD',
      userId: userDummyData.id
    });

    const portfolioSnapshot = await portfolioCalculator.computeSnapshot();
    const [position] = portfolioSnapshot.positions;

    expect(position.quantity.toNumber()).toEqual(86);
    expect(position.averagePrice.toNumber()).toEqual(44.4);
    expect(position.investment.toNumber()).toEqual(3818.4);
    expect(position.netPerformanceWithCurrencyEffectMap.max.gt(0)).toBe(true);
    expect(
      position.netPerformancePercentageWithCurrencyEffectMap.max.gt(0)
    ).toBe(true);
  });
});
