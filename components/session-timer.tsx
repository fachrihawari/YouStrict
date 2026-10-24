import { Text, View } from 'react-native';
import clsx from 'clsx';
import { useSession } from '@/contexts/session-context';
import { getRemainingSeconds } from '@/helpers/session';
import { formatDuration } from '@/helpers/video';
import { useNow } from '@/hooks/use-now';

// Display only: ending a session early needs the parent PIN (app/watch/unlock.tsx).
export default function SessionTimer({ className }: { className?: string }) {
  const { session, graceUntil } = useSession();
  const now = useNow();

  const remaining = getRemainingSeconds(session, now);
  if (!session) return null;

  return (
    <View className={clsx('flex-row items-center gap-2 px-4 py-2 rounded-full', remaining <= 60 ? 'bg-red-600' : 'bg-gray-900/80', className)}>
      {graceUntil !== null ? (
        <Text className='text-white text-lg font-bold'>🎬 Last video</Text>
      ) : (
        <>
          <Text className='text-white text-lg'>⏰</Text>
          <Text className='text-white text-lg font-bold tracking-wider'>{formatDuration(remaining)}</Text>
        </>
      )}
    </View>
  );
}
