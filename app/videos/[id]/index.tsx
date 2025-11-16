import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { YoutubeView, useYouTubePlayer } from 'react-native-youtube-bridge';

export default function VideoPage() {
  const { id } = useLocalSearchParams<'/videos/[id]'>()
  
  const player = useYouTubePlayer(id, {
    autoplay: true,
    playsinline: false,
    rel: false,
    controls: true
  });

  return (
    <View className='h-screen'>
      <Stack.Screen options={{ headerShown: false }} />
      <YoutubeView player={player} style={{ flex: 1 }} />
    </View>
  )
}