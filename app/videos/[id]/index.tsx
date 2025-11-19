import SessionTimer from '@/components/session-timer';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { YoutubeView, useYouTubePlayer } from 'react-native-youtube-bridge';
import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function VideoPage() {
  const { id } = useLocalSearchParams<'/videos/[id]'>()
  
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);
  
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