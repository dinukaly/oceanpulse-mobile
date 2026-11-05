import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Matches the existing artwork and native splash background.
const BRAND_BACKGROUND = '#0456C7';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  useEffect(() => {
    let active = true;
    const showImmediately = () => {
      opacity.stopAnimation(); scale.stopAnimation();
      opacity.setValue(1); scale.setValue(1);
    };
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', reduced => {
      if (reduced) showImmediately();
    });
    AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!active) return;
      if (reduced) { showImmediately(); return; }
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }).catch(() => { if (active) showImmediately(); });
    return () => {
      active = false; subscription.remove();
      opacity.stopAnimation(); scale.stopAnimation();
    };
  }, [opacity, scale]);
  return <SafeAreaView style={styles.container} accessibilityLabel="OceanPulse is starting">
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <Image source={require('../../../assets/logo/logo.png')} resizeMode="contain"
        style={styles.logo} accessible={false} />
    </Animated.View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND_BACKGROUND },
  logo: { width: 208, height: 208 },
});
