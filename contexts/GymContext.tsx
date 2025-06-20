import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GymContextType, User, Subscription, Attendance } from '@/types';
import { GoogleSheetsService } from '@/services/googleSheets';
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
        GoogleSheetsService.getUsers(),
        GoogleSheetsService.getSubscriptions(),
        GoogleSheetsService.getAttendance(),
        GoogleSheetsService.getPendingUsers()
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
      // If online fetch fails, try to use cached data
      await loadCachedData();
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      const userId = await GoogleSheetsService.addUser({
        ...userData,
        createdAt: new Date().toISOString()
      });

      // Generate QR code
      const qrCode = generateQRData({ ...userData, id: userId });
      await GoogleSheetsService.updateUser(userId, { qrCode });

      await refreshData();
    } catch (error) {
      console.error('Error adding user:', error);
      
      // Fallback to local storage if online fails
      const localUser: User = {
        ...userData,
        id: generateUniqueId(),
        createdAt: new Date().toISOString(),
        qrCode: generateQRData({ ...userData, id: generateUniqueId() })
      };
      
      const updatedUsers = [...users, localUser];
      setUsers(updatedUsers);
      await StorageService.setItem('users', updatedUsers);
      
      throw error;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await GoogleSheetsService.updateUser(userId, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating user:', error);
      
      // Fallback to local update
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      );
      setUsers(updatedUsers);
      await StorageService.setItem('users', updatedUsers);
      
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await GoogleSheetsService.deleteUser(userId);
      await refreshData();
    } catch (error) {
      console.error('Error deleting user:', error);
      
      // Fallback to local deletion
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      await StorageService.setItem('users', updatedUsers);
      
      throw error;
    }
  };

  const recordAttendance = async (userId: string, type: 'check-in' | 'check-out') => {
    const attendanceRecord: Attendance = {
      id: generateUniqueId(),
      userId,
      date: formatDate(new Date()),
      time: formatTime(new Date()),
      type,
      synced: false
    };

    try {
      // Add to local state immediately for better UX
      const updatedAttendance = [attendanceRecord, ...attendance];
      setAttendance(updatedAttendance);
      await StorageService.setItem('attendance', updatedAttendance);

      // Try to sync with Google Sheets
      await GoogleSheetsService.recordAttendance({
        ...attendanceRecord,
        synced: true
      });

      // Update local record as synced
      const syncedAttendance = updatedAttendance.map(record =>
        record.id === attendanceRecord.id ? { ...record, synced: true } : record
      );
      setAttendance(syncedAttendance);
      await StorageService.setItem('attendance', syncedAttendance);

    } catch (error) {
      console.error('Error recording attendance:', error);
      // Keep the local record as unsynced
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
      await GoogleSheetsService.approveUser(userId, {
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
      await GoogleSheetsService.addSubscription(subscriptionData);
      await refreshData();
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  };

  const syncOfflineData = async () => {
    try {
      const unsyncedAttendance = attendance.filter(record => !record.synced);
      
      for (const record of unsyncedAttendance) {
        try {
          await GoogleSheetsService.recordAttendance({
            ...record,
            synced: true
          });
        } catch (error) {
          console.error('Error syncing attendance record:', record.id, error);
        }
      }

      await refreshData();
    } catch (error) {
      console.error('Error syncing offline data:', error);
      throw error;
    }
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