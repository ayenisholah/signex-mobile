import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { Image } from "expo-image";
import type {
  AccessRequest,
  LinkedIdentity,
  Opportunity,
  OpportunityFilter,
  OpportunitySort,
  Position,
  PositionLeg,
  RiskLimits,
  RouteType,
  Session,
} from "@ayenisholah/perpeto-api-client";

import { useAuth } from "@/auth/AuthContext";
import { GlassSurface } from "@/components/GlassSurface";
import { ProviderButton } from "@/components/ProviderButton";
import { themes, type Theme } from "@/theme/tokens";

const markDark = require("../../assets/brand/mark-dark.png");
const markLight = require("../../assets/brand/mark-light.png");

function Shell({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const theme = scheme === "light" ? themes.light : themes.dark;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View accessible accessibilityRole="header" style={styles.brandRow}>
          <Image
            accessibilityIgnoresInvertColors
            contentFit="contain"
            source={scheme === "light" ? markLight : markDark}
            style={styles.mark}
          />
          <Text maxFontSizeMultiplier={2} style={[styles.brand, { color: theme.textPrimary }]}>Perpeto</Text>
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
      <Heading title="Your control plane, securely yours" body="Use Apple or Google to sign in. Perpeto never creates a password account and never merges identities by email." />
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
      <Heading title="Access request received" body="Your provider identity is verified, but private Perpeto data remains locked until an Owner approves this account." />
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
      <Heading title="Protect privileged access" body="Owner, Trader, and Approver access requires Perpeto TOTP in addition to your social identity." />
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
        "Delete Perpeto account?",
        "This revokes sessions and provider credentials and erases profile data. The final Owner must transfer ownership first.",
        [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => void deleteAccount() }],
      )} />
    </>
  );
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function formatClock(iso: string): string {
  if (iso === "") return "—";
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface OpportunitiesState {
  readonly opportunities: readonly Opportunity[];
  readonly scannedAt: string;
  readonly loading: boolean;
  readonly error: string | undefined;
  readonly reload: () => void;
}

function useOpportunities(filter: OpportunityFilter): OpportunitiesState {
  const { controller } = useAuth();
  const [opportunities, setOpportunities] = useState<readonly Opportunity[]>([]);
  const [scannedAt, setScannedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const reload = useCallback(() => {
    setLoading(true);
    setError(undefined);
    void controller.client
      .listOpportunities(filter)
      .then((scan) => {
        setOpportunities(scan.opportunities);
        setScannedAt(scan.scanned_at);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load opportunities.");
      })
      .finally(() => setLoading(false));
  }, [controller, filter]);

  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);

  return { opportunities, scannedAt, loading, error, reload };
}

function useRiskLimits(): RiskLimits | undefined {
  const { controller } = useAuth();
  const [limits, setLimits] = useState<RiskLimits>();
  useEffect(() => {
    queueMicrotask(() => void controller.client.getRiskLimits().then(setLimits).catch(() => undefined));
  }, [controller]);
  return limits;
}

interface PositionsState {
  readonly positions: readonly Position[];
  readonly loading: boolean;
  readonly error: string | undefined;
  readonly reload: () => void;
}

function usePositions(): PositionsState {
  const { controller } = useAuth();
  const [positions, setPositions] = useState<readonly Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const reload = useCallback(() => {
    setLoading(true);
    setError(undefined);
    void controller.client
      .listPositions()
      .then((list) => setPositions(list.positions))
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Could not load positions.");
      })
      .finally(() => setLoading(false));
  }, [controller]);

  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);

  return { positions, loading, error, reload };
}

function useCanTrade(): boolean {
  const { state } = useAuth();
  if (state.kind !== "AUTHENTICATED") return false;
  return state.user.roles.some((role) => role === "OWNER" || role === "TRADER");
}

