import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, secureTextEntry, ...rest }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const focusedBorderColor = '#5DC264';
  const inputBgColor = useThemeColor({ light: '#ffffff', dark: Colors.dark.background }, 'background');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'background');
  const textColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');
  const placeholderColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text');
  const shadowColor = useThemeColor({ light: '#5DC264', dark: '#000' }, 'background');
  
  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: borderColor,
            backgroundColor: inputBgColor,
            shadowColor: shadowColor,
            shadowOpacity: isFocused ? 0.18 : 0, // Still apply shadow on focus
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
    fontWeight: '500',
    bottom: 4
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  input: {
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    color: '#E03535',
  },
});

