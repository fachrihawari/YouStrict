import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import clsx from 'clsx';
import FocusButton from '@/components/focus-button';
import { useSession } from '@/contexts/session-context';
import { useChannels } from '@/hooks/use-channels';
import { computeExpiresAt } from '@/helpers/session';
import { getSetting, setSetting } from '@/lib/settings';

const PRESETS = [15, 30, 60];
const MIN = 5;
const MAX = 180;
const STEP = 5;

export default function ParentHome() {
  const { startSession } = useSession();
  const channels = useChannels();
  const enabledCount = channels.filter((c) => c.enabled).length;
  const [minutes, setMinutes] = useState(() => Number(getSetting('defaultDuration')) || 30);

  const endsAt = useMemo(
    () => new Date(computeExpiresAt(Date.now(), minutes)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [minutes],
  );

  const start = async () => {
    setSetting('defaultDuration', String(minutes));
    await startSession(minutes);
  };

  return (
    <ScrollView className='flex-1 bg-white' contentContainerClassName='p-6 gap-6 md:flex-row'>
      <View className='flex-1 bg-gray-50 rounded-3xl p-6'>
        <Text className='text-2xl font-bold text-gray-900 mb-1'>Watch time</Text>
        <Text className='text-base text-gray-500 mb-5'>How long can your child watch?</Text>

        <View className='flex-row flex-wrap gap-3 mb-5'>
          {PRESETS.map((m) => (
            <FocusButton
              key={m}
              onPress={() => setMinutes(m)}
              className={clsx('px-6 py-3 rounded-xl border-2', minutes === m ? 'bg-blue-600 border-blue-600' : 'border-gray-300')}
              focusClassName={minutes === m ? 'bg-blue-800 border-blue-800' : 'border-blue-600'}
            >
              <Text className={clsx('text-xl font-bold', minutes === m ? 'text-white' : 'text-gray-900')}>{m} min</Text>
            </FocusButton>
          ))}
        </View>

        <View className='flex-row items-center gap-4 mb-5'>
          <Stepper label='−' onPress={() => setMinutes((m) => Math.max(MIN, m - STEP))} />
          <Text className='text-3xl font-bold text-gray-900 w-28 text-center'>{minutes} min</Text>
          <Stepper label='+' onPress={() => setMinutes((m) => Math.min(MAX, m + STEP))} />
        </View>

        <Text className='text-base text-blue-900 mb-5'>⏰ Ends at {endsAt}</Text>

        {enabledCount === 0 ? (
          <Text className='text-base text-red-600 font-semibold'>
            No channels are turned on yet. Open Channels to choose what your child can watch.
          </Text>
        ) : (
          <FocusButton hasTVPreferredFocus onPress={start} className='py-4 rounded-2xl items-center bg-green-600' focusClassName='bg-green-800'>
            <Text className='text-white text-xl font-bold'>▶ Start watching</Text>
          </FocusButton>
        )}
      </View>

      <View className='gap-4 md:w-80'>
        <NavCard href='/parent/channels' title='📺 Channels' subtitle={`${enabledCount} of ${channels.length} turned on`} preferred={enabledCount === 0} />
        <NavCard href='/parent/settings' title='⚙️ Settings' subtitle='Sync, PIN' />
      </View>
    </ScrollView>
  );
}

function Stepper({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <FocusButton onPress={onPress} accessibilityLabel={label === '+' ? 'More time' : 'Less time'} className='w-14 h-14 rounded-full border-2 border-gray-300 items-center justify-center'>
      {({ focused }) => <Text className={clsx('text-3xl font-bold', focused ? 'text-white' : 'text-gray-700')}>{label}</Text>}
    </FocusButton>
  );
}

function NavCard({ href, title, subtitle, preferred }: { href: '/parent/channels' | '/parent/settings'; title: string; subtitle: string; preferred?: boolean }) {
  return (
    <Link href={href} asChild>
      <FocusButton hasTVPreferredFocus={preferred} className='p-5 rounded-2xl border-2 border-gray-200 bg-white' focusClassName='border-blue-600 bg-blue-50'>
        <Text className='text-xl font-bold text-gray-900'>{title}</Text>
        <Text className='text-base text-gray-500 mt-1'>{subtitle}</Text>
      </FocusButton>
    </Link>
  );
}
