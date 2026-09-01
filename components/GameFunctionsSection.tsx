import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  UIManager,
  View,
} from 'react-native';
import { theme } from '../theme';
import RedShape from './RedShape';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const animateNext = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
};

const COMMON_REFRESH_RATES = [60, 90, 120];

function useScreenRefreshRate(active: boolean) {
  const [refreshRate, setRefreshRate] = useState<number | null>(null);

  useEffect(() => {
    if (!active) {
      setRefreshRate(null);
      return;
    }

    let rafId: number;
    let frameCount = 0;
    const startTime = Date.now();

    const tick = () => {
      frameCount += 1;
      const elapsed = Date.now() - startTime;
      if (elapsed >= 600) {
        const measured = Math.round((frameCount * 1000) / elapsed);
        const closest = COMMON_REFRESH_RATES.reduce((best, rate) =>
          Math.abs(rate - measured) < Math.abs(best - measured) ? rate : best
        );
        animateNext();
        setRefreshRate(closest);
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active]);

  return refreshRate;
}

export default function GameFunctionsSection() {
  const [aimStabilizer, setAimStabilizer] = useState(false);
  const [fpsBooster, setFpsBooster] = useState(false);
  const refreshRate = useScreenRefreshRate(fpsBooster);

  const toggleAimStabilizer = (value: boolean) => {
    animateNext();
    setAimStabilizer(value);
  };

  const toggleFpsBooster = (value: boolean) => {
    animateNext();
    setFpsBooster(value);
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Funções do jogo</Text>
        <RedShape size={30} radius={10}>
          <Ionicons name="game-controller" size={16} color={theme.colors.text} />
        </RedShape>
      </View>

      <View style={styles.row}>
        <RedShape size={52} radius={16}>
          <MaterialCommunityIcons name="crosshairs" size={24} color={theme.colors.text} />
        </RedShape>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Estabilizar mira</Text>
          <Text style={styles.rowDescription}>
            Ative para que as balas fiquem fixas em um ponto e não se espalhem.
          </Text>
        </View>
        <Switch
          value={aimStabilizer}
          onValueChange={toggleAimStabilizer}
          trackColor={{ false: '#2A2A2A', true: theme.colors.accent }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#2A2A2A"
        />
      </View>

      <View style={styles.row}>
        <RedShape size={52} radius={16}>
          <Ionicons name="speedometer" size={24} color={theme.colors.text} />
        </RedShape>
        <View style={styles.rowText}>
          {fpsBooster ? (
            <View style={styles.fpsLive}>
              <View style={styles.fpsBar} />
              <Text style={styles.rowTitle}>
                {refreshRate !== null ? `${refreshRate} Hz` : 'Medindo...'}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.rowTitle}>Booster de FPS</Text>
              <Text style={styles.rowDescription}>
                Trava o FPS no FF para oferecer uma jogabilidade mais estável
              </Text>
            </>
          )}
        </View>
        <Switch
          value={fpsBooster}
          onValueChange={toggleFpsBooster}
          trackColor={{ false: '#2A2A2A', true: theme.colors.accent }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#2A2A2A"
        />
      </View>

      <View style={styles.dragRow}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Booster de drag-shot</Text>
          <Text style={styles.rowDescription}>
            Defina a velocidade de arraste do seu botão de tiro.
          </Text>
        </View>

        <View style={styles.dragActions}>
          <View style={styles.dragIconBox}>
            <MaterialCommunityIcons name="gesture-tap-hold" size={26} color={theme.colors.text} />
          </View>
          <Pressable style={styles.boostButton}>
            <Text style={styles.boostButtonText}>BOOST</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  rowDescription: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  fpsLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fpsBar: {
    width: 5,
    height: 22,
    borderRadius: 3,
    backgroundColor: '#3DD673',
  },
  dragRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  dragActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dragIconBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boostButton: {
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 26,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boostButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
});
