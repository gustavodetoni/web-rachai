import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter, type Href } from "expo-router";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { z } from "zod";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { loginUser, type LoginPayload } from "@functions/user-login";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, signIn } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: async (data) => {
      await signIn(data.accessToken);
      router.replace("/group");
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/group");
    }
  }, [isAuthenticated, router]);

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
                  Login
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Bem-vindo de volta!
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
                  render={({
                    field: { value, onChange, onBlur },
                    fieldState: { error },
                  }) => (
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

                <View style={styles.linkRow}>
                  <ThemedText style={styles.linkText}>
                    Ainda não tem conta?{" "}
                  </ThemedText>
                  <Link href={"/register" as Href}>
                    <ThemedText style={styles.linkHighlight}>
                      Cadastrar-se
                    </ThemedText>
                  </Link>
                </View>

                {mutation.error ? (
                  <ThemedText style={styles.formError}>
                    {(mutation.error as Error).message}
                  </ThemedText>
                ) : null}

                <View style={styles.buttonWrapper}>
                  <Button
                    title="Acessar Conta"
                    onPress={handleSubmit(onSubmit)}
                    loading={isSubmitting || mutation.isPending}
                  />
                </View>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <ThemedText style={styles.dividerText}>or sign in with</ThemedText>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialButtonsContainer}>
                  <Pressable style={[styles.socialButton, styles.disabledButton]} disabled={true}>
                    <AntDesign name="google" size={20} color={Colors.dark.muted} />
                    <ThemedText style={styles.socialButtonText}>Continue with Google</ThemedText>
                  </Pressable>
                  <Pressable style={[styles.socialButton, styles.disabledButton]} disabled={true}>
                    <AntDesign name="apple" size={20} color={Colors.dark.muted} />
                    <ThemedText style={styles.socialButtonText}>Continue with Apple</ThemedText>
                  </Pressable>
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
    paddingTop: 140,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 42,
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
  linkRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  linkText: {
    fontSize: 14,
    color: "#a2a2a2",
  },
  linkHighlight: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5DC264",
  },
  buttonWrapper: {
    marginTop: 24,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#a2a2a2",
  },
  dividerText: {
    fontSize: 14,
    color: "#a2a2a2",
  },
  socialButtonsContainer: {
    gap: 22,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 0.5,
    borderColor: "#e5e5e5ad",
    gap: 10,
    backgroundColor: "transparent",
  },
  disabledButton: {
    opacity: 0.6,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
