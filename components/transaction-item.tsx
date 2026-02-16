import { Fonts } from '@/constants/theme';
import { TransactionResponse } from '@/functions/transaction-get';
import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import DrinksIcon from '@/assets/images/categories/drinks.svg';
import EntertainmentIcon from '@/assets/images/categories/entreteriment.svg';
import FoodIcon from '@/assets/images/categories/food.svg';
import FuelIcon from '@/assets/images/categories/fuel.svg';
import MoneyIcon from '@/assets/images/categories/money.svg';
import OthersIcon from '@/assets/images/categories/others.svg';
import RentIcon from '@/assets/images/categories/rent.svg';

const CATEGORY_IMAGES: Record<string, React.FC<SvgProps>> = {
  FOOD: FoodIcon,
  FUEL: FuelIcon,
  DRINKS: DrinksIcon,
  RENT: RentIcon,
  ENTERTAINMENT: EntertainmentIcon,
  OTHERS: OthersIcon,
};

const categoryLabels: Record<string, string> = {
  FOOD: 'Alimentação',
  FUEL: 'Combustível',
  DRINKS: 'Bebidas',
  RENT: 'Aluguel',
  ENTERTAINMENT: 'Entretenimento',
  OTHERS: 'Outros',
};


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

  const getCategoryImage = (category: string) => {
    const key = category?.toUpperCase();
    return CATEGORY_IMAGES[key] || CATEGORY_IMAGES.OTHERS;
  };

  const isIncome = transaction.type === 'RECEIVE';
  const amountColor = isIncome 
    ? (isDark ? '#4ade80' : '#4ade80') 
    : (isDark ? '#ef4444' : '#ef4444');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).toUpperCase();
  };

  const getDetailsInfo = () => {
    return categoryLabels[transaction.category] ?? transaction.category;
  };

  const receiver = transaction.type === 'RECEIVE' || transaction.type === 'PAYMENT' || transaction.type === 'TRANSFER';

  const CategoryIcon = getCategoryImage(transaction.category);

  return (
    <Pressable onPress={() => onPress(transaction.id)}>
      <ThemedView style={[styles.container, isDark && styles.containerDark]}>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {receiver ? (
              <MoneyIcon width={40} height={40} viewBox="0 0 1024 1024" />
            ) : (
              <CategoryIcon width={40} height={40} viewBox="0 0 1024 1024" />
            )}
          </View>

          <View style={styles.info}>
            <ThemedText style={styles.name} numberOfLines={1}>
              {transaction.name.charAt(0).toUpperCase() + transaction.name.slice(1)}
            </ThemedText>
            <ThemedText style={styles.details}>
              {getDetailsInfo()} • {formatDate(transaction.createdAt)}
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
    marginBottom: 4,
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
    borderColor: '#171717', 
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
    // borderRadius: 22,
    // backgroundColor: 'rgba(128, 128, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    padding: 4, 
  },
  category: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: '#888888',
    textTransform: 'capitalize',
  },
  name: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
  },
  details: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: '#888888',
  },
  amount: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
});
