import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { computeExpiresAt } from '@/helpers/session';
import { useSession } from '@/contexts/session-context';
import clsx from 'clsx';

function CustomDurationPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <View className="flex-row items-center justify-center gap-6 mb-8 bg-gray-50 py-6 rounded-2xl">
      <Pressable
        onPress={() => onChange(Math.max(5, value - 5))}
        accessibilityRole="button"
        className='w-12 focus:bg-blue-600 h-12 rounded-3xl border border-gray-300 items-center justify-center'
      >
        {({ focused }) => (
          <Text className={clsx("text-2xl font-bold", {
            'text-gray-700': !focused,
            'text-white': focused,
          })}>-</Text>
        )}
      </Pressable>

      <View className="items-center px-6">
        <Text className="text-4xl font-bold text-gray-900">{value}</Text>
        <Text className="text-sm text-gray-600 mt-1">minutes</Text>
      </View>

      <Pressable
        onPress={() => onChange(Math.min(180, value + 5))}
        accessibilityRole="button"
        className='w-12 focus:bg-blue-600 h-12 rounded-3xl border border-gray-300 items-center justify-center'
      >
        {({ focused }) => (
          <Text className={clsx("text-2xl font-bold", {
            'text-gray-700': !focused,
            'text-white': focused,
          })}>+</Text>
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
      <View className="flex-1 bg-gray-50 items-center justify-center px-8">
        <View className="bg-white rounded-3xl p-8 shadow-lg max-w-2xl w-full">
          <Text className="text-4xl font-bold text-gray-900 text-center mb-2">Set Watch Time</Text>
          <Text className="text-base text-gray-500 text-center mb-8">Choose how long your child can watch</Text>

          <View className="flex-row gap-3 mb-8 justify-center">
            {options.map((m, i) => {
              const isSelected = selected === m && !showCustom;
              return (
                <Pressable
                  key={m}
                  style={({ focused }) => ({
                    backgroundColor: focused ? '#3B82F6' : isSelected ? '#2563EB' : 'white',
                    borderWidth: 2,
                    borderColor: isSelected ? '#2563EB' : '#E5E7EB',
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    borderRadius: 12,
                  })}
                  hasTVPreferredFocus={i === 1}
                  onPress={() => { setSelected(m); setShowCustom(false); }}
                  accessibilityRole="button"
                >
                  {({ focused }) => (
                    <>
                      <Text className={`${isSelected || focused ? 'text-white' : 'text-gray-700'} text-xl font-bold text-center`}>{m}</Text>
                      <Text className={`${isSelected || focused ? 'text-white opacity-90' : 'text-gray-500'} text-xs text-center mt-1`}>minutes</Text>
                    </>
                  )}
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setShowCustom((s) => !s)}
              accessibilityRole="button"
              style={({ focused }) => ({
                backgroundColor: focused ? '#3B82F6' : showCustom ? '#2563EB' : 'white',
                borderWidth: 2,
                borderColor: showCustom ? '#2563EB' : '#E5E7EB',
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 12,
              })}
            >
              {({ focused }) => (
                <>
                  <Text className={`${showCustom || focused ? 'text-white' : 'text-gray-700'} text-xl font-bold text-center`}>⚙️</Text>
                  <Text className={`${showCustom || focused ? 'text-white opacity-90' : 'text-gray-500'} text-xs text-center mt-1`}>Custom</Text>
                </>
              )}
            </Pressable>
          </View>

          {showCustom && <CustomDurationPicker value={customValue} onChange={setCustomValue} />}

          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-sm text-blue-600 font-medium">⏰ Session ends at</Text>
              <Text className="text-lg font-bold text-blue-900">{previewEnd}</Text>
            </View>
          </View>

          <Pressable
            onPress={startSession}
            accessibilityRole="button"
            style={({ focused }) => ({
              backgroundColor: focused ? '#16A34A' : '#22C55E',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            })}
          >
            <Text className="text-white text-xl font-bold text-center">Start Watching</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}
