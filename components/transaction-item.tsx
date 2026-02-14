import { TransactionResponse } from '@/functions/transaction-get';
import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

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
  const amountColor = isIncome ? '#5DC264' : '#FF5252';
  const stripeColor = isIncome ? '#5DC264' : '#FF5252';

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
              color={isDark ? '#fff' : '#333'} 
            />
          </View>

          <View style={styles.info}>
            <ThemedText style={styles.category}>{transaction.category}</ThemedText>
            <ThemedText style={styles.name} numberOfLines={1}>{transaction.name}</ThemedText>
            <ThemedText style={styles.details}>
              {formatDate(transaction.createdAt)}
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
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  stripe: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
    gap: 2,
  },
  category: {
    fontSize: 12,
    opacity: 0.6,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 12,
    opacity: 0.6,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
