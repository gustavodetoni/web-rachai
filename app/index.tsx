import { Fonts } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  if (showSplash || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          <Text style={styles.logoText}>Rachaì</Text>
        </View>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/group" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#76db75',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: Fonts.extraBold,
    fontSize: 70,
    color: '#000000',
    letterSpacing: -2,
  },
});
