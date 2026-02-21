import { BlurView } from 'expo-blur';
import { Fragment } from 'react';
import { Modal, Platform, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../themed-text';
import { IconSymbol } from './icon-symbol';
import { Colors } from '@/constants/theme';

export type MenuItem = {
  label: string;
  icon?: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

interface MenuProps {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
  anchor?: { x: number; y: number; width: number; height: number } | null;
}

export function Menu({ visible, onClose, items, anchor }: MenuProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!visible) return null;

  // Default position if no anchor provided (center)
  const menuStyle = anchor
    ? {
        top: anchor.y + anchor.height + 8,
        right: 20, // Align right with some margin
        // Or calculate left based on anchor.x but right alignment is safer for overflow
      }
    : {
        top: insets.top + 60,
        right: 20,
      };

  const backgroundColor = isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  const textColor = isDark ? '#fff' : '#000';
  const separatorColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 0} // Android blur is tricky, fallback to opacity
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.menuContainer,
            menuStyle,
            Platform.OS === 'android' && { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', elevation: 5 },
          ]}
        >
          {items.map((item, index) => (
            <Fragment key={index}>
              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                  item.disabled && styles.menuItemDisabled,
                ]}
                onPress={() => {
                  if (!item.disabled) {
                    onClose();
                    // Small delay to allow closing animation
                    setTimeout(item.onPress, 100);
                  }
                }}
                disabled={item.disabled}
              >
                <ThemedText
                  style={[
                    styles.menuText,
                    { color: item.destructive ? '#FF3B30' : textColor },
                    item.disabled && { opacity: 0.5 },
                  ]}
                >
                  {item.label}
                </ThemedText>
                {item.icon && (
                  <IconSymbol
                    name={item.icon as any}
                    size={20}
                    color={item.destructive ? '#FF3B30' : (item.disabled ? 'rgba(128, 128, 128, 0.5)' : textColor)}
                  />
                )}
              </Pressable>
              {index < items.length - 1 && (
                <View style={[styles.separator, { backgroundColor: separatorColor }]} />
              )}
            </Fragment>
          ))}
        </BlurView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // No background color to keep it clean, or use slight dim
    // backgroundColor: 'rgba(0,0,0,0.1)',
  },
  menuContainer: {
    position: 'absolute',
    width: 250,
    borderRadius: 12,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
