import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GymContextType, User, Subscription, Attendance } from '@/types';
import { FirebaseService } from '@/services/firebaseService';
import StorageService from '@/services/storage';
import { generateUniqueId, formatDate, formatTime, generateQRData } from '@/utils/qrCode';

const GymContext = createContext<GymContextType | undefined>(undefined);

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};

interface GymProviderProps {
  children: ReactNode;
}

export const GymProvider: React.FC<GymProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCachedData();
    refreshData();
    
    // Set up real-time listeners
    const unsubscribeUsers = FirebaseService.subscribeToUsers((users) => {
      setUsers(users);
      StorageService.setItem('users', users);
    });

    const unsubscribeAttendance = FirebaseService.subscribeToAttendance((attendance) => {
      setAttendance(attendance);
      StorageService.setItem('attendance', attendance);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeAttendance();
    };
  }, []);

  const loadCachedData = async () => {
    try {
      const cachedUsers = await StorageService.getItem<User[]>('users') || [];
      const cachedSubs = await StorageService.getItem<Subscription[]>('subscriptions') || [];
      const cachedAttendance = await StorageService.getItem<Attendance[]>('attendance') || [];
      
      setUsers(cachedUsers);
      setSubscriptions(cachedSubs);
      setAttendance(cachedAttendance);
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [usersData, subsData, attendanceData, pendingData] = await Promise.all([
        FirebaseService.getUsers(),
        FirebaseService.getSubscriptions(),
        FirebaseService.getAttendance(),
        FirebaseService.getPendingUsers()
      ]);

      setUsers(usersData);
      setSubscriptions(subsData);
      setAttendance(attendanceData);
      setPendingUsers(pendingData);

      // Cache data
      await Promise.all([
        StorageService.setItem('users', usersData),
        StorageService.setItem('subscriptions', subsData),
        StorageService.setItem('attendance', attendanceData)
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const userId = await FirebaseService.addUser({
        ...userData,
        createdAt: new Date().toISOString()
      });

      // Generate QR code
      const qrCode = generateQRData({ ...userData, id: userId });
      await FirebaseService.updateUser(userId, { qrCode });

      await refreshData();
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await FirebaseService.updateUser(userId, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await FirebaseService.deleteUser(userId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const recordAttendance = async (userId: string, type: 'check-in' | 'check-out') => {
    try {
      await FirebaseService.recordAttendance({
        userId,
        date: formatDate(new Date()),
        time: formatTime(new Date()),
        type,
        synced: true
      });
    } catch (error) {
      console.error('Error recording attendance:', error);
      throw error;
    }
  };

  const getAttendanceHistory = (userId?: string, date?: string): Attendance[] => {
    let filtered = attendance;

    if (userId) {
      filtered = filtered.filter(record => record.userId === userId);
    }

    if (date) {
      filtered = filtered.filter(record => record.date === date);
    }

    return filtered.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
  };

  const approveUser = async (userId: string, subscriptionData: {
    type: 'monthly' | 'quarterly' | 'yearly';
    startDate: string;
    endDate: string;
  }) => {
    try {
      await FirebaseService.approveUser(userId, {
        ...subscriptionData,
        status: 'active'
      });
      await refreshData();
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  };

  const addSubscription = async (subscriptionData: Omit<Subscription, 'id'>) => {
    try {
      await FirebaseService.addSubscription(subscriptionData);
      await refreshData();
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  };

  const syncOfflineData = async () => {
    // Firebase handles real-time sync automatically
    await refreshData();
  };

  const value: GymContextType = {
    users,
    subscriptions,
    attendance,
    pendingUsers,
    addUser,
    updateUser,
    deleteUser,
    recordAttendance,
    getAttendanceHistory,
    approveUser,
    addSubscription,
    syncOfflineData,
    refreshData,
    loading
  };

  return (
    <GymContext.Provider value={value}>
      {children}
    </GymContext.Provider>
  );
};