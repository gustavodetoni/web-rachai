import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { joinGroup } from '@/functions/groups-join';
import { Input } from '@/components/ui/input';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function JoinGroupScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');

  const mutation = useMutation({
    mutationFn: (token: string) => joinGroup(token),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
      await AsyncStorage.setItem('lastSessionGroupId', data.groupId);
      router.replace(`/group/${data.groupId}`);
    },
  });

  const handleCodeChange = (text: string) => {
    const cleanText = text.trim();
    setCode(cleanText);

    if (cleanText.length === 8) {
      Keyboard.dismiss();
      mutation.mutate(cleanText);
    }
  };

  const handleSubmit = () => {
    if (code.length === 8) {
      Keyboard.dismiss();
      mutation.mutate(code);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safe}
      >
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="chevron-left" size={32} color={Colors.dark.text} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={code.length !== 8 || mutation.isPending}
              style={[styles.backButton, { opacity: code.length !== 8 ? 0.5 : 1 }]}
            >
            </TouchableOpacity>
          </View>
            
          <View style={styles.subHeader}>
            <ThemedText type="title" style={{ color: Colors.light.tint }}>Entrar em um grupo</ThemedText>
            <ThemedText style={styles.subtitle}>
              Insira o código de 8 caracteres para entrar.
            </ThemedText>
          </View>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <Input
                label="Código do grupo"
                placeholder="Ex: A1B2C3D4"
                value={code}
                onChangeText={handleCodeChange}
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect={false}
                error={mutation.error ? (mutation.error as Error).message : undefined}
              />
              
              {mutation.isPending && (
                <Text style={styles.loadingText}>Entrando no grupo...</Text>
              )}
            </View>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  subHeader: {
    marginBottom: 24,
  },
  backButton: {
    marginLeft: -8,
  },
  subtitle: {
    opacity: 0.8,
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  form: {
    gap: 12,
  },
  loadingText: {
    marginTop: 8,
    color: Colors.light.tint,
    fontSize: 14,
    textAlign: 'center',
  },
});
