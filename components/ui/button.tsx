import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'outline';

type ButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  destructive?: boolean;
  style?: ViewStyle;
};

const PRIMARY_COLOR = '#5DC264';
const DESTRUCTIVE_COLOR = '#E03535';

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  destructive,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const backgroundColor =
    variant === 'outline'
      ? '#ffffff'
      : destructive
      ? DESTRUCTIVE_COLOR
      : PRIMARY_COLOR;

  const textColor = variant === 'outline' ? backgroundColor : '#ffffff';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          backgroundColor: variant === 'outline' ? '#ffffff' : backgroundColor,
          borderColor: destructive ? DESTRUCTIVE_COLOR : PRIMARY_COLOR,
          opacity: isDisabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12, // ~0.75rem
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#5DC264',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    // Caso DM Sans seja carregada depois, podemos ajustar aqui.
    // fontFamily: 'DMSans',
  },
});

