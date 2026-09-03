import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import { ENHANCE_SUB_TABS } from '../components/Header';
import HudScreen from './HudScreen';
import PlaceholderScreen from './PlaceholderScreen';

const SUB_TAB_TITLES: Record<string, string> = {
  chat: 'Chat',
  sparkles: 'Enhance',
  diamond: 'Premium',
};

type Props = {
  activeSubTab: number;
  onSubTabChange: (index: number) => void;
};

export default function EnhanceScreen({ activeSubTab, onSubTabChange }: Props) {
  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    pagerRef.current?.setPage(activeSubTab);
  }, [activeSubTab]);

  return (
    <PagerView
      ref={pagerRef}
      style={styles.flex}
      initialPage={activeSubTab}
      onPageSelected={(e) => onSubTabChange(e.nativeEvent.position)}
    >
      {ENHANCE_SUB_TABS.map((tab) =>
        tab.key === 'diamond' ? (
          <HudScreen key={tab.key} />
        ) : (
          <PlaceholderScreen key={tab.key} title={SUB_TAB_TITLES[tab.key]} icon={tab.icon} />
        )
      )}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
