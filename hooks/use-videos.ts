import { useCallback, useEffect, useState } from 'react';
import { and, desc, eq, gt, lt, ne, or, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { channels, videos } from '@/db/schema';
import { useDbQuery } from '@/hooks/use-db-query';

const PAGE_SIZE = 40;

type Options = {
  channelId?: string;
  // Kid view shows only enabled channels and non-hidden videos;
  // the parent view of a single channel shows everything.
  includeHidden?: boolean;
};

export function useVideos({ channelId, includeHidden = false }: Options = {}) {
  const [limit, setLimit] = useState(PAGE_SIZE);

  // Reset to the first page when switching channels.
  useEffect(() => setLimit(PAGE_SIZE), [channelId]);

  const items = useDbQuery(
    () => {
      const filters = [];
      if (channelId) filters.push(eq(videos.channelId, channelId));
      if (!includeHidden) filters.push(eq(videos.hidden, false), eq(channels.enabled, true));

      return db
        .select({
          id: videos.id,
          title: videos.title,
          duration: videos.duration,
          timestamp: videos.timestamp,
          hidden: videos.hidden,
          channelId: videos.channelId,
          channelName: channels.name,
        })
        .from(videos)
        .innerJoin(channels, eq(channels.id, videos.channelId))
        .where(and(...filters))
        .orderBy(desc(videos.timestamp), videos.id)
        .limit(limit)
        .all();
    },
    ['videos', 'channels'],
    [channelId, includeHidden, limit],
  );

  // Growing LIMIT (not OFFSET pages) keeps the list consistent when a sync
  // or a parent toggle changes rows underneath it.
  const hasMore = items.length === limit;
  const loadMore = useCallback(() => {
    if (hasMore) setLimit((l) => (l === items.length ? l + PAGE_SIZE : l));
  }, [hasMore, items.length]);

  return { videos: items, hasMore, loadMore };
}

export type VideoItem = ReturnType<typeof useVideos>['videos'][number];

// The video after `id` in the same channel (older first, like the grid);
// wraps to the channel's newest video at the end.
export function getNextVideo(id: string) {
  const current = db.select().from(videos).where(eq(videos.id, id)).get();
  if (!current) return null;

  const visible = and(eq(videos.channelId, current.channelId), eq(videos.hidden, false), ne(videos.id, id));
  const first = (where: SQL | undefined) => db
    .select({ id: videos.id, title: videos.title })
    .from(videos)
    .where(where)
    .orderBy(desc(videos.timestamp), videos.id)
    .limit(1)
    .get();

  const older = or(lt(videos.timestamp, current.timestamp), and(eq(videos.timestamp, current.timestamp), gt(videos.id, id)));
  return first(and(visible, older)) ?? first(visible) ?? null;
}
