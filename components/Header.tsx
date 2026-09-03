import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AccountSheet from './AccountSheet';
import DiamondDotsIcon from './DiamondDotsIcon';
import { theme } from '../theme';

type OverlayRightButton = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

type Props = {
  activeIndex: number;
  subTabIndex: number;
  onSubTabChange: (index: number) => void;
  overlayActive?: boolean;
  overlayTitle?: string;
  overlayBarColor?: string;
  onOverlayBack?: () => void;
  overlayRightButton?: OverlayRightButton;
};

const ENHANCE_TAB_INDEX = 2;
export const HEADER_HEIGHT = 150;
const OVERLAY_ROW_HEIGHT = 64;

export type SubTab = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const ENHANCE_SUB_TABS: SubTab[] = [
  { key: 'chat', icon: 'chatbubble' },
  { key: 'sparkles', icon: 'sparkles' },
  { key: 'diamond', icon: 'diamond' },
];

export default function Header({
  activeIndex,
  subTabIndex,
  onSubTabChange,
  overlayActive = false,
  overlayTitle = '',
  overlayBarColor = 'transparent',
  onOverlayBack,
  overlayRightButton,
}: Props) {
  const insets = useSafeAreaInsets();
  const isEnhance = activeIndex === ENHANCE_TAB_INDEX;
  const progress = useRef(new Animated.Value(0)).current;
  const overlayProgress = useRef(new Animated.Value(0)).current;
  const [accountSheetVisible, setAccountSheetVisible] = useState(false);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isEnhance ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isEnhance]);

  useEffect(() => {
    Animated.timing(overlayProgress, {
      toValue: overlayActive ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [overlayActive]);

  return (
    <View
      style={[
        styles.wrapper,
        { height: overlayActive ? insets.top + OVERLAY_ROW_HEIGHT : HEADER_HEIGHT + insets.top },
      ]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: Animated.subtract(1, overlayProgress) }]}
        pointerEvents="none"
      >
        <LinearGradient
          style={StyleSheet.absoluteFill}
          colors={[theme.colors.accent, 'transparent']}
          pointerEvents="none"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.topRow,
          { marginTop: insets.top + 6 },
          isEnhance && styles.topRowCentered,
          { opacity: Animated.subtract(1, overlayProgress) },
        ]}
        pointerEvents={overlayActive ? 'none' : 'box-none'}
      >
        {!isEnhance && (
          <>
            <Pressable
              style={styles.dotsButton}
              onPress={() => setAccountSheetVisible(true)}
              hitSlop={8}
            >
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
              {ENHANCE_SUB_TABS.map((tab, index) => {
                const isActive = index === subTabIndex;
                return (
                  <Pressable
                    key={tab.key}
                    style={styles.m3Tab}
                    onPress={() => onSubTabChange(index)}
                  >
                    {tab.key === 'diamond' ? (
                      <DiamondDotsIcon
                        size={24}
                        color={isActive ? theme.colors.text : 'rgba(255,255,255,0.55)'}
                      />
                    ) : (
                      <Ionicons
                        name={isActive ? tab.icon : (`${tab.icon}-outline` as keyof typeof Ionicons.glyphMap)}
                        size={28}
                        color={isActive ? theme.colors.text : 'rgba(255,255,255,0.55)'}
                      />
                    )}
                    <View style={[styles.m3Indicator, isActive && styles.m3IndicatorActive]} />
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View
        style={[
          styles.overlayRow,
          { paddingTop: insets.top + 6, backgroundColor: overlayBarColor },
          { opacity: overlayProgress },
        ]}
        pointerEvents={overlayActive ? 'box-none' : 'none'}
      >
        <Pressable style={styles.overlayBackButton} onPress={onOverlayBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.overlayTitle}>{overlayTitle}</Text>
        {overlayRightButton && (
          <Pressable
            style={styles.overlayRightButton}
            onPress={overlayRightButton.onPress}
            hitSlop={8}
          >
            <Ionicons name={overlayRightButton.icon} size={20} color={theme.colors.text} />
          </Pressable>
        )}
      </Animated.View>

      <AccountSheet
        visible={accountSheetVisible}
        onClose={() => setAccountSheetVisible(false)}
      />
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
  overlayRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  overlayBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTitle: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
    marginHorizontal: 12,
  },
  overlayRightButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
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
