import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type ActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  buttonLabel: string;
};

function ActionCard({ icon, title, description, buttonLabel }: ActionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={24} color={theme.colors.text} />
        </View>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

export default function PerformanceActionsSection() {
  return (
    <View style={styles.section}>
      <ActionCard
        icon="flash"
        title="Redução de lag"
        description="Redução de lag: para melhorar a jogabilidade."
        buttonLabel="REDUZIR"
      />
      <ActionCard
        icon="hardware-chip-outline"
        title="Otimização de RAM"
        description="Otimização de RAM: para melhor desempenho."
        buttonLabel="OTIMIZAR"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flexDirection: 'row',
    marginTop: 56,
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    flex: 1,
    gap: 14,
  },
  title: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
