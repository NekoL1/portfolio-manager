import { FIXED_EXCHANGE_RATES, USD_TO_CAD_EXCHANGE_RATE } from './config';

describe('Config', () => {
  describe('fixed exchange rates', () => {
    it('uses the centralized USD to CAD exchange rate in both directions', () => {
      expect(USD_TO_CAD_EXCHANGE_RATE).toEqual(1.39);
      expect(FIXED_EXCHANGE_RATES.USDCAD).toEqual(USD_TO_CAD_EXCHANGE_RATE);
      expect(FIXED_EXCHANGE_RATES.CADUSD).toEqual(1 / USD_TO_CAD_EXCHANGE_RATE);
    });
  });
});
