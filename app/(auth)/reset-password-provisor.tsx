import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { z } from "zod";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fonts } from "@/constants/theme";
import { provisionalResetPassword, type ProvisionalResetPasswordRequest } from "@/functions/auth-reset-password";

const resetPasswordSchema = z
  .object({
    email: z.email("Informe um e-mail válido."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordProvisorScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email || "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: ProvisionalResetPasswordRequest) =>
      provisionalResetPassword(payload),
    onSuccess: () => {
      if (Platform.OS === 'web') {
        if (confirm("Sua senha foi redefinida com sucesso. Faça login para continuar.")) {
            router.replace("/(auth)/login");
        }
      } else {
        Alert.alert(
            "Sucesso",
            "Sua senha foi redefinida com sucesso. Faça login para continuar.",
            [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
          );
      }
    },
    onError: (error) => {
      Alert.alert("Erro", (error as Error).message);
    },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    mutation.mutate({
      email: values.email,
      newPassword: values.password,
    });
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.container}>
            <View>
              <Animated.View
                entering={FadeInUp.duration(400).delay(150)}
                style={styles.header}
              >
                <ThemedText style={styles.title} type="title">
                  Redefinir Senha
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Crie uma nova senha para sua conta
                </ThemedText>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.duration(400).delay(250)}
                style={styles.form}
              >
                <Controller
                  control={control}
                  name="email"
                  render={({
                    field: { value, onChange, onBlur },
                    fieldState: { error },
                  }) => (
                    <Input
                      label="E-mail"
                      placeholder="Confirme seu e-mail"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={error?.message}
                      editable={!email} // Se veio por parâmetro, bloqueia edição (opcional, removi bloqueio para permitir correção)
                    />
                  )}
                />

                <View style={styles.fieldSpacing} />

                <Controller
                  control={control}
                  name="password"
                  render={({
                    field: { value, onChange, onBlur },
                    fieldState: { error },
                  }) => (
                    <Input
                      label="Nova Senha"
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
                  name="confirmPassword"
                  render={({
                    field: { value, onChange, onBlur },
                    fieldState: { error },
                  }) => (
                    <Input
                      label="Confirmar Senha"
                      placeholder="************"
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={error?.message}
                    />
                  )}
                />

                {mutation.error ? (
                  <ThemedText style={styles.formError}>
                    {(mutation.error as Error).message}
                  </ThemedText>
                ) : null}

                <View style={styles.buttonWrapper}>
                  <Button
                    title="Redefinir Senha"
                    onPress={handleSubmit(onSubmit)}
                    loading={isSubmitting || mutation.isPending}
                  />
                  
                  <Button
                    title="Voltar para Login"
                    variant="outline"
                    onPress={() => router.back()}
                    style={{ marginTop: 12 }}
                  />
                </View>
              </Animated.View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 32, // Levemente menor que o login para caber melhor
    paddingTop: 10,
    fontWeight: "700",
    color: "#35B16C",
  },
  subtitle: {
    fontSize: 18,
    color: "#a2a2a2",
    fontFamily: Fonts.regular,
    marginTop: 4,
  },
  form: {
    marginTop: 20,
    gap: 2,
  },
  fieldSpacing: {
    height: 16,
  },
  formError: {
    marginTop: 12,
    color: "#E03535",
    fontSize: 13,
  },
  buttonWrapper: {
    marginTop: 32,
  },
});
