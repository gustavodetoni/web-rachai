import ImageViewing from '@/components/ui/image-viewer';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useFocusEffect, useGlobalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StatusBar, StyleSheet, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sidebar } from '@/components/sidebar';
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
      if (groupId) {
        refetchSummary();
        refetchTransactions();
      }
    }, [refetchSummary, refetchTransactions, groupId])
  );

  const group = groups?.find((g) => g.id === groupId);
  const headerIconColor = '#FFFFFF'; 
  const iconColor = isDark ? Colors.dark.text : Colors.light.text;

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
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerShape, { height: 280 + insets.top }]}>
           <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
            <Pressable onPress={() => setIsSidebarOpen(true)} style={styles.menuButton}>
              <Feather name="menu" size={28} color={headerIconColor} />
            </Pressable>
            <ThemedText 
              type="title" 
              style={styles.headerTitle} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {group?.name || 'Carregando...'}
            </ThemedText>
            <View ref={menuRef} collapsable={false}>
              <Pressable 
                style={styles.moreButton} 
                onPress={handleMenuPress}
              >
                <Feather name="more-horizontal" size={28} color={headerIconColor} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Spacer para posicionar o card corretamente (sobrepondo o verde) */}
        <View style={{ marginTop: -100 }} />

        {/* Summary Card */}
        <View style={[
          styles.summaryCard, 
          { 
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            shadowColor: isDark ? '#000' : '#000',
          }
        ]}>
          <View style={styles.summaryHeader}>
            <ThemedText style={styles.summaryLabel}>Total da viagem</ThemedText>
          </View>
          
          <ThemedText style={[styles.summaryTotalValue, { color: Colors.light.tint }]}>
            {formatCurrency(summary?.totalSpent || 0)}
          </ThemedText>

          <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]} />

          <View style={styles.summaryRow}>
            <Pressable 
              style={styles.summaryColumn}
              onPress={() => router.push(`/group/${groupId}/pendings`)}
            >
              <View style={[styles.summaryBadge, { backgroundColor: isDark ? '#1f2d25' : '#e6f7ed' }]}>
                <ThemedText style={[styles.summaryBadgeText, { color: Colors.light.tint }]}>A receber</ThemedText>
              </View>
              <ThemedText style={[styles.summarySubValue, { color: Colors.light.tint }]}>
                {formatCurrency(summary?.totalToReceive || 0)}
              </ThemedText>
            </Pressable>
            
            <View style={[styles.verticalDivider, { backgroundColor: isDark ? '#333' : '#F0F0F0' }]} />

            <Pressable 
              style={styles.summaryColumn}
              onPress={() => router.push(`/group/${groupId}/pendings`)}
            >
              <View style={[styles.summaryBadge, { backgroundColor: isDark ? '#3f2222' : '#fce8e8' }]}>
                <ThemedText style={[styles.summaryBadgeText, { color: isDark ? '#ef4444' : '#ca3214' }]}>A pagar</ThemedText>
              </View>
              <ThemedText style={[styles.summarySubValue, { color: isDark ? '#ef4444' : '#ca3214' }]}>
                {formatCurrency(summary?.totalToPay || 0)}
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Transações recentes
            </ThemedText>
            <ThemedText style={styles.dateHeader}>
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </ThemedText>
          </View>

          <View style={styles.transactionsList}>
            {isLoadingTransactions ? (
              <ActivityIndicator color={Colors.light.tint} style={{ marginTop: 20 }} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerShape: {
    width: '100%',
    backgroundColor: '#2E9E5F',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28, // Large title
    fontWeight: '800', // Extra bold
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    padding: 8,
    marginLeft: -8,
  },
  moreButton: {
    padding: 8,
    marginRight: -8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: -80, // Overlap effect
    borderRadius: 20,
    padding: 24,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#A1ACBA',
    fontWeight: '500',
  },
  summaryTotalValue: {
    fontSize: 36,
    fontWeight: '800',
    paddingTop: 22,
    marginBottom: 18,
    fontFamily: Fonts.extraBold,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: '80%',
  },
  summaryColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  summaryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 4,
  },
  summaryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summarySubValue: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
  },
  transactionsSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
  },
  dateHeader: {
    fontSize: 13,
    color: '#A1ACBA',
    fontWeight: '600',
  },
  transactionsList: {
    gap: 16,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    width: '100%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
    backgroundColor: Colors.light.tint,
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
    borderRadius: 16,
    backgroundColor: '#000000ff',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
    color: Colors.light.tint,
    fontWeight: '600',
  },
  pendingStatus: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
});
