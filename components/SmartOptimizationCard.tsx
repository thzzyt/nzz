import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  LayoutAnimation,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import {
  GestureEvent,
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';
import { theme } from '../theme';
import RedShape from './RedShape';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const animateNext = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};

const MAX_LEVEL = 3;
const KNOB_SIZE = 40;
const TRACK_HEIGHT = 50;
const TRACK_PADDING = 5;

function levelFromProgress(progress: number) {
  return Math.round(progress * (MAX_LEVEL - 1)) + 1;
}

function progressFromLevel(level: number) {
  return (level - 1) / (MAX_LEVEL - 1);
}

export default function SmartOptimizationCard() {
  const [trackWidth, setTrackWidth] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const updateFromX = (x: number) => {
    if (!trackWidth) return;
    const clamped = Math.max(0, Math.min(trackWidth, x));
    const rawProgress = clamped / trackWidth;
    const snappedProgress = progressFromLevel(levelFromProgress(rawProgress));
    setProgress(snappedProgress);
    setHasInteracted((prev) => {
      if (!prev) {
        animateNext();
        return true;
      }
      return prev;
    });
  };

  const onGestureEvent = (event: GestureEvent<PanGestureHandlerEventPayload>) => {
    updateFromX(event.nativeEvent.x);
  };

  const onHandlerStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
    const { state, x } = event.nativeEvent;
    if (state === State.BEGAN) {
      updateFromX(x);
    }
  };

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const level = levelFromProgress(progress);
  const knobTravel = Math.max(trackWidth - TRACK_PADDING * 2 - KNOB_SIZE, 0);
  const knobX = progress * knobTravel;

  let buttonBackground: string = '#8A8A8A';
  let buttonTextColor: string = theme.colors.text;
  if (level === MAX_LEVEL) {
    buttonBackground = theme.colors.accent;
    buttonTextColor = theme.colors.text;
  } else if (level > 1) {
    buttonBackground = '#FFFFFF';
    buttonTextColor = '#000000';
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <RedShape size={44} radius={14}>
          <Ionicons name="rocket-outline" size={22} color={theme.colors.text} />
        </RedShape>
        <View style={styles.headerText}>
          <Text style={styles.title}>Otimização inteligente</Text>
          <Text style={styles.subtitle}>Selecione o nível e otimize!</Text>
        </View>
      </View>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-5, 5]}
        failOffsetY={[-15, 15]}
      >
        <View style={styles.track} onLayout={onTrackLayout}>
          <View style={[styles.trackFill, { width: knobX }]} />
          <View style={[styles.knob, { transform: [{ translateX: knobX }] }]}>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.text} />
          </View>
        </View>
      </PanGestureHandler>

      {hasInteracted && (
        <Pressable style={[styles.button, { backgroundColor: buttonBackground }]}>
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>
            NÍVEL DE OTIMIZAÇÃO {level}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  headerText: {
    gap: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    paddingHorizontal: TRACK_PADDING,
  },
  trackFill: {
    position: 'absolute',
    left: TRACK_PADDING + KNOB_SIZE / 2,
    top: (TRACK_HEIGHT - 2) / 2,
    height: 2,
    backgroundColor: theme.colors.accent,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignSelf: 'center',
    marginTop: 20,
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
