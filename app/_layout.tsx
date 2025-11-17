import './globals.css'
import { Stack } from 'expo-router';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '@/db';
import migrations from '@/drizzle/migrations';
import { useEffect, useState } from 'react';
import { channels, videos } from '@/db/schema';
import { count } from 'drizzle-orm';
import { ActivityIndicator, Text, View } from 'react-native';

export default function RootLayout() {
  const { success } = useMigrations(db, migrations);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!success) return;

    (async () => {
      console.log('⏳ Checking existing videos... \n');
      const existing = await db.select().from(videos).limit(1);
      if (existing.length > 0) {
        console.log('✅ Data already exists. Skipping seeding. \n');
        setIsReady(true);
        return;
      }

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
        .groupBy(videos.channelId)
      
      console.log('⏳ Seeding channels data... \n');      
      await db.insert(channels).values(channelResults);
      
      console.log('✅ All data seeded successfully. \n');

      setIsReady(true);
    })();
  }, [success]);
  
  if (!isReady) {
    return (
      <View className='h-screen bg-white flex justify-center items-center'>
        <ActivityIndicator size={48} color='tomato' />
        <Text className='mt-4 text-lg'>Preparing your data...</Text>
      </View>
    )
  }

  return <Stack />;
}
