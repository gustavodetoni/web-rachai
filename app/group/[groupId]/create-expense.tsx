import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { createExpense, ExpenseCategory } from '@/functions/expense-create';
import { getGroupMembers } from '@/functions/group-members-get';

const CATEGORIES: { label: string; value: ExpenseCategory }[] = [
  { label: 'Alimentação', value: 'FOOD' },
  { label: 'Combustível', value: 'FUEL' },
  { label: 'Bebidas', value: 'DRINKS' },
  { label: 'Aluguel', value: 'RENT' },
  { label: 'Entretenimento', value: 'ENTERTAINMENT' },
  { label: 'Outros', value: 'OTHERS' },
];

const createExpenseSchema = z.object({
  title: z.string().min(1, 'Informe o título da despesa.'),
  amount: z.string().min(1, 'Informe o valor.').refine((val) => {
    const num = Number(val.replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, 'Valor inválido.'),
  category: z.enum(['FOOD', 'FUEL', 'DRINKS', 'RENT', 'ENTERTAINMENT', 'OTHERS']),
  divideTo: z.array(z.string()),
});

type CreateExpenseFormValues = z.infer<typeof createExpenseSchema>;

export default function CreateExpenseScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const groupId = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;
  const [step, setStep] = useState(1);

  const primaryColor = useThemeColor({ light: Colors.light.tint, dark: Colors.dark.tint }, 'tint');

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      title: '',
      amount: '',
      category: 'FOOD',
      divideTo: [],
    },
  });

  const divideTo = watch('divideTo');

  const { data: members = [], isLoading: loadingMembers, error: membersError } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId!),
    enabled: !!groupId,
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateExpenseFormValues) => {
      const payload = {
        title: data.title,
        amount: Number(data.amount.replace(',', '.')),
        category: data.category,
        divideTo: data.divideTo,
      };
      return createExpense(groupId!, payload);
    },
    onSuccess: () => {
      reset();
      Alert.alert('Sucesso', 'Despesa criada com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error) => {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao criar despesa');
    },
  });

  const onSubmit = (values: CreateExpenseFormValues) => {
    mutation.mutate(values);
  };

  const handleNextStep = async () => {
    const isValid = await trigger(['title', 'amount', 'category']);
    if (isValid) {
      setStep(2);
    }
  };

  function toggleMember(memberId: string) {
    const currentSelection = divideTo || [];
    const isSelected = currentSelection.includes(memberId);
    let newSelection;

    if (isSelected) {
      newSelection = currentSelection.filter((id) => id !== memberId);
    } else {
      newSelection = [...currentSelection, memberId];
    }
    setValue('divideTo', newSelection);
  }

  function toggleAll() {
    setValue('divideTo', []);
  }

  const isAllSelected = (divideTo || []).length === 0;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Adicionar transação', headerBackTitle: 'Voltar' }} />
      
      <View style={styles.stepsContainer}>
        <ThemedText style={[styles.stepText, step === 1 && { color: primaryColor, fontWeight: 'bold' }]}>
          1. Identificação
        </ThemedText>
        <View style={styles.stepDivider} />
        <ThemedText style={[styles.stepText, step === 2 && { color: primaryColor, fontWeight: 'bold' }]}>
          2. Divisão
        </ThemedText>
        <View style={styles.stepDivider} />
        <ThemedText style={[styles.stepText, step === 3 && { color: primaryColor, fontWeight: 'bold' }]}>
          3. Confirmação
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 ? (
          <View style={styles.form}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label="Título"
                  placeholder="Ex: Jantar, Gasolina..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Input
                  label="Valor (R$)"
                  placeholder="0,00"
                  keyboardType="numeric"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <Select
                  label="Categoria"
                  placeholder="Selecione uma categoria"
                  options={CATEGORIES}
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                />
              )}
            />
          </View>
        ) : (
          <View style={styles.divisionContainer}>
            {loadingMembers ? (
              <ActivityIndicator size="large" color={primaryColor} />
            ) : membersError ? (
               <ThemedText style={{ color: 'red', textAlign: 'center' }}>Erro ao carregar membros.</ThemedText>
            ) : (
              <>
                <TouchableOpacity
                  style={[
                    styles.memberRow,
                    isAllSelected && { backgroundColor: primaryColor + '20', borderColor: primaryColor }
                  ]}
                  onPress={toggleAll}
                >
                  <View style={[styles.checkbox, isAllSelected && { backgroundColor: primaryColor }]} />
                  <ThemedText style={styles.memberName}>Todos do grupo</ThemedText>
                </TouchableOpacity>

                {members.map((member) => {
                  const isSelected = (divideTo || []).includes(member.id);
                  const active = !isAllSelected && isSelected;

                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberRow,
                        active && { backgroundColor: primaryColor + '20', borderColor: primaryColor }
                      ]}
                      onPress={() => {
                        if (isAllSelected) {
                          setValue('divideTo', [member.id]);
                        } else {
                          toggleMember(member.id);
                        }
                      }}
                    >
                      <View style={[styles.checkbox, active && { backgroundColor: primaryColor }]} />
                      <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
            
            <View style={styles.infoBox}>
               <ThemedText style={styles.infoText}>
                 A divisão só será feita entre você e os demais selecionados.
               </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step === 2 ? (
           <Button
             title="Confirmar e Criar"
             onPress={handleSubmit(onSubmit)}
             loading={isSubmitting || mutation.isPending}
             style={styles.button}
           />
        ) : (
          <Button
            title="Próximo"
            onPress={handleNextStep}
            style={styles.button}
          />
        )}
        
        {step === 2 && (
          <Button
            title="Voltar"
            variant="outline"
            onPress={() => setStep(1)}
            style={[styles.button, { marginTop: 12 }]}
            disabled={isSubmitting || mutation.isPending}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 72, 
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  stepText: {
    fontSize: 12,
    color: '#888',
  },
  stepDivider: {
    width: 20,
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  content: {
    padding: 20,
  },
  form: {
    gap: 16,
  },
  divisionContainer: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 12,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 20,
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
  },
  button: {
    width: '100%',
  },
});
