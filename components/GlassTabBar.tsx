import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';

export type TabItem = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

type Props = {
  tabs: TabItem[];
  activeIndex: number;
  onChange: (index: number) => void;
};

const INDICATOR_WIDTH = 64;
const INDICATOR_HEIGHT = 32;

export default function GlassTabBar({ tabs, activeIndex, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const indicatorX = useRef(new Animated.Value(0)).current;
  const [barWidth, setBarWidth] = useState(0);

  const indicatorCenterFor = (index: number, width: number) => {
    const tabWidth = width / tabs.length;
    return tabWidth * index + tabWidth / 2 - INDICATOR_WIDTH / 2;
  };

  const onBarLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setBarWidth(width);
    indicatorX.setValue(indicatorCenterFor(activeIndex, width));
  };

  useEffect(() => {
    if (barWidth) {
      Animated.spring(indicatorX, {
        toValue: indicatorCenterFor(activeIndex, barWidth),
        useNativeDriver: true,
        damping: 20,
        mass: 0.7,
        stiffness: 260,
      }).start();
    }
  }, [activeIndex, barWidth]);

  const handlePress = (index: number) => {
    if (index !== activeIndex) {
      onChange(index);
    }
  };

  return (
    <View
      style={[styles.bar, { paddingBottom: insets.bottom || 12 }]}
      onLayout={onBarLayout}
    >
      <Animated.View
        style={[styles.indicator, { transform: [{ translateX: indicatorX }] }]}
      />
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => handlePress(index)}
            hitSlop={8}
          >
            <Ionicons
              name={(isActive ? tab.icon : `${tab.icon}-outline`) as keyof typeof Ionicons.glyphMap}
              size={24}
              color="#FFFFFF"
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const BAR_HEIGHT = 56;

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: BAR_HEIGHT + 12,
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.glassBorder,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  indicator: {
    position: 'absolute',
    top: 12,
    left: 0,
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_HEIGHT / 2,
    backgroundColor: theme.colors.accentDim,
  },
  tab: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
