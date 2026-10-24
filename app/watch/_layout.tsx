import { Stack } from 'expo-router';

export default function WatchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='[id]' options={{ statusBarHidden: true, orientation: 'landscape', animation: 'fade' }} />
      <Stack.Screen name='unlock' options={{ presentation: 'modal' }} />
    </Stack>
  );
}
