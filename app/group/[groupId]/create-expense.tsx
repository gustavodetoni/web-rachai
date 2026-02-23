import { Colors, Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useFocusEffect, useGlobalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { createExpense, ExpenseCategory } from '@/functions/expense-create';
import { getGroupMembers } from '@/functions/group-members-get';

const CATEGORIES: { label: string; value: ExpenseCategory; color: string }[] = [
  { label: 'Alimentação', value: 'FOOD', color: '#4ADE80' },
  { label: 'Bebidas', value: 'DRINKS', color: '#FACC15' },
  { label: 'Combustível', value: 'FUEL', color: '#60A5FA' },
  { label: 'Aluguel', value: 'RENT', color: '#F472B6' },
  { label: 'Entretenimento', value: 'ENTERTAINMENT', color: '#FB923C' },
  { label: 'Outros', value: 'OTHERS', color: '#166534' },
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
  const [image, setImage] = useState<string | null>(null);

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
  const selectedCategory = watch('category');

  const { data: members = [], isLoading: loadingMembers, error: membersError, refetch } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => getGroupMembers(groupId!),
    enabled: !!groupId,
    staleTime: 0,
    gcTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      return () => {
        refetch();
        reset();
        setStep(1);
        setImage(null);
      };
    }, [groupId, refetch, reset])
  );

  const getCategoryColor = (catValue: ExpenseCategory) => {
    return CATEGORIES.find(c => c.value === catValue)?.color || '#ccc';
  };

  const mutation = useMutation({
    mutationFn: async (data: CreateExpenseFormValues) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('amount', String(Number(data.amount.replace(',', '.'))));
      formData.append('category', data.category);
      if (data.divideTo !== null && data.divideTo.length > 0) {
        formData.append('divideTo', JSON.stringify(data.divideTo));
      }
      
      if (image) {
          const fileName = image.split('/').pop() || 'invoice.jpg';
          const match = /\.(\w+)$/.exec(fileName);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          formData.append('invoice', { uri: image, name: fileName, type } as any);
      }
      
      return createExpense(groupId!, formData);
    },
    onSuccess: () => {
      reset();
      setImage(null);
      setStep(1);
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
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const isValid = await trigger(['title', 'amount']);
      if (isValid) {
        setStep(3);
      }
    }
  };

  const handleCategorySelect = (category: ExpenseCategory) => {
    setValue('category', category);
    setStep(2);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar fotos.');
        return;
    }
    
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
          1. Categoria
        </ThemedText>
        <View style={styles.stepDivider} />
        <ThemedText style={[styles.stepText, step === 2 && { color: primaryColor, fontWeight: 'bold' }]}>
          2. Detalhes
        </ThemedText>
        <View style={styles.stepDivider} />
        <ThemedText style={[styles.stepText, step === 3 && { color: primaryColor, fontWeight: 'bold' }]}>
          3. Confirmação
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 ? (
          <View style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <ThemedText type="title" style={styles.categoryTitle}>Criar despesa</ThemedText>
              <ThemedText style={styles.categorySubtitle}>
                Escolha o tipo de categoria para sua despesa.
              </ThemedText>
            </View>
            <View style={styles.grid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.card, { backgroundColor: cat.color }]}
                  onPress={() => handleCategorySelect(cat.value)}
                >
                  <View style={styles.cardCircle} />
                  <ThemedText style={styles.cardText}>{cat.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : step === 2 ? (
          <View style={styles.form}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getCategoryColor(selectedCategory), marginRight: 8 }} />
              <ThemedText style={{ fontSize: 16, fontWeight: '900' }}>
                 {CATEGORIES.find(c => c.value === selectedCategory)?.label}
              </ThemedText>
              <TouchableOpacity onPress={() => setStep(1)} style={{ marginLeft: 'auto' }}>
                <ThemedText style={{ color: primaryColor, fontSize: 14 }}>Alterar</ThemedText>
              </TouchableOpacity>
            </View>

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

            <View style={styles.divisionSection}>
              <ThemedText type="default" style={{ marginBottom: 12 }}>Com quem dividir?</ThemedText>
              
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
          </View>
        ) : (
          <View style={styles.confirmationContainer}>
            <View style={styles.categorySummary}>
                <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(selectedCategory) }]} />
                <ThemedText style={styles.categoryName}>
                   {CATEGORIES.find(c => c.value === selectedCategory)?.label}
                </ThemedText>
            </View>

            <ThemedText style={styles.sectionTitle}>Comprovante (Opcional)</ThemedText>
            
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImageButton}>
                  <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>X</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageButtons}>
                <Button 
                   title="Tirar Foto" 
                   onPress={takePhoto} 
                   variant="outline"
                   style={{ flex: 1, marginRight: 8 }}
                />
                <Button 
                   title="Galeria" 
                   onPress={pickImage} 
                   variant="outline"
                   style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            )}

            <View style={styles.summaryContainer}>
               <ThemedText style={styles.summaryTitle}>Resumo</ThemedText>
               <ThemedText>Título: {watch('title')}</ThemedText>
               <ThemedText>Valor: R$ {watch('amount')}</ThemedText>
               <ThemedText>Categoria: {CATEGORIES.find(c => c.value === watch('category'))?.label}</ThemedText>
               <ThemedText>Dividido com: {isAllSelected ? 'Todos' : `${(divideTo || []).length} pessoas`}</ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step === 3 ? (
           <Button
             title="Confirmar e Criar"
             onPress={handleSubmit(onSubmit)}
             loading={isSubmitting || mutation.isPending}
             style={styles.button}
           />
        ) : step === 2 && (
          <Button
            title="Próximo"
            onPress={handleNextStep}
            style={styles.button}
          />
        )}
        
        {step > 2 && (
          <Button
            title="Voltar"
            variant="outline"
            onPress={() => setStep(step - 1)}
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
  divisionSection: {
    gap: 12,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  categoryContainer: {
    flex: 1,
  },
  categoryHeader: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 32,
    color: '#4ADE80',
    marginBottom: 8,
  },
  categorySubtitle: {
    fontSize: 16,
    color: '#888',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    height: 100,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  cardCircle: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardText: {
    fontSize: 19,
    fontFamily: Fonts.extraBold,
    color: '#000', 
    paddingBottom: 12,
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
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  confirmationContainer: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  categorySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  categoryIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
