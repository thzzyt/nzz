import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GlassTabBar, { TabItem } from './components/GlassTabBar';
import Header, { ENHANCE_SUB_TABS } from './components/Header';
import DragShotScreen from './screens/DragShotScreen';
import EnhanceScreen from './screens/EnhanceScreen';
import HomeScreen from './screens/HomeScreen';
import LibraryScreen from './screens/LibraryScreen';
import MouseScreen, { MouseItem } from './screens/MouseScreen';
import PlaceholderScreen from './screens/PlaceholderScreen';
import SettingsScreen from './screens/SettingsScreen';
import { theme } from './theme';

const TABS: TabItem[] = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'library', icon: 'game-controller', label: 'Jogos' },
  { key: 'enhance', icon: 'sparkles', label: 'Enhance' },
  { key: 'settings', icon: 'rocket', label: 'Ajustes' },
];

const TITLES: Record<string, string> = {
  home: 'Home',
  library: 'Biblioteca',
  enhance: 'Enhance',
  settings: 'Configurações',
};

const MICE_API_URL = 'https://exemulator.pro/up/mouse/';

function useFadeOverlay(visible: boolean) {
  const [mounted, setMounted] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(fade, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fade, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible]);

  return { mounted, fade };
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [enhanceSubTab, setEnhanceSubTab] = useState(ENHANCE_SUB_TABS.length - 1);
  const [dragShotVisible, setDragShotVisible] = useState(false);
  const [dragShotMs, setDragShotMs] = useState<number | null>(null);
  const [dragShotInfoVisible, setDragShotInfoVisible] = useState(false);
  const [mouseVisible, setMouseVisible] = useState(false);
  const [mice, setMice] = useState<MouseItem[]>([]);
  const [miceLoading, setMiceLoading] = useState(false);
  const [selectedMouse, setSelectedMouse] = useState<MouseItem | null>(null);
  const pagerRef = useRef<PagerView>(null);

  const dragShot = useFadeOverlay(dragShotVisible);
  const mouseOverlay = useFadeOverlay(mouseVisible);

  const goToPage = (index: number) => {
    pagerRef.current?.setPage(index);
  };

  const openMouseScreen = () => {
    setMouseVisible(true);
    if (mice.length === 0 && !miceLoading) {
      setMiceLoading(true);
      fetch(MICE_API_URL)
        .then((response) => response.json())
        .then((data: MouseItem[]) => setMice(data))
        .catch(() => {})
        .finally(() => setMiceLoading(false));
    }
  };

  const overlayTitle = dragShotVisible
    ? 'ACELERADOR DE ARRASTE'
    : mouseVisible
      ? 'EMULADOR DE DPI DO MOUSE'
      : '';

  const onOverlayBack = dragShotVisible
    ? () => setDragShotVisible(false)
    : () => setMouseVisible(false);

  const overlayRightButton = dragShotVisible
    ? { icon: 'information-circle-outline' as const, onPress: () => setDragShotInfoVisible(true) }
    : undefined;

  const overlayBarColor = dragShotVisible ? theme.colors.surface : 'transparent';

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <PagerView
          ref={pagerRef}
          style={styles.flex}
          initialPage={0}
          onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
        >
          {TABS.map((tab) => {
            if (tab.key === 'home') {
              return (
                <HomeScreen
                  key={tab.key}
                  selectedMouse={selectedMouse}
                  onOpenMouseScreen={openMouseScreen}
                />
              );
            }
            if (tab.key === 'library') {
              return (
                <LibraryScreen
                  key={tab.key}
                  dragShotMs={dragShotMs}
                  onOpenDragShot={() => setDragShotVisible(true)}
                />
              );
            }
            if (tab.key === 'settings') {
              return <SettingsScreen key={tab.key} />;
            }
            if (tab.key === 'enhance') {
              return (
                <EnhanceScreen
                  key={tab.key}
                  activeSubTab={enhanceSubTab}
                  onSubTabChange={setEnhanceSubTab}
                />
              );
            }
            return (
              <PlaceholderScreen key={tab.key} title={TITLES[tab.key]} icon={tab.icon} />
            );
          })}
        </PagerView>
        <GlassTabBar tabs={TABS} activeIndex={activeIndex} onChange={goToPage} />

        {dragShot.mounted && (
          <Animated.View
            style={[styles.overlay, { opacity: dragShot.fade }]}
            pointerEvents={dragShotVisible ? 'auto' : 'none'}
          >
            <DragShotScreen
              infoVisible={dragShotInfoVisible}
              onCloseInfo={() => setDragShotInfoVisible(false)}
              onApply={(ms) => {
                setDragShotMs(ms);
                setDragShotVisible(false);
              }}
              onGoHome={() => goToPage(0)}
            />
          </Animated.View>
        )}

        {mouseOverlay.mounted && (
          <Animated.View
            style={[styles.overlay, { opacity: mouseOverlay.fade }]}
            pointerEvents={mouseVisible ? 'auto' : 'none'}
          >
            <MouseScreen
              mice={mice}
              loading={miceLoading}
              selectedMouse={selectedMouse}
              onSelectMouse={setSelectedMouse}
            />
          </Animated.View>
        )}

        <Header
          activeIndex={activeIndex}
          subTabIndex={enhanceSubTab}
          onSubTabChange={setEnhanceSubTab}
          overlayActive={dragShotVisible || mouseVisible}
          overlayTitle={overlayTitle}
          overlayBarColor={overlayBarColor}
          onOverlayBack={onOverlayBack}
          overlayRightButton={overlayRightButton}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
});
