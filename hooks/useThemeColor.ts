import { palettes, type ColorToken } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

/** Resolve a semantic color, preserving explicit platform-theme overrides. */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorToken,
): string {
  const mode = useColorScheme() ?? 'light';
  return props[mode] ?? palettes[mode][colorName];
}
