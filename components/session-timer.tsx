import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '@/contexts/session-context';
import { formatDuration } from '@/helpers/video';

export default function SessionTimer() {
  const router = useRouter();
  const { active, remainingSeconds, endSession } = useSession();

  const remaining = useMemo(() => formatDuration(remainingSeconds), [remainingSeconds]);

  if (!active) return null;

  const handleEndNow = async () => {
    await endSession();
    router.replace('/');
  };

  return (
    <View className='flex-row items-center gap-2 px-4 py-2'>
      <Text className='text-base sm:text-2xl font-bold text-gray-900 tracking-wider'>{remaining}</Text>
      <Pressable
        onPress={handleEndNow}
        accessibilityRole='button'
        className='p-2 bg-red-600'
      >
        <Text className='text-white text-sm font-bold'>End Now</Text>
      </Pressable>
    </View>
  );
}
