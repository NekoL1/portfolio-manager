import { RoaiPortfolioCalculator } from '@ghostfolio/api/app/portfolio/calculator/roai/portfolio-calculator';
import { PerformanceCalculationType } from '@ghostfolio/common/types/performance-calculation-type.type';

import {
  calculateTimeWeightedReturn,
  getNetPerformance
} from '../performance-calculation.helper';

export class TwrPortfolioCalculator extends RoaiPortfolioCalculator {
  protected getPerformanceCalculationType() {
    return PerformanceCalculationType.TWR;
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

    const chart = historicalData.map((historicalDataItem, index) => {
      const chartSlice = historicalData.slice(0, index + 1);
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
      const timeWeightedReturn = calculateTimeWeightedReturn({
        cashFlowsByDate,
        points: chartSlice.map(({ date, valueWithCurrencyEffect }) => {
          return {
            date,
            value: valueWithCurrencyEffect
          };
        })
      });

      return {
        ...historicalDataItem,
        netPerformance: netPerformanceWithCurrencyEffect,
        netPerformanceInPercentage: timeWeightedReturn,
        netPerformanceInPercentageWithCurrencyEffect: timeWeightedReturn,
        netPerformanceWithCurrencyEffect
      };
    });

    return { chart };
  }
}
