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
          cashFlows: [{ amount: 100, date: '2021-01-02T00:00:00.000Z' }],
          endDate: new Date('2021-01-03'),
          endValue: 220,
          startDate: new Date('2021-01-01'),
          startValue: 100
        })
      ).toBeCloseTo(((Math.sqrt(9.8) - 1) / 2) ** 2 - 1, 12);
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
        // 20 / (100 + 100 * 0.25): the contribution has half a day remaining.
      ).toBeCloseTo(0.16, 6);
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

    it('includes fees incurred on the first funded day', () => {
      expect(
        calculateTimeWeightedReturn({
          cashFlowsByDate: { '2021-01-02': 1005 },
          points: [
            { date: '2021-01-01', value: 0 },
            { date: '2021-01-02', value: 1000 }
          ]
        })
      ).toBeCloseTo(-5 / 1005, 12);
    });

    it('compounds first-day gains with subsequent market changes', () => {
      expect(
        calculateTimeWeightedReturn({
          cashFlowsByDate: { '2021-01-02': 1000 },
          points: [
            { date: '2021-01-01', value: 0 },
            { date: '2021-01-02', value: 1100 },
            { date: '2021-01-03', value: 1210 }
          ]
        })
      ).toBeCloseTo(0.21, 12);
    });

    it('preserves performance through full withdrawals and empty periods', () => {
      expect(
        calculateTimeWeightedReturn({
          cashFlowsByDate: {
            '2021-01-02': 1005,
            '2021-01-03': -1000,
            '2021-01-05': 2000
          },
          points: [
            { date: '2021-01-01', value: 0 },
            { date: '2021-01-02', value: 1000 },
            { date: '2021-01-03', value: 0 },
            { date: '2021-01-04', value: 0 },
            { date: '2021-01-05', value: 1980 }
          ]
        })
      ).toBeCloseTo((1000 / 1005) * (1980 / 2000) - 1, 12);
    });

    it('leaves an unfunded empty portfolio at zero return', () => {
      expect(
        calculateTimeWeightedReturn({
          cashFlowsByDate: {},
          points: [
            { date: '2021-01-01', value: 0 },
            { date: '2021-01-02', value: 0 },
            { date: '2021-01-03', value: 0 }
          ]
        })
      ).toBe(0);
    });

    it.each([500, -500])(
      'neutralizes an external flow of %s between chart dates',
      (amount) => {
        expect(
          calculateTimeWeightedReturn({
            cashFlowsByDate: { '2021-01-02': amount },
            points: [
              { date: '2021-01-01', value: 1000 },
              { date: '2021-01-03', value: 1000 + amount }
            ]
          })
        ).toBeCloseTo(0, 12);
      }
    );

    it('counts each intervening flow once and excludes flows outside the range', () => {
      expect(
        calculateTimeWeightedReturn({
          cashFlowsByDate: {
            '2021-01-08': 1000,
            '2021-01-04': -250,
            '2021-01-01': 1000,
            '2021-01-03': 500,
            '2021-01-02': 1000
          },
          points: [
            { date: '2021-01-02', value: 1000 },
            { date: '2021-01-05', value: 1250 },
            { date: '2021-01-07', value: 1375 }
          ]
        })
      ).toBeCloseTo(0.1, 12);
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
