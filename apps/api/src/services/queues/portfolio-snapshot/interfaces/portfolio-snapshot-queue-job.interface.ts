import { Filter } from '@ghostfolio/common/interfaces';
import { PerformanceCalculationType } from '@ghostfolio/common/types/performance-calculation-type.type';

export interface PortfolioSnapshotQueueJob {
  calculationType: PerformanceCalculationType;
  filters: Filter[];
  includeBitcoin?: boolean;
  userCurrency: string;
  userId: string;
}
