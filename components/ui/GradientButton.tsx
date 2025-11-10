import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function GradientButton({ 
  title, 
  onPress, 
  disabled = false, 
  size = 'medium' 
}: GradientButtonProps) {
  const buttonStyle = styles[size];
  
  return (
    <TouchableOpacity 
      style={[styles.container, disabled && styles.disabled]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled ? ['#cccccc', '#999999'] : theme.colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, buttonStyle]}
      >
        <Text style={[styles.text, styles[`${size}Text`]]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  gradient: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  small: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  medium: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  large: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});