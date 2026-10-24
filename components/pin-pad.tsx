import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import clsx from 'clsx';
import FocusButton from '@/components/focus-button';
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from '@/helpers/pin';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'OK'] as const;

type Props = {
  // Return an error message to reject the PIN (pad shakes and clears).
  onSubmit: (pin: string) => Promise<string | null>;
};

// On-screen keypad: works with a TV remote D-pad and with touch.
export default function PinPad({ onSubmit }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
  const isTV = Platform.isTV;

  const press = async (key: (typeof KEYS)[number]) => {
    if (busy) return;
    setError(null);
    if (key === '⌫') return setPin((p) => p.slice(0, -1));
    if (key !== 'OK') return setPin((p) => (p.length < PIN_MAX_LENGTH ? p + key : p));

    if (pin.length < PIN_MIN_LENGTH) {
      setError(`Enter at least ${PIN_MIN_LENGTH} digits`);
      return;
    }
    setBusy(true);
    const message = await onSubmit(pin);
    setBusy(false);
    if (message) {
      setError(message);
      setPin('');
      shake.value = withSequence(
        withTiming(12, { duration: 50 }),
        withTiming(-12, { duration: 50 }),
        withTiming(12, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  };

  return (
    <View className='items-center'>
      <Animated.View style={shakeStyle} className='flex-row gap-3 mb-3 h-6 items-center'>
        {Array.from({ length: PIN_MAX_LENGTH }, (_, i) => (
          <View
            key={i}
            className={clsx('w-4 h-4 rounded-full border-2', {
              'bg-gray-900 border-gray-900': i < pin.length,
              'border-gray-300': i >= pin.length,
            })}
          />
        ))}
      </Animated.View>
      <Text className='text-red-600 text-base h-6 mb-2'>{error ?? ''}</Text>

      <View className={clsx('flex-row flex-wrap justify-center', isTV ? 'w-80 gap-3' : 'w-72 gap-3')}>
        {KEYS.map((key, i) => (
          <FocusButton
            key={key}
            hasTVPreferredFocus={i === 0}
            onPress={() => press(key)}
            disabled={busy}
            accessibilityLabel={key === '⌫' ? 'Delete' : key}
            className={clsx(
              'items-center justify-center rounded-2xl border-2 border-gray-200',
              isTV ? 'w-24 h-16' : 'w-20 h-16',
              key === 'OK' ? 'bg-green-600 border-green-600' : 'bg-gray-50',
            )}
            focusClassName={key === 'OK' ? 'bg-green-800 border-green-800' : 'bg-blue-600 border-blue-600'}
          >
            {({ focused }) => (
              <Text className={clsx('text-2xl font-bold', focused || key === 'OK' ? 'text-white' : 'text-gray-900')}>
                {key}
              </Text>
            )}
          </FocusButton>
        ))}
      </View>
    </View>
  );
}