function Pill({ label, active, onPress }: { readonly label: string; readonly active: boolean; readonly onPress: () => void }) {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.pill, { borderColor: theme.border }, active ? { backgroundColor: theme.accent, borderColor: theme.accent } : null]}
    >
      <Text maxFontSizeMultiplier={2} style={[styles.pillText, { color: active ? "#04120C" : theme.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

function OpportunityRow({ opportunity, onPress }: { readonly opportunity: Opportunity; readonly onPress: () => void }) {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  const positive = opportunity.net_apr >= 0;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.oppRow, { borderColor: theme.border, opacity: pressed ? 0.6 : 1 }]}>
      <View style={styles.oppTop}>
        <View style={[styles.badge, { backgroundColor: theme.field }]}>
          <Text maxFontSizeMultiplier={2} style={[styles.badgeText, { color: theme.velocity }]}>
            {opportunity.route_type === "SPOT_PERP" ? "SPOT · PERP" : "PERP · PERP"}
          </Text>
        </View>
        <Text maxFontSizeMultiplier={2} style={[styles.oppApr, { color: positive ? theme.signal : theme.critical }]}>
          {formatPercent(opportunity.net_apr)}
        </Text>
      </View>
      <Text maxFontSizeMultiplier={2} style={[styles.oppRoute, { color: theme.textPrimary }]}>
        {opportunity.underlying} · long {opportunity.long_venue} → short {opportunity.short_venue}
      </Text>
      <View style={styles.oppMetrics}>
        <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Win {formatPercent(opportunity.profitability_probability)}</Text>
        <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Reserved {formatUsd(opportunity.reserved_capital)}</Text>
        <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Funds {formatClock(opportunity.next_funding_at)}</Text>
      </View>
    </Pressable>
  );
}

