import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { and, eq, sql } from 'drizzle-orm';
import clsx from 'clsx';
import FocusButton from '@/components/focus-button';
import { db } from '@/db';
import { channels, videos } from '@/db/schema';
import { useDbQuery } from '@/hooks/use-db-query';
import { addKeyword, filterConditions } from '@/helpers/filters';
import { getFilters, setFilters } from '@/lib/settings';

const DURATIONS = [null, 15, 30, 60];

// Counts videos the child could otherwise see (enabled channel, not hidden)
// that the filters remove.
function countBlocked() {
  const visible = and(eq(channels.enabled, true), eq(videos.hidden, false));
  const count = (where: ReturnType<typeof and>) => db
    .select({ n: sql<number>`count(*)` })
    .from(videos)
    .innerJoin(channels, eq(channels.id, videos.channelId))
    .where(where)
    .get()!.n;
  return count(visible) - count(and(visible, ...filterConditions(getFilters())));
}

export default function FiltersPage() {
  const filters = useDbQuery(getFilters, ['settings'], []);
  const blocked = useDbQuery(countBlocked, ['settings', 'videos', 'channels'], []);
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const add = () => {
    setFilters({ ...filters, keywords: addKeyword(filters.keywords, input) });
    setInput('');
  };
  const remove = (keyword: string) => setFilters({ ...filters, keywords: filters.keywords.filter((k) => k !== keyword) });

  return (
    <ScrollView className='flex-1 bg-white' contentContainerClassName='p-6 gap-6'>
      <Text className='text-base text-gray-600'>
        Filters hide videos from your child on top of the ones you hide by hand. They apply right away.{' '}
        <Text className='font-bold text-gray-900'>{blocked} video{blocked === 1 ? '' : 's'} hidden by filters.</Text>
      </Text>

      <View className='gap-6 md:flex-row md:items-start'>
        <View className='flex-1 bg-gray-50 rounded-3xl p-6 gap-4'>
          <View>
            <Text className='text-2xl font-bold text-gray-900 mb-1'>Blocked words</Text>
            <Text className='text-base text-gray-500'>Hide videos whose title contains any of these words.</Text>
          </View>

          <View className='flex-row items-center gap-3'>
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={add}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              hasTVPreferredFocus
              autoCapitalize='none'
              autoCorrect={false}
              returnKeyType='done'
              placeholder='e.g. zombie'
              className={clsx('flex-1 border-2 rounded-xl px-4 py-3 text-lg text-gray-900 bg-white', inputFocused ? 'border-blue-600' : 'border-gray-300')}
            />
            <FocusButton disabled={!input.trim()} onPress={add} className='px-5 py-3 rounded-xl bg-gray-900' focusClassName='bg-blue-600'>
              <Text className='text-white text-lg font-bold'>Add</Text>
            </FocusButton>
          </View>

          {filters.keywords.length === 0 ? (
            <Text className='text-base text-gray-400'>No blocked words yet.</Text>
          ) : (
            <View className='flex-row flex-wrap gap-2'>
              {filters.keywords.map((keyword) => (
                <FocusButton
                  key={keyword}
                  onPress={() => remove(keyword)}
                  accessibilityLabel={`Remove ${keyword}`}
                  className='flex-row items-center gap-2 px-4 py-2 rounded-full bg-red-100 border-2 border-red-100'
                  focusClassName='border-red-600'
                >
                  <Text className='text-base font-semibold text-red-800'>{keyword}</Text>
                  <Text className='text-base text-red-800'>✕</Text>
                </FocusButton>
              ))}
            </View>
          )}
        </View>

        <View className='flex-1 bg-gray-50 rounded-3xl p-6 gap-4'>
          <View>
            <Text className='text-2xl font-bold text-gray-900 mb-1'>Longest video</Text>
            <Text className='text-base text-gray-500'>Hide long compilations that would use up the whole watch time.</Text>
          </View>
          <View className='flex-row flex-wrap gap-3'>
            {DURATIONS.map((minutes) => {
              const selected = filters.maxDurationMinutes === minutes;
              return (
                <FocusButton
                  key={minutes ?? 'off'}
                  onPress={() => setFilters({ ...filters, maxDurationMinutes: minutes })}
                  accessibilityState={{ selected }}
                  className={clsx('px-6 py-3 rounded-xl border-2', selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300')}
                  focusClassName={selected ? 'bg-blue-800 border-blue-800' : 'border-blue-600'}
                >
                  <Text className={clsx('text-xl font-bold', selected ? 'text-white' : 'text-gray-900')}>
                    {minutes === null ? 'No limit' : `${minutes} min`}
                  </Text>
                </FocusButton>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
