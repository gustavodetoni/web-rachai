import { JWT_EXPIRES_AT_NAME, JWT_NAME } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
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
  expiresAt: number | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(JWT_NAME);
        const storedExpiresAt = await AsyncStorage.getItem(JWT_EXPIRES_AT_NAME);

        if (storedToken && storedExpiresAt) {
          const parsedExpiresAt = parseInt(storedExpiresAt, 10);
          if (new Date().getTime() < parsedExpiresAt) {
            setAccessToken(storedToken);
            setExpiresAt(parsedExpiresAt);
          } else {
            console.warn('Token expirado ou inválido, realizando signOut.');
            await signOut();
          }
        }
      } catch (error) {
        console.error('Erro ao carregar token:', error);
        await signOut();
      } finally {
        setIsLoading(false);
      }
    };

    void loadToken();
  }, []);

  const signIn = useCallback(async (token: string) => {
    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      const newExpiresAt = decodedToken.exp * 1000;

      setAccessToken(token);
      setExpiresAt(newExpiresAt);
      await AsyncStorage.setItem(JWT_NAME, token);
      await AsyncStorage.setItem(JWT_EXPIRES_AT_NAME, newExpiresAt.toString());
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error);
      await signOut();
    }
  }, []);

  const signOut = useCallback(async () => {
    setAccessToken(null);
    setExpiresAt(null);
    await AsyncStorage.removeItem(JWT_NAME);
    await AsyncStorage.removeItem(JWT_EXPIRES_AT_NAME);
    await AsyncStorage.removeItem('lastSessionGroupId');
  }, []);

  useEffect(() => {
    if (expiresAt) {
      const timeout = setInterval(() => {
        if (new Date().getTime() > expiresAt) {
          console.warn('Token expirado, realizando signOut automático.');
          void signOut();
        }
      }, 60 * 1000);

      return () => clearInterval(timeout);
    }
  }, [expiresAt, signOut]);

  const value: AuthContextValue = {
    accessToken,
    expiresAt,
    isLoading,
    isAuthenticated: !!accessToken && !!expiresAt && new Date().getTime() < expiresAt,
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
