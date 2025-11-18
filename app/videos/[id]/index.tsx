import SessionTimer from '@/components/session-timer';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { YoutubeView, useYouTubePlayer } from 'react-native-youtube-bridge';

export default function VideoPage() {
  const { id } = useLocalSearchParams<'/videos/[id]'>()
  
  const player = useYouTubePlayer(id, {
    autoplay: true,
    playsinline: false,
    rel: false,
    controls: false
  });

  return (
    <View className='h-screen'>
      <View className='absolute top-0 right-0 z-10 bg-white shadow rounded-bl-md'>
        <SessionTimer />
      </View>
      <Stack.Screen options={{ headerShown: false }} />
      <YoutubeView player={player} style={{ flex: 1 }} />
    </View>
  )
}