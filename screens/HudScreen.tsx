import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { cacheDirectory, downloadAsync } from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DiamondDotsIcon from '../components/DiamondDotsIcon';
import { HEADER_HEIGHT } from '../components/Header';
import RedShape from '../components/RedShape';
import { theme } from '../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const animateNext = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};

const OPTIONS = [
  { key: '2', fingers: 2 },
  { key: '3', fingers: 3 },
  { key: '4', fingers: 4 },
];

const HUDS_API_URL = 'https://exemulator.pro/up/huds/';
const HUD_ORIGIN = 'https://exemulator.pro/';

type Phase = 'idle' | 'preparing' | 'generating' | 'done';

type HudItem = {
  name: string;
  url: string;
  pasta: string;
};

type HudsResponse = {
  '2dedos': HudItem[];
  '3dedos': HudItem[];
  '4dedos': HudItem[];
};

export default function HudScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [percent, setPercent] = useState(0);
  const [hudsData, setHudsData] = useState<HudsResponse | null>(null);
  const [activeHud, setActiveHud] = useState<HudItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [hudSaved, setHudSaved] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(HUDS_API_URL)
      .then((response) => response.json())
      .then((data: HudsResponse) => setHudsData(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const selectOption = (fingers: number) => {
    if (selected === null) {
      animateNext();
    }
    setSelected(fingers);
  };

  const startGeneration = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    animateNext();
    setPercent(0);
    setPhase('preparing');
    setHudSaved(false);

    const list = selected ? hudsData?.[`${selected}dedos` as keyof HudsResponse] : undefined;
    const randomHud = list && list.length > 0 ? list[Math.floor(Math.random() * list.length)] : null;
    setActiveHud(randomHud);

    setTimeout(() => {
      animateNext();
      setPhase('generating');
      intervalRef.current = setInterval(() => {
        setPercent((current) => {
          const next = Math.min(100, current + Math.random() + 1);
          if (next >= 100 && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            animateNext();
            setPhase('done');
          }
          return next;
        });
      }, 300);
    }, 900);
  };

  const resetToSelection = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    animateNext();
    setPercent(0);
    setSelected(null);
    setPhase('idle');
  };

  const saveToGallery = async () => {
    if (!activeHud || saving) return;
    setSaving(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Autorize o acesso às fotos nos Ajustes do iPhone para salvar o HUD.'
        );
        return;
      }

      const localUri = cacheDirectory + activeHud.name;
      const download = await downloadAsync(HUD_ORIGIN + activeHud.url, localUri);
      await MediaLibrary.saveToLibraryAsync(download.uri);
      Alert.alert('HUD salvo!', 'A imagem foi salva na sua galeria.');
    } catch {
      Alert.alert('Erro ao salvar', 'Não foi possível salvar o HUD na galeria.');
    } finally {
      setSaving(false);
    }
  };

  const toggleHudSaved = () => {
    animateNext();
    setHudSaved((prev) => !prev);
  };

  return (
    <View style={[styles.container, { paddingTop: HEADER_HEIGHT + insets.top + 24 }]}>
      <RedShape size={64} radius={32}>
        <DiamondDotsIcon />
      </RedShape>

      <Text style={styles.title}>HUD I.A.</Text>

      {phase === 'idle' && (
        <>
          <Text style={styles.subtitle}>
            Selecione o número de dedos{'\n'}para começar a gerar o HUD:
          </Text>

          <View style={styles.options}>
            {OPTIONS.map((option) => {
              const isSelected = option.fingers === selected;
              return (
                <Pressable
                  key={option.key}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => selectOption(option.fingers)}
                >
                  <Ionicons name="hand-left-outline" size={30} color={theme.colors.text} />
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={12} color={theme.colors.accent} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {selected !== null && (
            <Pressable style={styles.generateButton} onPress={startGeneration}>
              <DiamondDotsIcon />
              <Text style={styles.generateButtonText}>GERAR HUD</Text>
            </Pressable>
          )}
        </>
      )}

      {phase === 'preparing' && (
        <View style={styles.preparingRow}>
          <View style={styles.smallIconBox}>
            <Ionicons name="sparkles-outline" size={18} color={theme.colors.accent} />
          </View>
          <Text style={styles.preparingText}>Preparando a próxima geração de HUDs...</Text>
        </View>
      )}

      {(phase === 'generating' || phase === 'done') && selected !== null && (
        <View style={styles.generationWrap}>
          {phase === 'generating' && (
            <View style={styles.progressRow}>
              <View style={styles.smallIconBox}>
                <ActivityIndicator color={theme.colors.text} size="small" />
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.progressPercent}>[{Math.round(percent)}%]</Text>
            </View>
          )}

          <View style={styles.mediaCard}>
            {activeHud ? (
              <Image
                source={{ uri: HUD_ORIGIN + activeHud.url }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.mediaFallback]} />
            )}
            {phase === 'generating' && (
              <BlurView
                intensity={(1 - percent / 100) * 100}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            )}
            {phase === 'generating' && (
              <View style={styles.mediaOverlayContent}>
                <View style={styles.sparkleBox}>
                  <Ionicons name="sparkles" size={22} color={theme.colors.text} />
                </View>
                <Text style={styles.mediaText}>
                  Gerando HUD <Text style={styles.mediaTextBold}>[Aguarde]</Text>
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footerRow}>
            <RedShape size={40} radius={14}>
              <Ionicons name="hand-left-outline" size={20} color={theme.colors.text} />
            </RedShape>
            <Text style={styles.footerText}>
              HUD <Text style={styles.footerTextBold}>[{selected} DEDOS]</Text>
            </Text>
            <Pressable
              style={[styles.saveButton, phase !== 'done' && styles.saveButtonDisabled]}
              onPress={saveToGallery}
              disabled={phase !== 'done' || saving}
            >
              {saving ? (
                <ActivityIndicator color={theme.colors.text} size="small" />
              ) : (
                <Ionicons name="download-outline" size={16} color={theme.colors.text} />
              )}
              <Text style={styles.saveButtonText}>SALVAR</Text>
            </Pressable>
          </View>

          {phase === 'generating' ? (
            <View style={styles.bottomButtonDisabled}>
              <Ionicons name="sync-outline" size={16} color={theme.colors.textMuted} />
              <Text style={styles.bottomButtonDisabledText}>GERANDO HUD...</Text>
            </View>
          ) : (
            <>
              <Pressable style={styles.regenerateButton} onPress={resetToSelection}>
                <Ionicons name="reload-outline" size={16} color={theme.colors.background} />
                <Text style={styles.regenerateButtonText}>GERAR NOVAMENTE</Text>
              </Pressable>

              <Pressable
                style={[styles.saveOutlineButton, hudSaved && styles.saveOutlineButtonActive]}
                onPress={toggleHudSaved}
              >
                <Ionicons
                  name={hudSaved ? 'bookmark' : 'bookmark-outline'}
                  size={16}
                  color={theme.colors.text}
                />
                <Text style={styles.saveOutlineButtonText}>
                  {hudSaved ? 'HUD SALVO' : 'SALVAR HUD'}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 20,
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 10,
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    width: '100%',
  },
  card: {
    flex: 1,
    paddingVertical: 22,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  generateButton: {
    width: '100%',
    marginTop: 20,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  generateButtonText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  preparingRow: {
    width: '100%',
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  smallIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preparingText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
  },
  generationWrap: {
    width: '100%',
    marginTop: 24,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
  progressPercent: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  mediaCard: {
    width: '100%',
    aspectRatio: 18/9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  mediaFallback: {
    backgroundColor: theme.colors.surface,
  },
  mediaOverlayContent: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sparkleBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaText: {
    color: theme.colors.text,
    fontSize: 14,
  },
  mediaTextBold: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  footerRow: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  footerTextBold: {
    color: theme.colors.accent,
    fontWeight: '800',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
  },
  saveButtonDisabled: {
    backgroundColor: '#3A3A3A',
    opacity: 0.6,
  },
  saveButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  bottomButtonDisabled: {
    marginTop: 16,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  bottomButtonDisabledText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  regenerateButton: {
    marginTop: 16,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  regenerateButtonText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: '800',
  },
  saveOutlineButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveOutlineButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  saveOutlineButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
});
