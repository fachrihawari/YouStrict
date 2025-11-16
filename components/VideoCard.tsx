import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useAudioPlayer } from 'expo-audio'
import notifWav from '../assets/notif.wav';
import cx from 'clsx';
import { Video } from '../types/video';
import { formatDuration, formatViewCount } from '../helpers/video';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const soundPlayer = useAudioPlayer(notifWav);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused) {
      soundPlayer.seekTo(0)
        .then(() => {
          soundPlayer.play()
        })
    }
  }, [isFocused, soundPlayer]);

  return (
    <Link href={`/videos/${video.id}`} asChild>
      <Pressable
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Thumbnail */}
        <View className='relative w-full aspect-video'>
          <Image
            source={{ uri: video.thumbnail }}
            className={cx(
              'w-full h-full',
              {
                'rounded-t-2xl': isFocused,
                'rounded-2xl': !isFocused,
              }
            )}
            resizeMode='cover'
          />
          {/* Duration Badge */}
          {video.duration && (
            <View className='absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded'>
              <Text className='text-white text-xs font-semibold'>
                {formatDuration(video.duration)}
              </Text>
            </View>
          )}
        </View>

        {/* Video Info */}
        <View className={cx(
          'p-3',
          {
            'bg-gray-300 rounded-b-2xl': isFocused,
          }
        )}>
          {/* Title */}
          <Text className='text-base font-semibold text-gray-900 mb-2' numberOfLines={2}>
            {video.title}
          </Text>

          {/* View Count */}
          {video.views && (
            <Text className='text-sm text-gray-600'>
              {formatViewCount(video.views)}
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}
