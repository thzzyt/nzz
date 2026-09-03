import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

function DotCell({ filled, color }: { filled: boolean; color: string }) {
  return (
    <View style={styles.dotCell}>{filled && <View style={[styles.dot, { backgroundColor: color }]} />}</View>
  );
}

type Props = {
  color?: string;
  size?: number;
};

export default function DiamondDotsIcon({ color = theme.colors.text, size = 22 }: Props) {
  return (
    <View style={[styles.dotsGrid, { width: size, height: size }]}>
      <View style={styles.dotsRow}>
        <DotCell filled={false} color={color} />
        <DotCell filled color={color} />
        <DotCell filled={false} color={color} />
      </View>
      <View style={styles.dotsRow}>
        <DotCell filled color={color} />
        <DotCell filled={false} color={color} />
        <DotCell filled color={color} />
      </View>
      <View style={styles.dotsRow}>
        <DotCell filled={false} color={color} />
        <DotCell filled color={color} />
        <DotCell filled={false} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dotsGrid: {},
  dotsRow: {
    flex: 1,
    flexDirection: 'row',
  },
  dotCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
});
