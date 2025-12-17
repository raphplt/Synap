import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuizScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View className="flex-1 items-center justify-center">
        <Text className="text-sand text-xl font-bold">Quiz</Text>
        <Text className="text-sand/60 mt-2">Bientôt disponible</Text>
      </View>
    </SafeAreaView>
  );
}
