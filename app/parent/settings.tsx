import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import FocusButton from '@/components/focus-button';
import PinPad from '@/components/pin-pad';
import { useDbQuery } from '@/hooks/use-db-query';
import { syncCatalog, type SyncResult } from '@/lib/catalog';
import { getSetting } from '@/lib/settings';
import { setPin } from '@/helpers/pin';
import { formatRelativeTime } from '@/helpers/video';

export default function SettingsPage() {
  const sync = useDbQuery(
    () => ({
      version: getSetting('catalogVersion'),
      lastSyncAt: getSetting('lastSyncAt'),
      lastSyncError: getSetting('lastSyncError'),
    }),
    ['settings'],
    [],
  );
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [changingPin, setChangingPin] = useState(false);
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  const syncNow = async () => {
    setSyncing(true);
    setResult(await syncCatalog());
    setSyncing(false);
  };

  const lastSync = sync.lastSyncAt ? formatRelativeTime(Date.parse(sync.lastSyncAt) / 1000) : 'never';

  return (
    <ScrollView className='flex-1 bg-white' contentContainerClassName='p-6 gap-6 md:flex-row md:items-start'>
      <View className='flex-1 bg-gray-50 rounded-3xl p-6 gap-2'>
        <Text className='text-2xl font-bold text-gray-900 mb-2'>Video catalog</Text>
        <Text className='text-base text-gray-600'>
          New videos are published daily and downloaded automatically when the app opens.
        </Text>
        <Text className='text-base text-gray-900'>Last checked: {lastSync}</Text>
        <Text className='text-sm text-gray-500'>Version: {sync.version?.slice(0, 12) ?? '—'}</Text>
        {sync.lastSyncError && <Text className='text-base text-red-600'>Last error: {sync.lastSyncError}</Text>}
        {result?.status === 'updated' && (
          <Text className='text-base text-green-700'>Updated: {result.channels} channels, {result.videos} videos</Text>
        )}
        {result?.status === 'up-to-date' && <Text className='text-base text-green-700'>Already up to date</Text>}

        <FocusButton hasTVPreferredFocus disabled={syncing} onPress={syncNow} className='mt-3 py-3 rounded-xl items-center bg-gray-900' focusClassName='bg-blue-600'>
          <Text className='text-white text-lg font-bold'>{syncing ? 'Checking…' : 'Check for new videos'}</Text>
        </FocusButton>
      </View>

      <View className='flex-1 bg-gray-50 rounded-3xl p-6 items-center'>
        <Text className='text-2xl font-bold text-gray-900 mb-2 self-start'>Parent PIN</Text>
        {changingPin ? (
          <>
            <Text className='text-base text-gray-600 mb-4'>Enter a new PIN</Text>
            <PinPad
              onSubmit={async (pin) => {
                await setPin(pin);
                setChangingPin(false);
                setPinMessage('PIN changed');
                return null;
              }}
            />
          </>
        ) : (
          <>
            {pinMessage && <Text className='text-base text-green-700 mb-3'>{pinMessage}</Text>}
            <FocusButton onPress={() => { setPinMessage(null); setChangingPin(true); }} className='self-stretch py-3 rounded-xl items-center border-2 border-gray-300' focusClassName='bg-blue-600 border-blue-600'>
              {({ focused }) => <Text className={focused ? 'text-white text-lg font-bold' : 'text-gray-900 text-lg font-bold'}>Change PIN</Text>}
            </FocusButton>
            <Text className='text-sm text-gray-500 mt-4'>
              Forgot the PIN? Clear the app's storage in Android Settings → Apps → YouStrict.
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}
