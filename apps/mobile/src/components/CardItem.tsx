import { CardBase } from '@memex/shared';
import { LinearGradient, LinearGradientProps } from 'expo-linear-gradient';
import React, { useCallback, useMemo } from 'react';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import clsx from 'clsx';

const { height: screenHeight } = Dimensions.get('window');

type CardItemProps = {
  card: CardBase;
};

export function CardItem({ card }: CardItemProps) {
  const Gradient = LinearGradient as unknown as React.ComponentType<LinearGradientProps>;
  const rotation = useSharedValue(0);

  const toggle = useCallback(() => {
    rotation.value = withSpring(rotation.value === 0 ? 180 : 0, {
      damping: 12,
      stiffness: 140
    });
  }, [rotation]);

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }],
    backfaceVisibility: 'hidden'
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${rotation.value + 180}deg` }],
    backfaceVisibility: 'hidden'
  }));

  const displayedContent = useMemo(() => card.content ?? card.summary, [card.content, card.summary]);

  return (
    <View style={{ height: screenHeight }} className="bg-ink">
      <Animated.View style={[frontAnimatedStyle, { position: 'absolute', inset: 0 }]}>
        <Pressable style={{ flex: 1 }} onPress={toggle}>
          <ImageBackground
            source={{ uri: card.mediaUrl }}
            resizeMode="cover"
            style={{ flex: 1 }}
          >
            <Gradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
              locations={[0.35, 1]}
              style={{ flex: 1, padding: 24, justifyContent: 'flex-end' }}
            >
              <View className="flex-row items-center mb-4">
                <View className="h-2 w-12 rounded-full bg-amber mr-3" />
                <Text className="text-sand/80 text-xs uppercase tracking-widest">Grow your brain</Text>
              </View>
              <Text className="text-white text-3xl font-semibold mb-3">{card.title}</Text>
              <Text className="text-sand/90 text-base leading-6">{card.summary}</Text>
              <View className="mt-6 flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-neon mr-2" />
                <Text className="text-xs text-sand/80">Tap pour retourner · Carte MEMEX</Text>
              </View>
            </Gradient>
          </ImageBackground>
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[backAnimatedStyle, { position: 'absolute', inset: 0 }]}
      >
        <Pressable style={{ flex: 1 }} onPress={toggle}>
          <Gradient
            colors={['#0f172a', '#1e293b']}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
              <View className="mb-4">
                <Text className="text-neon text-xs uppercase tracking-widest mb-2">Face B</Text>
                <Text className="text-white text-2xl font-semibold">{card.title}</Text>
              </View>
              <Text className="text-sand text-base leading-7 mb-6">{displayedContent}</Text>
              <View className={clsx('rounded-xl border border-neon/30 p-4 bg-dusk/60')}>
                <Text className="text-neon font-semibold mb-1">Source</Text>
                <Text className="text-sand text-sm">{card.sourceLink}</Text>
                {card.sourceAttribution != null && (
                  <Text className="text-sand/70 text-xs mt-1">{card.sourceAttribution}</Text>
                )}
              </View>
            </ScrollView>
          </Gradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}
