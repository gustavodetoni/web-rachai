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
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'background');
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
        <TouchableOpacity
          style={[
            styles.picker,
            {
              backgroundColor: inputBgColor,
              borderColor: borderColor,
            },
          ]}
          onPress={pickImage}
          activeOpacity={0.7}
        >
          {value ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: value }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={removeImage}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={32} color={iconColor} />
              <Text style={[styles.placeholderText, { color: iconColor }]}>
                Adicionar foto
              </Text>
            </View>
          )}
        </TouchableOpacity>
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
  picker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
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
    top: 0,
    right: 0,
    backgroundColor: '#E03535',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  error: {
    fontSize: 12,
    color: '#E03535',
    textAlign: 'center',
    marginTop: 4,
  },
});
