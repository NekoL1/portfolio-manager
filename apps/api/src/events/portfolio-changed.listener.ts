import { RedisCacheService } from '@ghostfolio/api/app/redis-cache/redis-cache.service';

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PortfolioChangedEvent } from './portfolio-changed.event';

@Injectable()
export class PortfolioChangedListener {
  public constructor(private readonly redisCacheService: RedisCacheService) {}

  @OnEvent(PortfolioChangedEvent.getName())
  async handlePortfolioChangedEvent(event: PortfolioChangedEvent) {
    // A trade must not return while its previous valuation is still cached.
    await this.processPortfolioChanged({ userId: event.getUserId() });
  }

  private async processPortfolioChanged({ userId }: { userId: string }) {
    Logger.log(
      `Portfolio of user '${userId}' has changed`,
      'PortfolioChangedListener'
    );

    await this.redisCacheService.removePortfolioSnapshotsByUserId({ userId });
  }
}
