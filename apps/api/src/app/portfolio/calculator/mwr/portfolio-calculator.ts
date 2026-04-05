import { RoaiPortfolioCalculator } from '@ghostfolio/api/app/portfolio/calculator/roai/portfolio-calculator';
import { parseDate } from '@ghostfolio/common/helper';
import { PerformanceCalculationType } from '@ghostfolio/common/types/performance-calculation-type.type';

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

    const cashFlowsByDate = await this.getPortfolioCashFlowsByDate({
      end,
      start
    });
    const startDateString = historicalData[0].date;
    const rangeStartDate = parseDate(startDateString);

    const chart = historicalData.map((historicalDataItem) => {
      const endDateString = historicalDataItem.date;
      const datedCashFlows = this.getDatedCashFlows({
        cashFlowsByDate,
        endDateString,
        startDateString
      });
      const netPerformanceWithCurrencyEffect = getNetPerformance({
        cashFlows: datedCashFlows,
        endValue: historicalDataItem.valueWithCurrencyEffect,
        startValue: historicalData[0].valueWithCurrencyEffect
      });
      const moneyWeightedReturn = calculateMoneyWeightedReturn({
        cashFlows: datedCashFlows,
        endDate: parseDate(endDateString),
        endValue: historicalDataItem.valueWithCurrencyEffect,
        startDate: rangeStartDate,
        startValue: historicalData[0].valueWithCurrencyEffect
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
