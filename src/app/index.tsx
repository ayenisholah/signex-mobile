import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { getBackendHealth, type BackendHealth } from "../api/health";
import { GlassSurface } from "../components/GlassSurface";
import { themes, type Theme } from "../theme/tokens";

type LoadState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly health: BackendHealth }
  | { readonly kind: "error"; readonly message: string };

const signalLines = [
  { left: -38, top: 188, width: 218, rotate: "12deg" },
  { left: 108, top: 262, width: 260, rotate: "-8deg" },
  { left: 228, top: 158, width: 210, rotate: "-14deg" },
  { left: -24, top: 552, width: 250, rotate: "-10deg" },
  { left: 196, top: 640, width: 272, rotate: "9deg" },
] as const;

export default function StatusScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "light" ? themes.light : themes.dark;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  const refresh = useCallback(async () => {
    try {
      setState({ kind: "ready", health: await getBackendHealth() });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Backend health is unavailable",
      });
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getBackendHealth().then(
      (health) => active && setState({ kind: "ready", health }),
      (error: unknown) =>
        active &&
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Backend health is unavailable",
        }),
    );
    return () => {
      active = false;
    };
  }, []);

  const markSource =
    colorScheme === "light"
      ? require("../../assets/brand/mark-light.png")
      : require("../../assets/brand/mark-dark.png");

  return (
    <SafeAreaView style={styles.safeArea}>
      <SignalField theme={theme} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.brandLockup}>
            <Image accessibilityIgnoresInvertColors source={markSource} style={styles.brandMark} />
            <Text accessibilityRole="header" style={styles.brand}>
              Signex
            </Text>
          </View>
          <GlassSurface fallbackColor={theme.surface} style={styles.environmentBadge}>
            <View style={styles.signalDot} />
            <Text style={styles.environmentText}>PAPER</Text>
          </GlassSurface>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>SIGNALS INTO EXECUTION</Text>
          <Text style={styles.title}>Controlled from the backend.</Text>
          <Text style={styles.description}>
            This M0 client checks system readiness only. Trading, credentials, and signing never
            run on this device.
          </Text>
        </View>

        <GlassSurface
          fallbackColor={theme.surfaceElevated}
          style={styles.statusCard}
          tintColor={theme.background}
        >
          <Text style={styles.cardLabel}>BACKEND STATUS</Text>
          {state.kind === "loading" ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator accessibilityLabel="Checking backend status" color={theme.signal} />
              <Text style={styles.detailText}>Checking paper environment</Text>
            </View>
          ) : null}
          {state.kind === "ready" ? (
            <>
              <View style={styles.statusRow}>
                <View style={styles.healthyIndicator} />
                <Text style={styles.readyText}>{state.health.status}</Text>
              </View>
              <Text style={styles.detailText}>
                {state.health.mode} · {state.health.stage}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.blockedText}>Trading entry remains blocked.</Text>
            </>
          ) : null}
          {state.kind === "error" ? (
            <>
              <View style={styles.statusRow}>
                <View style={styles.errorIndicator} />
                <Text style={styles.errorText}>OFFLINE</Text>
              </View>
              <Text style={styles.detailText}>{state.message}</Text>
              <View style={styles.divider} />
              <Text style={styles.blockedText}>No commands are available offline.</Text>
            </>
          ) : null}
        </GlassSurface>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setState({ kind: "loading" });
            void refresh();
          }}
          style={({ pressed }) => [styles.buttonPressable, pressed && styles.buttonPressed]}
        >
          <GlassSurface
            fallbackColor={theme.surfaceElevated}
            interactive
            style={styles.button}
            tintColor={theme.accent}
          >
            <Text style={styles.buttonText}>Check again</Text>
            <Text accessibilityElementsHidden style={styles.buttonArrow}>
              →
            </Text>
          </GlassSurface>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SignalField({ theme }: { readonly theme: Theme }) {
  return (
    <View accessibilityElementsHidden pointerEvents="none" style={StyleSheet.absoluteFill}>
      {signalLines.map((line, index) => (
        <View
          key={`${line.top}-${line.left}`}
          style={[
            stylesBase.fieldLine,
            {
              backgroundColor: theme.field,
              left: line.left,
              top: line.top,
              transform: [{ rotate: line.rotate }],
              width: line.width,
            },
          ]}
        >
          <View
            style={[
              stylesBase.fieldNode,
              { backgroundColor: index % 2 === 0 ? theme.signal : theme.velocity },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const stylesBase = StyleSheet.create({
  fieldLine: { height: 1, opacity: 0.58, position: "absolute" },
  fieldNode: { borderRadius: 999, height: 5, position: "absolute", right: 0, top: -2, width: 5 },
});

function createStyles(theme: Theme) {
  return StyleSheet.create({
    safeArea: { backgroundColor: theme.background, flex: 1 },
    container: { flexGrow: 1, gap: 30, paddingHorizontal: 24, paddingVertical: 24 },
    header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
    brandLockup: { alignItems: "center", flexDirection: "row", gap: 10 },
    brandMark: { height: 36, width: 36 },
    brand: { color: theme.textPrimary, fontSize: 24, fontWeight: "700", letterSpacing: -0.7 },
    environmentBadge: {
      alignItems: "center",
      borderColor: theme.border,
      borderCurve: "continuous",
      borderRadius: 999,
      borderWidth: 1,
      flexDirection: "row",
      gap: 7,
      overflow: "hidden",
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    signalDot: { backgroundColor: theme.signal, borderRadius: 999, height: 6, width: 6 },
    environmentText: { color: theme.textPrimary, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
    hero: { gap: 12, paddingTop: 18 },
    eyebrow: { color: theme.signal, fontSize: 12, fontWeight: "800", letterSpacing: 1.8 },
    title: { color: theme.textPrimary, fontSize: 40, fontWeight: "800", letterSpacing: -1.5, lineHeight: 45 },
    description: { color: theme.textSecondary, fontSize: 16, lineHeight: 24 },
    statusCard: {
      borderColor: theme.border,
      borderCurve: "continuous",
      borderRadius: 24,
      borderWidth: 1,
      gap: 12,
      minHeight: 192,
      overflow: "hidden",
      padding: 22,
    },
    cardLabel: { color: theme.textSecondary, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
    loadingRow: { alignItems: "center", flexDirection: "row", gap: 12, paddingTop: 20 },
    statusRow: { alignItems: "center", flexDirection: "row", gap: 10 },
    healthyIndicator: { backgroundColor: theme.signal, borderRadius: 999, height: 10, width: 10 },
    errorIndicator: { backgroundColor: theme.critical, borderRadius: 999, height: 10, width: 10 },
    readyText: { color: theme.signal, fontSize: 30, fontWeight: "700" },
    errorText: { color: theme.critical, fontSize: 28, fontWeight: "800" },
    detailText: { color: theme.textPrimary, fontSize: 15, lineHeight: 22 },
    divider: { backgroundColor: theme.border, height: 1, marginVertical: 2 },
    blockedText: { color: theme.warning, fontSize: 14, fontWeight: "700" },
    buttonPressable: { borderCurve: "continuous", borderRadius: 18 },
    buttonPressed: { transform: [{ scale: 0.985 }] },
    button: {
      alignItems: "center",
      borderColor: theme.border,
      borderCurve: "continuous",
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "center",
      minHeight: 56,
      overflow: "hidden",
      paddingHorizontal: 22,
    },
    buttonText: { color: theme.textPrimary, fontSize: 16, fontWeight: "800" },
    buttonArrow: { color: theme.accent, fontSize: 22, marginLeft: 10 },
  });
}
