import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { Group } from '@/functions/groups-get';
import { User } from '@/functions/user-get';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  groups?: Group[];
  currentGroupId?: string;
  onSelectGroup: (groupId: string) => void;
};

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.7;

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

export function Sidebar({
  isOpen,
  onClose,
  user,
  groups,
  currentGroupId,
  onSelectGroup,
}: SidebarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();

  const [isVisible, setIsVisible] = useState(false);

  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      translateX.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withTiming(-SIDEBAR_WIDTH, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(setIsVisible)(false);
        }
      });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isOpen]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleCreateGroup = () => {
    onClose();
    router.push('/group/create-group');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleGroupPress = async (groupId: string) => {
    try {
      await AsyncStorage.setItem('lastSessionGroupId', groupId);
    } catch (error) {
      console.error('Failed to save last session group id:', error);
    }
    onSelectGroup(groupId);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <TouchableWithoutFeedback>
            <AnimatedThemedView
              style={[
                styles.sidebar,
                { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
                animatedStyle,
              ]}
            >
              <View style={styles.header}>
                <View style={styles.userInfo}>
                  {user?.thumbnail ? (
                    <Image
                      source={{ uri: user.thumbnail }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <ThemedText style={styles.avatarText}>
                        {user?.name?.charAt(0).toUpperCase() || '?'}
                      </ThemedText>
                    </View>
                  )}
                  <ThemedText type="subtitle" numberOfLines={1}>
                    {user?.name || 'Usuário'}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.sectionTitle}>Seus grupos</ThemedText>

              <ScrollView
                style={styles.groupsList}
                contentContainerStyle={styles.groupsListContent}
              >
                {groups?.map((group) => (
                  <Pressable
                    key={group.id}
                    style={[
                      styles.groupItem,
                      currentGroupId === group.id && styles.activeGroupItem,
                    ]}
                    onPress={() => handleGroupPress(group.id)}
                  >
                    {group.thumbnail ? (
                      <Image
                        source={{ uri: group.thumbnail }}
                        style={styles.groupThumbnail}
                      />
                    ) : (
                      <View style={[styles.groupThumbnail, styles.groupPlaceholder]}>
                        <ThemedText style={styles.groupPlaceholderText}>
                          {group.name.charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                    )}
                    <ThemedText
                      style={[
                        styles.groupName,
                        currentGroupId === group.id && styles.activeGroupText,
                      ]}
                      numberOfLines={1}
                    >
                      {group.name}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.footer}>
                <Pressable style={styles.createButton} onPress={handleCreateGroup}>
                  <AntDesign name="plus" size={20} color={Colors.dark.muted} />
                  <ThemedText style={styles.createButtonText}>Criar grupo</ThemedText>
                </Pressable>
                <Pressable style={styles.createButton}>
                  <AntDesign name="question-circle" size={20} color={Colors.dark.border} />
                  <ThemedText style={styles.createoffButtonText}>Help & Feedback</ThemedText>
                </Pressable>
                <Pressable style={styles.createButton}>
                  <AntDesign name="info-circle" size={20} color={Colors.dark.border} />
                  <ThemedText style={styles.createoffButtonText}>About</ThemedText>
                </Pressable>
                <Pressable style={styles.createButton} onPress={handleSignOut}>
                  <AntDesign name="logout" size={20} color={Colors.dark.muted} />
                  <ThemedText style={styles.createButtonText}>Log-out</ThemedText>
                </Pressable>
              </View>
            </AnimatedThemedView>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  sidebar: {
    width: '70%',
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 12,
    opacity: 0.6,
    paddingHorizontal: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  groupsList: {
    flex: 1,
  },
  groupsListContent: {
    paddingHorizontal: 12,
    gap: 4,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeGroupItem: {
    backgroundColor: 'rgba(141, 141, 141, 0.12)',
  },
  groupThumbnail: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  groupPlaceholder: {
    backgroundColor: 'rgba(150, 150, 150, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupName: {
    fontSize: 16,
    flex: 1,
  },
  activeGroupText: {
    fontWeight: '600',
  },
  footer: {
    padding: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  createButtonText: {
    fontSize: 16,
    color: '#a2a2a2',
    fontWeight: '600',
  },
  createoffButtonText: {
    fontSize: 16,
    color: '#292929',
    fontWeight: '600',
  },
});
