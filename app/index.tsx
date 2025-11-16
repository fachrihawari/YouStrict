import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import VideoCard from '../components/VideoCard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { db } from '../db';
import { Video } from '../db/schema';

export default function IndexPage() {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    db
      .query
      .videos
      .findMany({
        orderBy: (video, { desc }) => [desc(video.timestamp)]
      })
      .then(setVideos)
  }, []);

  return (
    <View className='flex-1 bg-gray-50'>
      <Stack.Screen options={{ title: "YouStrict" }} />
      <FlashList
        data={videos}
        numColumns={4}
        renderItem={({ item }) => (
          <View className='p-2'>
            <VideoCard video={item} />
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}