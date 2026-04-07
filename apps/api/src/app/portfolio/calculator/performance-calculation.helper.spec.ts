import {
  calculateModifiedDietzReturn,
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

    it('falls back to modified dietz when no irr root can be bracketed', () => {
      expect(
        calculateMoneyWeightedReturn({
          cashFlows: [{ amount: 100, date: '2021-01-02T12:00:00.000Z' }],
          endDate: new Date('2021-01-03T00:00:00.000Z'),
          endValue: -10,
          startDate: new Date('2021-01-01T00:00:00.000Z'),
          startValue: 100
        })
      ).toBeCloseTo(
        calculateModifiedDietzReturn({
          cashFlows: [{ amount: 100, date: '2021-01-02T12:00:00.000Z' }],
          endDate: new Date('2021-01-03T00:00:00.000Z'),
          endValue: -10,
          startDate: new Date('2021-01-01T00:00:00.000Z'),
          startValue: 100
        })
      );
    });
  });

  describe('calculateModifiedDietzReturn', () => {
    it('uses timestamp-aware cash flow weighting', () => {
      expect(
        calculateModifiedDietzReturn({
          cashFlows: [{ amount: 100, date: '2021-01-02T12:00:00.000Z' }],
          endDate: new Date('2021-01-03T00:00:00.000Z'),
          endValue: 220,
          startDate: new Date('2021-01-01T00:00:00.000Z'),
          startValue: 100
        })
      ).toBeCloseTo(0.114286, 6);
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
