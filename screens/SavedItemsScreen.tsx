import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DiamondDotsIcon from '../components/DiamondDotsIcon';
import { HEADER_HEIGHT, SAVED_TABS_HEIGHT, SavedTab } from '../components/Header';
import RedShape from '../components/RedShape';
import { theme } from '../theme';

const TAB_BAR_HEIGHT = 68;

type Props = {
  savedTab: SavedTab;
};

export default function SavedItemsScreen({ savedTab }: Props) {
  const insets = useSafeAreaInsets();
  const headerClearance = HEADER_HEIGHT + insets.top + SAVED_TABS_HEIGHT;

  return (
    <View style={styles.container}>
      <View style={[styles.centerWrap, { paddingTop: headerClearance }]}>
        {savedTab === 'sensibilidades' ? (
          <>
            <RedShape size={64} radius={22}>
              <Ionicons name="bookmark" size={30} color={theme.colors.text} />
            </RedShape>
            <Text style={styles.title}>Nenhuma sensibilidade salva</Text>
            <Text style={styles.subtitle}>
              As sensibilidades que você salvar no chat vão aparecer aqui.
            </Text>
          </>
        ) : (
          <>
            <RedShape size={64} radius={22}>
              <DiamondDotsIcon size={28} color={theme.colors.text} />
            </RedShape>
            <Text style={styles.title}>Nenhum HUD salvo</Text>
            <Text style={styles.subtitle}>Os HUDs que você salvar vão aparecer aqui.</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: TAB_BAR_HEIGHT,
  },
  title: {
    marginTop: 18,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
