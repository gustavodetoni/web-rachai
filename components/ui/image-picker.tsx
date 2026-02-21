import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

type ImagePickerProps = {
  value?: string | null;
  onChange: (uri: string | null) => void;
  label?: string;
  error?: string;
};

export function ImagePickerComponent({ value, onChange, label, error }: ImagePickerProps) {
  const inputBgColor = useThemeColor({ light: '#ffffff', dark: Colors.dark.background }, 'background');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#E5E7EB' }, 'background');
  const textColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');
  const iconColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    onChange(null);
  };

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      ) : null}

      <View style={styles.content}>
          <View style={styles.imageWrapper}>
            <TouchableOpacity
              style={[
                styles.picker,
                {
                  backgroundColor: inputBgColor,
                  borderColor: borderColor,
                },
                value ? styles.pickerHasImage : null,
              ]}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              {value ? (
                <Image source={{ uri: value }} style={styles.image} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="camera-outline" size={32} color={iconColor} />
                  <Text style={[styles.placeholderText, { color: iconColor }]}>
                    Adicionar foto
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {value && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={removeImage}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
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
    marginBottom: 4,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  picker: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pickerHasImage: {
    borderStyle: 'solid',
    borderWidth: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    gap: 4,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(254, 101, 101, 1)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  error: {
    fontSize: 12,
    color: '#E03535',
    textAlign: 'center',
    marginTop: 4,
  },
});
