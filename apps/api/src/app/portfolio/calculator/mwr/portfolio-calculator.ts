import { RoaiPortfolioCalculator } from '@ghostfolio/api/app/portfolio/calculator/roai/portfolio-calculator';
import { PerformanceCalculationType } from '@ghostfolio/common/types/performance-calculation-type.type';

import { endOfDay, parseISO } from 'date-fns';

import {
  calculateMoneyWeightedReturn,
  getNetPerformance
} from '../performance-calculation.helper';

export class MwrPortfolioCalculator extends RoaiPortfolioCalculator {
  protected getPerformanceCalculationType() {
    return PerformanceCalculationType.MWR;
  }

  public async getPerformance({ end, start }) {
    const historicalData = await this.getHistoricalDataInRange({
      end,
      start
    });

    if (historicalData.length === 0) {
      return { chart: [] };
    }

    const baselinePoint = await this.getHistoricalDataPointBefore({
      date: start
    });
    const rangeStartPoint = baselinePoint ?? historicalData[0];
    const rangeStartDate = endOfDay(parseISO(rangeStartPoint.date));
    const cashFlows = await this.getPortfolioCashFlows({
      end,
      start: baselinePoint ? parseISO(baselinePoint.date) : start
    });

    const chart = historicalData.map((historicalDataItem) => {
      const datedCashFlows = this.getDatedCashFlows({
        cashFlows,
        endDate: endOfDay(parseISO(historicalDataItem.date)),
        startDate: rangeStartDate
      });
      const netPerformanceWithCurrencyEffect = getNetPerformance({
        cashFlows: datedCashFlows,
        endValue: historicalDataItem.valueWithCurrencyEffect,
        startValue: rangeStartPoint.valueWithCurrencyEffect
      });
      const moneyWeightedReturn = calculateMoneyWeightedReturn({
        cashFlows: datedCashFlows,
        endDate: endOfDay(parseISO(historicalDataItem.date)),
        endValue: historicalDataItem.valueWithCurrencyEffect,
        startDate: rangeStartDate,
        startValue: rangeStartPoint.valueWithCurrencyEffect
      });

      return {
        ...historicalDataItem,
        netPerformance: netPerformanceWithCurrencyEffect,
        netPerformanceInPercentage: moneyWeightedReturn,
        netPerformanceInPercentageWithCurrencyEffect: moneyWeightedReturn,
        netPerformanceWithCurrencyEffect
      };
    });

    return { chart };
  }
}
