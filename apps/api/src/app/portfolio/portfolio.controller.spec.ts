import { PortfolioController } from './portfolio.controller';

describe('Portfolio performance privacy normalization', () => {
  it.each([
    { securities: 100, cash: 50 },
    { securities: 0, cash: 150 }
  ])(
    'includes retained cash when normalizing $securities of securities and $cash of cash',
    async ({ securities, cash }) => {
      const controller = Object.create(
        PortfolioController.prototype
      ) as PortfolioController;
      Object.assign(controller, {
        apiService: { buildFiltersFromQueryParams: () => [] },
        configurationService: { get: () => false },
        portfolioService: {
          getPerformance: async () => ({
            chart: [
              {
                date: '2026-11-05',
                value: securities,
                valueWithCurrencyEffect: securities + cash,
                netWorth: securities + cash,
                totalInvestment: 100
              }
            ],
            performance: {
              currentValueInBaseCurrency: securities + cash,
              currentNetWorth: securities + cash,
              totalInvestment: 100
            }
          })
        },
        request: {
          user: { id: 'user', settings: { settings: { viewMode: 'ZEN' } } }
        }
      });
      const result = await controller.getPerformanceV2(undefined);
      expect(result.chart.at(-1).valueInPercentage).toBe(1);
      expect(result.chart.at(-1).netWorthInPercentage).toBe(1);
    }
  );
});
