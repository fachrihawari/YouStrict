import { Platform, Text, View } from 'react-native';
import clsx from 'clsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '@/contexts/session-context';
import { activeWarning, getRemainingSeconds } from '@/helpers/session';
import { useNow } from '@/hooks/use-now';

// A short banner at 5:00 and 1:00 left, over the grid and the player alike,
// so running out of time isn't a surprise.
export default function TimeWarning() {
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const now = useNow();

  if (!session) return null;
  const warning = activeWarning(getRemainingSeconds(session, now), session.durationMinutes * 60);
  if (warning === null) return null;

  const minutes = warning / 60;
  return (
    <View className='absolute inset-x-0 items-center px-4' style={{ top: insets.top + 16 }} pointerEvents='none'>
      <View className={clsx('flex-row items-center gap-3 rounded-full shadow-lg', minutes === 1 ? 'bg-red-600' : 'bg-amber-400', Platform.isTV ? 'px-10 py-5' : 'px-6 py-3')}>
        <Text className={Platform.isTV ? 'text-4xl' : 'text-2xl'}>⏰</Text>
        <Text className={clsx('font-extrabold', minutes === 1 ? 'text-white' : 'text-gray-900', Platform.isTV ? 'text-4xl' : 'text-2xl')}>
          {minutes} more minute{minutes === 1 ? '' : 's'}
        </Text>
      </View>
    </View>
  );
}
