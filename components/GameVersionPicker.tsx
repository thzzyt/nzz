import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { theme } from '../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const animateNext = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};

const FREE_FIRE_API_URL = 'https://exemulator.pro/up/freefire/';
const SURFACE_TRANSLUCENT = 'rgba(22, 22, 22, 0.7)';

type FFVariant = {
  tipo: string;
  package: string;
  v: string;
  img: string;
};

type FFResponse = {
  formulario: string;
  nackground: string;
  ff: FFVariant[];
};

type Phase = 'idle' | 'loading' | 'loaded' | 'selected' | 'error';

function variantName(variant: FFVariant) {
  return `Free Fire${variant.tipo ? ` ${variant.tipo}` : ''}`;
}

function AnimatedRow({ index, children }: { index: number; children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export default function GameVersionPicker() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [variants, setVariants] = useState<FFVariant[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const loadVersions = async () => {
    setPhase('loading');
    try {
      const response = await fetch(FREE_FIRE_API_URL);
      const data: FFResponse = await response.json();
      animateNext();
      setVariants(data.ff ?? []);
      setPhase('loaded');
    } catch {
      animateNext();
      setPhase('error');
    }
  };

  const openFreeFire = () => {
    Linking.openURL('freefire://').catch(() => {});
  };

  const selectVariant = (index: number) => {
    animateNext();
    setSelectedIndex(index);
  };

  const confirmSelection = () => {
    animateNext();
    setPhase('selected');
  };

  const backToList = () => {
    animateNext();
    setPhase('loaded');
  };

  if (phase === 'selected' && selectedIndex !== null) {
    const variant = variants[selectedIndex];
    return (
      <View style={styles.section}>
        <View style={styles.selectedCard}>
          <Image source={{ uri: variant.img }} style={styles.selectedImage} />
          <View style={styles.rowText}>
            <Text style={styles.selectedName}>{variantName(variant)}</Text>
            <Text style={styles.rowVersion}>{variant.v}</Text>
          </View>

          <Pressable style={styles.actionButton} onPress={backToList}>
            <Ionicons name="refresh-outline" size={20} color={theme.colors.text} />
          </Pressable>

          <Pressable style={styles.actionButton} onPress={openFreeFire}>
            <Ionicons name="game-controller" size={20} color={theme.colors.text} />
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === 'loaded' && variants.length > 0) {
    return (
      <View style={styles.section}>
        <View style={styles.list}>
          {variants.map((variant, index) => {
            const isSelected = index === selectedIndex;
            return (
              <AnimatedRow key={`${variant.package}-${variant.tipo}-${index}`} index={index}>
                <Pressable
                  style={[styles.row, isSelected && styles.rowSelected]}
                  onPress={() => selectVariant(index)}
                >
                  <View style={styles.rowImageWrap}>
                    <Image source={{ uri: variant.img }} style={styles.rowImage} />
                    {!!variant.tipo && (
                      <View style={styles.typeTag}>
                        <Text style={styles.typeTagText}>{variant.tipo}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowName}>{variantName(variant)}</Text>
                    <Text style={styles.rowVersion}>{variant.v}</Text>
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                </Pressable>
              </AnimatedRow>
            );
          })}
        </View>

        {selectedIndex !== null && (
          <Pressable style={styles.selectButton} onPress={confirmSelection}>
            <Text style={styles.selectButtonText}>SELECIONAR</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.addIcon}>
        <Ionicons name="add" size={22} color={theme.colors.text} />
      </View>
      <Text style={styles.cardText}>Selecione sua versão do FF</Text>
      <Pressable style={styles.cardButton} onPress={loadVersions} disabled={phase === 'loading'}>
        {phase === 'loading' ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.cardButtonText}>Selecionar</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    gap: 14,
    backgroundColor: SURFACE_TRANSLUCENT,
    borderRadius: 20,
    padding: 16,
  },
  addIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  cardButton: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#DADADA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: SURFACE_TRANSLUCENT,
    borderRadius: 16,
    padding: 12,
  },
  rowSelected: {
    backgroundColor: 'rgba(222, 0, 0, 0.1)',
  },
  rowImageWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
  },
  rowImage: {
    width: '100%',
    height: '100%',
  },
  typeTag: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: theme.colors.accent,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 12,
  },
  typeTagText: {
    color: theme.colors.text,
    fontSize: 9,
    fontWeight: '800',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  rowVersion: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  selectButton: {
    alignSelf: 'center',
    marginTop: 16,
    height: 48,
    paddingHorizontal: 40,
    borderRadius: 24,
    backgroundColor: '#DADADA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: SURFACE_TRANSLUCENT,
    borderRadius: 20,
    padding: 14,
  },
  selectedName: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  selectedImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
  },
  actionButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
