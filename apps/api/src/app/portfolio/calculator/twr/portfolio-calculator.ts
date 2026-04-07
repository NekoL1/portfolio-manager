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

    const baselinePoint = await this.getHistoricalDataPointBefore({
      date: start
    });
    const cashFlowsByDate = await this.getPortfolioCashFlowsByDate({
      end,
      start: baselinePoint ? parseISO(baselinePoint.date) : start
    });
    const rangeStartPoint = baselinePoint ?? historicalData[0];
    const performancePoints = baselinePoint
      ? [baselinePoint, ...historicalData]
      : historicalData;
    const cashFlows = await this.getPortfolioCashFlows({
      end,
      start: baselinePoint ? parseISO(baselinePoint.date) : start
    });
    const startBoundary = endOfDay(parseISO(rangeStartPoint.date));

    const chart = historicalData.map((historicalDataItem) => {
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
        endValue: historicalDataItem.valueWithCurrencyEffect,
        startValue: rangeStartPoint.valueWithCurrencyEffect
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
