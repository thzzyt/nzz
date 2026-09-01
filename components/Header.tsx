import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';

type Props = {
  activeIndex: number;
};

const ENHANCE_TAB_INDEX = 2;
export const HEADER_HEIGHT = 150;

type SubTab = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SUB_TABS: SubTab[] = [
  { key: 'chat', icon: 'chatbubble' },
  { key: 'sparkles', icon: 'sparkles' },
  { key: 'diamond', icon: 'diamond' },
];

export default function Header({ activeIndex }: Props) {
  const insets = useSafeAreaInsets();
  const [subTabIndex, setSubTabIndex] = useState(SUB_TABS.length - 1);
  const isEnhance = activeIndex === ENHANCE_TAB_INDEX;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isEnhance ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isEnhance]);

  return (
    <View style={[styles.wrapper, { height: HEADER_HEIGHT + insets.top }]} pointerEvents="box-none">
      <LinearGradient
        style={StyleSheet.absoluteFill}
        colors={[theme.colors.accent, 'transparent']}
        pointerEvents="none"
      />

      <View
        style={[
          styles.topRow,
          { marginTop: insets.top + 6 },
          isEnhance && styles.topRowCentered,
        ]}
      >
        {!isEnhance && (
          <>
            <Pressable style={styles.dotsButton} hitSlop={8}>
              <Ionicons name="ellipsis-horizontal" size={26} color={theme.colors.text} />
            </Pressable>
            <View style={styles.centerLogoWrap} pointerEvents="none">
              <Text style={styles.logoCenter}>E</Text>
            </View>
          </>
        )}

        {isEnhance && (
          <Animated.View style={[styles.enhanceRow, { opacity: progress }]}>
            <View style={styles.m3Tabs}>
              {SUB_TABS.map((tab, index) => {
                const isActive = index === subTabIndex;
                return (
                  <Pressable
                    key={tab.key}
                    style={styles.m3Tab}
                    onPress={() => setSubTabIndex(index)}
                  >
                    <Ionicons
                      name={isActive ? tab.icon : (`${tab.icon}-outline` as keyof typeof Ionicons.glyphMap)}
                      size={28}
                      color={isActive ? theme.colors.text : 'rgba(255,255,255,0.55)'}
                    />
                    <View style={[styles.m3Indicator, isActive && styles.m3IndicatorActive]} />
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
    minHeight: 70,
  },
  topRowCentered: {
    flex: 1,
  },
  dotsButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enhanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  centerLogoWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logoCenter: {
    fontSize: 64,
    fontWeight: '900',
    fontStyle: 'italic',
    color: theme.colors.text,
  },
  m3Tabs: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  m3Tab: {
    flex: 1,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  m3Indicator: {
    height: 3,
    width: 20,
    borderRadius: 1.5,
    backgroundColor: 'transparent',
  },
  m3IndicatorActive: {
    backgroundColor: theme.colors.text,
  },
});
