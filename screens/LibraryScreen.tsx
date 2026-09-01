import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GameFunctionsSection from '../components/GameFunctionsSection';
import GameVersionPicker from '../components/GameVersionPicker';
import { HEADER_HEIGHT } from '../components/Header';
import { theme } from '../theme';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: HEADER_HEIGHT + insets.top + 24, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <GameVersionPicker />

      <GameFunctionsSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
