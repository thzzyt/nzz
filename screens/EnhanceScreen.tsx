import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';
import { ENHANCE_SUB_TABS, SALVOS_TAB_INDEX, SavedTab } from '../components/Header';
import ChatScreen from './ChatScreen';
import HudScreen from './HudScreen';
import SavedItemsScreen from './SavedItemsScreen';

type Props = {
  activeSubTab: number;
  onSubTabChange: (index: number) => void;
  savedTab: SavedTab;
};

export default function EnhanceScreen({ activeSubTab, onSubTabChange, savedTab }: Props) {
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
      {ENHANCE_SUB_TABS.map((tab) => {
        if (tab.key === 'chat') {
          return (
            <ChatScreen key={tab.key} onGoToSaved={() => onSubTabChange(SALVOS_TAB_INDEX)} />
          );
        }
        if (tab.key === 'huds') return <HudScreen key={tab.key} />;
        return <SavedItemsScreen key={tab.key} savedTab={savedTab} />;
      })}
    </PagerView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
