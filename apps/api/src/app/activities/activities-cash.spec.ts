import { ActivitiesService } from './activities.service';

describe('Activity cash accounting', () => {
  it.each(['BUY', 'SELL', 'DIVIDEND', 'FEE'])(
    'does not write a second cash checkpoint for a %s',
    async (type) => {
      const service = Object.create(
        ActivitiesService.prototype
      ) as ActivitiesService;
      const updateAccountBalance = jest.fn();
      Object.assign(service, {
        accountService: { updateAccountBalance },
        dataGatheringService: { addJobToQueue: jest.fn() },
        eventEmitter: {
          emit: jest.fn(),
          emitAsync: jest.fn().mockResolvedValue([])
        },
        prismaService: {
          order: {
            create: async ({ data }) => ({
              ...data,
              userId: 'user',
              SymbolProfile: {
                currency: 'CAD',
                dataSource: 'YAHOO',
                symbol: 'XEQT.TO'
              }
            })
          }
        }
      });
      await service.createActivity({
        accountId: 'account',
        userId: 'user',
        updateAccountBalance: true,
        date: new Date('2026-10-01T12:00:00Z'),
        type: type as any,
        quantity: 673,
        unitPrice: 44.63,
        fee: 5,
        user: { connect: { id: 'user' } },
        SymbolProfile: {
          connectOrCreate: {
            where: {
              dataSource_symbol: { dataSource: 'YAHOO', symbol: 'XEQT.TO' }
            },
            create: { currency: 'CAD', dataSource: 'YAHOO', symbol: 'XEQT.TO' }
          }
        }
      });
      expect(updateAccountBalance).not.toHaveBeenCalled();
    }
  );
});
