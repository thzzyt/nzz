import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

type Props = {
  size?: number;
  radius?: number;
  children?: ReactNode;
  style?: ViewStyle;
};

export default function RedShape({ size = 32, radius = 10, children, style }: Props) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
