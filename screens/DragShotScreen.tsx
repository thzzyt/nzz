import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';

const MODAL_CLOSE_MS = 350;

const CONFIRM_DURATION_MS = 5000;

const CONTENT_TOP_OFFSET = 100;

type Props = {
  infoVisible: boolean;
  onCloseInfo: () => void;
  onApply: (ms: number) => void;
  onGoHome: () => void;
};

export default function DragShotScreen({ infoVisible, onCloseInfo, onApply, onGoHome }: Props) {
  const insets = useSafeAreaInsets();
  const [ms, setMs] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [touches, setTouches] = useState<number[]>([]);
  const [confirming, setConfirming] = useState(false);
  const dotPosition = useRef(new Animated.ValueXY()).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const startTimeRef = useRef(0);

  const minMs = touches.length > 0 ? Math.min(...touches) : null;

  const confirmAndGoHome = (value: number) => {
    setConfirming(true);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: CONFIRM_DURATION_MS,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      setConfirming(false);
      onApply(value);
      setTimeout(onGoHome, MODAL_CLOSE_MS);
    }, CONFIRM_DURATION_MS);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          startTimeRef.current = Date.now();
          dotPosition.setValue({ x: locationX, y: locationY });
          setMs(0);
          setDragging(true);
          Animated.timing(dotOpacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          dotPosition.setValue({ x: locationX, y: locationY });
          setMs(Date.now() - startTimeRef.current);
        },
        onPanResponderRelease: () => {
          const finalMs = Date.now() - startTimeRef.current;
          setMs(finalMs);
          if (finalMs > 0) {
            setTouches((current) => [...current, finalMs]);
          }
          setDragging(false);
          Animated.timing(dotOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          setDragging(false);
          Animated.timing(dotOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        },
      }),
    []
  );

  const canApply = ms > 0;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + CONTENT_TOP_OFFSET, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <Text style={styles.msValue}>
        {ms} <Text style={styles.msUnit}>ms</Text>
      </Text>

      <View style={styles.dragBox} {...panResponder.panHandlers}>
        {minMs !== null && (
          <View style={styles.minBar}>
            <View>
              <Text style={styles.minLabel}>Arraste mínimo calculado:</Text>
              <Text style={styles.minValue}>{minMs} ms</Text>
            </View>
            <Pressable
              style={styles.minConfirmButton}
              onPress={() => confirmAndGoHome(minMs)}
              hitSlop={8}
            >
              <Ionicons name="checkmark" size={22} color={theme.colors.text} />
            </Pressable>
          </View>
        )}

        {!dragging && ms === 0 && minMs === null && (
          <View style={styles.hintWrap} pointerEvents="none">
            <Ionicons name="hand-left-outline" size={32} color={theme.colors.textMuted} />
            <Text style={styles.hintText}>
              Arraste aqui do jeito que você{'\n'}arrasta para atirar no jogo
            </Text>
          </View>
        )}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dot,
            {
              opacity: dotOpacity,
              transform: [
                { translateX: Animated.subtract(dotPosition.x, 22) },
                { translateY: Animated.subtract(dotPosition.y, 22) },
              ],
            },
          ]}
        />
      </View>

      <Pressable
        style={[styles.applyButton, !canApply && styles.applyButtonDisabled]}
        disabled={!canApply}
        onPress={() => confirmAndGoHome(ms)}
      >
        <Text style={[styles.applyButtonText, !canApply && styles.applyButtonTextDisabled]}>
          APLICAR VELOCIDADE
        </Text>
      </Pressable>

      {infoVisible && (
        <Pressable
          style={[styles.infoBackdrop, StyleSheet.absoluteFill]}
          onPress={onCloseInfo}
        >
          <Pressable style={styles.infoCard} onPress={() => {}}>
            <View style={styles.infoTitleRow}>
              <Ionicons name="warning" size={20} color={theme.colors.accent} />
              <Text style={styles.infoTitle}>ACELERADOR DE ARRASTE</Text>
            </View>
            <Text style={styles.infoText}>
              Faça o movimento de arraste dentro da caixa para definir o ponto de corte do
              tempo de atraso de resposta.
            </Text>
            <Text style={styles.infoText}>Quando estiver satisfeito, toque em Definir.</Text>
            <Pressable style={styles.infoNextButton} onPress={onCloseInfo} hitSlop={8}>
              <Text style={styles.infoNextText}>Próximo</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}

      {confirming && (
        <View style={[styles.confirmBackdrop, StyleSheet.absoluteFill]}>
          <View style={styles.confirmCard}>
            <ActivityIndicator color={theme.colors.text} size="small" />
            <Text style={styles.confirmText}>Calibrando velocidade de arraste...</Text>
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
    paddingHorizontal: 20,
  },
  msValue: {
    color: theme.colors.text,
    fontSize: 56,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
  },
  msUnit: {
    fontSize: 30,
    fontWeight: '700',
  },
  dragBox: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  minBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    zIndex: 1,
  },
  minLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  minValue: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  minConfirmButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintWrap: {
    alignItems: 'center',
    gap: 10,
  },
  hintText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  dot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
  },
  applyButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#3A1414',
  },
  applyButtonText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  applyButtonTextDisabled: {
    color: 'rgba(255,255,255,0.4)',
  },
  infoBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  infoCard: {
    width: '90%',
    backgroundColor: '#2B1414',
    borderRadius: 20,
    padding: 24,
    gap: 14,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoTitle: {
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '800',
  },
  infoText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 22,
  },
  infoNextButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  infoNextText: {
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '600',
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
