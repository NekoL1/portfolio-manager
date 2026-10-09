import { PerformanceCalculationType } from '@ghostfolio/common/types/performance-calculation-type.type';

import { RedisCacheService } from './redis-cache.service';

describe('Portfolio snapshot cache keys', () => {
  const service = Object.create(
    RedisCacheService.prototype
  ) as RedisCacheService;
  const base = {
    userId: 'user-a',
    calculationType: PerformanceCalculationType.ROAI
  };

  it('shares the identical snapshot used by ROAI, TWR and MWR', () => {
    const key = service.getPortfolioSnapshotKey(base);
    for (const calculationType of [
      PerformanceCalculationType.TWR,
      PerformanceCalculationType.MWR
    ]) {
      expect(
        service.getPortfolioSnapshotKey({ ...base, calculationType })
      ).toBe(key);
    }
  });

  it('isolates users, filters, Bitcoin settings and distinct snapshot algorithms', () => {
    const key = service.getPortfolioSnapshotKey(base);
    for (const options of [
      { ...base, userId: 'user-b' },
      { ...base, includeBitcoin: false },
      { ...base, filters: [{ type: 'ACCOUNT' as const, id: 'account-a' }] },
      { ...base, calculationType: PerformanceCalculationType.ROI }
    ]) {
      expect(service.getPortfolioSnapshotKey(options)).not.toBe(key);
    }
    expect(
      key.startsWith(service.getPortfolioSnapshotKey({ userId: base.userId }))
    ).toBe(true);
  });
});
