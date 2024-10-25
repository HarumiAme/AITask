import React, { createContext, useContext, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthProviderProps {
  children: React.ReactNode;
  navigate: NavigateFunction;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, navigate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (email: string, password: string) => {
    // TODO: Implement actual API call
    // Simulated login
    setUser({
      id: '1',
      name: 'Demo User',
      email: email
    });
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const register = async (email: string, password: string, name: string) => {
    // TODO: Implement actual API call
    // Simulated registration
    setUser({
      id: '1',
      name: name,
      email: email
    });
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};