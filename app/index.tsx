import { Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, interpolateColor } from 'react-native-reanimated';
import { useAudioPlayer } from 'expo-audio';

export default function IndexPage() {
  const router = useRouter();
  const [answer, setAnswer] = useState('');
  const { shake, setColor, style } = useInputAnimation();
  const wrongPlayer = useAudioPlayer(require('@/assets/sounds/wrong.mp3'));
  const correctPlayer = useAudioPlayer(require('@/assets/sounds/correct.mp3'));

  const handleChangeText = (text: string) => {
    setAnswer(text);
    setColor(0);
  };

  const mathQuestion = useMemo(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;

    return {
      question: `${num1} + ${num2}`,
      correctAnswer: correctAnswer.toString()
    };
  }, []);

  const handleSubmit = async () => {
    if (answer.trim() === mathQuestion.correctAnswer) {
      router.push('/select-duration');
      await correctPlayer.seekTo(0);
      correctPlayer.play();
    } else {
      shake();
      await wrongPlayer.seekTo(0);
      wrongPlayer.play();
      setColor(1);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className='bg-white px-8 flex-1 items-center pt-[calc(100vh/6)]'>
        <Text className='text-4xl font-bold text-gray-900 text-center mb-4'>
          Parental Verification
        </Text>
        <Text className='text-xl text-gray-600 text-center mb-2'>
          Please solve this simple math problem to access the app
        </Text>
        <Text className='text-3xl text-gray-700 text-center mb-4'>
          {mathQuestion.question} = ?
        </Text>
        <Animated.View style={style}>
          <TextInput
            value={answer}
            onChangeText={handleChangeText}
            onSubmitEditing={handleSubmit}
            keyboardType='number-pad'
            autoFocus
            className='w-24 h-16 text-3xl'
          />
        </Animated.View>
      </View>
    </>
  );
}

function useInputAnimation() {
  const shakeValue = useSharedValue(0);
  const colorValue = useSharedValue(0);

  const shake = () => {
    shakeValue.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };

  const setColor = (value: number) => {
    colorValue.value = value;
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  const colorStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(colorValue.value, [0, 1], ['rgb(209, 213, 219)', 'rgb(239, 68, 68)']),
    borderWidth: 2,
    borderRadius: 8
  }));

  const style = [
    shakeStyle,
    colorStyle,
    {
      paddingVertical: 4,
    }
  ];

  return { shake, setColor, style };
}