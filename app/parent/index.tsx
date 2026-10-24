import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import clsx from 'clsx';
import FocusButton from '@/components/focus-button';
import { useSession } from '@/contexts/session-context';
import { useChannels } from '@/hooks/use-channels';
import { computeExpiresAt } from '@/helpers/session';
import type { VideoFilters } from '@/helpers/filters';
import { formatWatchTime } from '@/helpers/video';
import { secondsWatchedToday } from '@/lib/history';
import { useDbQuery } from '@/hooks/use-db-query';
import { getFilters, getFinishVideoOnTimeUp, getSetting, setSetting } from '@/lib/settings';

const PRESETS = [15, 30, 60];
const MIN = 5;
const MAX = 180;
const STEP = 5;

export default function ParentHome() {
  const { startSession } = useSession();
  const channels = useChannels();
  const enabledCount = channels.filter((c) => c.enabled).length;
  const filters = useDbQuery(getFilters, ['settings'], []);
  const watchedToday = useDbQuery(() => secondsWatchedToday(), ['watch_history'], []);
  const finishVideo = useDbQuery(getFinishVideoOnTimeUp, ['settings'], []);
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

        <FocusButton
          onPress={() => setSetting('finishVideoOnTimeUp', finishVideo ? '0' : '1')}
          accessibilityRole='switch'
          accessibilityState={{ checked: finishVideo }}
          className='flex-row items-center gap-4 p-3 mb-5 rounded-2xl border-2 border-gray-200 bg-white'
          focusClassName='border-blue-600 bg-blue-50'
        >
          <View className={clsx('w-14 h-8 rounded-full p-1', finishVideo ? 'bg-green-600 items-end' : 'bg-gray-300 items-start')}>
            <View className='w-6 h-6 rounded-full bg-white' />
          </View>
          <View className='flex-1'>
            <Text className='text-lg font-bold text-gray-900'>🎬 Let the last video finish</Text>
            <Text className='text-sm text-gray-500'>If time runs out mid-video, it plays to the end (up to 10 more minutes).</Text>
          </View>
        </FocusButton>

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
        <NavCard href='/parent/history' title='🕘 History' subtitle={watchedToday > 0 ? `${formatWatchTime(watchedToday)} watched today` : 'Nothing watched today'} />
        <NavCard href='/parent/filters' title='🚫 Filters' subtitle={filtersSummary(filters)} />
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

function filtersSummary({ keywords, maxDurationMinutes }: VideoFilters) {
  const parts = [];
  if (keywords.length) parts.push(`${keywords.length} blocked word${keywords.length === 1 ? '' : 's'}`);
  if (maxDurationMinutes !== null) parts.push(`max ${maxDurationMinutes} min`);
  return parts.length ? parts.join(' · ') : 'Blocked words, video length';
}

function NavCard({ href, title, subtitle, preferred }: { href: '/parent/channels' | '/parent/history' | '/parent/filters' | '/parent/settings'; title: string; subtitle: string; preferred?: boolean }) {
  return (
    <Link href={href} asChild>
      <FocusButton hasTVPreferredFocus={preferred} className='p-5 rounded-2xl border-2 border-gray-200 bg-white' focusClassName='border-blue-600 bg-blue-50'>
        <Text className='text-xl font-bold text-gray-900'>{title}</Text>
        <Text className='text-base text-gray-500 mt-1'>{subtitle}</Text>
      </FocusButton>
    </Link>
  );
}
