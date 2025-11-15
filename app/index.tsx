import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function IndexPage() {
  return (
    <View className='h-screen'>
      <Text className='text-2xl'>Welcome to the Index Page</Text>
      <Link href='/videos/xCq8WVLfaEk'>Go to Video Page</Link>
    </View>
  )
}