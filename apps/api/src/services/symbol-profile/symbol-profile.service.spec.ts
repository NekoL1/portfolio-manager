import { PrismaService } from '@ghostfolio/api/services/prisma/prisma.service';

import { AssetClass, AssetSubClass, DataSource } from '@prisma/client';

import { SymbolProfileService } from './symbol-profile.service';

describe('SymbolProfileService Berkshire sector classification', () => {
  const identifiers = ['BRK-B', 'BRK.NE'].map((symbol) => ({
    dataSource: DataSource.YAHOO,
    symbol
  }));
  const storedProfiles = identifiers.map((identifier) => ({
    ...identifier,
    _count: { activities: 1, watchedBy: 0 },
    assetClass: AssetClass.EQUITY,
    assetSubClass: AssetSubClass.STOCK,
    countries: [{ code: 'US', weight: 1 }],
    holdings: [],
    id: identifier.symbol,
    sectors: [
      { name: 'Financial Services', weight: 0.5 },
      { name: 'Technology', weight: 0.5 }
    ],
    SymbolProfileOverrides: null
  }));

  it.each(['getSymbolProfiles', 'getSymbolProfilesByIds'] as const)(
    '%s supplies the same company sector to portfolio and asset detail consumers',
    async (method) => {
      const service = new SymbolProfileService({
        symbolProfile: {
          findMany: jest.fn().mockResolvedValue(storedProfiles)
        }
      } as unknown as PrismaService);

      const profiles =
        method === 'getSymbolProfiles'
          ? await service.getSymbolProfiles(identifiers)
          : await service.getSymbolProfilesByIds(
              storedProfiles.map(({ id }) => id)
            );

      expect(profiles).toHaveLength(2);

      for (const profile of profiles) {
        expect(profile.sectors).toEqual([
          { name: 'Financial Services', weight: 1 }
        ]);
      }
    }
  );
});
