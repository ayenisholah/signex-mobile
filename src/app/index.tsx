import { useEffect, useMemo, useState, type PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AccessRequest, LinkedIdentity, Session } from "@ayenisholah/signex-api-client";

import { useAuth } from "@/auth/AuthContext";
import { GlassSurface } from "@/components/GlassSurface";
import { ProviderButton } from "@/components/ProviderButton";
import { themes, type Theme } from "@/theme/tokens";

function Shell({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const theme = scheme === "light" ? themes.light : themes.dark;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View accessible accessibilityRole="header" style={styles.brandRow}>
          <View style={[styles.mark, { backgroundColor: theme.accent }]} />
          <Text maxFontSizeMultiplier={2} style={[styles.brand, { color: theme.textPrimary }]}>Signex</Text>
          <Text maxFontSizeMultiplier={2} style={[styles.environment, { color: theme.signal }]}>PAPER</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ children }: PropsWithChildren) {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  return (
    <GlassSurface fallbackColor={theme.surfaceElevated} style={[styles.card, { borderColor: theme.border }]}>
      {children}
    </GlassSurface>
  );
}

function Button({
  label,
  onPress,
  destructive = false,
  disabled = false,
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly destructive?: boolean;
  readonly disabled?: boolean;
}) {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: destructive ? theme.critical : theme.accent, opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text maxFontSizeMultiplier={2} style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function Heading({ title, body }: { readonly title: string; readonly body: string }) {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  return (
    <View style={styles.headingBlock}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text maxFontSizeMultiplier={2} style={[styles.body, { color: theme.textSecondary }]}>{body}</Text>
    </View>
  );
}

function SignIn() {
  const { signIn } = useAuth();
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  return (
    <>
      <Heading title="Your control plane, securely yours" body="Use Apple or Google to sign in. Signex never creates a password account and never merges identities by email." />
      <Card>
        {Platform.OS === "ios" ? (
          <View style={styles.providerStack}>
            <ProviderButton provider="APPLE" onPress={() => void signIn("APPLE")} />
            <ProviderButton provider="GOOGLE" onPress={() => void signIn("GOOGLE")} />
          </View>
        ) : (
          <Text maxFontSizeMultiplier={2} style={[styles.caption, { color: theme.textSecondary }]}>This authentication slice is available on iOS only.</Text>
        )}
        <Text maxFontSizeMultiplier={2} style={[styles.caption, { color: theme.textSecondary }]}>New accounts get full access right away.</Text>
      </Card>
    </>
  );
}

function Pending() {
  const { state, bootstrap, logout, deleteAccount } = useAuth();
  const [token, setToken] = useState("");
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  if (state.kind !== "PENDING_APPROVAL" && state.kind !== "BOOTSTRAP_REQUIRED") return null;
  return (
    <>
      <Heading title="Access request received" body="Your provider identity is verified, but private Signex data remains locked until an Owner approves this account." />
      <Card>
        <Text maxFontSizeMultiplier={2} style={[styles.label, { color: theme.textPrimary }]}>Setting up the first Owner?</Text>
        <TextInput
          accessibilityLabel="Deployment bootstrap token"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setToken}
          placeholder="One-use deployment token"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
          value={token}
        />
        <Button disabled={token.length < 32} label="Bootstrap first Owner" onPress={() => void bootstrap(token)} />
      </Card>
      <Button label="Sign out" onPress={() => void logout()} />
      <Button destructive label="Delete request and account" onPress={() => void deleteAccount()} />
    </>
  );
}

function MfaChallenge() {
  const { verifyMfa } = useAuth();
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState(false);
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  return (
    <>
      <Heading title="Verify it’s you" body={recovery ? "Enter one unused recovery code." : "Enter the current six-digit code from your authenticator."} />
      <Card>
        <TextInput
          accessibilityLabel={recovery ? "Recovery code" : "Authenticator code"}
          autoComplete="one-time-code"
          keyboardType={recovery ? "default" : "number-pad"}
          maxLength={recovery ? 64 : 6}
          onChangeText={setCode}
          style={[styles.input, styles.codeInput, { borderColor: theme.border, color: theme.textPrimary }]}
          value={code}
        />
        <Button disabled={code.length < 6} label="Verify" onPress={() => void verifyMfa(code, recovery)} />
        <Pressable accessibilityRole="button" onPress={() => { setCode(""); setRecovery(!recovery); }} style={styles.textButton}>
          <Text maxFontSizeMultiplier={2} style={{ color: theme.accent }}>{recovery ? "Use authenticator code" : "Use a recovery code"}</Text>
        </Pressable>
      </Card>
    </>
  );
}

