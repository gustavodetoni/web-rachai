import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets

import { GroupCard } from '@/components/group-card'
import { HelloWave } from '@/components/hello-wave'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { getGroups } from '@/functions/groups-get'
import { getUser } from '@/functions/user-get'

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: getUser,
  })

  const {
    data: groups,
    isLoading: isLoadingGroups,
    isError: isErrorGroups,
  } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  })

  const handleCreateGroup = () => {
    router.push('/group/create-group')
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + 24 },
        ]}
        pointerEvents="box-none"
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title">
            {user ? `Bem-vindo, ${user.name.split(' ')[0]}!` : 'Bem-vindo!'}
          </ThemedText>
          <HelloWave />
        </ThemedView>

        <ThemedView style={styles.sectionHeader}>
          <ThemedText type="subtitle">Seus grupos</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Acompanhe e crie novos rachinhas com seus amigos.
          </ThemedText>
        </ThemedView>

        <View style={styles.groupsContainer}>
          {isLoadingGroups ? (
            <ThemedText>Carregando seus grupos...</ThemedText>
          ) : isErrorGroups ? (
            <ThemedText>
              Não foi possível carregar seus grupos. Tente novamente mais tarde.
            </ThemedText>
          ) : !groups || groups.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <IconSymbol name="plus" size={48} color="gray" />
              <ThemedText type="subtitle">
                Nenhum grupo por aqui ainda
              </ThemedText>
              <ThemedText style={styles.emptyStateText}>
                Toque no botão + para criar seu primeiro grupo e começar a
                organizar seus gastos em conjunto.
              </ThemedText>
            </ThemedView>
          ) : (
            groups.map((group) => <GroupCard key={group.id} group={group} />)
          )}
        </View>
      </ScrollView>

      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 10 }]}
        onPress={handleCreateGroup}
        pointerEvents="auto"
      >
        <IconSymbol name="plus" size={28} color="#ffffff" />
      </Pressable>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionSubtitle: {
    opacity: 0.7,
    fontSize: 14,
  },
  groupsContainer: {
    marginTop: 16,
    gap: 12,
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
    zIndex: 999,
  },
})
