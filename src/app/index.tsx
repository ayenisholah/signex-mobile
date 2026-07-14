import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getBackendHealth, type BackendHealth } from "../api/health";

type LoadState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly health: BackendHealth }
  | { readonly kind: "error"; readonly message: string };

export default function StatusScreen() {
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
      (health) => {
        if (active) {
          setState({ kind: "ready", health });
        }
      },
      (error: unknown) => {
        if (active) {
          setState({
            kind: "error",
            message: error instanceof Error ? error.message : "Backend health is unavailable",
          });
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.brand}>
            Signex
          </Text>
          <View style={styles.environmentBadge}>
            <Text style={styles.environmentText}>PAPER</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>SIGNALS INTO EXECUTION</Text>
          <Text style={styles.title}>Controlled from the backend.</Text>
          <Text style={styles.description}>
            This M0 client checks system readiness only. Trading, credentials, and
            signing never run on this device.
          </Text>
        </View>

        <View accessibilityLiveRegion="polite" style={styles.statusCard}>
          <Text style={styles.cardLabel}>BACKEND STATUS</Text>
          {state.kind === "loading" ? (
            <ActivityIndicator accessibilityLabel="Checking backend status" color="#56E0C5" />
          ) : null}
          {state.kind === "ready" ? (
            <>
              <Text style={styles.readyText}>{state.health.status}</Text>
              <Text style={styles.detailText}>
                {state.health.mode} · {state.health.stage}
              </Text>
              <Text style={styles.blockedText}>Trading entry remains blocked.</Text>
            </>
          ) : null}
          {state.kind === "error" ? (
            <>
              <Text style={styles.errorText}>OFFLINE</Text>
              <Text style={styles.detailText}>{state.message}</Text>
              <Text style={styles.blockedText}>No commands are available offline.</Text>
            </>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setState({ kind: "loading" });
            void refresh();
          }}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Check again</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#07111F", flex: 1 },
  container: { flex: 1, gap: 32, paddingHorizontal: 24, paddingVertical: 28 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  brand: { color: "#F4F8FF", fontSize: 24, fontWeight: "800", letterSpacing: -0.6 },
  environmentBadge: {
    backgroundColor: "#12352F",
    borderColor: "#2A8A78",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  environmentText: { color: "#7CF0D7", fontSize: 12, fontWeight: "800", letterSpacing: 1.1 },
  hero: { gap: 12, paddingTop: 28 },
  eyebrow: { color: "#56E0C5", fontSize: 12, fontWeight: "800", letterSpacing: 1.8 },
  title: { color: "#F4F8FF", fontSize: 42, fontWeight: "800", letterSpacing: -1.6, lineHeight: 47 },
  description: { color: "#9FB0C6", fontSize: 17, lineHeight: 25 },
  statusCard: {
    backgroundColor: "#0D1B2D",
    borderColor: "#1D314A",
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    minHeight: 176,
    padding: 22,
  },
  cardLabel: { color: "#71859E", fontSize: 12, fontWeight: "700", letterSpacing: 1.4 },
  readyText: { color: "#7CF0D7", fontSize: 28, fontWeight: "800" },
  errorText: { color: "#FF8F8F", fontSize: 28, fontWeight: "800" },
  detailText: { color: "#D8E2EF", fontSize: 16, lineHeight: 23 },
  blockedText: { color: "#F5B85D", fontSize: 14, fontWeight: "700" },
  button: {
    alignItems: "center",
    backgroundColor: "#56E0C5",
    borderRadius: 14,
    minHeight: 52,
    justifyContent: "center",
  },
  buttonPressed: { opacity: 0.75 },
  buttonText: { color: "#07111F", fontSize: 16, fontWeight: "800" },
});
