import { View, Text } from 'react-native';
import { RegisterDto } from '@memex/shared';

export default function Home() {
  const testDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password',
      username: 'user'
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-black">MEMEX Mobile</Text>
      <Text className="text-gray-500 mt-2">Shared DTO Test: {testDto.email}</Text>
    </View>
  );
}
