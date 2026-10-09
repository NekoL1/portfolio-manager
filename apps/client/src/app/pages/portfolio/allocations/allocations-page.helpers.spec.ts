import { BITCOIN_KEY, UNKNOWN_KEY } from '@ghostfolio/common/config';

import {
  getAllocationSectorDisplayName,
  normalizeAllocationSectorName
} from './allocations-page.helpers';

describe('normalizeAllocationSectorName', () => {
  it('uses one aggregation key for all Bitcoin sector variants', () => {
    expect(normalizeAllocationSectorName('Bitcoin')).toEqual(BITCOIN_KEY);
    expect(normalizeAllocationSectorName('BITCOIN')).toEqual(BITCOIN_KEY);
    expect(normalizeAllocationSectorName(' bitcoin ')).toEqual(BITCOIN_KEY);
  });

  it('keeps supported equity sector names unchanged', () => {
    expect(normalizeAllocationSectorName('Technology')).toEqual('Technology');
  });

  it('falls back unsupported sector names to UNKNOWN', () => {
    expect(normalizeAllocationSectorName('Crypto Miners')).toEqual(UNKNOWN_KEY);
  });

  it('keeps the Bitcoin display label user friendly', () => {
    expect(getAllocationSectorDisplayName(BITCOIN_KEY)).toEqual('Bitcoin');
  });
});
