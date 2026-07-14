import type { ConfigContext, ExpoConfig } from "expo/config";

function environmentValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === undefined || value.length === 0 ? undefined : value;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const googlePlugin = "@react-native-google-signin/google-signin";
  const buildPropertiesPlugin = "expo-build-properties";
  const plugins = (config.plugins ?? []).filter((plugin) => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    return pluginName !== googlePlugin && pluginName !== buildPropertiesPlugin;
  });
  const googleIosClientId = environmentValue("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID");
  const googleWebClientId = environmentValue("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID");
  const googleIosUrlScheme = environmentValue("GOOGLE_IOS_URL_SCHEME");
  const googleValues = [googleIosClientId, googleWebClientId, googleIosUrlScheme];
  const googleConfigured =
    googleIosClientId !== undefined &&
    googleWebClientId !== undefined &&
    googleIosUrlScheme !== undefined;

  if (googleValues.some((value) => value !== undefined) && !googleConfigured) {
    throw new Error(
      "Google Sign-In configuration is incomplete. Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, " +
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, and GOOGLE_IOS_URL_SCHEME together.",
    );
  }
  if (process.env.EAS_BUILD_PROFILE === "testflight" && !googleConfigured) {
    throw new Error("The testflight profile requires complete Google Sign-In configuration.");
  }
  if (googleConfigured) {
    const suffix = ".apps.googleusercontent.com";
    if (!googleIosClientId.endsWith(suffix) || !googleWebClientId.endsWith(suffix)) {
      throw new Error("Google OAuth client IDs must end with .apps.googleusercontent.com.");
    }
    const expectedScheme = `com.googleusercontent.apps.${googleIosClientId.slice(0, -suffix.length)}`;
    if (googleIosUrlScheme !== expectedScheme) {
      throw new Error(`GOOGLE_IOS_URL_SCHEME must be ${expectedScheme}.`);
    }
  }
  const googlePluginConfiguration: [string, { iosUrlScheme: string }][] = googleConfigured
    ? [[googlePlugin, { iosUrlScheme: googleIosUrlScheme }]]
    : [];

  return {
    ...config,
    name: config.name ?? "Signex",
    slug: config.slug ?? "signex-mobile",
    version: "0.2.0",
    ios: {
      ...config.ios,
      bundleIdentifier: "com.signex.mobile",
      usesAppleSignIn: true,
    },
    plugins: [
      ...plugins,
      [
        buildPropertiesPlugin,
        {
          ios: {
            extraPods: [
              { name: "GoogleUtilities", modular_headers: true },
              { name: "RecaptchaInterop", modular_headers: true },
            ],
          },
        },
      ],
      "expo-apple-authentication",
      ...googlePluginConfiguration,
    ],
    extra: {
      ...config.extra,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_URL,
      ...(googleConfigured ? { googleIosClientId, googleWebClientId } : {}),
    },
  };
};
