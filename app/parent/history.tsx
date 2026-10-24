import { Image, SectionList, Text, View } from 'react-native';
import clsx from 'clsx';
import FocusButton from '@/components/focus-button';
import { useDbQuery } from '@/hooks/use-db-query';
import { getHistory, groupByDay, HISTORY_DAYS, type HistoryItem } from '@/lib/history';
import { setChannelEnabled, setVideoHidden } from '@/lib/catalog';
import { thumbnailUrl } from '@/catalog/schema';
import { formatWatchTime } from '@/helpers/video';

// What the child watched in the last 30 days, by day, with quick actions to
// hide a video or turn its channel off.
export default function HistoryPage() {
  const days = useDbQuery(() => groupByDay(getHistory()), ['watch_history', 'videos', 'channels'], []);

  return (
    <SectionList
      className='flex-1 bg-white'
      contentContainerClassName='p-6'
      sections={days}
      keyExtractor={(item) => String(item.id)}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <Text className='text-base text-gray-600 mb-2'>Videos watched in the last {HISTORY_DAYS} days.</Text>
      }
      ListEmptyComponent={<Text className='text-base text-gray-400 mt-4'>Nothing watched yet.</Text>}
      renderSectionHeader={({ section }) => (
        <View className='flex-row items-baseline justify-between mt-6 mb-3'>
          <Text className='text-2xl font-bold text-gray-900'>{section.title}</Text>
          <Text className='text-lg font-semibold text-gray-600'>{formatWatchTime(section.totalSeconds)}</Text>
        </View>
      )}
      renderItem={({ item, index, section }) => (
        <HistoryRow item={item} preferred={section === days[0] && index === 0} />
      )}
    />
  );
}

function HistoryRow({ item, preferred }: { item: HistoryItem; preferred: boolean }) {
  const time = new Date(item.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const inCatalog = item.videoHidden !== null;

  return (
    <View className='flex-row flex-wrap items-center gap-4 py-3 border-b border-gray-100'>
      <Image source={{ uri: thumbnailUrl(item.videoId) }} className={clsx('w-28 aspect-video rounded-lg', item.videoHidden && 'opacity-30')} />
      <View className='flex-1 min-w-48'>
        <Text className='text-base font-semibold text-gray-900' numberOfLines={2}>{item.title}</Text>
        <Text className='text-sm text-gray-500' numberOfLines={1}>
          {item.channelName} · {time} · {formatWatchTime(item.watchedSeconds)}
        </Text>
      </View>
      {inCatalog ? (
        <View className='flex-row gap-2'>
          <ActionButton
            preferred={preferred}
            label={item.videoHidden ? 'Show video' : 'Hide video'}
            onPress={() => setVideoHidden([item.videoId], !item.videoHidden)}
          />
          {item.channelEnabled !== null && (
            <ActionButton
              label={item.channelEnabled ? 'Turn off channel' : 'Turn on channel'}
              onPress={() => setChannelEnabled(item.channelId, !item.channelEnabled)}
            />
          )}
        </View>
      ) : (
        <Text className='text-sm text-gray-400'>No longer in the catalog</Text>
      )}
    </View>
  );
}

function ActionButton({ label, onPress, preferred }: { label: string; onPress: () => void; preferred?: boolean }) {
  return (
    <FocusButton
      hasTVPreferredFocus={preferred}
      onPress={onPress}
      className='px-4 py-2 rounded-xl border-2 border-gray-300'
      focusClassName='bg-blue-600 border-blue-600'
    >
      {({ focused }) => <Text className={clsx('text-base font-semibold', focused ? 'text-white' : 'text-gray-900')}>{label}</Text>}
    </FocusButton>
  );
}
