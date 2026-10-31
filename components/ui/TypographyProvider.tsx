import { createContext, useContext, type ReactNode } from 'react';
import { useFonts } from 'expo-font';
import { fontFamilies, typography } from '@/constants/theme';

const FontsReady = createContext(false);

export default function TypographyProvider({ children }: { children: ReactNode }) {
  const [loaded] = useFonts({
    'Inter-Regular': require('../../assets/fonts/inter/Inter_400Regular.ttf'),
    'Inter-SemiBold': require('../../assets/fonts/inter/Inter_600SemiBold.ttf'),
    'Inter-Bold': require('../../assets/fonts/inter/Inter_700Bold.ttf'),
  });
  // Render immediately with native system fonts, including on font-load failure.
  return <FontsReady.Provider value={loaded}>{children}</FontsReady.Provider>;
}

export function useTypography(variant: keyof typeof typography = 'body') {
  const loaded = useContext(FontsReady);
  const token = typography[variant];
  const fontFamily = token.fontWeight === '700' ? fontFamilies.bold
    : token.fontWeight === '600' ? fontFamilies.semibold : fontFamilies.regular;
  return { ...token, ...(loaded ? { fontFamily } : {}) };
}
