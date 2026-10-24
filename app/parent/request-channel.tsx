import { useState } from 'react';
import { Platform, ScrollView, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { HANDLE_PATTERN } from '@/catalog/schema';

const REPO_URL = 'https://github.com/fachrihawari/YouStrict';

// The TV can't run yt-dlp, so new channels go through GitHub: the QR opens a
// prefilled "add-channel" issue; .github/workflows/add-channel.yml does the rest.
function requestUrl(handle: string) {
  const title = encodeURIComponent(`Add channel @${handle}`);
  return `${REPO_URL}/issues/new?template=add-channel.yml&title=${title}&handle=${encodeURIComponent(handle)}`;
}

export default function RequestChannelPage() {
  const [input, setInput] = useState('');
  const handle = input.trim().replace(/^.*youtube\.com\//, '').replace(/^@/, '').replace(/\/.*$/, '');
  const valid = HANDLE_PATTERN.test(handle);

  return (
    <ScrollView className='flex-1 bg-white' contentContainerClassName='p-6 gap-6 md:flex-row md:items-start'>
      <View className='flex-1 gap-3'>
        <Text className='text-xl font-bold text-gray-900'>1. Type the channel's handle</Text>
        <Text className='text-base text-gray-600'>
          It's the part after @ in the channel link, e.g. youtube.com/@NussaOfficialSeries
        </Text>
        <TextInput
          value={input}
          onChangeText={setInput}
          autoFocus={!Platform.isTV}
          autoCapitalize='none'
          autoCorrect={false}
          placeholder='@handle'
          className='border-2 border-gray-300 rounded-xl px-4 py-3 text-xl text-gray-900'
        />
        <Text className='text-xl font-bold text-gray-900 mt-4'>2. Scan the code with your phone</Text>
        <Text className='text-base text-gray-600'>
          Submit the GitHub issue that opens. The channel is checked and added automatically, usually within a few
          minutes. It then shows up turned off under Channels after the next sync.
        </Text>
      </View>

      <View className='items-center justify-center bg-gray-50 rounded-3xl p-6 min-h-72 md:w-96'>
        {valid ? (
          <>
            <QRCode value={requestUrl(handle)} size={240} />
            <Text className='text-sm text-gray-500 mt-4 text-center' selectable>{requestUrl(handle)}</Text>
          </>
        ) : (
          <Text className='text-base text-gray-400 text-center'>The QR code appears here once the handle looks right.</Text>
        )}
      </View>
    </ScrollView>
  );
}
