/** Canonical design tokens from design/DESIGN.md. Native dimensions are points. */
export const palettes = {
  light: {
    primary: '#075985', onPrimary: '#FFFFFF', background: '#F8FAFC',
    surface: '#FFFFFF', text: '#0F172A', muted: '#475569', border: '#64748B',
    separator: '#CBD5E1', accentSurface: '#E0F2FE',
    success: '#166534', successSurface: '#F0FDF4',
    warning: '#854D0E', warningSurface: '#FEFCE8',
    danger: '#B91C1C', dangerSurface: '#FEF2F2',
  },
  dark: {
    primary: '#7DD3FC', onPrimary: '#0F172A', background: '#0F172A',
    surface: '#1E293B', text: '#F8FAFC', muted: '#CBD5E1', border: '#94A3B8',
    separator: '#334155', accentSurface: '#163247',
    success: '#86EFAC', successSurface: '#142A20',
    warning: '#FDE68A', warningSurface: '#302A14',
    danger: '#FCA5A5', dangerSurface: '#321E24',
  },
} as const;

export type ThemeMode = keyof typeof palettes;
export type ColorToken = keyof typeof palettes.light;

// Use these families only after expo-font has loaded the corresponding assets.
// Until then omit fontFamily to retain native system sans-serif and script fallback.
export const fontFamilies = {
  regular: 'Inter-Regular', semibold: 'Inter-SemiBold', bold: 'Inter-Bold',
} as const;

export const typography = {
  display: { fontSize: 40, lineHeight: 48, fontWeight: '700' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  section: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  tab: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
} as const;

export const numericText = { fontVariant: ['tabular-nums'] as ('tabular-nums')[] };

const geometry = {
  spacing: { xs: 4, sm: 8, compact: 12, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 8, md: 12, lg: 16, full: 9999 },
  layout: { gutter: 16, cardPadding: 16, sectionGap: 24, webMaxWidth: 480 },
  touchTarget: 48,
  iconSize: 24,
  focus: { width: 2, gap: 2 },
  button: { minHeight: 48, padding: 12, radius: 8 },
  motion: { feedbackMin: 120, feedbackMax: 180, sheet: 200 },
} as const;

export function getTheme(mode: ThemeMode = 'light') {
  const colors = palettes[mode];
  return {
    ...geometry,
    colors: {
      ...colors,
      // Compatibility aliases for existing shared components.
      mutedText: colors.muted, accent: colors.primary, accentText: colors.onPrimary,
      dangerText: colors.onPrimary, infoSurface: colors.accentSurface,
      warningBorder: colors.warning, errorSurface: colors.dangerSurface,
    },
    typography,
    fontFamilies,
    numericText,
    // Legacy scalar access; new components should use full typography styles.
    type: { display: 40, title: 28, section: 20, body: 16, label: 16, caption: 14, tab: 12 },
    effects: {
      scrimColor: colors.text, scrimOpacity: 0.4,
      modalShadow: {
        shadowColor: colors.text, shadowOpacity: mode === 'dark' ? 0 : 0.12,
        shadowOffset: { width: 0, height: 4 }, shadowRadius: 16,
      },
    },
  } as const;
}

// Light-first rollout. Dark tokens are ready; screen migration controls activation.
export const theme = getTheme('light');
export const darkTheme = getTheme('dark');
