import { RoaiPortfolioCalculator } from '@ghostfolio/api/app/portfolio/calculator/roai/portfolio-calculator';
import { PerformanceCalculationType } from '@ghostfolio/common/types/performance-calculation-type.type';

import { endOfDay, parseISO } from 'date-fns';

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
    const rangeStartPoint = historicalData[0];
    const performancePoints = historicalData;
    const cashFlows = await this.getPortfolioCashFlows({
      end,
      start
    });
    const startBoundary = endOfDay(parseISO(rangeStartPoint.date));
    const rangeStartValue =
      rangeStartPoint.netWorth ?? rangeStartPoint.valueWithCurrencyEffect;

    const chart = historicalData.map((historicalDataItem) => {
      const currentValue =
        historicalDataItem.netWorth ??
        historicalDataItem.valueWithCurrencyEffect;
      const chartSlice = performancePoints.filter(({ date }) => {
        return date <= historicalDataItem.date;
      });
      const datedCashFlows = this.getDatedCashFlows({
        cashFlows,
        endDate: endOfDay(parseISO(historicalDataItem.date)),
        startDate: startBoundary
      });
      const netPerformanceWithCurrencyEffect = getNetPerformance({
        cashFlows: datedCashFlows,
        endValue: currentValue,
        startValue: rangeStartValue
      });
      const timeWeightedReturn = calculateTimeWeightedReturn({
        cashFlowsByDate,
        points: chartSlice.map(
          ({ date, netWorth, valueWithCurrencyEffect }) => {
            return {
              date,
              value: netWorth ?? valueWithCurrencyEffect
            };
          }
        )
      });

      return {
        ...historicalDataItem,
        netPerformance: netPerformanceWithCurrencyEffect,
        netPerformanceInPercentage: timeWeightedReturn,
        netPerformanceInPercentageWithCurrencyEffect: timeWeightedReturn,
        valueWithCurrencyEffect: currentValue,
        netPerformanceWithCurrencyEffect
      };
    });

    return { chart };
  }
}
