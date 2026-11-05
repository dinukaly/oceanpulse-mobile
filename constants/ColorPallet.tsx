import { theme } from './theme';

/** @deprecated Use semantic tokens from constants/theme instead. */
export const COLORS = {
  primary: theme.colors.primary,
  secondary: theme.colors.success,
  tertiary: theme.colors.primary,
  // Legacy background also serves as white foreground on colored surfaces.
  // Preserve white until each consumer is migrated according to its role.
  background: theme.colors.surface,
  mainBackground: theme.colors.primary,
  mainBackgroundtwo: theme.colors.background,
  primaryBlack: theme.colors.text,
  darkGray: theme.colors.text,
  lightGray: theme.colors.border,
  lighBlue: theme.colors.primary,
  lightGray2: theme.colors.background,
  gray: theme.colors.muted,
  primaryTextColor: theme.colors.onPrimary,
  primaryGray: theme.colors.separator,
  primaryTextBlueColor: theme.colors.primary,
} as const;

/** @deprecated Use ColorToken from constants/theme. */
export type ColorPallet = keyof typeof COLORS;
