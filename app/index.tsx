import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { entries } from '../data'
import VideoCard from '../components/VideoCard';
import { Stack } from 'expo-router';

export default function IndexPage() {
  return (
    <View className='flex-1 bg-gray-50'>
      <Stack.Screen options={{ title: "YouStrict" }} />
      <FlashList
        data={entries}
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