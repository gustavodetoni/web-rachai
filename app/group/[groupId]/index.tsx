import { AntDesign } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useGlobalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sidebar } from '@/components/sidebar';
import { SummaryCard } from '@/components/summary-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionItem } from '@/components/transaction-item';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { getExpenseSummary } from '@/functions/expense-summary-get';
import { getGroups } from '@/functions/groups-get';
import { getTransactions } from '@/functions/transaction-get';
import { getUser } from '@/functions/user-get';

export default function GroupScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const groupId = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  });

  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary } = useQuery({
    queryKey: ['expense-summary', groupId],
    queryFn: () => getExpenseSummary(groupId!),
    enabled: !!groupId,
    gcTime: 0,
  });

  const { data: transactions, isLoading: isLoadingTransactions, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions', groupId],
    queryFn: () => getTransactions(groupId!),
    enabled: !!groupId,
    gcTime: 0,
  });

  useFocusEffect(
    useCallback(() => {
      refetchSummary();
      refetchTransactions();
    }, [refetchSummary, refetchTransactions])
  );

  const group = groups?.find((g) => g.id === groupId);
  const iconColor = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;

  const handleTransactionPress = (id: string) => {
    setSelectedTransactionId(id);
  };

  const closeModal = () => {
    setSelectedTransactionId(null);
  };

  const handleGroupSelect = (newGroupId: string) => {
    setIsSidebarOpen(false);
    if (newGroupId !== groupId) {
      router.replace(`/group/${newGroupId}`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => setIsSidebarOpen(true)} style={styles.menuButton}>
              <AntDesign name="menu-fold" size={24} color={iconColor} />
            </Pressable>
            <ThemedText type="subtitle" style={styles.groupName}>
              {group?.name || 'Carregando...'}
            </ThemedText>
          </View>
          <Pressable style={styles.memberButton} onPress={() => router.push(`/group/invite-group?groupId=${groupId}`)}>
            <IconSymbol name="person.2.fill" size={20} color="rgba(128, 128, 128, 0.6)" />
          </Pressable>
        </View>

        <View style={styles.summaryContainer}>
          <SummaryCard 
            title={`Total da ${group?.name || 'viagem'}`} 
            value={summary?.totalSpent || 0} 
            type="total" 
          />
          <View style={styles.row}>
            <SummaryCard 
              title="Receber" 
              value={summary?.totalToReceive || 0} 
              type="receive" 
            />
            <SummaryCard 
              title="Pagar" 
              value={summary?.totalToPay || 0} 
              type="pay" 
            />
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Lista de transações
          </ThemedText>
          <ThemedText style={styles.dateHeader}>
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </ThemedText>

          <View style={styles.transactionsList}>
            {isLoadingTransactions ? (
              <ThemedText>Carregando transações...</ThemedText>
            ) : transactions?.length === 0 ? (
              <ThemedText style={styles.emptyText}>Nenhuma transação encontrada.</ThemedText>
            ) : (
              transactions?.map((item) => (
                <TransactionItem 
                  key={item.id} 
                  transaction={item} 
                  onPress={handleTransactionPress} 
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        groups={groups}
        currentGroupId={groupId}
        onSelectGroup={handleGroupSelect}
      />

      <Modal
        visible={!!selectedTransactionId}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="subtitle">Detalhe transação</ThemedText>
            <ThemedText style={styles.modalId}>ID: {selectedTransactionId}</ThemedText>
            <Pressable style={styles.closeButton} onPress={closeModal}>
              <ThemedText style={styles.closeButtonText}>Fechar</ThemedText>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuButton: {
    padding: 4,
  },
  groupName: {
    fontSize: 34, 
    flex: 1,
  },
  memberButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  transactionsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  dateHeader: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 16,
    fontFamily: Fonts.semiBold,
  },
  transactionsList: {
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 16,
  },
  modalId: {
    opacity: 0.7,
  },
  closeButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#5DC264',
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
