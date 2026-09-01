import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import RedShape from './RedShape';

export default function MelhoriasSection() {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Melhorias</Text>
        <RedShape size={30} radius={10}>
          <Ionicons name="settings-outline" size={16} color={theme.colors.text} />
        </RedShape>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.dpiCard}>
          <View style={styles.dpiIconBox}>
            <MaterialCommunityIcons name="mouse-outline" size={48} color={theme.colors.text} />
            <RedShape size={32} radius={0} style={styles.dpiBadge}>
              <MaterialCommunityIcons name="mouse" size={16} color={theme.colors.text} />
            </RedShape>
          </View>
          <Text style={styles.dpiLabel}>DPI DO MOUSE</Text>
          <Pressable style={styles.pillButton}>
            <Text style={styles.pillButtonText}>EMULAR</Text>
          </Pressable>
        </View>

        <View style={styles.speedCard}>
          <Text style={styles.cardTitle}>Velocidade da tela</Text>
          <View style={styles.speedIconBox}>
            <Ionicons name="speedometer-outline" size={48} color={theme.colors.text} />
          </View>
          <Pressable style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>AUMENTAR</Text>
            <RedShape size={32} radius={16}>
              <Ionicons name="chevron-forward" size={17} color={theme.colors.text} />
            </RedShape>
          </Pressable>
        </View>

        <View style={styles.calibratorCard}>
          <Text style={styles.cardTitle}>Calibrador</Text>
          <Text style={styles.cardSubtitle}>Acelere o atraso do toque.</Text>
          <View style={styles.blocksBox}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.block} />
            ))}
          </View>
          <Pressable style={[styles.pillButton, styles.calibrateButton]}>
            <Text style={styles.pillButtonText}>CALIBRAR</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_RADIUS = 18;
const SECTION_MAX_HEIGHT = 210;

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    height: SECTION_MAX_HEIGHT,
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 40,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  cardSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: -5,
    marginBottom: 10,
  },
  dpiCard: {
    width: 144,
    height: '100%',
  },
  dpiIconBox: {
    width: 144,
    flex: 1,
    borderRadius: CARD_RADIUS,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpiBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 14,
    borderBottomRightRadius: CARD_RADIUS,
  },
  dpiLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  pillButton: {
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  speedCard: {
    width: 240,
    height: '100%',
  },
  speedIconBox: {
    width: 240,
    flex: 1,
    borderRadius: CARD_RADIUS,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 7,
    paddingLeft: 18,
  },
  outlineButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  calibratorCard: {
    width: 228,
    height: '100%',
  },
  blocksBox: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 10,
    gap: 8,
  },
  block: {
    flex: 1,
    height: '100%',
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
  },
  calibrateButton: {
    marginTop: 10,
  },
});
