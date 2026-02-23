import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Slot, useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

export default function GroupLayout() {
  const params = useGlobalSearchParams();
  const groupId = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const navigateTo = (path: string) => {
    if (!groupId) return;
    router.replace({
      pathname: path as any,
      params: { groupId },
    });
  };

  const isCreateExpense = pathname.includes('/create-expense');
  const isPendings = pathname.includes('/pendings');
  const isIndex = !isPendings && !isCreateExpense;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Slot />
      </View>

      {!isCreateExpense && 
        <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        activeOpacity={0.8}
        onPress={() => navigateTo('/group/[groupId]/create-expense')}
        >
          <View style={styles.fabCircle}>
            <MaterialIcons name="add" size={32} color="#ffffff" />
          </View>
        </TouchableOpacity>
      }

      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: isDark ? '#000000' : '#ffffff',
            paddingBottom: insets.bottom + 10,
            borderTopColor: isDark ? '#333' : 'rgba(128, 128, 128, 0.1)',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.tabItem}
            hitSlop={{ top: 20, bottom: 20, left: 100, right: 100 }}
          onPress={() => navigateTo('/group/[groupId]')}
        >
          <MaterialIcons
            name="house"
            size={28}
            color={isIndex ? '#5DC264' : colors.tabIconDefault}
          />
          {isIndex && <View style={styles.activeDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
            hitSlop={{ top: 20, bottom: 20, left: 100, right: 100 }}
          onPress={() => navigateTo('/group/[groupId]/pendings')}
        >
          <MaterialIcons
            name="account-balance-wallet"
            size={28}
            color={isPendings ? '#5DC264' : colors.tabIconDefault}
          />
          {isPendings && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingTop: 16,
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#5DC264',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  fabCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5DC264',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
