import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RedShape from '../components/RedShape';
import { theme } from '../theme';

const COUNT_UP_DURATION_MS = 700;

function AnimatedCounter({ value, style }: { value: number; style?: TextStyle }) {
  const [display, setDisplay] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animValue.setValue(0);
    const listenerId = animValue.addListener(({ value: current }) => {
      setDisplay(Math.round(current));
    });
    Animated.timing(animValue, {
      toValue: value,
      duration: COUNT_UP_DURATION_MS,
      useNativeDriver: false,
    }).start();

    return () => animValue.removeListener(listenerId);
  }, [value]);

  return <Text style={style}>{display}</Text>;
}

const CONTENT_TOP_OFFSET = 100;
const MODAL_CLOSE_MS = 350;
const CONFIRM_DURATION_MS = 5000;
const ZONE_COUNT = 4;

const SPINNER_STAGE_MS = 1000;
const OBTAINED_STAGE_MS = 1300;
const VALUES_STAGE_MS = 1700;
const REVEAL_TOTAL_MS = SPINNER_STAGE_MS + OBTAINED_STAGE_MS + VALUES_STAGE_MS;
const REVEAL_SECONDS_LABEL = `${Math.round(REVEAL_TOTAL_MS / 1000)}s`;
const RESPONSE_OFFSET_MS = 4;

type ZoneStage = 'pending' | 'spinner' | 'obtained' | 'values' | 'done';

type ZoneValues = {
  analisado: number;
  resposta: number;
};

type Props = {
  onApply: (averageMs: number) => void;
  onGoHome: () => void;
};

