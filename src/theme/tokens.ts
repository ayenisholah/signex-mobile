export const themes = {
  light: {
    background: "#F5F7FB",
    surface: "rgba(255,255,255,0.78)",
    surfaceElevated: "rgba(238,242,247,0.9)",
    textPrimary: "#101828",
    textSecondary: "#475467",
    border: "rgba(208,213,221,0.82)",
    accent: "#1E5EFF",
    signal: "#007A70",
    velocity: "#6D28D9",
    warning: "#9A6700",
    critical: "#B42318",
    field: "rgba(30,94,255,0.12)",
  },
  dark: {
    background: "#080D18",
    surface: "rgba(17,24,39,0.72)",
    surfaceElevated: "rgba(27,37,53,0.88)",
    textPrimary: "#F8FAFC",
    textSecondary: "#B6C2D2",
    border: "rgba(120,166,255,0.24)",
    accent: "#78A6FF",
    signal: "#5EEAD4",
    velocity: "#C4B5FD",
    warning: "#F5B85D",
    critical: "#FF8F8F",
    field: "rgba(120,166,255,0.18)",
  },
} as const;

export type Theme = (typeof themes)[keyof typeof themes];
