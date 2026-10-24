import { Stack } from 'expo-router';
import { Text } from 'react-native';
import FocusButton from '@/components/focus-button';
import { useSession } from '@/contexts/session-context';

export default function ParentLayout() {
  const { lock } = useSession();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <FocusButton onPress={lock} className='px-4 py-2 rounded-lg border border-gray-300' focusClassName='bg-gray-900 border-gray-900'>
            {({ focused }) => <Text className={focused ? 'text-white font-bold' : 'text-gray-900 font-bold'}>🔒 Lock</Text>}
          </FocusButton>
        ),
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Parent' }} />
      <Stack.Screen name='channels' options={{ title: 'Channels' }} />
      <Stack.Screen name='channel/[id]' options={{ title: 'Videos' }} />
      <Stack.Screen name='request-channel' options={{ title: 'Request a channel' }} />
      <Stack.Screen name='filters' options={{ title: 'Filters' }} />
      <Stack.Screen name='settings' options={{ title: 'Settings' }} />
    </Stack>
  );
}
