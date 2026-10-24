import './globals.css'
import { Stack } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useDatabaseInit } from '@/hooks/use-database-init';
import { SessionProvider, useSession } from '@/contexts/session-context';
import FocusButton from '@/components/focus-button';

export default function RootLayout() {
  const data = useDatabaseInit();

  if (data.status === 'loading') {
    return (
      <View className='flex-1 bg-white justify-center items-center'>
        <ActivityIndicator size={48} colorClassName='accent-pink-600' />
        <Text className='mt-4 text-lg'>Downloading videos…</Text>
      </View>
    )
  }

  if (data.status === 'error') {
    return (
      <View className='flex-1 bg-white justify-center items-center px-8'>
        <Text className='text-5xl mb-4'>📡</Text>
        <Text className='text-2xl font-bold text-gray-900 mb-2'>Couldn't download videos</Text>
        <Text className='text-base text-gray-600 text-center mb-6'>{data.message}. Check the internet connection.</Text>
        <FocusButton hasTVPreferredFocus onPress={data.retry} className='px-8 py-4 rounded-xl bg-gray-900' focusClassName='bg-blue-600'>
          <Text className='text-white text-lg font-bold'>Try again</Text>
        </FocusButton>
      </View>
    )
  }

  return (
    <SessionProvider>
      <StatusBar style='auto' />
      <RootStack />
    </SessionProvider>
  );
}

function RootStack() {
  const { hydrated, mode } = useSession();

  if (!hydrated) {
    return <View className='flex-1 bg-white' />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={mode === 'setup' || mode === 'locked' || mode === 'time-up'}>
        <Stack.Screen name='index' />
      </Stack.Protected>
      <Stack.Protected guard={mode === 'parent'}>
        <Stack.Screen name='parent' />
      </Stack.Protected>
      <Stack.Protected guard={mode === 'watching'}>
        <Stack.Screen name='watch' />
      </Stack.Protected>
    </Stack>
  );
}
