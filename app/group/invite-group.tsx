import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Share,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { getInvite } from '@/functions/group-invite-get';
import { generateInvite } from '@/functions/groups-invite';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';

export default function InviteGroupScreen() {
  const router = useRouter();
  const { groupId, from } = useLocalSearchParams<{ groupId: string; from?: string }>();
  const [inviteCode, setInviteCode] = useState<string>('');

  const { data: existingInvite, isLoading: isLoadingInvite } = useQuery({
    queryKey: ['invite', groupId],
    queryFn: () => getInvite(groupId!),
    enabled: !!groupId,
  });

  const generateMutation = useMutation({
    mutationFn: () => generateInvite(groupId!),
    onSuccess: (data) => {
       if (data.message) {
           setInviteCode(data.message);
       }
    },
  });

  useEffect(() => {
    if (existingInvite?.message) {
      setInviteCode(existingInvite.message);
    } else if (!isLoadingInvite && !inviteCode && groupId) {
        generateMutation.mutate();
    }
  }, [existingInvite, isLoadingInvite, groupId]);

  const handleShare = async () => {
    try {
    const message = `*Rachaì* – Gestão Inteligente de Despesas em Grupo
🎉 Você foi convidado para participar de um grupo!

Para entrar:
1️⃣ Abra o app
2️⃣ Toque em *Participar de um grupo*
3️⃣ Cole o código abaixo:

🔑 Código do convite:
${inviteCode}`;
      
      await Share.share({
        message,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSkip = () => {
    if (from === 'create-group') {
      router.replace(`/group/${groupId}`);
    } else {
      router.back();
    }
  };

  const isLoading = isLoadingInvite || generateMutation.isPending;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safe}
      >
        <ThemedView style={styles.container}>
          <View style={styles.header}>
             <View style={{ width: 32 }} />             
            <TouchableOpacity 
              onPress={handleSkip} 
              style={styles.skipButton}
            >
              <ThemedText type="subtitle" style={{ color: Colors.light.tint, fontSize: 16 }}>
                Agora não
              </ThemedText>
            </TouchableOpacity>
          </View>

            <View style={styles.subHeader}>
              <ThemedText type="title" style={{ color: Colors.light.tint }}>Convide pessoas</ThemedText>
              <ThemedText style={styles.subtitle}>
                Convide pessoas para participarem do seu grupo.
              </ThemedText>
            </View>

            <View style={styles.content}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={Colors.light.tint} />
                ) : (
                    <View style={styles.inputContainer}>
                        <Input 
                            value={inviteCode}
                            editable={false}
                            style={styles.codeInput}
                            textAlign="center"
                        />
                    </View>
                )}
            </View>

          <View style={styles.footer}>
            <Button
              title="Compartilhar"
              onPress={handleShare}
              disabled={isLoading || !inviteCode}
            />
          </View>
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
    marginBottom: 24,
  },
  subHeader: {
    marginBottom: 40,
  },
  subtitle: {
    opacity: 0.8,
    fontSize: 14,
    marginTop: 4,
  },
  skipButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 100,
  },
  inputContainer: {
    width: '100%',
  },
  codeInput: {
    fontSize: 32,
    color: Colors.light.background,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
    height: 80,
  },
  footer: {
    paddingVertical: 16,
    marginBottom: 60,
  },
});
