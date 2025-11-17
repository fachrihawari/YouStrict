import { ActivityIndicator, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import VideoCard from '@/components/VideoCard';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Video } from '@/db/schema';
import { getVideos } from '@/db/query';

export default function IndexPage() {
  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Fetching page', page);
    setLoading(true);
    getVideos(page)
      .then((data) => {
        if (page === 1) setVideos(data);
        else setVideos((prevVideos) => [...prevVideos, ...data]);
      })
      .finally(() => setLoading(false));

  }, [page]);

  return (
    <View className='flex-1 bg-gray-50'>
      <Stack.Screen options={{ title: "YouStrict" }} />
      <FlashList
        data={videos}
        onEndReached={() => {
          if (!loading) setPage((prevPage) => prevPage + 1);
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading && (
            <View className='flex justify-center items-center h-20'>
              <ActivityIndicator size='large' color='tomato' />
              <Text className='mt-2 text-red-600'>Loading more videos...</Text>
            </View>
          )
        }
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