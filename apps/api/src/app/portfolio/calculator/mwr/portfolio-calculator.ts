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

    const rangeStartPoint = historicalData[0];
    const rangeStartDate = endOfDay(parseISO(rangeStartPoint.date));
    const rangeStartValue =
      rangeStartPoint.netWorth ?? rangeStartPoint.valueWithCurrencyEffect;
    const cashFlows = await this.getPortfolioCashFlows({
      end,
      start
    });

    const chart = historicalData.map((historicalDataItem) => {
      const currentValue =
        historicalDataItem.netWorth ??
        historicalDataItem.valueWithCurrencyEffect;
      const datedCashFlows = this.getDatedCashFlows({
        cashFlows,
        endDate: endOfDay(parseISO(historicalDataItem.date)),
        startDate: rangeStartDate
      });
      const netPerformanceWithCurrencyEffect = getNetPerformance({
        cashFlows: datedCashFlows,
        endValue: currentValue,
        startValue: rangeStartValue
      });
      const moneyWeightedReturn = calculateMoneyWeightedReturn({
        cashFlows: datedCashFlows,
        endDate: endOfDay(parseISO(historicalDataItem.date)),
        endValue: currentValue,
        startDate: rangeStartDate,
        startValue: rangeStartValue
      });

      return {
        ...historicalDataItem,
        netPerformance: netPerformanceWithCurrencyEffect,
        netPerformanceInPercentage: moneyWeightedReturn,
        netPerformanceInPercentageWithCurrencyEffect: moneyWeightedReturn,
        valueWithCurrencyEffect: currentValue,
        netPerformanceWithCurrencyEffect
      };
    });

    return { chart };
  }
}
