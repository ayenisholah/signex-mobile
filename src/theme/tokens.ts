export const themes = {
  light: {
    background: "#F6F8FA",
    surface: "rgba(255,255,255,0.80)",
    surfaceElevated: "rgba(240,243,246,0.90)",
    textPrimary: "#0B1220",
    textSecondary: "#4A5567",
    border: "rgba(203,213,225,0.82)",
    accent: "#0E9E6E",
    signal: "#0F9D63",
    velocity: "#0284C7",
    warning: "#B45309",
    critical: "#C4384B",
    field: "rgba(14,158,110,0.12)",
  },
  dark: {
    background: "#0A0C10",
    surface: "rgba(16,20,26,0.72)",
    surfaceElevated: "rgba(20,25,33,0.88)",
    textPrimary: "#F2F5F9",
    textSecondary: "#98A2B3",
    border: "rgba(52,224,161,0.20)",
    accent: "#34E0A1",
    signal: "#34D399",
    velocity: "#38BDF8",
    warning: "#F5B14C",
    critical: "#F5677E",
    field: "rgba(52,224,161,0.14)",
  },
} as const;

export type Theme = (typeof themes)[keyof typeof themes];
