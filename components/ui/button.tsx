import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  useColorScheme,
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
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const isDisabled = disabled || loading;

  const outlineColor = isDark ? '#ffffff' : '#737373';

  const backgroundColor =
    variant === 'outline'
      ? 'transparent'
      : destructive
      ? DESTRUCTIVE_COLOR
      : PRIMARY_COLOR;

  const borderColor =
    variant === 'outline'
      ? outlineColor
      : destructive
      ? DESTRUCTIVE_COLOR
      : PRIMARY_COLOR;

  const textColor =
    variant === 'outline'
      ? outlineColor
      : '#ffffff';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor,
          opacity: isDisabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    elevation: 4,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
