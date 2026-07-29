import { Platform } from "react-native";

/**
 * Retro/analog palette for the M5 redesign: warm paper + ink rather than a
 * generic light/dark scheme. `paper`/`cork` are page backgrounds; `card` is
 * the surface content sits on top of either.
 */
export const Colors = {
  paper: "#e8dcc8", // warm cream — matches login_background.png / the erase-transition overlay
  card: "#f7f1e3", // slightly lighter surface for cards, inputs, chips
  ink: "#1f1a14", // near-black warm text color ("pencil", not pure black)
  inkMuted: "#6b6153", // secondary/muted text (timestamps, status, hints)
  accent: "#b5502e", // terracotta — primary buttons/CTAs
  accentPressed: "#8f3f23",
  danger: "#a33636", // delete/destructive actions
  dangerPressed: "#7d2828",
  border: "#1f1a14", // hand-drawn border stroke color
};

/** Soft, translucent card shadow — replaces the old heavy opaque drop-shadow. */
export const CARD_SHADOW = "1px 3px 5px #21212155";

export const PENCIL_FONT = "PencilFont";

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
