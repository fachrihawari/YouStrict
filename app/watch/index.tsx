import { useCallback, useState } from 'react';
import { BackHandler, FlatList, Platform, Text, useWindowDimensions, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Link, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import clsx from 'clsx';
import FocusButton from '@/components/focus-button';
import SessionTimer from '@/components/session-timer';
import VideoCard from '@/components/video-card';
import { useChannels } from '@/hooks/use-channels';
import { useVideos } from '@/hooks/use-videos';

function useColumns() {
  const { width } = useWindowDimensions();
  if (Platform.isTV) return 4;
  if (width >= 900) return 3;
  if (width >= 560) return 2;
  return 1;
}

export default function WatchPage() {
  const insets = useSafeAreaInsets();
  const columns = useColumns();
  const channels = useChannels({ enabledOnly: true });
  const [channelId, setChannelId] = useState<string | undefined>();
  const { videos, loadMore } = useVideos({ channelId });

  // The grid is the bottom of the kid stack: Back does nothing here.
  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []));

  return (
    <View className='flex-1 bg-white' style={{ paddingTop: insets.top }}>
      <View className='flex-row items-center gap-3 px-4 pt-3'>
        <Text className='text-2xl font-extrabold text-pink-600'>YouStrict</Text>
        <FlatList
          horizontal
          className='flex-1'
          contentContainerClassName='gap-2 px-2'
          showsHorizontalScrollIndicator={false}
          data={[{ id: undefined, name: 'All' }, ...channels]}
          keyExtractor={(c) => c.id ?? 'all'}
          renderItem={({ item }) => {
            const selected = item.id === channelId;
            return (
              <FocusButton
                onPress={() => setChannelId(item.id)}
                className={clsx('px-4 py-2 rounded-full border-2', selected ? 'bg-gray-900 border-gray-900' : 'border-gray-200')}
                focusClassName='bg-blue-600 border-blue-600'
              >
                {({ focused }) => (
                  <Text className={clsx('text-base font-semibold', selected || focused ? 'text-white' : 'text-gray-800')} numberOfLines={1}>
                    {item.name}
                  </Text>
                )}
              </FocusButton>
            );
          }}
        />
        <SessionTimer />
        <Link href='/watch/unlock' asChild>
          <FocusButton accessibilityLabel='Parent' className='w-11 h-11 rounded-full items-center justify-center border-2 border-gray-200' focusClassName='bg-blue-600 border-blue-600'>
            <Text className='text-lg'>🔒</Text>
          </FocusButton>
        </Link>
      </View>

      <FlashList
        key={columns}
        data={videos}
        numColumns={columns}
        keyExtractor={(v) => v.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ padding: 8, paddingBottom: insets.bottom + 16 }}
        ListEmptyComponent={
          <View className='items-center p-16'>
            <Text className='text-xl text-gray-500'>No videos here yet</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View className='flex-1 p-2'>
            <VideoCard video={item} preferredFocus={index === 0} />
          </View>
        )}
      />
    </View>
  );
}
