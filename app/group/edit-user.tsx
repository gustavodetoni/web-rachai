import { MaterialIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ImagePickerComponent } from '@/components/ui/image-picker';
import { Input } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import { provisionalResetPassword } from '@/functions/auth-reset-password';
import { getUser } from '@/functions/user-get';
import { updateUser } from '@/functions/user-update';

const editUserSchema = z.object({
  name: z.string().min(1, 'Informe seu nome.'),
  pixKey: z.string().optional(),
  thumbnail: z.string().optional().nullable(),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function EditUserScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      pixKey: '',
      thumbnail: null,
    },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { isSubmitting: isSubmittingPassword },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        pixKey: user.pixKey || '',
        thumbnail: user.thumbnail,
      });
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: FormData) => updateUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      router.back();
    },
    onError: (error) => {
      Alert.alert('Erro', (error as Error).message || 'Não foi possível atualizar o perfil.');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: { email: string; newPassword: string }) =>
      provisionalResetPassword(payload),
    onSuccess: () => {
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      resetPassword();
    },
    onError: (error) => {
      Alert.alert('Erro', (error as Error).message || 'Não foi possível alterar a senha.');
    },
  });

  const onSubmit = (values: EditUserFormValues) => {
    const formData = new FormData();
    formData.append('name', values.name);

    if (values.pixKey) {
      formData.append('pixKey', values.pixKey);
    }

    if (values.thumbnail) {
      const uri = values.thumbnail;
      if (!uri.startsWith('http')) {
        const fileName = uri.split('/').pop() || 'thumbnail.jpg';
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('thumbnail', {
          uri,
          name: fileName,
          type,
        } as any);
      }
    }

    updateMutation.mutate(formData);
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    if (!user?.email) return;
    passwordMutation.mutate({
      email: user.email,
      newPassword: values.newPassword,
    });
  };

  if (isLoadingUser) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

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
            <ThemedText type="subtitle" style={{ color: Colors.light.tint }}>
              Editar Perfil
            </ThemedText>
            <View style={{ width: 32 }} /> 
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Informações Pessoais
              </ThemedText>
              
              <View style={styles.form}>
                <Controller
                  control={control}
                  name="thumbnail"
                  render={({ field: { value, onChange }, fieldState: { error } }) => (
                    <View style={styles.imagePickerContainer}>
                        <ImagePickerComponent
                          value={value}
                          onChange={onChange}
                          error={error?.message}
                        />
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="name"
                  render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                    <Input
                      label="Nome"
                      placeholder="Seu nome"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      error={error?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="pixKey"
                  render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                    <Input
                      label="Chave Pix"
                      placeholder="CPF, Email ou Telefone"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      error={error?.message}
                    />
                  )}
                />

                <Button
                  title="Salvar Alterações"
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting || updateMutation.isPending}
                  style={styles.button}
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Segurança
              </ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Redefina sua senha abaixo.
              </ThemedText>

              <View style={styles.form}>
                <Controller
                  control={passwordControl}
                  name="newPassword"
                  render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                    <Input
                      label="Nova Senha"
                      placeholder="Mínimo 6 caracteres"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                      error={error?.message}
                    />
                  )}
                />

                <Button
                  title="Alterar Senha"
                  onPress={handlePasswordSubmit(onPasswordSubmit)}
                  loading={isSubmittingPassword || passwordMutation.isPending}
                  variant="outline"
                  style={styles.button}
                />
              </View>
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
    paddingTop: 60,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    marginLeft: -8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: Colors.light.tint,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  form: {
    gap: 16,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
    opacity: 0.5,
  },
});
