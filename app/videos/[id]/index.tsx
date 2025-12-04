import SessionTimer from '@/components/session-timer';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { YoutubeView, useYouTubePlayer } from 'react-native-youtube-bridge';
import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VideoPage() {
  const { id } = useLocalSearchParams<'/videos/[id]'>()
  const { top } = useSafeAreaInsets()

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
    <Pressable onPress={async () => {
      if (await player.getPlayerState() === 1) {
        player.pause();
      } else {
        player.play();
      }
    }} style={{ paddingTop: top }}>
      <View className='overflow-hidden absolute right-0 z-10 bg-white shadow rounded-bl-md' style={{ top: top }}>
        <SessionTimer />
      </View>
      <Stack.Screen options={{ headerShown: false }} />
      <YoutubeView player={player} style={{  width: '100%', height: '100%' }} />
    </Pressable>
  )
}