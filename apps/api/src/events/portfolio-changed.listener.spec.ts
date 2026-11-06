import { PortfolioChangedEvent } from './portfolio-changed.event';
import { PortfolioChangedListener } from './portfolio-changed.listener';

describe('Portfolio cache invalidation', () => {
  it('invalidates immediately and waits for Redis before completing', async () => {
    let release: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const removePortfolioSnapshotsByUserId = jest.fn().mockReturnValue(pending);
    const listener = new PortfolioChangedListener({
      removePortfolioSnapshotsByUserId
    } as any);
    let finished = false;
    const result = Promise.resolve(
      listener.handlePortfolioChangedEvent(
        new PortfolioChangedEvent({ userId: 'user' })
      )
    ).then(() => {
      finished = true;
    });
    expect(removePortfolioSnapshotsByUserId).toHaveBeenCalledWith({
      userId: 'user'
    });
    await Promise.resolve();
    expect(finished).toBe(false);
    release();
    await result;
    expect(finished).toBe(true);
  });
});
