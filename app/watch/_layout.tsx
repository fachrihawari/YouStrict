import { View } from 'react-native';
import { Stack } from 'expo-router';
import TimeWarning from '@/components/time-warning';

export default function WatchLayout() {
  return (
    <View className='flex-1'>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='index' />
        <Stack.Screen name='[id]' options={{ statusBarHidden: true, orientation: 'landscape', animation: 'fade' }} />
        <Stack.Screen name='unlock' options={{ presentation: 'modal' }} />
      </Stack>
      <TimeWarning />
    </View>
  );
}
