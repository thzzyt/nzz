import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DeviceInfoSection from '../components/DeviceInfoSection';
import { HEADER_HEIGHT } from '../components/Header';
import PerformanceActionsSection from '../components/PerformanceActionsSection';
import SmartOptimizationCard from '../components/SmartOptimizationCard';
import { theme } from '../theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: HEADER_HEIGHT + insets.top + 24, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <SmartOptimizationCard />

      <PerformanceActionsSection />

      <DeviceInfoSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
