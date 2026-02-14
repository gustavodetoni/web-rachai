import * as Clipboard from 'expo-clipboard';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

type CopyPixButtonProps = {
  pixKey: string | null;
};

export function CopyPixButton({ pixKey }: CopyPixButtonProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const handleCopy = async () => {
    if (!pixKey) {
      Alert.alert('Erro', 'Chave PIX não disponível.');
      return;
    }
    
    await Clipboard.setStringAsync(pixKey);
    Alert.alert('Sucesso', 'Chave PIX copiada para a área de transferência!');
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderColor: '#76db75', backgroundColor: isDark ? '#171717' : '#ffffff' },
      ]}
      onPress={handleCopy}
      disabled={!pixKey}
    >
      <Text style={[styles.text, { color: isDark ? '#ffffff' : '#000000' }]}>
        Copiar PIX
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
  },
});
