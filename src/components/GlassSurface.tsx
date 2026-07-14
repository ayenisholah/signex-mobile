import { useEffect, useState, type PropsWithChildren } from "react";
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";

interface GlassSurfaceProps extends PropsWithChildren {
  readonly fallbackColor: string;
  readonly interactive?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly tintColor?: string;
}

export function GlassSurface({
  children,
  fallbackColor,
  interactive = false,
  style,
  tintColor,
}: GlassSurfaceProps) {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "ios") {
      return undefined;
    }
    void AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparency,
    );
    return () => subscription.remove();
  }, []);

  const supportsGlass =
    Platform.OS === "ios" && isGlassEffectAPIAvailable() && !reduceTransparency;

  if (supportsGlass) {
    return (
      <GlassView
        colorScheme="auto"
        glassEffectStyle="regular"
        isInteractive={interactive}
        style={style}
        tintColor={tintColor}
      >
        {children}
      </GlassView>
    );
  }

  return <View style={[style, styles.fallback, { backgroundColor: fallbackColor }]}>{children}</View>;
}

const styles = StyleSheet.create({
  fallback: {
    borderCurve: "continuous",
  },
});
