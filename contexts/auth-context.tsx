import { JWT_NAME } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

type AuthContextValue = {
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(JWT_NAME);
        if (storedToken && storedToken.trim().length > 0) {
          setAccessToken(storedToken);
        } else {
          setAccessToken(null);
          await AsyncStorage.removeItem(JWT_NAME);
        }
      } catch (error) {
        console.error('Erro ao carregar token:', error);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadToken();
  }, []);

  const signIn = useCallback(async (token: string) => {
    setAccessToken(token);
    await AsyncStorage.setItem(JWT_NAME, token);
  }, []);

  const signOut = useCallback(async () => {
    setAccessToken(null);
    await AsyncStorage.removeItem(JWT_NAME);
  }, []);

  const value: AuthContextValue = {
    accessToken,
    isLoading,
    isAuthenticated: !!accessToken,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return ctx;
}

