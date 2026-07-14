import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const googlePlugin = "@react-native-google-signin/google-signin";
  const plugins = (config.plugins ?? []).filter((plugin) =>
    (Array.isArray(plugin) ? plugin[0] : plugin) !== googlePlugin,
  );
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
      "expo-apple-authentication",
      [
        googlePlugin,
        {
          iosUrlScheme:
            process.env.GOOGLE_IOS_URL_SCHEME ?? "com.googleusercontent.apps.signex-unconfigured",
        },
      ],
    ],
    extra: {
      ...config.extra,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_URL,
      googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    },
  };
};
