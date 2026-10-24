import { useState } from 'react';
import { Text, View } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import PinPad from '@/components/pin-pad';
import { useSession } from '@/contexts/session-context';
import { pinErrorMessage, setPin, verifyPin } from '@/helpers/pin';

// Shared gate for modes: setup (create PIN), locked and time-up (enter PIN).
export default function GatePage() {
  const { mode, unlock } = useSession();
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const wrongPlayer = useAudioPlayer(require('@/assets/sounds/wrong.mp3'));

  const playWrong = () => {
    wrongPlayer.seekTo(0).then(() => wrongPlayer.play()).catch(() => {});
  };

  const handleSubmit = async (pin: string): Promise<string | null> => {
    if (mode === 'setup') {
      if (firstPin === null) {
        setFirstPin(pin);
        return null;
      }
      if (pin !== firstPin) {
        setFirstPin(null);
        return 'PINs did not match, start again';
      }
      await setPin(pin);
      await unlock();
      return null;
    }

    const result = await verifyPin(pin);
    if (result.ok) {
      await unlock();
      return null;
    }
    playWrong();
    return pinErrorMessage(result);
  };

  const copy = {
    setup: firstPin === null
      ? { emoji: '👋', title: 'Welcome to YouStrict', subtitle: 'Create a parent PIN (4–6 digits)' }
      : { emoji: '🔁', title: 'Confirm your PIN', subtitle: 'Enter the same PIN again' },
    'time-up': { emoji: '⏰', title: "Time's up!", subtitle: 'Ask a parent to unlock' },
  }[mode as 'setup' | 'time-up'] ?? { emoji: '🔒', title: 'Parents only', subtitle: 'Enter your PIN to continue' };

  return (
    <View className='flex-1 bg-white items-center justify-center px-8'>
      <Text className='text-6xl mb-4'>{copy.emoji}</Text>
      <Text className='text-4xl font-bold text-gray-900 text-center mb-2'>{copy.title}</Text>
      <Text className='text-xl text-gray-600 text-center mb-8'>{copy.subtitle}</Text>
      {/* Remount between setup steps so the pad clears. */}
      <PinPad key={firstPin === null ? 'first' : 'confirm'} onSubmit={handleSubmit} />
    </View>
  );
}
