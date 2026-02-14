import { Fonts } from '@/constants/theme';
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
    total: isDark ? '#4ade80' : '#72e3ad',
    receive: isDark ? '#4ade80' : '#72e3ad',
    pay: isDark ? '#ef4444' : '#ca3214',
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfdfdf', 
    backgroundColor: '#fcfcfc', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.17,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#171717',
    borderColor: '#292929',
    shadowColor: '#000',
  },
  totalCard: {
    width: '100%',
    marginBottom: 12,
    minHeight: 120,
    justifyContent: 'center',
    padding: 24,
  },
  smallCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
    fontFamily: Fonts.semiBold,
  },
  value: {
    fontSize: 28,
    paddingTop: 8,
    fontFamily: Fonts.bold,
  },
  smallTitle: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Fonts.semiBold,
  },
  smallValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  smallValue: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
});
