import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getGroups } from '@/functions/groups-get';

export default function GroupIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  const {
    data: groups,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    async function checkLastGroup() {
      if (!groups || groups.length === 0) {
        setIsCheckingStorage(false);
        return;
      }

      try {
        const lastGroupId = await AsyncStorage.getItem('lastSessionGroupId');
        
        if (lastGroupId) {
          const groupExists = groups.find(g => g.id === lastGroupId);
          if (groupExists) {
            router.replace(`/group/${lastGroupId}`);
            return;
          }
        }
        router.replace(`/group/${groups[0].id}`);
      } catch (error) {
        console.error('Error checking local storage:', error);
        router.replace(`/group/${groups[0].id}`);
      } finally {
        setIsCheckingStorage(false);
      }
    }

    if (!isLoading && groups) {
      checkLastGroup();
    } else if (!isLoading && !groups) {
        setIsCheckingStorage(false);
    }
  }, [groups, isLoading, router]);


  const handleCreateGroup = () => {
    router.push('/group/create-group');
  };

  if (isLoading || (groups && groups.length > 0 && isCheckingStorage)) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Não foi possível carregar seus grupos.</ThemedText>
        <Pressable onPress={() => refetch()} style={{ marginTop: 20 }}>
          <ThemedText type="link">Tentar novamente</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <ThemedView style={styles.emptyState}>
          <IconSymbol name="plus" size={48} color="gray" />
          <ThemedText type="subtitle">Nenhum grupo por aqui ainda</ThemedText>
          <ThemedText style={styles.emptyStateText}>
            Toque no botão + para criar seu primeiro grupo e começar a organizar
            seus gastos em conjunto.
          </ThemedText>
        </ThemedView>
      </View>

      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={handleCreateGroup}
      >
        <IconSymbol name="plus" size={28} color="#ffffff" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  emptyStateText: {
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5DC264',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 12,
  },
});
