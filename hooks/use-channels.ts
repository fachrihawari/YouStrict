import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { channels } from '@/db/schema';
import { useDbQuery } from '@/hooks/use-db-query';

export function useChannels({ enabledOnly = false } = {}) {
  return useDbQuery(
    () => db
      .select()
      .from(channels)
      .where(enabledOnly ? eq(channels.enabled, true) : undefined)
      .orderBy(asc(channels.sortOrder))
      .all(),
    ['channels'],
    [enabledOnly],
  );
}