function MfaEnrollment() {
  const { beginMfaEnrollment, confirmMfaEnrollment, acknowledgeRecoveryCodes } = useAuth();
  const [secret, setSecret] = useState<string>();
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<readonly string[]>();
  const [error, setError] = useState<string>();
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;

  useEffect(() => {
    let active = true;
    void beginMfaEnrollment().then((value) => { if (active) setSecret(value.secret); }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Enrollment failed.");
    });
    return () => { active = false; };
  }, [beginMfaEnrollment]);

  const confirm = async () => {
    try { setCodes(await confirmMfaEnrollment(code)); } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That code was not accepted.");
    }
  };

  return (
    <>
      <Heading title="Protect privileged access" body="Owner, Trader, and Approver access requires Signex TOTP in addition to your social identity." />
      <Card>
        {error === undefined ? null : <Text accessibilityRole="alert" style={{ color: theme.critical }}>{error}</Text>}
        {codes === undefined ? (
          <>
            <Text selectable maxFontSizeMultiplier={2} style={[styles.secret, { color: theme.textPrimary }]}>{secret ?? "Preparing authenticator secret…"}</Text>
            <TextInput accessibilityLabel="Authenticator code" keyboardType="number-pad" maxLength={6} onChangeText={setCode} style={[styles.input, styles.codeInput, { borderColor: theme.border, color: theme.textPrimary }]} value={code} />
            <Button disabled={code.length !== 6 || secret === undefined} label="Confirm authenticator" onPress={() => void confirm()} />
          </>
        ) : (
          <>
            <Text maxFontSizeMultiplier={2} style={[styles.label, { color: theme.textPrimary }]}>Save these one-use recovery codes now</Text>
            <Text selectable maxFontSizeMultiplier={2} style={[styles.recoveryCodes, { color: theme.textPrimary }]}>{codes.join("\n")}</Text>
            <Button label="I saved every code" onPress={() => void acknowledgeRecoveryCodes(codes)} />
          </>
        )}
      </Card>
    </>
  );
}

function SecurityCenter() {
  const { state, controller, logout, deleteAccount } = useAuth();
  const [sessions, setSessions] = useState<readonly Session[]>([]);
  const [identities, setIdentities] = useState<readonly LinkedIdentity[]>([]);
  const [requests, setRequests] = useState<readonly AccessRequest[]>([]);
  const [linkTotp, setLinkTotp] = useState("");
  const [error, setError] = useState<string>();
  const theme: Theme = useColorScheme() === "light" ? themes.light : themes.dark;
  const user = state.kind === "AUTHENTICATED" ? state.user : null;
  const owner = user?.roles.includes("OWNER") ?? false;

  const refresh = useMemo(() => async () => {
    const [nextSessions, nextIdentities] = await Promise.all([
      controller.client.listSessions(),
      controller.client.listIdentities(),
    ]);
    setSessions(nextSessions);
    setIdentities(nextIdentities);
    if (owner) setRequests(await controller.client.listAccessRequests());
  }, [controller, owner]);

  useEffect(() => {
    queueMicrotask(() => void refresh().catch(() => undefined));
  }, [refresh]);
  if (user === null) return null;

  const run = async (action: () => Promise<unknown>) => {
    try {
      setError(undefined);
      await action();
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The security action failed.");
    }
  };

  return (
    <>
      <Heading title={`Welcome${user.display_name === null ? "" : `, ${user.display_name}`}`} body="Authentication is active. Access tokens stay in memory; only the rotating refresh credential is stored in the device keychain." />
      <Card>
        <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={[styles.sectionTitle, { color: theme.textPrimary }]}>Linked providers</Text>
        {error === undefined ? null : <Text accessibilityRole="alert" style={{ color: theme.critical }}>{error}</Text>}
        {identities.map((identity) => (
          <View key={identity.provider} style={styles.row}>
            <Text maxFontSizeMultiplier={2} style={{ color: theme.textPrimary }}>{identity.provider === "APPLE" ? "Apple" : "Google"}</Text>
            <Text maxFontSizeMultiplier={2} style={{ color: theme.textSecondary }}>{identity.profile_email ?? "Private profile"}</Text>
            {identities.length < 2 ? null : <Button label="Unlink" onPress={() => void run(() => controller.client.unlinkIdentity(identity.provider))} />}
          </View>
        ))}
        {!user.roles.some((role) => role === "OWNER" || role === "TRADER" || role === "APPROVER") ? null : (
          <TextInput
            accessibilityLabel="Authenticator code for provider linking"
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={setLinkTotp}
            placeholder="TOTP required to link"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
            value={linkTotp}
          />
        )}
        {(["APPLE", "GOOGLE"] as const).filter((provider) => !identities.some((identity) => identity.provider === provider)).map((provider) => (
          <Button
            key={provider}
            disabled={user.roles.some((role) => role === "OWNER" || role === "TRADER" || role === "APPROVER") && linkTotp.length !== 6}
            label={`Link ${provider === "APPLE" ? "Apple" : "Google"}`}
            onPress={() => void run(() => controller.linkIdentity(provider, linkTotp || undefined))}
          />
        ))}
      </Card>
      <Card>
        <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={[styles.sectionTitle, { color: theme.textPrimary }]}>Devices and sessions</Text>
        {sessions.map((session) => (
          <View key={session.id} style={styles.row}>
            <View>
              <Text maxFontSizeMultiplier={2} style={{ color: theme.textPrimary }}>{session.device_name}</Text>
              <Text maxFontSizeMultiplier={2} style={{ color: theme.textSecondary }}>{session.current ? "This device" : `Last used ${session.last_seen_at}`}</Text>
            </View>
            {session.current ? null : <Button label="Revoke" onPress={() => void run(() => controller.client.revokeSession(session.id))} />}
          </View>
        ))}
      </Card>
      {!owner ? null : (
        <Card>
          <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={[styles.sectionTitle, { color: theme.textPrimary }]}>Pending access</Text>
          {requests.length === 0 ? <Text style={{ color: theme.textSecondary }}>No pending requests.</Text> : requests.map((request) => (
            <View key={request.user_id} style={styles.row}>
              <Text maxFontSizeMultiplier={2} style={{ color: theme.textPrimary }}>{request.display_name ?? request.email ?? request.provider}</Text>
              <Button label="Approve Viewer" onPress={() => void run(() => controller.client.approveAccessRequest(request.user_id))} />
            </View>
          ))}
        </Card>
      )}
      <Button label="Sign out" onPress={() => void logout()} />
      <Button destructive label="Delete account" onPress={() => Alert.alert(
        "Delete Signex account?",
        "This revokes sessions and provider credentials and erases profile data. The final Owner must transfer ownership first.",
        [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => void deleteAccount() }],
      )} />
    </>
  );
}

