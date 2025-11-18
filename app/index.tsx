import { ActivityIndicator, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import VideoCard from '@/components/video-card';
import { Stack } from 'expo-router';
import { useVideos } from '@/hooks/use-videos';

export default function IndexPage() {
  const { videos, loading, loadNextPage } = useVideos();

  return (
    <View className='flex-1 bg-gray-50'>
      <Stack.Screen options={{ title: "YouStrict" }} />
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