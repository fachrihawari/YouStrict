import { Image, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Stack, useLocalSearchParams } from 'expo-router';
import clsx from 'clsx';
import FocusButton from '@/components/focus-button';
import { useChannels } from '@/hooks/use-channels';
import { useVideos } from '@/hooks/use-videos';
import { setVideoHidden } from '@/lib/catalog';
import { thumbnailUrl } from '@/catalog/schema';
import { formatDuration } from '@/helpers/video';
import { blockedReason, type BlockReason } from '@/helpers/filters';
import { useDbQuery } from '@/hooks/use-db-query';
import { getFilters } from '@/lib/settings';

const BLOCK_LABEL: Record<BlockReason, string> = { keyword: 'Blocked word', duration: 'Too long' };

// Parent review of one channel: hide videos you don't want your child to see.
export default function ChannelVideosPage() {
  const { id } = useLocalSearchParams<'/parent/channel/[id]'>();
  const channel = useChannels().find((c) => c.id === id);
  const { videos, loadMore } = useVideos({ channelId: id, includeHidden: true });
  const filters = useDbQuery(getFilters, ['settings'], []);

  return (
    <View className='flex-1 bg-white'>
      <Stack.Screen options={{ title: channel?.name ?? 'Videos' }} />
      <FlashList
        data={videos}
        keyExtractor={(v) => v.id}
        onEndReached={loadMore}
        contentContainerClassName='p-6'
        ListHeaderComponent={
          <Text className='text-base text-gray-600 mb-4'>
            Select a video to hide or show it. Videos marked "Blocked word" or "Too long" are hidden by Filters.
          </Text>
        }
        renderItem={({ item, index }) => {
          const blocked = blockedReason(item, filters);
          const off = item.hidden || blocked !== null;
          return (
            <FocusButton
              hasTVPreferredFocus={index === 0}
              onPress={() => setVideoHidden([item.id], !item.hidden)}
              className='flex-row items-center gap-4 p-2 mb-2 rounded-xl border-2 border-transparent'
              focusClassName='border-blue-600 bg-blue-50'
            >
              <Image source={{ uri: thumbnailUrl(item.id) }} className={clsx('w-32 aspect-video rounded-lg', off && 'opacity-30')} />
              <View className='flex-1'>
                <Text className={clsx('text-base font-semibold', off ? 'text-gray-400 line-through' : 'text-gray-900')} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text className='text-sm text-gray-500'>{formatDuration(item.duration)}</Text>
              </View>
              <Text
                className={clsx(
                  'text-sm font-bold px-3 py-1 rounded-full',
                  item.hidden ? 'bg-red-100 text-red-700' : blocked ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700',
                )}
              >
                {item.hidden ? 'Hidden' : blocked ? BLOCK_LABEL[blocked] : 'Visible'}
              </Text>
            </FocusButton>
          );
        }}
      />
    </View>
  );
}
