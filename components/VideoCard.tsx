import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useAudioPlayer } from 'expo-audio'
import notifWav from '../assets/notif.wav';
import cx from 'clsx';

interface Thumbnail {
  url: string;
  height: number;
  width: number;
}

interface VideoEntry {
  id: string;
  title: string;
  description: string;
  duration: number;
  view_count: number;
  thumbnails: Thumbnail[];
}

interface VideoCardProps {
  video: VideoEntry;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatViewCount(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
}

export default function VideoCard({ video }: VideoCardProps) {
  // Get the highest quality thumbnail
  const thumbnail = video.thumbnails?.[video.thumbnails.length - 1];

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
          {thumbnail && (
            <Image
              source={{ uri: thumbnail.url }}
              className={cx(
                'w-full h-full',
                {
                  'rounded-t-2xl': isFocused,
                  'rounded-2xl': !isFocused,
                }
              )}
              resizeMode='cover'
            />
          )}
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
          {video.view_count !== null && video.view_count !== undefined && (
            <Text className='text-sm text-gray-600'>
              {formatViewCount(video.view_count)}
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}
