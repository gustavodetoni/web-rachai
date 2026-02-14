import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Group } from '@/functions/groups-get';

type GroupCardProps = {
  group: Group;
};

export function GroupCard({ group }: GroupCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/group/[groupId]',
      params: { groupId: group.id },
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.pressable}>
      <ThemedView
        lightColor="#ffffff"
        darkColor="#1E2021"
        style={styles.card}
      >
        <View style={styles.thumbnailWrapper}>
          <Image
            source={
              group.thumbnail
                ? { uri: group.thumbnail }
                : require('@/assets/images/big.png')
            }
            style={styles.thumbnail}
          />
        </View>
        <View style={styles.info}>
          <ThemedText type="subtitle" numberOfLines={1}>
            {group.name}
          </ThemedText>
          {group.description ? (
            <ThemedText numberOfLines={2} style={styles.description}>
              {group.description}
            </ThemedText>
          ) : (
            <ThemedText numberOfLines={1} style={styles.descriptionMuted}>
              Sem descrição adicionada.
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
    borderWidth: 1, // Added border
    borderColor: 'rgba(128, 128, 128, 0.2)', // Subtle border color for both themes
    shadowColor: '#000', // Adjusted for better cross-theme visibility
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  thumbnailWrapper: {
    width: 54,
    height: 54,
    borderRadius: 18,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  description: {
    fontSize: 14,
  },
  descriptionMuted: {
    fontSize: 14,
    opacity: 0.7,
  },
});
