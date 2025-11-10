import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof theme.spacing;
}

export default function Card({ children, style, padding = 'md' }: CardProps) {
  return (
    <View style={[
      styles.card, 
      { padding: theme.spacing[padding] },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
});