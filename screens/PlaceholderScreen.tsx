import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function PlaceholderScreen({ title, icon }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={theme.colors.accent} />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
});
