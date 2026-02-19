import { Colors, Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  Pressable,
} from 'react-native';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, secureTextEntry, ...rest }: InputProps) {
  const inputBgColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.surface }, 'background');
  const borderColor = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, 'border');
  const textColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');
  const placeholderColor = useThemeColor({ light: Colors.light.muted, dark: Colors.dark.muted }, 'text');
  
  const shadowColor = '#000000';
  const inputRef = useRef<TextInput>(null);
  
  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      ) : null}
      <Pressable
        style={[
          styles.inputWrapper,
          {
            borderColor: borderColor,
            backgroundColor: inputBgColor,
            shadowColor: shadowColor,
            shadowOpacity: 0.06,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 4 },
          },
        ]}
        onPress={() => {
          inputRef.current?.focus();
        }}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: textColor }]}
          placeholderTextColor={placeholderColor}
          secureTextEntry={secureTextEntry}
          {...rest}
        />
      </Pressable>
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
