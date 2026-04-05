import {
  calculateMoneyWeightedReturn,
  calculateTimeWeightedReturn,
  getNetPerformance
} from '@ghostfolio/api/app/portfolio/calculator/performance-calculation.helper';

describe('PerformanceCalculationHelper', () => {
  describe('calculateMoneyWeightedReturn', () => {
    it('matches a simple no-cash-flow period return', () => {
      expect(
        calculateMoneyWeightedReturn({
          cashFlows: [],
          endDate: new Date('2021-01-03'),
          endValue: 121,
          startDate: new Date('2021-01-01'),
          startValue: 100
        })
      ).toBeCloseTo(0.21);
    });

    it('weights late contributions correctly', () => {
      expect(
        calculateMoneyWeightedReturn({
          cashFlows: [{ amount: 100, date: '2021-01-02' }],
          endDate: new Date('2021-01-03'),
          endValue: 220,
          startDate: new Date('2021-01-01'),
          startValue: 100
        })
      ).toBeCloseTo(0.134756, 6);
    });
  });

  describe('calculateTimeWeightedReturn', () => {
    it('matches a simple no-cash-flow period return', () => {
      expect(
        calculateTimeWeightedReturn({
          cashFlowsByDate: {},
          points: [
            { date: '2021-01-01', value: 100 },
            { date: '2021-01-02', value: 110 },
            { date: '2021-01-03', value: 121 }
          ]
        })
      ).toBeCloseTo(0.21);
    });

    it('neutralizes contributions when chaining subperiod returns', () => {
      expect(
        calculateTimeWeightedReturn({
          cashFlowsByDate: {
            '2021-01-03': 100
          },
          points: [
            { date: '2021-01-01', value: 100 },
            { date: '2021-01-02', value: 110 },
            { date: '2021-01-03', value: 220 }
          ]
        })
      ).toBeCloseTo(0.2);
    });
  });

  describe('getNetPerformance', () => {
    it('returns profit net of contributions', () => {
      expect(
        getNetPerformance({
          cashFlows: [{ amount: 100, date: '2021-01-02' }],
          endValue: 220,
          startValue: 100
        })
      ).toBe(20);
    });
  });
});
