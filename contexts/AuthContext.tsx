import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '@/types';
import { GoogleSheetsService } from '@/services/googleSheets';
import StorageService from '@/services/storage';
import { parseQRData } from '@/utils/qrCode';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await StorageService.getItem<User>('currentUser');
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await GoogleSheetsService.getUserByCredentials(username, password);
      if (response.success && response.data && response.data.length > 0) {
        const userData = response.data[0];
        const user: User = {
          id: userData.id,
          name: userData.name,
          role: userData.role,
          password: userData.password,
          qrCode: userData.qrCode,
          subscriptionStatus: userData.subscriptionStatus,
          createdAt: userData.createdAt
        };
        
        setUser(user);
        await StorageService.setItem('currentUser', user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithQR = async (qrData: string): Promise<boolean> => {
    setLoading(true);
    try {
      const parsedData = parseQRData(qrData);
      if (!parsedData) {
        return false;
      }

      const response = await GoogleSheetsService.getUserByQR(qrData);
      if (response.success && response.data && response.data.length > 0) {
        const userData = response.data[0];
        const user: User = {
          id: userData.id,
          name: userData.name,
          role: userData.role,
          password: userData.password,
          qrCode: userData.qrCode,
          subscriptionStatus: userData.subscriptionStatus,
          createdAt: userData.createdAt
        };
        
        setUser(user);
        await StorageService.setItem('currentUser', user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('QR login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    await StorageService.removeItem('currentUser');
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithQR,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};