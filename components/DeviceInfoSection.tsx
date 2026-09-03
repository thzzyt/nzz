import { Ionicons } from '@expo/vector-icons';
import { BatteryState, useBatteryLevel, useBatteryState } from 'expo-battery';
import { getFreeDiskStorageAsync, getTotalDiskCapacityAsync } from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../theme';

const RING_SIZE = 130;
const RING_STROKE = 11;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function batteryStateLabel(state: BatteryState) {
  switch (state) {
    case BatteryState.CHARGING:
      return 'Carregando';
    case BatteryState.FULL:
      return 'Completa';
    case BatteryState.UNPLUGGED:
      return 'Descarregando';
    default:
      return 'Desconhecido';
  }
}

function bytesToGB(bytes: number) {
  return Math.round(bytes / 1_000_000_000);
}

export default function DeviceInfoSection() {
  const batteryLevel = useBatteryLevel();
  const batteryState = useBatteryState();
  const [totalBytes, setTotalBytes] = useState<number | null>(null);
  const [freeBytes, setFreeBytes] = useState<number | null>(null);

  useEffect(() => {
    getTotalDiskCapacityAsync().then(setTotalBytes).catch(() => {});
    getFreeDiskStorageAsync().then(setFreeBytes).catch(() => {});
  }, []);

  const batteryPercent = batteryLevel >= 0 ? Math.round(batteryLevel * 100) : 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - batteryPercent / 100);

  const totalGB = totalBytes !== null ? bytesToGB(totalBytes) : null;
  const freeGB = freeBytes !== null ? bytesToGB(freeBytes) : null;
  const usedGB = totalGB !== null && freeGB !== null ? totalGB - freeGB : null;
  const usedPercent = totalGB && usedGB !== null ? Math.round((usedGB / totalGB) * 100) : 0;

  return (
    <View style={styles.section}>
      <View style={styles.topRow}>
        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke="#2A2A2A"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={theme.colors.accent}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
              strokeDashoffset={ringOffset}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.ringCenter} pointerEvents="none">
            <Text style={styles.ringPercent}>{batteryPercent}%</Text>
            <Text style={styles.ringLabel}>Nível atual</Text>
          </View>
        </View>

        <View style={styles.batteryInfo}>
          <View style={styles.rowHeader}>
            <View style={styles.iconBadge}>
              <Ionicons name="phone-portrait-outline" size={16} color={theme.colors.text} />
            </View>
            <Text style={styles.rowHeaderText}>Sobre minha bateria:</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <Ionicons name="thermometer-outline" size={16} color={theme.colors.textMuted} />
              <Text style={styles.infoLabel}>Temperatura:</Text>
            </View>
            <Text style={styles.infoValue}>—</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <Ionicons name="battery-half-outline" size={16} color={theme.colors.textMuted} />
              <Text style={styles.infoLabel}>Status:</Text>
            </View>
            <Text style={styles.infoValue}>{batteryStateLabel(batteryState)}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <Ionicons name="pulse-outline" size={16} color={theme.colors.textMuted} />
              <Text style={styles.infoLabel}>Saúde:</Text>
            </View>
            <Text style={styles.infoValue}>Vida boa</Text>
          </View>
        </View>
      </View>

      <View style={styles.rowHeader}>
        <View style={styles.iconBadge}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.text} />
        </View>
        <Text style={styles.rowHeaderText}>Informações de armazenamento:</Text>
      </View>

      <View style={styles.storageBarRow}>
        <View style={styles.storageBarTrack}>
          <View style={[styles.storageBarFill, { width: `${usedPercent}%` }]} />
        </View>
        <View style={styles.storagePercentBadge}>
          <Text style={styles.storagePercentText}>{usedPercent}%</Text>
        </View>
      </View>

      <View style={styles.storageChips}>
        <View style={styles.storageChip}>
          <Ionicons name="ellipse" size={16} color={theme.colors.text} />
          <Text style={styles.storageChipText}>{totalGB ?? '--'} GB</Text>
        </View>
        <View style={styles.storageChip}>
          <Ionicons name="pie-chart" size={16} color={theme.colors.text} />
          <Text style={styles.storageChipText}>{usedGB ?? '--'} GB</Text>
        </View>
        <View style={styles.storageChip}>
          <Ionicons name="pie-chart-outline" size={16} color={theme.colors.text} />
          <Text style={styles.storageChipText}>{freeGB ?? '--'} GB</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 28,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringPercent: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  ringLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  batteryInfo: {
    flex: 1,
    gap: 14,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowHeaderText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  storageBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storageBarTrack: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#262626',
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 7,
    backgroundColor: theme.colors.accent,
  },
  storagePercentBadge: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storagePercentText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  storageChips: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  storageChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#262626',
  },
  storageChipText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
