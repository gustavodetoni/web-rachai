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

const BORDER_COLOR = '#E5E7EB';
const FOCUSED_COLOR = '#5DC264';

export function Input({ label, error, secureTextEntry, ...rest }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: isFocused ? FOCUSED_COLOR : BORDER_COLOR,
            shadowOpacity: isFocused ? 0.18 : 0,
          },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor="#9CA3AF"
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
    color: '#111827',
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: 12, // ~0.75rem
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#5DC264',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  input: {
    fontSize: 16,
    color: '#111827',
  },
  error: {
    fontSize: 12,
    color: '#E03535',
  },
});

