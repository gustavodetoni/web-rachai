import { Colors, Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';

type Option = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
};

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  error,
}: SelectProps) {
  const [visible, setVisible] = useState(false);

  const focusedBorderColor = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');
  const inputBgColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.surface }, 'background');
  const borderColor = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, 'border');
  const textColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');
  const placeholderColor = useThemeColor({ light: Colors.light.muted, dark: Colors.dark.muted }, 'text');
  const modalBgColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, 'background');

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.inputWrapper,
          {
            borderColor: visible ? focusedBorderColor : borderColor,
            backgroundColor: inputBgColor,
          },
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.inputText, { color: value ? textColor : placeholderColor }]}>
          {selectedLabel || placeholder}
        </Text>
        {/* Simple chevron icon could be added here */}
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: modalBgColor }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    { backgroundColor: item.value === value ? focusedBorderColor + '20' : 'transparent' }
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={[
                    styles.optionText, 
                    { 
                      color: textColor,
                      fontWeight: item.value === value ? '600' : '400'
                    }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
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
    marginBottom: 4,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    height: 50,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  error: {
    fontSize: 12,
    color: '#ca3214',
    fontFamily: Fonts.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 16,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
  },
});
