import { FlatList, Text, View } from 'react-native';
import { Link } from 'expo-router';
import clsx from 'clsx';
import FocusButton from '@/components/focus-button';
import { useChannels } from '@/hooks/use-channels';
import { setChannelEnabled } from '@/lib/catalog';

export default function ChannelsPage() {
  const channels = useChannels();

  return (
    <FlatList
      className='flex-1 bg-white'
      contentContainerClassName='p-6 gap-3'
      data={channels}
      keyExtractor={(c) => c.id}
      ListHeaderComponent={
        <View className='flex-row flex-wrap items-center justify-between gap-3 mb-3'>
          <Text className='text-base text-gray-600 flex-1 min-w-60'>
            Only channels that are turned on appear for your child. New channels start turned off.
          </Text>
          <Link href='/parent/request-channel' asChild>
            <FocusButton className='px-5 py-3 rounded-xl bg-gray-900' focusClassName='bg-blue-600'>
              <Text className='text-white font-bold text-base'>＋ Request a channel</Text>
            </FocusButton>
          </Link>
        </View>
      }
      ListEmptyComponent={<Text className='text-gray-500 text-base'>No channels yet. They appear after the next sync.</Text>}
      renderItem={({ item, index }) => (
        <View className='flex-row items-center gap-3'>
          <FocusButton
            hasTVPreferredFocus={index === 0}
            onPress={() => setChannelEnabled(item.id, !item.enabled)}
            accessibilityRole='switch'
            accessibilityState={{ checked: item.enabled }}
            className='flex-1 flex-row items-center gap-4 p-4 rounded-2xl border-2 border-gray-200'
            focusClassName='border-blue-600 bg-blue-50'
          >
            <View className={clsx('w-14 h-8 rounded-full p-1', item.enabled ? 'bg-green-600 items-end' : 'bg-gray-300 items-start')}>
              <View className='w-6 h-6 rounded-full bg-white' />
            </View>
            <View className='flex-1'>
              <Text className='text-lg font-bold text-gray-900' numberOfLines={1}>{item.name}</Text>
              <Text className='text-sm text-gray-500'>@{item.handle} · {item.videoCount} videos</Text>
            </View>
          </FocusButton>
          <Link href={{ pathname: '/parent/channel/[id]', params: { id: item.id } }} asChild>
            <FocusButton className='px-4 py-4 rounded-2xl border-2 border-gray-200' focusClassName='border-blue-600 bg-blue-50'>
              <Text className='text-base font-semibold text-gray-900'>Videos ›</Text>
            </FocusButton>
          </Link>
        </View>
      )}
    />
  );
}
