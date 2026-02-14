import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';

interface SummaryCardProps {
  title: string;
  value: number;
  type: 'total' | 'receive' | 'pay';
}

export function SummaryCard({ title, value, type }: SummaryCardProps) {
  const isDark = useColorScheme() === 'dark';
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const colors = {
    total: '#5DC264',
    receive: '#5DC264',
    pay: '#FF5252',
  };

  if (type === 'total') {
    return (
      <ThemedView style={[styles.card, styles.totalCard, isDark && styles.cardDark]}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={[styles.value, { color: colors.total }]}>
          {formatCurrency(value)}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.card, styles.smallCard, isDark && styles.cardDark]}>
      <ThemedText style={styles.smallTitle}>{title}</ThemedText>
      <View style={styles.smallValueContainer}>
        <IconSymbol 
          name={type === 'receive' ? 'arrow.up.circle.fill' : 'arrow.down.circle.fill'} 
          size={16} 
          color={colors[type]} 
        />
        <ThemedText style={styles.smallValue}>
          {formatCurrency(value)}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
    backgroundColor: '#fff',
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalCard: {
    width: '100%',
    marginBottom: 12,
    minHeight: 140,
    justifyContent: 'center',
    padding: 24,
  },
  smallCard: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    paddingTop: 8,
    fontWeight: 'bold',
  },
  smallTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    textAlign: 'center',
  },
  smallValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  smallValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
