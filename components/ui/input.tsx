import { Colors, Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, secureTextEntry, ...rest }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const focusedBorderColor = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');
  const inputBgColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.surface }, 'background');
  const borderColor = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, 'border');
  const textColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');
  const placeholderColor = useThemeColor({ light: Colors.light.muted, dark: Colors.dark.muted }, 'text');
  
  const shadowColor = '#000';
  
  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: isFocused ? focusedBorderColor : borderColor,
            backgroundColor: inputBgColor,
            shadowColor: shadowColor,
            shadowOpacity: 0.17, 
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1 },
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholderTextColor={placeholderColor}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    bottom: 4
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 8, 
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 2, 
  },
  input: {
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  error: {
    fontSize: 12,
    color: '#ca3214',
    fontFamily: Fonts.regular,
  },
});

