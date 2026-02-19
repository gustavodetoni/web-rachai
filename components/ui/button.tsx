import { Colors, Fonts } from '@/constants/theme';
import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
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
  style?: StyleProp<ViewStyle>;
};

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

  const PRIMARY_COLOR = isDark ? Colors.dark.tint : Colors.light.tint;
  const DESTRUCTIVE_COLOR = isDark ? Colors.dark.error : Colors.light.error;

  const isDisabled = disabled || loading;

  const outlineColor = isDark ? '#a2a2a2' : '#202020';

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
      : destructive
      ? '#1e2723'
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.17,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
