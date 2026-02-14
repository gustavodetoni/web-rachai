import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function GroupLayout() {
  const router = useRouter();
  const activeColor = '#5DC264';
  const inactiveColor = useThemeColor({}, 'tabIconDefault');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderTopWidth: 1,
          borderTopColor: 'rgba(128, 128, 128, 0.1)',
          height: 80,
        },
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Transações',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-expense"
        options={{
          title: 'Adicionar',
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.fabContainer,
              { backgroundColor: activeColor }
            ]}>
              <IconSymbol size={32} name="plus" color="#ffffff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pendings"
        options={{
          title: 'Pendências',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
