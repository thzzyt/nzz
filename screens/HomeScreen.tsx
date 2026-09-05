import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HEADER_HEIGHT } from '../components/Header';
import MelhoriasSection from '../components/MelhoriasSection';
import RedShape from '../components/RedShape';
import { MouseItem } from './MouseScreen';
import { theme } from '../theme';

const USER_EMAIL = 'thzzdeveloper@gmail.com';

type FeatureCard = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const FEATURES: FeatureCard[] = [
  { key: 'boost', icon: 'sync-outline', label: 'Aceleração\navançada' },
  { key: 'swipe', icon: 'hand-left-outline', label: 'Deslize de\ntela' },
  { key: 'resolution', icon: 'albums-outline', label: 'Resolução\ndo celular' },
];

type Props = {
  selectedMouse: MouseItem | null;
  onOpenMouseScreen: () => void;
  calibratorMs: number | null;
  onOpenCalibrator: () => void;
};

export default function HomeScreen({
  selectedMouse,
  onOpenMouseScreen,
  calibratorMs,
  onOpenCalibrator,
}: Props) {
  const insets = useSafeAreaInsets();
  const [floatingEnabled, setFloatingEnabled] = useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: HEADER_HEIGHT + insets.top + 24, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.userRow}>
        <RedShape size={36} radius={12}>
          <Ionicons name="person" size={18} color={theme.colors.text} />
        </RedShape>
        <Text style={styles.userEmail} numberOfLines={1}>
          {USER_EMAIL}
        </Text>
        <Text style={styles.brand}>EXTREME</Text>
      </View>

      <View style={styles.cardsRow}>
        {FEATURES.map((feature) => (
          <View key={feature.key} style={styles.card}>
            <Ionicons name={feature.icon} size={30} color={theme.colors.text} />
            <Text style={styles.cardLabel}>{feature.label}</Text>
            <RedShape size={32} radius={0} style={styles.cardArrow}>
              <Ionicons name="arrow-forward" size={14} color={theme.colors.text} />
            </RedShape>
          </View>
        ))}
      </View>

      <View style={styles.floatingSection}>
        <View style={styles.floatingHeader}>
          <Text style={styles.floatingTitle}>Extreme Floating</Text>
          <RedShape size={30} radius={10}>
            <Ionicons name="layers-outline" size={16} color={theme.colors.text} />
          </RedShape>
        </View>

        <View style={styles.floatingCard}>
          <View style={styles.floatingIcon}>
            <Text style={styles.floatingIconLetter}>E</Text>
          </View>

          <View style={styles.floatingBadge}>
            <RedShape size={16} radius={8}>
              <Ionicons name="add" size={10} color={theme.colors.text} />
            </RedShape>
            <Text style={styles.floatingBadgeText}>40%</Text>
          </View>

          <Text style={styles.floatingLabel} numberOfLines={1}>
            assistência no jogo.
          </Text>

          <Switch
            style={styles.floatingSwitch}
            value={floatingEnabled}
            onValueChange={setFloatingEnabled}
            trackColor={{ false: '#2A2A2A', true: theme.colors.accent }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#2A2A2A"
          />
        </View>
      </View>

      <MelhoriasSection
        selectedMouse={selectedMouse}
        onOpenMouseScreen={onOpenMouseScreen}
        calibratorMs={calibratorMs}
        onOpenCalibrator={onOpenCalibrator}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  userEmail: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  brand: {
    color: theme.colors.textMuted,
    fontSize: 15,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 28,
    gap: 12,
  },
  card: {
    flex: 1,
    aspectRatio: 0.85,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 12,
  },
  cardLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardArrow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 18,
  },
  floatingSection: {
    paddingHorizontal: 20,
    marginTop: 45,
  },
  floatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 25,
  },
  floatingTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  floatingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floatingIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingIconLetter: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: theme.colors.accent,
  },
  floatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  floatingBadgeText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  floatingLabel: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
  },
  floatingSwitch: {
    alignSelf: 'center',
  },
});
