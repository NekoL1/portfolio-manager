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

import { Big } from 'big.js';

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

describe('PortfolioCalculator date range performance', () => {
  let portfolioCalculatorFactory: PortfolioCalculatorFactory;

  beforeEach(() => {
    portfolioCalculatorFactory = new PortfolioCalculatorFactory(
      new ConfigurationService(),
      new CurrentRateService(null, null, null, null),
      new ExchangeRateDataService(null, null, null, null),
      new PortfolioSnapshotService(null),
      new RedisCacheService(null, null)
    );
  });

  it('keeps range performance for holdings with sparse historical prices', async () => {
    jest.useFakeTimers().setSystemTime(parseDate('2026-07-28').getTime());

    const activities: Activity[] = [
      {
        ...activityDummyData,
        currency: 'USD',
        date: parseDate('2025-01-05'),
        fee: 0,
        feeInAssetProfileCurrency: 0,
        feeInBaseCurrency: 0,
        quantity: 1,
        SymbolProfile: {
          ...symbolProfileDummyData,
          currency: 'USD',
          dataSource: 'YAHOO',
          name: 'Sparse Bitcoin',
          symbol: 'SPARSEBTC'
        },
        type: 'BUY',
        unitPrice: 100,
        unitPriceInAssetProfileCurrency: 100
      }
    ];

    const portfolioCalculator = portfolioCalculatorFactory.createCalculator({
      activities,
      calculationType: PerformanceCalculationType.ROAI,
      currency: 'USD',
      userId: userDummyData.id
    });

    const portfolioSnapshot = await portfolioCalculator.computeSnapshot();
    const position = portfolioSnapshot.positions[0];

    expect(position.netPerformanceWithCurrencyEffectMap).toMatchObject({
      '1d': new Big('70'),
      '5d': new Big('70'),
      '1m': new Big('70'),
      '6m': new Big('50'),
      ytd: new Big('50'),
      '1y': new Big('50'),
      max: new Big('50')
    });

    expect(
      position.netPerformancePercentageWithCurrencyEffectMap
    ).toMatchObject({
      '1d': new Big('0.7'),
      '5d': new Big('0.7'),
      '1m': new Big('0.7'),
      '6m': new Big('0.5'),
      ytd: new Big('0.5'),
      '1y': new Big('0.5'),
      max: new Big('0.5')
    });
  });
});
