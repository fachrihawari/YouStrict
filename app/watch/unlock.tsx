import { Text, View } from 'react-native';
import PinPad from '@/components/pin-pad';
import { useSession } from '@/contexts/session-context';
import { pinErrorMessage, verifyPin } from '@/helpers/pin';

// Parent interrupts a session early. A correct PIN ends the session and
// switches the app to parent mode (the whole watch stack unmounts).
export default function UnlockPage() {
  const { unlock } = useSession();

  return (
    <View className='flex-1 bg-white items-center justify-center px-8'>
      <Text className='text-4xl font-bold text-gray-900 mb-2'>🔒 Parents only</Text>
      <Text className='text-lg text-gray-600 mb-8'>Enter the PIN to stop watching</Text>
      <PinPad
        onSubmit={async (pin) => {
          const result = await verifyPin(pin);
          if (result.ok) {
            await unlock();
            return null;
          }
          return pinErrorMessage(result);
        }}
      />
    </View>
  );
}
