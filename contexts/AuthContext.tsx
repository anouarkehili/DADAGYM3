import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '@/types';
import { FirebaseService } from '@/services/firebaseService';
import StorageService from '@/services/storage';
import { parseQRData, generateQRData } from '@/utils/qrCode';

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
      const userData = await FirebaseService.getUserByCredentials(username, password);
      if (userData) {
        setUser(userData);
        await StorageService.setItem('currentUser', userData);
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

      const userData = await FirebaseService.getUserByQR(qrData);
      if (userData) {
        setUser(userData);
        await StorageService.setItem('currentUser', userData);
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

  const register = async (userData: {
    name: string;
    password: string;
    phone?: string;
    email?: string;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      const newUser: Omit<User, 'id'> = {
        name: userData.name,
        password: userData.password,
        role: 'member',
        qrCode: '', // Will be generated after user creation
        subscriptionStatus: 'pending',
        createdAt: new Date().toISOString(),
        phone: userData.phone,
        email: userData.email
      };

      const userId = await FirebaseService.addUser(newUser);
      
      // Generate QR code with user ID
      const qrCode = generateQRData({ ...newUser, id: userId });
      await FirebaseService.updateUser(userId, { qrCode });

      const createdUser = { ...newUser, id: userId, qrCode };
      setUser(createdUser);
      await StorageService.setItem('currentUser', createdUser);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
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
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};