function DetailLine({ label, value }: { readonly label: string; readonly value: string }) {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  return (
    <View style={styles.detailLine}>
      <Text maxFontSizeMultiplier={2} style={[styles.detailLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text maxFontSizeMultiplier={2} style={[styles.detailValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

function OpportunityDetail({
  opportunity,
  onClose,
  onOpen,
  canOpen,
}: {
  readonly opportunity: Opportunity;
  readonly onClose: () => void;
  readonly onOpen: (opportunity: Opportunity) => Promise<void>;
  readonly canOpen: boolean;
}) {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string>();
  const leg = (label: string, l: Opportunity["long_leg"]) =>
    `${label} ${l.venue}: ${formatPercent(l.predicted_rate)} (p10 ${formatPercent(l.p10_rate)} · p90 ${formatPercent(l.p90_rate)})`;

  const open = async () => {
    setOpening(true);
    setError(undefined);
    try {
      await onOpen(opportunity);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not open the paper position.");
      setOpening(false);
    }
  };
  return (
    <Modal animationType="slide" transparent onRequestClose={onClose} visible>
      <View style={styles.modalBackdrop}>
        <SafeAreaView style={[styles.modalSheet, { backgroundColor: theme.surfaceElevated }]}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.oppTop}>
              <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={[styles.sectionTitle, { color: theme.textPrimary }]}>{opportunity.underlying} route</Text>
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.textButton}>
                <Text maxFontSizeMultiplier={2} style={{ color: theme.accent, fontWeight: "700" }}>Close</Text>
              </Pressable>
            </View>
            <Text maxFontSizeMultiplier={2} style={[styles.oppRoute, { color: theme.textSecondary }]}>
              {opportunity.route_type === "SPOT_PERP" ? "Spot · Perp" : "Perp · Perp"} · long {opportunity.long_venue} → short {opportunity.short_venue} · {opportunity.funding_direction.toLowerCase()} funding
            </Text>
            <DetailLine label="Net APR" value={formatPercent(opportunity.net_apr)} />
            <DetailLine label="Gross funding APR" value={formatPercent(opportunity.gross_funding_apr)} />
            <DetailLine label="Break-even funding" value={formatPercent(opportunity.break_even_funding)} />
            <DetailLine label="Entry cost" value={formatPercent(opportunity.entry_cost)} />
            <DetailLine label="Exit cost" value={formatPercent(opportunity.exit_cost)} />
            <DetailLine label="Carry cost" value={formatPercent(opportunity.carry_cost)} />
            <DetailLine label="Risk buffer" value={formatPercent(opportunity.risk_buffer)} />
            <DetailLine label="Profitability" value={formatPercent(opportunity.profitability_probability)} />
            <DetailLine label="Expected net PnL" value={formatUsd(opportunity.expected_net_pnl)} />
            <DetailLine label="Entry basis" value={`${opportunity.entry_basis_bps.toFixed(1)} bps`} />
            <DetailLine label="Leverage" value={`${opportunity.leverage.toFixed(1)}×`} />
            <DetailLine label="Required capital" value={formatUsd(opportunity.required_capital)} />
            <DetailLine label="Available capacity" value={formatUsd(opportunity.available_capacity)} />
            <DetailLine label="Reserved notional" value={formatUsd(opportunity.reserved_notional)} />
            <DetailLine label="Reserved capital" value={formatUsd(opportunity.reserved_capital)} />
            <DetailLine label="Portfolio use" value={formatPercent(opportunity.capital_fraction)} />
            <DetailLine label="Within risk limits" value={opportunity.within_limits ? "Yes" : "No"} />
            <Text maxFontSizeMultiplier={2} style={[styles.detailLeg, { color: theme.textSecondary }]}>{leg("Long", opportunity.long_leg)}</Text>
            <Text maxFontSizeMultiplier={2} style={[styles.detailLeg, { color: theme.textSecondary }]}>{leg("Short", opportunity.short_leg)}</Text>
            {error === undefined ? null : <Text accessibilityRole="alert" style={{ color: theme.critical, marginTop: 8 }}>{error}</Text>}
            {canOpen && opportunity.within_limits ? (
              <View style={{ marginTop: 12 }}>
                <Button disabled={opening} label={opening ? "Opening paper position…" : "Open paper position"} onPress={() => void open()} />
                <Text maxFontSizeMultiplier={2} style={[styles.caption, { color: theme.textSecondary, textAlign: "left", marginTop: 8 }]}>Simulated fill — paper only. No live orders are placed.</Text>
              </View>
            ) : (
              <Text maxFontSizeMultiplier={2} style={[styles.caption, { color: theme.textSecondary, textAlign: "left", marginTop: 8 }]}>
                {opportunity.within_limits ? "Paper — monitoring only. Trader access is required to open positions." : "Outside risk limits — not open-eligible."}
              </Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function RiskLimitsCard({ limits }: { readonly limits: RiskLimits }) {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  return (
    <Card>
      <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={[styles.sectionTitle, { color: theme.textPrimary }]}>Active risk limits</Text>
      <View style={styles.oppMetrics}>
        <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Min APR {formatPercent(limits.min_net_apr)}</Text>
        <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Min win {formatPercent(limits.min_profitability)}</Text>
        <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Max lev {limits.max_leverage.toFixed(1)}×</Text>
        <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Max basis {limits.max_entry_basis_bps.toFixed(0)} bps</Text>
        <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Max/opp {formatPercent(limits.max_opportunity_fraction)}</Text>
      </View>
    </Card>
  );
}

const ROUTE_FILTERS: readonly { readonly key: "ALL" | RouteType; readonly label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PERP_PERP", label: "Perp·Perp" },
  { key: "SPOT_PERP", label: "Spot·Perp" },
];
const SORTS: readonly { readonly key: OpportunitySort; readonly label: string }[] = [
  { key: "default", label: "Rank" },
  { key: "net_apr", label: "APR" },
  { key: "next_funding", label: "Funding" },
  { key: "capacity", label: "Capacity" },
];

function Scanner({ onOpened }: { readonly onOpened: () => void }) {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  const { controller } = useAuth();
  const canTrade = useCanTrade();
  const [route, setRoute] = useState<"ALL" | RouteType>("ALL");
  const [sort, setSort] = useState<OpportunitySort>("default");
  const [selected, setSelected] = useState<Opportunity>();

  const handleOpen = useCallback(
    async (opportunity: Opportunity) => {
      await controller.client.createPosition({ route_id: opportunity.route_id });
      setSelected(undefined);
      onOpened();
    },
    [controller, onOpened],
  );

  const filter = useMemo<OpportunityFilter>(
    () => ({
      ...(route === "ALL" ? {} : { route_type: route }),
      ...(sort === "default" ? {} : { sort }),
    }),
    [route, sort],
  );
  const { opportunities, scannedAt, loading, error, reload } = useOpportunities(filter);
  const limits = useRiskLimits();

  return (
    <>
      <View style={styles.headingBlock}>
        <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={[styles.title, { color: theme.textPrimary }]}>Opportunities</Text>
        <Text maxFontSizeMultiplier={2} style={[styles.body, { color: theme.textSecondary }]}>
          Ranked funding-arbitrage routes from the paper scanner. Tap a route for the full breakdown. Monitoring only.
        </Text>
      </View>
      {limits === undefined ? null : <RiskLimitsCard limits={limits} />}
      <View style={styles.pillRow}>
        {ROUTE_FILTERS.map((entry) => (
          <Pill key={entry.key} label={entry.label} active={route === entry.key} onPress={() => setRoute(entry.key)} />
        ))}
      </View>
      <View style={styles.pillRow}>
        {SORTS.map((entry) => (
          <Pill key={entry.key} label={entry.label} active={sort === entry.key} onPress={() => setSort(entry.key)} />
        ))}
      </View>
      <View style={styles.scannerBar}>
        <Text maxFontSizeMultiplier={2} style={[styles.caption, { color: theme.textSecondary, textAlign: "left" }]}>
          {loading ? "Scanning…" : scannedAt === "" ? "No scan yet" : `As of ${formatClock(scannedAt)}`}
        </Text>
        <Pressable accessibilityRole="button" onPress={reload} style={styles.textButton}>
          <Text maxFontSizeMultiplier={2} style={{ color: theme.accent, fontWeight: "700" }}>Refresh</Text>
        </Pressable>
      </View>
      {error === undefined ? null : <Text accessibilityRole="alert" style={{ color: theme.critical }}>{error}</Text>}
      <Card>
        {loading && opportunities.length === 0 ? (
          <ActivityIndicator accessibilityLabel="Loading opportunities" />
        ) : opportunities.length === 0 ? (
          <Text maxFontSizeMultiplier={2} style={[styles.caption, { color: theme.textSecondary }]}>
            No eligible opportunities in the latest scan.
          </Text>
        ) : (
          opportunities.map((opportunity) => (
            <OpportunityRow key={opportunity.route_id} opportunity={opportunity} onPress={() => setSelected(opportunity)} />
          ))
        )}
      </Card>
      {selected === undefined ? null : (
        <OpportunityDetail
          opportunity={selected}
          onClose={() => setSelected(undefined)}
          onOpen={handleOpen}
          canOpen={canTrade}
        />
      )}
    </>
  );
}

function LegCard({ label, leg }: { readonly label: string; readonly leg: PositionLeg }) {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  return (
    <View style={styles.legBlock}>
      <Text maxFontSizeMultiplier={2} style={[styles.legHeader, { color: theme.textSecondary }]}>
        {label} · {leg.venue} · {leg.symbol}
      </Text>
      <DetailLine label="Filled" value={`${leg.filled_qty} @ ${formatUsd(leg.avg_fill_price)}`} />
      <DetailLine label="Fees" value={formatUsd(leg.fees)} />
    </View>
  );
}

function PositionCard({
  position,
  canTrade,
  onClose,
}: {
  readonly position: Position;
  readonly canTrade: boolean;
  readonly onClose: (id: string) => Promise<void>;
}) {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  const open = position.state === "OPEN";
  const [closing, setClosing] = useState(false);
  const close = async () => {
    setClosing(true);
    try {
      await onClose(position.id);
    } finally {
      setClosing(false);
    }
  };
  return (
    <View style={[styles.oppRow, { borderColor: theme.border }]}>
      <View style={styles.oppTop}>
        <Text maxFontSizeMultiplier={2} style={[styles.oppRoute, { color: theme.textPrimary }]}>
          {position.underlying} · long {position.long_leg.venue} → short {position.short_leg.venue}
        </Text>
        <View style={[styles.badge, { backgroundColor: theme.field }]}>
          <Text maxFontSizeMultiplier={2} style={[styles.badgeText, { color: open ? theme.signal : theme.velocity }]}>
            {position.state}
          </Text>
        </View>
      </View>
      <View style={styles.oppMetrics}>
        <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Notional {formatUsd(position.target_notional)}</Text>
        <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Reserved {formatUsd(position.reserved_capital)}</Text>
        <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Residual {formatUsd(position.residual_delta_usd)}</Text>
      </View>
      {open ? null : (
        <View style={styles.oppMetrics}>
          <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Funding {formatUsd(position.funding_captured)}</Text>
          <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: position.realized_pnl >= 0 ? theme.signal : theme.critical }]}>PnL {formatUsd(position.realized_pnl)}</Text>
          {position.closed_at === undefined ? null : (
            <Text maxFontSizeMultiplier={2} style={[styles.oppMetric, { color: theme.textSecondary }]}>Closed {formatClock(position.closed_at)}</Text>
          )}
        </View>
      )}
      <LegCard label="Long" leg={position.long_leg} />
      <LegCard label="Short" leg={position.short_leg} />
      {open && canTrade ? (
        <View style={{ marginTop: 12 }}>
          <Button disabled={closing} label={closing ? "Closing…" : "Close position"} onPress={() => void close()} />
        </View>
      ) : null}
    </View>
  );
}

function Positions() {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  const { controller } = useAuth();
  const canTrade = useCanTrade();
  const { positions, loading, error, reload } = usePositions();
  const [actionError, setActionError] = useState<string>();

  const handleClose = useCallback(
    async (id: string) => {
      setActionError(undefined);
      try {
        await controller.client.closePosition(id);
        reload();
      } catch (cause) {
        setActionError(cause instanceof Error ? cause.message : "Could not close the position.");
      }
    },
    [controller, reload],
  );

  return (
    <>
      <View style={styles.headingBlock}>
        <Text accessibilityRole="header" maxFontSizeMultiplier={2} style={[styles.title, { color: theme.textPrimary }]}>Positions</Text>
        <Text maxFontSizeMultiplier={2} style={[styles.body, { color: theme.textSecondary }]}>
          Opened paper positions, their simulated fills, and realized PnL after close. Paper only — no live orders are placed.
        </Text>
      </View>
      <View style={styles.scannerBar}>
        <Text maxFontSizeMultiplier={2} style={[styles.caption, { color: theme.textSecondary, textAlign: "left" }]}>
          {loading ? "Loading…" : `${positions.length} position${positions.length === 1 ? "" : "s"}`}
        </Text>
        <Pressable accessibilityRole="button" onPress={reload} style={styles.textButton}>
          <Text maxFontSizeMultiplier={2} style={{ color: theme.accent, fontWeight: "700" }}>Refresh</Text>
        </Pressable>
      </View>
      {error === undefined ? null : <Text accessibilityRole="alert" style={{ color: theme.critical }}>{error}</Text>}
      {actionError === undefined ? null : <Text accessibilityRole="alert" style={{ color: theme.critical }}>{actionError}</Text>}
      <Card>
        {loading && positions.length === 0 ? (
          <ActivityIndicator accessibilityLabel="Loading positions" />
        ) : positions.length === 0 ? (
          <Text maxFontSizeMultiplier={2} style={[styles.caption, { color: theme.textSecondary }]}>
            No paper positions yet. Open one from an opportunity in the Scanner.
          </Text>
        ) : (
          positions.map((position) => (
            <PositionCard key={position.id} position={position} canTrade={canTrade} onClose={handleClose} />
          ))
        )}
      </Card>
    </>
  );
}

function AuthenticatedHome() {
  const theme = useColorScheme() === "light" ? themes.light : themes.dark;
  const [tab, setTab] = useState<"scanner" | "positions" | "security">("scanner");
  const tabs: readonly { readonly key: "scanner" | "positions" | "security"; readonly label: string }[] = [
    { key: "scanner", label: "Scanner" },
    { key: "positions", label: "Positions" },
    { key: "security", label: "Security" },
  ];
  return (
    <>
      <View style={[styles.segmented, { borderColor: theme.border }]}>
        {tabs.map((entry) => {
          const active = tab === entry.key;
          return (
            <Pressable
              key={entry.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setTab(entry.key)}
              style={[styles.segment, active ? { backgroundColor: theme.accent } : null]}
            >
              <Text maxFontSizeMultiplier={2} style={[styles.segmentText, { color: active ? "#04120C" : theme.textSecondary }]}>
                {entry.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {tab === "scanner" ? <Scanner onOpened={() => setTab("positions")} /> : tab === "positions" ? <Positions /> : <SecurityCenter />}
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
      {state.kind === "AUTHENTICATED" ? <AuthenticatedHome /> : null}
      {state.kind === "OFFLINE_LOCKED" || state.kind === "ERROR" ? (
        <>
          <Heading title="Perpeto is locked" body={state.message} />
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
  mark: { height: 26, width: 26 },
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
  segmented: { borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 4, marginTop: 20, padding: 4 },
  segment: { alignItems: "center", borderRadius: 10, flex: 1, justifyContent: "center", minHeight: 40 },
  segmentText: { fontSize: 15, fontWeight: "700" },
  scannerBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  oppRow: { borderTopWidth: 1, gap: 8, paddingVertical: 14 },
  oppTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  oppApr: { fontSize: 22, fontVariant: ["tabular-nums"], fontWeight: "800" },
  oppRoute: { fontSize: 16, fontWeight: "600" },
  oppMetrics: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  oppMetric: { fontSize: 14, fontVariant: ["tabular-nums"] },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  pillText: { fontSize: 14, fontWeight: "700" },
  detailLine: { alignItems: "center", borderTopWidth: 0, flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  detailLabel: { fontSize: 15 },
  detailValue: { fontSize: 15, fontVariant: ["tabular-nums"], fontWeight: "600" },
  detailLeg: { fontSize: 14, fontVariant: ["tabular-nums"], marginTop: 4 },
  legBlock: { gap: 2, marginTop: 8 },
  legHeader: { fontSize: 13, fontWeight: "700", letterSpacing: 0.3 },
  modalBackdrop: { backgroundColor: "rgba(0,0,0,0.5)", flex: 1, justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%" },
  modalScroll: { gap: 4, padding: 24 },
  secret: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), fontSize: 16, lineHeight: 24 },
  recoveryCodes: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), fontSize: 18, lineHeight: 28 },
  sectionTitle: { fontSize: 20, fontWeight: "800" },
  row: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between", minHeight: 52 },
});
