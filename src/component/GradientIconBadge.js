import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';

/**
 * GradientIconBadge
 *
 * A reusable gradient container with a centered icon.
 *
 * Usage:
 * <GradientIconBadge
 *   colors={['#4A7EC7', '#6B9FE4']}
 *   iconName="pills"
 * />
 */
export default function GradientIconBadge({
  colors = ['#4A7EC7', '#6B9FE4'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  iconName = 'pills',
  iconType = 'solid',      // 'solid' | 'regular' | 'brand'
  iconSize = 24,
  iconColor = '#fff',
  size = 48,                // width/height of the badge (square)
  borderRadius,             // defaults to size / 2 (circle) if not passed
  style,
}) {
  const resolvedRadius = borderRadius ?? size / 2;

  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: resolvedRadius,
        },
        style,
      ]}
    >
      <Icon
        name={iconName}
        size={iconSize}
        color={iconColor}
        solid={iconType === 'solid'}
        regular={iconType === 'regular'}
        brand={iconType === 'brand'}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
