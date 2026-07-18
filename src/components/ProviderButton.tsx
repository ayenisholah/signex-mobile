import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";

import type { SocialProvider } from "@ayenisholah/signex-api-client";

const googleLogo = require("../../assets/brand/google-g.svg");

interface ProviderButtonProps {
  readonly provider: SocialProvider;
  readonly onPress: () => void;
  readonly disabled?: boolean;
}

interface ProviderVisual {
  readonly label: string;
  readonly background: string;
  readonly foreground: string;
  readonly border?: string;
}

// Apple and Google both mandate specific button colors. Apple's HIG flips the
// button polarity with the interface style; Google's brand guidelines have no
// sanctioned dark fill, so its button stays light with a neutral border.
function visualFor(provider: SocialProvider, dark: boolean): ProviderVisual {
  if (provider === "APPLE") {
    return dark
      ? { label: "Continue with Apple", background: "#FFFFFF", foreground: "#000000" }
      : { label: "Continue with Apple", background: "#000000", foreground: "#FFFFFF" };
  }
  return {
    label: "Continue with Google",
    background: "#FFFFFF",
    foreground: "#1F1F1F",
    border: "#747775",
  };
}

export function ProviderButton({ provider, onPress, disabled = false }: ProviderButtonProps) {
  const dark = useColorScheme() !== "light";
  const visual = visualFor(provider, dark);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={visual.label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: visual.background,
          borderColor: visual.border ?? visual.background,
          borderWidth: visual.border === undefined ? 0 : StyleSheet.hairlineWidth,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        {provider === "APPLE" ? (
          <SymbolView name="apple.logo" size={19} tintColor={visual.foreground} style={styles.logo} />
        ) : (
          <Image source={googleLogo} style={styles.logo} contentFit="contain" />
        )}
        <Text maxFontSizeMultiplier={1.6} style={[styles.label, { color: visual.foreground }]}>
          {visual.label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    width: "100%",
  },
  content: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "center" },
  logo: { height: 19, width: 19 },
  label: { fontSize: 17, fontWeight: "600" },
});
