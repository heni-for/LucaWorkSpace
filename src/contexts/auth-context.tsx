'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing authentication on mount
    const checkAuth = () => {
      try {
        const isAuth = localStorage.getItem('isAuthenticated');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');

        if (isAuth === 'true' && userEmail) {
          setUser({
            id: '1', // In real app, this would come from the server
            email: userEmail,
            name: userName || userEmail,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || userEmail)}&background=3b82f6&color=ffffff`,
          });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an actual API call
      if (email && password.length >= 6) {
        const userData: User = {
          id: '1',
          email,
          name: email.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=3b82f6&color=ffffff`,
        };
        
        setUser(userData);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', userData.name);
        
        router.push('/dashboard');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser: User = {
        id: '1',
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${userData.firstName} ${userData.lastName}`)}&background=3b82f6&color=ffffff`,
      };
      
      setUser(newUser);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('userName', newUser.name);
      
      router.push('/dashboard');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('rememberMe');
    router.push('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userName', updatedUser.name);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
