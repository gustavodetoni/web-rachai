import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VerifyPhone from '@/assets/images/verify-phone.svg';
import { Sidebar } from '@/components/sidebar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { getGroups } from '@/functions/groups-get';
import { getUser } from '@/functions/user-get';

export default function GroupIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
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
        
        if (groups[0]?.id) {
          router.replace(`/group/${groups[0].id}`);
        } else {
          setIsCheckingStorage(false);
        }
      } catch (error) {
        console.error('Error checking local storage:', error);
        if (groups && groups.length > 0 && groups[0]?.id) {
          router.replace(`/group/${groups[0].id}`);
        } else {
          setIsCheckingStorage(false);
        }
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

  if (isLoading || isCheckingStorage) {
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
      <View style={styles.header}>
        <Pressable onPress={() => setIsSidebarOpen(true)} style={styles.menuButton}>
            <AntDesign name="menu-fold" size={24} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.title}>Vamos começar!</ThemedText>
        
        <View style={styles.imageContainer}>
            <VerifyPhone width={224} height={235} />
        </View>

        <View style={styles.buttonsContainer}>
            <Pressable style={styles.actionButton} onPress={handleCreateGroup}>
                <View style={styles.iconWrapper}>
                     <AntDesign name="plus-circle" size={24} color="#fff" />
                </View>
                <View style={styles.textWrapper}>
                    <ThemedText style={styles.buttonTitle}>Criar um grupo</ThemedText>
                    <ThemedText style={styles.buttonSubtitle}>Crie um grupo e convide pessoas.</ThemedText>
                </View>
            </Pressable>

            <View style={styles.separator} />

            <Pressable style={styles.actionButton}>
                <View style={styles.iconWrapper}>
                     <AntDesign name="team" size={24} color="#fff" />
                </View>
                <View style={styles.textWrapper}>
                    <ThemedText style={styles.buttonTitle}>Participar de um grupo</ThemedText>
                    <ThemedText style={styles.buttonSubtitle}>Entre em um grupo já existente.</ThemedText>
                </View>
            </Pressable>
        </View>
      </View>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        groups={groups}
        currentGroupId=""
        onSelectGroup={(groupId) => router.push(`/group/${groupId}`)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-start',
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    paddingTop: 20,
    fontSize: 32,
    color: '#35b16c',
    marginBottom: 40,
    fontFamily: Fonts.extraBold,
  },
  imageContainer: {
    marginBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsContainer: {
    width: '100%',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    marginRight: 16,
  },
  textWrapper: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
    fontFamily: Fonts.semiBold,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#b2b2b2',
    fontFamily: Fonts.regular,
  },
  separator: {
    height: 1,
    backgroundColor: '#2c2c2e',
  },
});
