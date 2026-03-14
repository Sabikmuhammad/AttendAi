import Class from '@/models/Class';

/**
 * Sync class status with wall-clock time for a tenant.
 * - scheduled -> active when class has started and not ended
 * - active -> completed when class has ended
 * - scheduled -> completed when class end is already in the past
 */
export async function synchronizeClassStatuses(institutionId: string) {
  const now = new Date();
  const update = { updatedAt: now };

  await Class.updateMany(
    {
      institutionId,
      status: 'scheduled',
      startTime: { $lte: now },
      endTime: { $gt: now },
    },
    {
      $set: {
        status: 'active',
        ...update,
      },
    }
  );

  await Class.updateMany(
    {
      institutionId,
      status: 'active',
      endTime: { $lte: now },
    },
    {
      $set: {
        status: 'completed',
        ...update,
      },
    }
  );

  await Class.updateMany(
    {
      institutionId,
      status: 'scheduled',
      endTime: { $lte: now },
    },
    {
      $set: {
        status: 'completed',
        ...update,
      },
    }
  );
}
