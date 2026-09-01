import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GlassTabBar, { TabItem } from './components/GlassTabBar';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import LibraryScreen from './screens/LibraryScreen';
import PlaceholderScreen from './screens/PlaceholderScreen';
import { theme } from './theme';

const TABS: TabItem[] = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'library', icon: 'game-controller', label: 'Jogos' },
  { key: 'enhance', icon: 'sparkles', label: 'Enhance' },
  { key: 'settings', icon: 'settings', label: 'Ajustes' },
];

const TITLES: Record<string, string> = {
  home: 'Home',
  library: 'Biblioteca',
  enhance: 'Enhance',
  settings: 'Configurações',
};

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const goToPage = (index: number) => {
    pagerRef.current?.setPage(index);
  };

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
              return <HomeScreen key={tab.key} />;
            }
            if (tab.key === 'library') {
              return <LibraryScreen key={tab.key} />;
            }
            return (
              <PlaceholderScreen key={tab.key} title={TITLES[tab.key]} icon={tab.icon} />
            );
          })}
        </PagerView>
        <Header activeIndex={activeIndex} />
        <GlassTabBar tabs={TABS} activeIndex={activeIndex} onChange={goToPage} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
