import { AssetClass, AssetSubClass } from '@prisma/client';

import { YahooFinanceService } from './yahoo-finance.service';

describe('YahooFinanceService', () => {
  it('disables yahoo-finance2 result validation for search', async () => {
    const search = jest.fn().mockResolvedValue({
      quotes: [
        {
          quoteType: 'ETF',
          symbol: 'IGV'
        }
      ]
    });
    const quote = jest.fn().mockResolvedValue([
      {
        currency: 'USD',
        longName: 'iShares Expanded Tech-Software Sector ETF',
        quoteType: 'ETF',
        shortName: 'iShares Expanded Tech-Software',
        symbol: 'IGV'
      }
    ]);

    const service = new YahooFinanceService(
      {
        isCryptocurrency: jest.fn().mockReturnValue(false)
      } as any,
      {
        convertFromYahooFinanceSymbol: jest.fn((symbol: string) => symbol),
        formatName: jest.fn(({ longName }: { longName: string }) => longName),
        parseAssetClass: jest.fn(() => {
          return {
            assetClass: AssetClass.EQUITY,
            assetSubClass: AssetSubClass.ETF
          };
        })
      } as any
    );

    (service as any).yahooFinance = {
      quote,
      search
    };

    const result = await service.search({ query: 'igv' });

    expect(search).toHaveBeenCalledWith(
      'igv',
      undefined,
      expect.objectContaining({ validateResult: false })
    );
    expect(quote).toHaveBeenCalledWith(['IGV']);
    expect(result.items).toEqual([
      expect.objectContaining({
        assetClass: AssetClass.EQUITY,
        assetSubClass: AssetSubClass.ETF,
        currency: 'USD',
        name: 'iShares Expanded Tech-Software Sector ETF',
        symbol: 'IGV'
      })
    ]);
  });
});
