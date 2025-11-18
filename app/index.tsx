import { Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

export default function IndexPage() {
  const router = useRouter();
  const [answer, setAnswer] = useState('');

  // Generate a random math question
  const mathQuestion = useMemo(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;
    
    return {
      question: `${num1} + ${num2}`,
      correctAnswer: correctAnswer.toString()
    };
  }, []);

  const handleSubmit = () => {
    if (answer.trim() === mathQuestion.correctAnswer) {
      router.navigate('/videos');
    } else {
      setAnswer('');
    }
  };

  return (
    <View className='flex-1 bg-white justify-center items-center'>
      <Stack.Screen options={{ headerShown: false }} />
      <View className='bg-white'>
        <Text className='text-4xl font-bold text-gray-900 text-center mb-4'>
          Parent Verification
        </Text>
        <Text className='text-3xl text-gray-700 text-center mb-4'>
          What is {mathQuestion.question}?
        </Text>
        <TextInput
          value={answer}
          onChangeText={setAnswer}
          onSubmitEditing={handleSubmit}
          keyboardType='number-pad'
          autoFocus
          placeholder='Enter answer'
          className='bg-white text-3xl py-6 px-8 rounded-2xl border-2 border-gray-300'
        />
      </View>
    </View>
  );
}
