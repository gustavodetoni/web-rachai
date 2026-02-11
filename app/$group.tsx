import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type GroupRouteParams = {
  group?: string;
};

export default function GroupScreen() {
  const { group } = useLocalSearchParams<GroupRouteParams>();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Detalhes do grupo</ThemedText>
        <ThemedText style={styles.subtitle}>
          Em breve você verá aqui o resumo financeiro, despesas e membros deste grupo.
        </ThemedText>
        {group ? (
          <ThemedText style={styles.groupId}>ID do grupo: {group}</ThemedText>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  content: {
    gap: 12,
  },
  subtitle: {
    opacity: 0.8,
  },
  groupId: {
    marginTop: 12,
    opacity: 0.7,
  },
});

