import { useEffect, useState } from 'react';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { count, eq } from 'drizzle-orm';
import { db } from '@/db';
import migrations from '@/drizzle/migrations';
import { channels, settings, videos } from '@/db/schema';

export function useDatabaseInit() {
  const { success } = useMigrations(db, migrations);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!success) return;

    (async () => {
      console.log('⏳ Checking last updated at... \n');
      const { lastUpdatedAt } = await import('@/data');
      const meta = await db.query.settings.findFirst({
        where: (settings, { eq }) => eq(settings.key, 'lastUpdatedAt'),
      });
      console.log('Fetched last updated at: ', meta?.value ?? 'none', '\n');
      console.log('New last updated at: ', lastUpdatedAt, '\n');

      if (meta?.value === lastUpdatedAt) {
        console.log('✅ Data already up to date. Skipping seeding. \n');
        setIsReady(true);
        return;
      }

      // Clear existing data before reseeding
      console.log('⏳ Clearing old data... \n');
      await db.delete(channels);
      await db.delete(videos);

      console.log('⏳ Seeding videos data... \n');
      const { entries } = await import('@/data');
      await db.insert(videos).values(entries);

      console.log('⏳ Fetching channel summary... \n');
      // Aggregate channels data
      const channelResults = await db
        .select({
          id: videos.channelId,
          name: videos.channelName,
          totalVideos: count(videos.id),
        })
        .from(videos)
        .groupBy(videos.channelId);

      console.log('⏳ Seeding channels data... \n');
      await db.insert(channels).values(channelResults);

      // Update or insert lastUpdatedAt
      console.log('⏳ Updating lastUpdatedAt... \n');
      if (meta) {
        await db
          .update(settings)
          .set({ value: lastUpdatedAt })
          .where(eq(settings.key, 'lastUpdatedAt'));
      } else {
        await db
          .insert(settings)
          .values({ key: 'lastUpdatedAt', value: lastUpdatedAt });
      }

      console.log('✅ All data seeded successfully. \n');

      setIsReady(true);
    })();
  }, [success]);

  return { isReady };
}
