import { ActivityIndicator, Text, View, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import VideoCard from '@/components/video-card';
import { Stack } from 'expo-router';
import { useVideos } from '@/hooks/use-videos';
import SessionTimer from '@/components/session-timer';

export default function VideosPage() {
  const { videos, loading, loadNextPage } = useVideos();
  const isTV = Platform.isTV;
  const numColumns = isTV ? 4 : 1;

  return (
    <View className='flex-1 bg-gray-50'>
      <Stack.Screen
        options={{
          title: "YouStrict",
          headerBackVisible: false,
          headerShown: true,
          headerRight: () => <SessionTimer />
        }}
      />
      <FlashList
        data={videos}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading && (
            <View className='flex justify-center items-center h-20'>
              <ActivityIndicator size='large' color='tomato' />
              <Text className='mt-2 text-red-600'>Loading more videos...</Text>
            </View>
          )
        }
        numColumns={numColumns}
        renderItem={({ item }) => (
          <View className={isTV ? 'p-2' : 'px-4 py-2'}>
            <VideoCard video={item} />
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}