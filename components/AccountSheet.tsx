import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';

const USER_EMAIL = 'thzzdeveloper@gmail.com';
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.8;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AccountSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > DISMISS_DISTANCE || gestureState.vy > DISMISS_VELOCITY) {
            onClose();
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 4,
            }).start();
          }
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [onClose]
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 24, transform: [{ translateY }] },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View {...panResponder.panHandlers} style={styles.dragZone}>
            <View style={styles.handle} />
          </View>

          <View style={styles.languageRow}>
            <Text style={styles.flagEmoji}>🇧🇷</Text>
            <Text style={styles.languageLabel}>Idioma do aplicativo</Text>
            <Text style={styles.languageValue}>PT</Text>
            <Pressable style={styles.iconCircleSmall} hitSlop={8}>
              <Ionicons name="sync-outline" size={16} color={theme.colors.text} />
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Sobre seu acesso:</Text>

          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={20} color={theme.colors.text} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Usuário:</Text>
              <Text style={styles.rowValue}>
                {USER_EMAIL} <Text style={styles.rowValueMuted}>#2500</Text>
              </Text>
            </View>
            <Pressable style={styles.logoutButton} hitSlop={8}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.accessHeaderRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={20} color={theme.colors.text} />
            </View>
            <Text style={styles.accessTitle}>Tempo de acesso:</Text>
            <Text style={styles.daysRemainingLabel}>Dias restantes:</Text>
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressPercent}>3%</Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.daysRemainingValue}>29 dias</Text>
          </View>

          <Text style={styles.sectionTitle}>Contribua com a EX:</Text>

          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="file-tray-outline" size={20} color={theme.colors.text} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Enviar sugestões</Text>
              <Text style={styles.rowSubtitle}>
                Sugestões para melhorar o app, anotaremos todas!
              </Text>
            </View>
            <Pressable style={styles.suggestionButton}>
              <Text style={styles.suggestionButtonText}>ENVIAR SUGESTÃO</Text>
            </Pressable>
          </View>

          <Pressable style={styles.supportButton}>
            <Ionicons name="mail-outline" size={18} color={theme.colors.text} />
            <Text style={styles.supportButtonText}>CONTATAR SUPORTE</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  dragZone: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  flagEmoji: {
    fontSize: 20,
  },
  languageLabel: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  languageValue: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  iconCircleSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#232323',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  rowValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  rowValueMuted: {
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  rowSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  accessTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  daysRemainingLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  progressPercent: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '3%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
  },
  daysRemainingValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  suggestionButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  supportButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  supportButtonText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
