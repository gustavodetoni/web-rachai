import { AntDesign } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useFocusEffect, useGlobalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sidebar } from '@/components/sidebar';
import { SummaryCard } from '@/components/summary-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionItem } from '@/components/transaction-item';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Menu, MenuItem } from '@/components/ui/menu';
import { Colors, Fonts } from '@/constants/theme';
import { getExpenseSummary } from '@/functions/expense-summary-get';
import { leaveOrDeleteGroup } from '@/functions/groups-delete';
import { getGroups } from '@/functions/groups-get';
import { getTransactionDetail } from '@/functions/transaction-detail-get';
import { getTransactions } from '@/functions/transaction-get';
import { getUser } from '@/functions/user-get';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GroupScreen() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const groupId = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuRef = useRef<View>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

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

  const { data: transactionDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['transaction-detail', selectedTransactionId],
    queryFn: () => getTransactionDetail(selectedTransactionId!),
    enabled: !!selectedTransactionId,
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

  const handleMenuPress = () => {
    menuRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setMenuAnchor({ x: pageX, y: pageY, width, height });
      setIsMenuVisible(true);
    });
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Editar grupo',
      icon: 'square.and.pencil',
      onPress: () => {},
      disabled: true,
    },
    {
      label: 'Convidar',
      icon: 'square.and.arrow.up', 
      onPress: () => {
        if (groupId) {
          router.push(`/group/invite-group?groupId=${groupId}`);
        }
      },
    },
    {
      label: 'Excluir grupo',
      icon: 'rectangle.portrait.and.arrow.right',
      destructive: true,
      onPress: () => {
        if (!groupId) return;
        Alert.alert(
          'Excluir grupo',
          'Tem certeza que deseja excluir este grupo? Essa ação não pode ser desfeita.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Excluir',
              style: 'destructive',
              onPress: async () => {
                try {
                  await leaveOrDeleteGroup(groupId);
                  await AsyncStorage.removeItem('lastSessionGroupId');
                  router.replace('/group');
                } catch (error) {
                  Alert.alert('Erro', error instanceof Error ? error.message : 'Erro ao excluir grupo');
                }
              },
            },
          ]
        );
      },
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <View ref={menuRef} collapsable={false}>
            <Pressable 
              style={styles.memberButton} 
              onPress={handleMenuPress}
            >
              <IconSymbol name="ellipsis" size={20} color="rgba(128, 128, 128, 0.6)" />
            </Pressable>
          </View>
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

      <Menu
        visible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        items={menuItems}
        anchor={menuAnchor}
      />

      <Modal
        visible={!!selectedTransactionId}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Detalhes da Transação</ThemedText>
              <Pressable onPress={closeModal} style={styles.closeIcon}>
                <AntDesign name="close" size={24} color={iconColor} />
              </Pressable>
            </View>

            {isLoadingDetail ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5DC264" />
              </View>
            ) : transactionDetail ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailHeader}>
                  <View style={styles.detailIconContainer}>
                    <IconSymbol 
                      name={transactionDetail.type === 'EXPENSE' ? 'cart.fill' : 'arrow.right.arrow.left'} 
                      size={32} 
                      color="#fff" 
                    />
                  </View>
                  <ThemedText type="title" style={styles.detailAmount}>
                    {formatCurrency(transactionDetail.amount)}
                  </ThemedText>
                  <ThemedText style={styles.detailTitle}>{transactionDetail.name}</ThemedText>
                  <ThemedText style={styles.detailDate}>{formatDate(transactionDetail.createdAt)}</ThemedText>
                </View>

                <View style={styles.detailSection}>
                  <ThemedText type="defaultSemiBold" style={styles.detailLabel}>Categoria</ThemedText>
                  <ThemedText>{transactionDetail.category || 'Geral'}</ThemedText>
                </View>

                <View style={styles.detailSection}>
                  <ThemedText type="defaultSemiBold" style={styles.detailLabel}>Quem pagou</ThemedText>
                  <ThemedText>{transactionDetail.userName}</ThemedText>
                </View>

                {transactionDetail.expenseInvoice && (
                  <View style={styles.detailSection}>
                    <ThemedText type="defaultSemiBold" style={styles.detailLabel}>Comprovante da Despesa</ThemedText>
                    <Pressable onPress={() => setFullScreenImage(transactionDetail.expenseInvoice!)}>
                      <Image 
                        source={{ uri: transactionDetail.expenseInvoice }} 
                        style={[
                          styles.invoiceImage,
                          { backgroundColor: isDark ? '#000000' : '#ffffff' }
                        ]} 
                        contentFit="cover"
                        transition={1000}
                      />
                    </Pressable>
                  </View>
                )}

                {transactionDetail.splits && transactionDetail.splits.length > 0 && (
                  <View style={styles.detailSection}>
                    <ThemedText type="defaultSemiBold" style={styles.detailLabel}>Divisão</ThemedText>
                    {transactionDetail.splits.map((split) => (
                      <View key={split.userId} style={styles.splitRow}>
                        <ThemedText style={styles.splitUser}>{split.userName}</ThemedText>
                        <View style={styles.splitInfo}>
                          <ThemedText style={styles.splitAmount}>{formatCurrency(split.amount)}</ThemedText>
                          {split.paid ? (
                            <ThemedText style={styles.paidStatus}>Pago</ThemedText>
                          ) : (
                            <ThemedText style={styles.pendingStatus}>Pendente</ThemedText>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {transactionDetail.type === 'PAYMENT' && transactionDetail.splits?.some(s => s.evidence) && (
                   <View style={styles.detailSection}>
                    <ThemedText type="defaultSemiBold" style={styles.detailLabel}>Comprovante de Pagamento</ThemedText>
                     {transactionDetail.splits.filter(s => s.evidence).map((s, idx) => (
                      <Pressable onPress={() => setFullScreenImage(s.evidence!)}>
                       <View key={idx} style={{ marginTop: 8 }}>
                          <Image 
                            source={{ uri: s.evidence }} 
                            style={[
                              styles.invoiceImage,
                              { backgroundColor: isDark ? '#000000' : '#ffffff' }
                            ]} 
                            contentFit="cover"
                            transition={1000}
                          />
                       </View>
                       </Pressable>
                     ))}
                   </View>
                )}
              </ScrollView>
            ) : (
              <View style={styles.errorContainer}>
                <ThemedText>Não foi possível carregar os detalhes.</ThemedText>
              </View>
            )}
          </ThemedView>
        </View>
      <ImageViewing
        images={[{ uri: fullScreenImage || '' }]}
        imageIndex={0}
        visible={!!fullScreenImage}
        onRequestClose={() => setFullScreenImage(null)}
      />
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeIcon: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  detailIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#5DC264',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  detailAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.8,
  },
  detailDate: {
    fontSize: 14,
    opacity: 0.5,
  },
  detailSection: {
    marginBottom: 24,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  invoiceImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#000000ff',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  splitUser: {
    fontSize: 16,
    fontWeight: '500',
  },
  splitInfo: {
    alignItems: 'flex-end',
  },
  splitAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  paidStatus: {
    fontSize: 12,
    color: '#5DC264',
    fontWeight: '600',
  },
  pendingStatus: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
});
