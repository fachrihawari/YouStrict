import './globals.css'
import { Stack } from 'expo-router';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import { useDatabaseInit } from '@/hooks/use-database-init';
import { SessionProvider } from '@/contexts/session-context';

export default function RootLayout() {
  const { isReady } = useDatabaseInit();

  if (!isReady) {
    return (
      <View className='h-screen bg-white flex justify-center items-center'>
        <ActivityIndicator size={48} colorClassName='accent-pink-600' />
        <Text className='mt-4 text-lg'>Preparing your data...</Text>
      </View>
    )
  }

  return (
    <SessionProvider>
      <StatusBar barStyle='dark-content' />
      <Stack screenOptions={{ headerShown: false }} />
    </SessionProvider>
  );
}