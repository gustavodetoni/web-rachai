import { TransactionResponse } from '@/functions/transaction-get';
import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';
import { Fonts } from '@/constants/theme';

interface TransactionItemProps {
  transaction: TransactionResponse;
  onPress: (id: string) => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isDark = useColorScheme() === 'dark';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const getCategoryIcon = (category: string): any => {
    const cat = category.toLowerCase();
    if (cat.includes('alimentação') || cat.includes('comida') || cat.includes('restaurante')) {
      return 'restaurant';
    }
    if (cat.includes('transporte') || cat.includes('viagem')) {
      return 'directions-bus';
    }
    if (cat.includes('mercado') || cat.includes('compras')) {
      return 'cart.fill';
    }
    return 'receipt';
  };

  const isIncome = transaction.type === 'RECEIVE' || transaction.type === 'PAYMENT';
  const amountColor = isIncome 
    ? (isDark ? '#4ade80' : '#72e3ad') 
    : (isDark ? '#ef4444' : '#ca3214');
  const stripeColor = isIncome 
    ? (isDark ? '#4ade80' : '#72e3ad') 
    : (isDark ? '#ef4444' : '#ca3214');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).toUpperCase();
  };

  return (
    <Pressable onPress={() => onPress(transaction.id)}>
      <ThemedView style={[styles.container, isDark && styles.containerDark]}>
        <View style={[styles.stripe, { backgroundColor: stripeColor }]} />
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <IconSymbol 
              name={transaction.type === 'RECEIVE' ? 'dollarsign.circle.fill' : getCategoryIcon(transaction.category)} 
              size={24} 
              color={isDark ? '#f5f5f5' : '#333'} 
            />
          </View>

          <View style={styles.info}>
            <ThemedText style={styles.category}>{transaction.category}</ThemedText>
            <ThemedText style={styles.name} numberOfLines={1}>{transaction.name}</ThemedText>
            <ThemedText style={styles.details}>
              {transaction.type === 'RECEIVE' ? 'Você recebeu' : 'Você pagou'} • {formatDate(transaction.createdAt)}
            </ThemedText>
          </View>

          <ThemedText style={[styles.amount, { color: amountColor }]}>
            {formatCurrency(transaction.amount)}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#fcfcfc', 
    borderWidth: 1,
    borderColor: '#dfdfdf', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.17,
    shadowRadius: 3,
    elevation: 2,
  },
  containerDark: {
    backgroundColor: '#171717', 
    borderColor: '#292929', 
    shadowColor: '#000',
  },
  stripe: {
    width: 10,
    height: '100%',
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 12, 
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  category: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: '#888888',
    textTransform: 'capitalize',
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  details: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: '#888888',
  },
  amount: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
});
