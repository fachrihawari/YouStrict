import { memo } from 'react';
import { Link } from 'expo-router';
import { View, Text, Image, Platform } from 'react-native';
import clsx from 'clsx';
import FocusButton from '@/components/focus-button';
import { formatDuration, formatRelativeTime } from '@/helpers/video';
import { thumbnailUrl } from '@/catalog/schema';
import type { VideoItem } from '@/hooks/use-videos';

const isTV = Platform.isTV;

function VideoCard({ video, preferredFocus }: { video: VideoItem; preferredFocus?: boolean }) {
  return (
    <Link href={{ pathname: '/watch/[id]', params: { id: video.id } }} asChild>
      <FocusButton
        hasTVPreferredFocus={preferredFocus}
        className='rounded-3xl border-4 border-transparent p-1'
        focusClassName='border-blue-500 bg-blue-50'
      >
        {({ focused }) => (
          <>
            <View className='w-full aspect-video rounded-2xl overflow-hidden bg-gray-200'>
              <Image source={{ uri: thumbnailUrl(video.id) }} className='w-full h-full' resizeMode='cover' />
              <View className='absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded-md'>
                <Text className={clsx('text-white font-semibold', isTV ? 'text-sm' : 'text-xs')}>
                  {formatDuration(video.duration)}
                </Text>
              </View>
            </View>
            <View className='px-2 pt-2 pb-1'>
              <Text
                className={clsx('font-semibold', isTV ? 'text-lg' : 'text-base', focused ? 'text-blue-900' : 'text-gray-900')}
                numberOfLines={2}
              >
                {video.title}
              </Text>
              <Text className={clsx('text-gray-500 mt-1', isTV ? 'text-base' : 'text-sm')} numberOfLines={1}>
                {video.channelName} · {formatRelativeTime(video.timestamp)}
              </Text>
            </View>
          </>
        )}
      </FocusButton>
    </Link>
  );
}

export default memo(VideoCard);
