import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useGlobalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
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

export default function PendingsScreen() {
  const params = useGlobalSearchParams();
  const groupId = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

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

  // const payMutation = useMutation({
  //   mutationFn: async (expenseSplitIds: string[]) => {
  //     await Promise.all(
  //       expenseSplitIds.map((id) =>
  //         settleExpenseSplits(id)
  //       )
  //     );
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['expense-debts', groupId] });
  //     queryClient.invalidateQueries({ queryKey: ['expense-summary', groupId] }); // Also update summary
  //     Alert.alert('Sucesso', 'Pagamento realizado!');
  //   },
  //   onError: (error) => {
  //     Alert.alert('Erro', 'Não foi possível registrar o pagamento.');
  //     console.error(error);
  //   },
  // });

  const handlePay = (debt: Debt) => {
    Alert.alert(
      'Confirmar pagamento',
      `Deseja marcar como pago o valor de ${formatCurrency(debt.totalAmount)} para ${debt.userName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar',
          // onPress: () => payMutation.mutate(debt.expenseSplitIds),
        },
      ]
    );
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
        <MaterialIcons name="info-outline" size={16} color="#888888" />
        <ThemedText style={styles.emptyStateText}>{message}</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <MaterialIcons name="chevron-left" size={28} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Pagamentos pendentes
        </ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.sectionTitle}>A pagar</ThemedText>
        {isLoadingDebts ? (
          <ActivityIndicator size="small" color="#4bc355" style={{ marginVertical: 20 }} />
        ) : !debts?.debts || debts.debts.length === 0 ? (
          renderEmptyState('Você não possui pagamentos a pagar')
        ) : (
          debts.debts.map((debt, index) => (
            <View key={index} style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                   <MaterialIcons name="attach-money" size={24} color="#4bc355" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.debtTitle} numberOfLines={1}>
                    Dívida com {debt.userName}
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
                  onPress={() => handlePay(debt)}
                  // disabled={payMutation.isPending}
                >
                  {/* {payMutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.payButtonText}>Pagar</ThemedText>
                  )} */}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <ThemedText style={styles.sectionTitle}>A receber</ThemedText>
        {isLoadingReceivables ? (
          <ActivityIndicator size="small" color="#4bc355" style={{ marginVertical: 20 }} />
        ) : !receivables || receivables.length === 0 ? (
          renderEmptyState('Você não possui pagamentos a receber')
        ) : (
          receivables.map((receivable, index) => (
            <View key={index} style={[styles.card, isDark && styles.cardDark]}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                   <MaterialIcons name="attach-money" size={24} color="#4bc355" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.debtTitle} numberOfLines={1}>
                     Receber de {receivable.payerName}
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    opacity: 0.8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  piggyBankContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5fcdc', 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  helpIconLeft: {
    position: 'absolute',
    top: 20,
    left: 30,
    transform: [{ rotate: '-15deg' }],
  },
  helpIconRight: {
    position: 'absolute',
    top: 20,
    right: 30,
    transform: [{ rotate: '15deg' }],
  },
  emptyStateMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyStateText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#cccccc',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
    shadowColor: '#000',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5fcdc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff3728',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  payerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  payerLabel: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '600',
  },
  payerName: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    height: 44,
  },
  payButton: {
    flex: 1,
    backgroundColor: '#4bc355',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
