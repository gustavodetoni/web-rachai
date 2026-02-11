import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
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
import Animated, { FadeInUp } from 'react-native-reanimated';
import { z } from 'zod';

import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Logo } from '@components/ui/logo';
import { useAuth } from '@/contexts/auth-context';
import {
  registerUser,
  type RegisterPayload,
} from '@functions/user-register';

const registerSchema = z.object({
  name: z.string().min(2, 'Informe seu nome.'),
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  pixKey: z.string().min(3, 'Informe uma chave Pix válida.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      pixKey: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
    onSuccess: async (data) => {
      await signIn(data.accessToken);
      router.replace('/(tabs)');
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    mutation.mutate(values);
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.safe}
    >
      <View style={styles.container}>
        <View>          
        <Animated.View
          entering={FadeInUp.duration(400).delay(50)}
          style={styles.logoContainer}
        >
          <Logo />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(150)}
          style={styles.header}
        >
          <Text style={styles.title}>Criar Conta</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(250)}
          style={styles.form}
        >
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <Input
                label="Nome"
                placeholder="Digite seu nome..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
              />
            )}
          />

          <View style={styles.fieldSpacing} />

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <Input
                label="E-mail"
                placeholder="Digite seu e-mail..."
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
              />
            )}
          />

          <View style={styles.fieldSpacing} />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <Input
                label="Senha"
                placeholder="************"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
              />
            )}
          />

          <View style={styles.fieldSpacing} />

          <Controller
            control={control}
            name="pixKey"
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
              <Input
                label="Chave Pix"
                placeholder="124–1241–4124"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={error?.message}
              />
            )}
          />

          {mutation.error ? (
            <Text style={styles.formError}>
              {(mutation.error as Error).message}
            </Text>
          ) : null}
          </Animated.View>
          </View>

          <View>
          <Animated.View
          entering={FadeInUp.duration(400).delay(250)}
          style={styles.form}
          >
          <View style={styles.linkRow}>
            <Text style={styles.linkText}>Já tem conta? </Text>
            <Link href="/login">
              <Text style={styles.linkHighlight}>Login</Text>
            </Link>
          </View>
          </Animated.View>
       

        <Animated.View
          entering={FadeInUp.duration(400).delay(350)}
          style={styles.buttonWrapper}
        >
          <Button
            title="Criar Conta"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting || mutation.isPending}
          />
        </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 60,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
  },
  header: {
    marginTop: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  form: {
    marginTop: 32,
  },
  fieldSpacing: {
    height: 16,
  },
  formError: {
    marginTop: 12,
    color: '#E03535',
    fontSize: 13,
  },
  linkRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkHighlight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5DC264',
  },
  buttonWrapper: {
    marginTop: 40,
  },
});