export default function CalibratorScreen({ onApply, onGoHome }: Props) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [activatedAt, setActivatedAt] = useState(() => Date.now());
  const [zoneStages, setZoneStages] = useState<ZoneStage[]>(Array(ZONE_COUNT).fill('pending'));
  const [zoneValues, setZoneValues] = useState<(ZoneValues | null)[]>(
    Array(ZONE_COUNT).fill(null)
  );
  const [confirming, setConfirming] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [summaryShownAt, setSummaryShownAt] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const zoneValuesRef = useRef<(ZoneValues | null)[]>(Array(ZONE_COUNT).fill(null));
  const zoneDoneAtRef = useRef<(number | null)[]>(Array(ZONE_COUNT).fill(null));

  useEffect(() => {
    if (currentStep < ZONE_COUNT) {
      setActivatedAt(Date.now());
    }
  }, [currentStep]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  const setStage = (index: number, stage: ZoneStage) => {
    setZoneStages((current) => {
      const next = [...current];
      next[index] = stage;
      return next;
    });
  };

  const startConfirm = (values: ZoneValues[]) => {
    setConfirming(true);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: CONFIRM_DURATION_MS,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      setConfirming(false);
      const average = Math.round(
        values.reduce((sum, value) => sum + value.analisado, 0) / values.length
      );
      onApply(average);
      setTimeout(onGoHome, MODAL_CLOSE_MS);
    }, CONFIRM_DURATION_MS);
  };

  const handlePressZone = (index: number) => {
    if (index !== currentStep || zoneStages[index] !== 'pending') return;

    const analisado = Date.now() - activatedAt;
    const resposta = analisado + RESPONSE_OFFSET_MS;
    const values: ZoneValues = { analisado, resposta };
    zoneValuesRef.current[index] = values;

    setZoneValues((current) => {
      const next = [...current];
      next[index] = values;
      return next;
    });
    setStage(index, 'spinner');

    timeouts.current.push(
      setTimeout(() => setStage(index, 'obtained'), SPINNER_STAGE_MS),
      setTimeout(() => setStage(index, 'values'), SPINNER_STAGE_MS + OBTAINED_STAGE_MS),
      setTimeout(() => {
        setStage(index, 'done');
        zoneDoneAtRef.current[index] = Date.now();
        if (index === ZONE_COUNT - 1) {
          setSummaryShownAt(Date.now());
          setResultsVisible(true);
        } else {
          setCurrentStep(index + 1);
        }
      }, REVEAL_TOTAL_MS)
    );
  };

  const handleRealizarCalibracao = () => {
    setResultsVisible(false);
    const allValues = zoneValuesRef.current.filter(
      (value): value is ZoneValues => value !== null
    );
    startConfirm(allValues);
  };

  const renderZone = (index: number) => {
    const stage = zoneStages[index];
    const values = zoneValues[index];
    const isActive = index === currentStep && stage === 'pending';

    return (
      <Pressable
        key={index}
        style={styles.zone}
        onPress={() => handlePressZone(index)}
        disabled={stage !== 'pending'}
      >
        {stage === 'pending' &&
          (isActive ? (
            <Text style={styles.zoneActive}>TOQUE {index + 1}</Text>
          ) : (
            <Text style={styles.zoneIdle}>{index + 1}</Text>
          ))}

        {(stage === 'spinner' || stage === 'obtained') && (
          <View style={styles.zoneBadge}>
            <ActivityIndicator color={theme.colors.accent} size="small" />
          </View>
        )}

        {stage === 'obtained' && <Text style={styles.obtainedCaption}>[ Valores obtidos ]</Text>}

        {(stage === 'values' || stage === 'done') && (
          <>
            {stage === 'values' ? (
              <View style={styles.zoneBadge}>
                <View style={styles.tickMark} />
              </View>
            ) : (
              <View style={styles.zoneBadgeDone}>
                <Text style={styles.zoneBadgeDoneText}>{REVEAL_SECONDS_LABEL}</Text>
              </View>
            )}
            {values && (
              <View style={styles.valuesWrap}>
                <Text style={styles.valuesText}>
                  Valor analisado: <AnimatedCounter value={values.analisado} />
                </Text>
                <Text style={styles.valuesText}>
                  Valor de resposta: <AnimatedCounter value={values.resposta} />
                </Text>
              </View>
            )}
          </>
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + CONTENT_TOP_OFFSET,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <View style={styles.row}>
        {renderZone(0)}
        {renderZone(1)}
      </View>
      <View style={styles.row}>
        {renderZone(2)}
        {renderZone(3)}
      </View>

      {resultsVisible && (
        <View style={[styles.resultsBackdrop, StyleSheet.absoluteFillObject]}>
          <View style={styles.resultsCard}>
            <RedShape size={56} radius={28}>
              <Ionicons name="checkmark" size={26} color={theme.colors.text} />
            </RedShape>

            <Text style={styles.resultsTitle}>DADOS PARA CALIBRAÇÃO</Text>
            <Text style={styles.resultsSubtitle}>
              Aqui estão os resultados da análise de calibração do toque da tela:
            </Text>

            <View style={styles.resultsList}>
              {zoneValues.map((values, index) => {
                if (!values) return null;
                const doneAt = zoneDoneAtRef.current[index] ?? summaryShownAt;
                const seconds = Math.max(1, Math.round((summaryShownAt - doneAt) / 1000));

                return (
                  <View key={index} style={styles.resultRow}>
                    <Text style={styles.resultIndex}>#{index + 1}</Text>
                    <View style={styles.resultValues}>
                      <View style={styles.resultValueLine}>
                        <Text style={styles.resultLabel}>Valor analisado</Text>
                        <View style={styles.resultPill}>
                          <AnimatedCounter value={values.analisado} style={styles.resultPillText} />
                        </View>
                      </View>
                      <View style={styles.resultValueLine}>
                        <Text style={styles.resultLabel}>Valor de resposta</Text>
                        <View style={styles.resultPill}>
                          <AnimatedCounter value={values.resposta} style={styles.resultPillText} />
                        </View>
                      </View>
                    </View>
                    <View style={styles.resultBadge}>
                      <Text style={styles.resultBadgeText}>{seconds}s</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <Pressable
              style={[styles.realizarButton, styles.realizarButtonSpacing]}
              onPress={handleRealizarCalibracao}
            >
              <Text style={styles.realizarButtonText}>REALIZAR CALIBRAÇÃO</Text>
            </Pressable>
          </View>
        </View>
      )}

      {confirming && (
        <View style={[styles.confirmBackdrop, StyleSheet.absoluteFillObject]}>
          <View style={styles.confirmCard}>
            <ActivityIndicator color={theme.colors.text} size="small" />
            <Text style={styles.confirmText}>Calibrando toque da tela...</Text>
            <View style={styles.confirmTrack}>
              <Animated.View
                style={[
                  styles.confirmFill,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  zone: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  zoneActive: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  zoneIdle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '500',
  },
  zoneBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickMark: {
    width: 3,
    height: 18,
    borderRadius: 1.5,
    backgroundColor: theme.colors.accent,
  },
  zoneBadgeDone: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneBadgeDoneText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  obtainedCaption: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  valuesWrap: {
    alignItems: 'center',
    gap: 6,
  },
  valuesText: {
    color: theme.colors.text,
    fontSize: 13,
  },
  resultsBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 40,
  },
  resultsCard: {
    width: '100%',
    backgroundColor: '#1A0A0A',
    borderRadius: 24,
    padding: 24,
  },
  resultsTitle: {
    marginTop: 16,
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  resultsSubtitle: {
    marginTop: 10,
    marginBottom: 20,
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  resultsList: {
    gap: 20,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  resultIndex: {
    width: 40,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  resultValues: {
    flex: 1,
    gap: 14,
  },
  resultValueLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultLabel: {
    color: theme.colors.text,
    fontSize: 14,
  },
  resultPill: {
    minWidth: 36,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultPillText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  resultBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBadgeText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  realizarButtonSpacing: {
    marginTop: 24,
  },
  realizarButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  realizarButtonText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  confirmBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 30,
  },
  confirmCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  confirmText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  confirmFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
  },
});
