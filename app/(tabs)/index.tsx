import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'

import { GroupCard } from '@/components/group-card'
import { HelloWave } from '@/components/hello-wave'
import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { getGroups } from '@/functions/groups-get'
import { getUser } from '@/functions/user-get'

export default function HomeScreen() {
  const router = useRouter()

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
    router.push('/create-group')
  }

  return (
    <ThemedView style={styles.screen}>
      <ParallaxScrollView
        headerBackgroundColor={{ dark: '#ffffff', light: '#ffffff' }}
        headerImage={
          <Image
            source={require('@/assets/images/group-image.png')}
            style={styles.reactLogo}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
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
      </ParallaxScrollView>

      <Pressable style={styles.fab} onPress={handleCreateGroup}>
        <IconSymbol name="plus" size={28} color="#ffffff" />
      </Pressable>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionSubtitle: {
    opacity: 0.75,
  },
  groupsContainer: {
    marginTop: 10,
    gap: 12,
  },
  emptyState: {
    paddingVertical: 24,
    gap: 8,
  },
  emptyStateText: {
    opacity: 0.8,
  },
  reactLogo: {
    height: 350,
    width: 350,
    top: 0,
    left: 100,
    position: 'absolute',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5DC264',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5DC264',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    zIndex: 999,        // 👈 importante
  },
})