export default function Index() {
  const { state, retry } = useAuth();
  return (
    <Shell>
      {state.kind === "RESTORING" || state.kind === "AUTHORIZING" ? <ActivityIndicator accessibilityLabel="Authenticating" size="large" /> : null}
      {state.kind === "SIGNED_OUT" ? <SignIn /> : null}
      {state.kind === "PENDING_APPROVAL" || state.kind === "BOOTSTRAP_REQUIRED" ? <Pending /> : null}
      {state.kind === "MFA_REQUIRED" ? <MfaChallenge /> : null}
      {state.kind === "MFA_ENROLLMENT_REQUIRED" ? <MfaEnrollment /> : null}
      {state.kind === "AUTHENTICATED" ? <SecurityCenter /> : null}
      {state.kind === "OFFLINE_LOCKED" || state.kind === "ERROR" ? (
        <>
          <Heading title="Signex is locked" body={state.message} />
          <Button label="Try again" onPress={() => void retry()} />
        </>
      ) : null}
    </Shell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1, gap: 20, paddingHorizontal: 20, paddingBottom: 40 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 10, paddingTop: 14 },
  mark: { borderRadius: 5, height: 20, transform: [{ skewX: "-12deg" }], width: 8 },
  brand: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  environment: { fontSize: 12, fontWeight: "800", marginLeft: "auto" },
  headingBlock: { gap: 10, marginTop: 26 },
  title: { fontSize: 34, fontWeight: "800", letterSpacing: -1.1, lineHeight: 40 },
  body: { fontSize: 17, lineHeight: 25 },
  card: { borderRadius: 24, borderWidth: 1, gap: 16, overflow: "hidden", padding: 20 },
  providerStack: { alignItems: "center", gap: 12 },
  caption: { fontSize: 14, lineHeight: 21, textAlign: "center" },
  button: { alignItems: "center", borderRadius: 14, justifyContent: "center", minHeight: 52, minWidth: 96, paddingHorizontal: 18, paddingVertical: 12 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", textAlign: "center" },
  textButton: { alignItems: "center", justifyContent: "center", minHeight: 48 },
  input: { borderRadius: 14, borderWidth: 1, fontSize: 17, minHeight: 52, paddingHorizontal: 16 },
  codeInput: { fontSize: 26, fontVariant: ["tabular-nums"], letterSpacing: 6, textAlign: "center" },
  label: { fontSize: 17, fontWeight: "700" },
  secret: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), fontSize: 16, lineHeight: 24 },
  recoveryCodes: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), fontSize: 18, lineHeight: 28 },
  sectionTitle: { fontSize: 20, fontWeight: "800" },
  row: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between", minHeight: 52 },
});
