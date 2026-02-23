import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useGlobalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CopyPixButton } from '@/components/copy-pix-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getExpenseDebts, type Debt } from '@/functions/expense-debts-get';
import {
  getExpenseReceivables
} from '@/functions/expense-receivables-get';
import { settleExpenseSplits } from '@/functions/expense-settle';
import { Fonts } from '@/constants/theme';

export default function PendingsScreen() {const params = useGlobalSearchParams();
  const groupId = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;
  const insets = useSafeAreaInsets(); const queryClient = useQueryClient();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: debts, isLoading: isLoadingDebts, refetch: refetchDebts } = useQuery({
    queryKey: ['expense-debts', groupId],
    queryFn: () => getExpenseDebts(groupId!),
    enabled: !!groupId,
  });

  const { data: receivables, isLoading: isLoadingReceivables, refetch: refetchReceivables } = useQuery({
    queryKey: ['expense-receivables', groupId],
    queryFn: () => getExpenseReceivables(groupId!),
    enabled: !!groupId,
  });

  useFocusEffect(
    useCallback(() => {
      refetchDebts();
      refetchReceivables();
    }, [refetchDebts, refetchReceivables])
  );

  const handleOpenModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setProofUri(null);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedDebt(null);
    setProofUri(null);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled) {
        setProofUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedDebt) {return;}

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      
      selectedDebt.expenseSplitIds.forEach((id) => {
        formData.append('expenseSplitIds', id);
      });

      if (proofUri) {
        const filename = proofUri.split('/').pop() || 'proof.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        // @ts-ignore: FormData expects Blob but React Native expects object with uri, name, type
        formData.append('evidence', {
          uri: Platform.OS === 'ios' ? proofUri.replace('file://', '') : proofUri,
          name: filename,
          type,
        });
      }

      await settleExpenseSplits(formData);

      queryClient.invalidateQueries({ queryKey: ['expense-debts', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary', groupId] });
      
      Alert.alert('Sucesso', 'Pagamento registrado com sucesso!');
      handleCloseModal();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível registrar o pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const renderEmptyState = (message: string) => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateMessage}>
        <MaterialIcons name="info-outline" size={18} color={isDark ? '#888' : '#666'} />
        <ThemedText style={styles.emptyStateText}>{message}</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.sectionTitle}>A pagar</ThemedText>
        {isLoadingDebts ? (
          <ActivityIndicator size="small" color="#4bc355" style={{ marginVertical: 20 }} />
        ) : !debts?.debts || debts.debts.length === 0 ? (
          renderEmptyState('Tudo certo! Você não deve nada.')
        ) : (
          debts.debts.map((debt, index) => (
            <View key={index} style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.cardHeader}>
                <Image
                  source={debt.userThumbnail ? { uri: debt.userThumbnail } : require('@/assets/images/big.png')}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.cardTitle} numberOfLines={1}>
                    Pagar para: {debt.userName.split(' ')[0]}
                  </ThemedText>
                  <ThemedText style={styles.debtAmount}>
                    {formatCurrency(debt.totalAmount)}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                   <CopyPixButton pixKey={debt.userPix} />
                </View>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handleOpenModal(debt)}
                >
                  <ThemedText style={styles.payButtonText}>Pagar</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <ThemedText style={styles.sectionTitle}>A receber</ThemedText>
        {isLoadingReceivables ? (
          <ActivityIndicator size="small" color="#4bc355" style={{ marginVertical: 20 }} />
        ) : !receivables || receivables.length === 0 ? (
          renderEmptyState('Você não tem valores a receber.')
        ) : (
          receivables.map((receivable, index) => (
            <View key={index} style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.cardHeader}>
                <Image
                    source={receivable.payerThumbnailUrl ? { uri: receivable.payerThumbnailUrl } : require('@/assets/images/big.png')}
                    style={styles.avatar}
                    contentFit="cover"
                />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.cardTitle} numberOfLines={1}>
                    Receber de: {receivable.payerName.split(' ')[0]}
                  </ThemedText>
                  <ThemedText style={[styles.debtAmount, { color: '#4bc355' }]}>
                    {formatCurrency(receivable.amount)}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
                <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>Confirmar Pagamento</ThemedText>
                    <TouchableOpacity onPress={handleCloseModal}>
                        <MaterialIcons name="close" size={24} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                </View>

                {selectedDebt && (
                    <View style={styles.modalBody}>
                        <ThemedText style={styles.modalText}>
                            Você está pagando <ThemedText type="defaultSemiBold">{formatCurrency(selectedDebt.totalAmount)}</ThemedText> para <ThemedText type="defaultSemiBold">{selectedDebt.userName}</ThemedText>
                        </ThemedText>

                        <View style={styles.proofSection}>
                            <ThemedText style={styles.proofLabel}>Comprovante (Opcional)</ThemedText>
                            {proofUri ? (
                                <View style={styles.proofPreviewContainer}>
                                    <Image source={{ uri: proofUri }} style={styles.proofPreview} contentFit="cover" />
                                    <TouchableOpacity style={styles.removeProofButton} onPress={() => setProofUri(null)}>
                                        <MaterialIcons name="delete" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={[styles.uploadButton, isDark && styles.uploadButtonDark]} onPress={handlePickImage}>
                                    <MaterialIcons name="cloud-upload" size={24} color={isDark ? '#888' : '#666'} />
                                    <ThemedText style={styles.uploadText}>Adicionar imagem</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        <TouchableOpacity
                            style={[styles.confirmButton, isSubmitting && styles.disabledButton]}
                            onPress={handleConfirmPayment}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <ThemedText style={styles.confirmButtonText}>Confirmar Pagamento</ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
    opacity: 0.9,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    opacity: 0.6,
  },
  emptyStateMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardDark: {
    backgroundColor: '#1c1c1e',
    borderWidth: 0,
    borderColor: '#2c2c2e',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e1e1e1',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  debtAmount: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#ff3b30', 
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    height: 38,
    marginTop: 16,
  },
  payButton: {
    flex: 1,
    backgroundColor: '#34c759', 
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
    paddingBottom: 40,
  },
  modalContentDark: {
    backgroundColor: '#1c1c1e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    gap: 24,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  proofSection: {
    gap: 12,
  },
  proofLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  uploadButton: {
    height: 120,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  uploadButtonDark: {
    backgroundColor: '#2c2c2e',
    borderColor: '#3a3a3c',
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
  proofPreviewContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  proofPreview: {
    width: '100%',
    height: '100%',
  },
  removeProofButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  confirmButton: {
    backgroundColor: '#34c759',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
