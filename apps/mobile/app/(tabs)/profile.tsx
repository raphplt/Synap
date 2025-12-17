import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View className="flex-1 items-center justify-center p-6">
        <View className="h-24 w-24 rounded-full bg-dusk border-2 border-neon items-center justify-center mb-6 overflow-hidden">
             <Image source={{ uri: "https://github.com/github.png" }} style={{ width: 96, height: 96 }} />
        </View>
        <Text className="text-white text-2xl font-bold mb-1">Cerveau Curieux</Text>
        <Text className="text-sand/60 mb-8">Niveau 1 · Novice</Text>
        
        <View className="w-full bg-dusk/50 p-4 rounded-xl border border-white/10">
            <Text className="text-sand font-semibold mb-2">Statistiques</Text>
            <Text className="text-sand/80">Cartes vues : 0</Text>
            <Text className="text-sand/80">Série actuelle : 0 jours</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
