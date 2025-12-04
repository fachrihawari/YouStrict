import React, { useMemo, useState } from 'react';
import { useResolveClassNames } from 'uniwind'
import { View, Text, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { computeExpiresAt } from '@/helpers/session';
import { useSession } from '@/contexts/session-context';
import clsx from 'clsx';

function CustomDurationPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const bgFocus = useResolveClassNames('bg-blue-600');

  return (
    <View className="flex-row items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8 bg-gray-50 py-4 sm:py-6 rounded-2xl">
      <Pressable
        onPress={() => onChange(Math.max(5, value - 5))}
        accessibilityRole="button"
        className='w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 rounded-full items-center justify-center'
        style={({ focused }) => focused && bgFocus}
      >
        {({ focused }) => (
          <Text className={clsx('text-xl sm:text-2xl font-bold text-white', !focused && 'text-gray-700')}>
            -
          </Text>
        )}
      </Pressable>

      <View className="items-center px-4 sm:px-6">
        <Text className="text-3xl sm:text-4xl font-bold text-gray-900">{value}</Text>
        <Text className="text-xs sm:text-sm text-gray-600 mt-1">minutes</Text>
      </View>

      <Pressable
        onPress={() => onChange(Math.min(180, value + 5))}
        accessibilityRole="button"
        className='w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 rounded-full items-center justify-center'
        style={({ focused }) => focused && bgFocus}
      >
        {({ focused }) => (
          <Text className={clsx('text-xl sm:text-2xl font-bold text-white', !focused && 'text-gray-700')}>
            +
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export default function SelectDuration() {
  const router = useRouter();
  const { startSession: startSessionHook } = useSession();
  const options = [15, 30, 60];
  const [selected, setSelected] = useState<number>(30);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState<number>(30);

  const styleFocus = useResolveClassNames('border-blue-600');
  const styleSelected = useResolveClassNames('bg-blue-600 border-blue-600');
  const styleSelectedFocus = useResolveClassNames('bg-blue-700 border-blue-700');
  const styleDefault = useResolveClassNames('bg-transparent border-gray-300');
  const styleSubmitFocus = useResolveClassNames('bg-green-700');

  const currentDuration = showCustom ? customValue : selected;

  const previewEnd = useMemo(() => {
    const startedAt = Date.now();
    const expiresAt = computeExpiresAt(startedAt, currentDuration);
    return new Date(expiresAt).toLocaleTimeString();
  }, [currentDuration]);

  const startSession = async () => {
    const durationMinutes = showCustom ? customValue : selected;
    try {
      await startSessionHook(durationMinutes);
    } catch (e) {
      // ignore - best-effort
    }
    router.replace('/videos');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-white items-center justify-center px-4 sm:px-8">
        <View className="p-4 sm:p-8 w-full">
          <Text className="text-2xl sm:text-4xl font-bold text-gray-900 text-center mb-2">Set Watch Time</Text>
          <Text className="text-sm sm:text-base text-gray-500 text-center mb-6 sm:mb-8">Choose how long your child can watch</Text>

          <View className="flex-row flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
            {options.map((m, i) => {
              const isSelected = !showCustom && selected === m;
              return (
                <Pressable
                  key={m}
                  className="border px-6 sm:px-8 py-3 sm:py-4 rounded-xl flex-1 min-w-20 sm:min-w-0 sm:flex-initial"
                  onPress={() => {
                    setSelected(m);
                    setShowCustom(false);
                  }}
                  style={({ focused }) => isSelected && focused ? styleSelectedFocus : isSelected ? styleSelected : focused ? styleFocus : styleDefault}
                  accessibilityRole="button"
                >
                  {({ focused }) => (
                    <>
                      <Text className={clsx('text-lg sm:text-xl font-bold text-center', {
                        'text-blue-600': !isSelected && focused,
                        'text-white': isSelected
                      })}>
                        {m}
                      </Text>
                      <Text className={clsx('text-xs text-center mt-1', {
                        'text-blue-600': !isSelected && focused,
                        'text-white': isSelected
                      })}>
                        minutes
                      </Text>
                    </>
                  )}
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => {
                setShowCustom(true)
              }}
              accessibilityRole="button"
              className="border px-6 sm:px-8 py-3 sm:py-4 rounded-xl flex-1 min-w-20 sm:min-w-0 sm:flex-initial"
              style={({ focused }) => showCustom && focused ? styleSelectedFocus : showCustom ? styleSelected : focused ? styleFocus : styleDefault}
            >
              {({ focused }) => (
                <>
                  <Text className={clsx('text-lg sm:text-xl font-bold text-center', {
                    'text-blue-600': !showCustom && focused,
                    'text-white': showCustom
                  })}>
                    ⚙️
                  </Text>
                  <Text className={clsx('text-xs text-center mt-1 opacity-90', {
                    'text-blue-600': !showCustom && focused,
                    'text-white': showCustom
                  })}>
                    Custom
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {showCustom && <CustomDurationPicker value={customValue} onChange={setCustomValue} />}

          <View className="bg-blue-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <View className="flex-row items-center justify-center gap-2 flex-wrap">
              <Text className="text-xs sm:text-sm text-blue-600 font-medium">⏰ Session ends at</Text>
              <Text className="text-base sm:text-lg font-bold text-blue-900">{previewEnd}</Text>
            </View>
          </View>

          <Pressable
            onPress={startSession}
            accessibilityRole="button"
            className="py-3 sm:py-4 rounded-xl items-center bg-green-600"
            style={({ focused }) => focused && styleSubmitFocus}
          >
            <Text className="text-white text-lg sm:text-xl font-bold text-center">Start Watching</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
