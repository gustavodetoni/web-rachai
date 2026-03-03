import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ImageViewerProps {
  images: { uri: string }[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
}

export default function ImageViewer({ images, visible, onRequestClose, imageIndex }: ImageViewerProps) {
  if (!visible || !images || images.length === 0) return null;

  const currentImage = images[imageIndex || 0];

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onRequestClose}>
          <AntDesign name="close" size={30} color="white" />
        </TouchableOpacity>
        <Image
          source={{ uri: currentImage.uri }}
          style={styles.image}
          contentFit="contain"
          transition={200}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  image: {
    width: '90%',
    height: '90%',
  },
});
