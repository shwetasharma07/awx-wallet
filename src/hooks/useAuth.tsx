import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('@wallet:user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // In a real app, you would make an API call here
      // For demo purposes, we'll simulate authentication
      if (!email || !password) {
        throw new Error('Please enter email and password');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a mock user
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        createdAt: new Date(),
      };

      await AsyncStorage.setItem('@wallet:user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // In a real app, you would make an API call here
      // For demo purposes, we'll simulate registration
      if (!email || !password || !name) {
        throw new Error('Please fill in all fields');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a new user
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        createdAt: new Date(),
      };

      await AsyncStorage.setItem('@wallet:user', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('@wallet:user');
      await AsyncStorage.removeItem('@wallet:walletId');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};