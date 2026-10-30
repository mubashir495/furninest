'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import {
  saveSession,
  saveUser,
  clearSession,
  getStoredUser,
  getAccessToken,
} from '@/lib/axios';
import { authService } from '@/services/authService';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { User } from '@/Type/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const resetCart = useCartStore((s) => s.reset);
  const resetWishlist = useWishlistStore((s) => s.reset);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storedUser = getStoredUser<User>();
      const token = getAccessToken();

      if (token) {
        // Optimistically show stored user to prevent flashing
        if (storedUser) {
          setUser(storedUser);
        }

        try {
          // Verify JWT token with backend
          const profile = await authService.getProfile();
          if (isMounted) {
            setUser(profile);
            saveUser(profile);
            fetchCart();
            fetchWishlist();
          }
        } catch {
          // Token is invalid/expired and refresh failed
          if (isMounted) {
            clearSession();
            setUser(null);
            resetCart();
            resetWishlist();
          }
        }
      } else {
        if (isMounted) {
          clearSession();
          setUser(null);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    function handleSessionExpired() {
      setUser(null);
      resetCart();
      resetWishlist();
    }

    window.addEventListener('furninest:session-expired', handleSessionExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('furninest:session-expired', handleSessionExpired);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    (newUser: User, accessToken: string, refreshToken: string) => {
      saveSession(accessToken, refreshToken);
      saveUser(newUser);
      setUser(newUser);
      fetchCart();
      fetchWishlist();
    },
    [fetchCart, fetchWishlist],
  );

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    clearSession();
    setUser(null);
    resetCart();
    resetWishlist();
  }, [resetCart, resetWishlist]);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      saveUser(next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
