import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RedShape from '../components/RedShape';
import { theme } from '../theme';

const CONTENT_TOP_OFFSET = 100;

export type MouseItem = {
  dpi: string;
  img: string;
  modelo: string;
};

type Props = {
  mice: MouseItem[];
  loading: boolean;
  selectedMouse: MouseItem | null;
  onSelectMouse: (mouse: MouseItem) => void;
};

export default function MouseScreen({ mice, loading, selectedMouse, onSelectMouse }: Props) {
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<PagerView>(null);
  const [detailMouse, setDetailMouse] = useState<MouseItem | null>(selectedMouse);

  const selectMouse = (mouse: MouseItem) => {
    setDetailMouse(mouse);
    onSelectMouse(mouse);
    pagerRef.current?.setPage(1);
  };

  const goToList = () => {
    pagerRef.current?.setPage(0);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + CONTENT_TOP_OFFSET }]}>
      <PagerView
        ref={pagerRef}
        style={styles.flex}
        initialPage={selectedMouse ? 1 : 0}
      >
        <View key="list" style={styles.page}>
          {loading ? (
            <ActivityIndicator color={theme.colors.text} style={styles.loading} />
          ) : (
            <FlatList
              data={mice}
              keyExtractor={(item) => item.modelo}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable style={styles.card} onPress={() => selectMouse(item)}>
                  <View style={styles.cardImageWrap}>
                    <Image
                      source={{ uri: item.img }}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                    <RedShape size={30} radius={15} style={styles.cardBadge}>
                      <MaterialCommunityIcons name="mouse" size={16} color={theme.colors.text} />
                    </RedShape>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardModel} numberOfLines={1}>
                      {item.modelo}
                    </Text>
                    <View style={styles.cardDpiRow}>
                      <Text style={styles.cardDpiText}>{item.dpi} DPI</Text>
                      <RedShape size={36} radius={18}>
                        <Ionicons name="arrow-forward" size={18} color={theme.colors.text} />
                      </RedShape>
                    </View>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>

        <View key="detail" style={styles.page}>
          {detailMouse && (
            <View style={[styles.detailWrap, { paddingBottom: insets.bottom + 20 }]}>
              <RedShape size={44} radius={22}>
                <MaterialCommunityIcons name="mouse" size={22} color={theme.colors.text} />
              </RedShape>
              <Text style={styles.detailDpi}>{detailMouse.dpi} DPI</Text>
              <View style={styles.detailCard}>
                <View style={styles.detailImageWrap}>
                  <Image
                    source={{ uri: detailMouse.img }}
                    style={styles.detailImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.detailFooter}>
                  <Text style={styles.detailModel}>{detailMouse.modelo}</Text>
                </View>
              </View>
              <View style={styles.spacer} />
              <Pressable style={styles.swapButton} onPress={goToList}>
                <Ionicons name="sync-outline" size={16} color={theme.colors.text} />
                <Text style={styles.swapButtonText}>TROCAR MOUSE</Text>
              </Pressable>
            </View>
          )}
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    marginTop: 60,
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 14,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardImageWrap: {
    backgroundColor: '#FFFFFF',
    aspectRatio: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '75%',
    height: '75%',
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  cardFooter: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    gap: 12,
  },
  cardModel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  cardDpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDpiText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  detailWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  detailDpi: {
    marginTop: 20,
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 32,
  },
  detailCard: {
    width: '65%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  detailImageWrap: {
    width: '100%',
    aspectRatio: 1.1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  detailImage: {
    width: '75%',
    height: '75%',
  },
  detailFooter: {
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  detailModel: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
  swapButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  swapButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
