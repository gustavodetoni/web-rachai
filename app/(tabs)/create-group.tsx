import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createGroup } from '@/functions/groups-create';
import { Button } from '@components/ui/button';
import { ImagePickerComponent } from '@components/ui/image-picker';
import { Input } from '@components/ui/input';

const createGroupSchema = z.object({
  name: z.string().min(1, 'Informe um nome para o grupo.'),
  description: z.string().optional(),
  thumbnail: z.string().optional().nullable(),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

export default function CreateGroupScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      thumbnail: null,
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: FormData) => createGroup(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['groups'] });
      router.back();
    },
  });

  const onSubmit = (values: CreateGroupFormValues) => {
    const formData = new FormData();
    formData.append('name', values.name);
    
    if (values.description) {
      formData.append('description', values.description);
    }

    if (values.thumbnail) {
      const uri = values.thumbnail;
      const fileName = uri.split('/').pop() || 'thumbnail.jpg';
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('thumbnail', {
        uri,
        name: fileName,
        type,
      } as any);
    }

    mutation.mutate(formData);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safe}
      >
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <ThemedText type="title">Novo grupo</ThemedText>
            <ThemedText style={styles.subtitle}>
              Dê um nome e uma breve descrição para o seu grupo.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="thumbnail"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <ImagePickerComponent
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />

            <View style={styles.fieldSpacing} />

            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <Input
                  label="Nome do grupo"
                  placeholder="Viagem com amigos"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="sentences"
                  error={error?.message}
                />
              )}
            />

            <View style={styles.fieldSpacing} />

            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Descrição (opcional)"
                  placeholder="Descreva rapidamente para que é esse grupo"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  style={styles.multilineInput}
                />
              )}
            />

            {mutation.error ? (
              <Text style={styles.formError}>
                {(mutation.error as Error).message ||
                  'Não foi possível criar o grupo. Tente novamente.'}
              </Text>
            ) : null}
          </View>

          <View style={styles.footer}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => router.back()}
              style={styles.cancelButton}
            />
            <Button
              title="Criar grupo"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting || mutation.isPending}
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
    paddingTop: 90,
    paddingBottom: 60,
    justifyContent: 'space-between',
    gap: 24,
  },
  header: {
    gap: 8,
  },
  subtitle: {
    opacity: 0.8,
  },
  form: {
    flex: 1,
    gap: 12,
  },
  fieldSpacing: {
    height: 8,
  },
  formError: {
    marginTop: 8,
    color: '#E03535',
    fontSize: 13,
  },
  footer: {
    gap: 12,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
});

