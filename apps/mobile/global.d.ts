import type { ReactNode } from 'react';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }

  interface ImagePropsBase {
    className?: string;
  }

  interface ScrollViewProps {
    contentContainerClassName?: string;
  }
}

declare module 'react-native-gesture-handler' {
  interface GestureHandlerRootViewProps {
    children?: ReactNode;
  }
}

declare module 'react-native-gesture-handler/lib/typescript/components/GestureHandlerRootView' {
  interface GestureHandlerRootViewProps {
    children?: ReactNode;
  }
}

declare module 'expo-linear-gradient' {
  import type { ComponentType } from 'react';
  import type { LinearGradientProps } from 'expo-linear-gradient/build/LinearGradient';
  export { LinearGradientProps } from 'expo-linear-gradient/build/LinearGradient';
  export const LinearGradient: ComponentType<LinearGradientProps>;
}
