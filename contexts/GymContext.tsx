import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GymContextType, User, Subscription, Attendance } from '@/types';
import { GoogleSheetsService } from '@/services/googleSheets';
import StorageService from '@/services/storage';
import { generateUniqueId, formatDate, formatTime } from '@/utils/qrCode';

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
      const [usersResponse, subsResponse, attendanceResponse] = await Promise.all([
        GoogleSheetsService.getUsers(),
        GoogleSheetsService.getSubscriptions(),
        GoogleSheetsService.getAttendance()
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
        await StorageService.setItem('users', usersResponse.data || []);
      }

      if (subsResponse.success) {
        setSubscriptions(subsResponse.data || []);
        await StorageService.setItem('subscriptions', subsResponse.data || []);
      }

      if (attendanceResponse.success) {
        setAttendance(attendanceResponse.data || []);
        await StorageService.setItem('attendance', attendanceResponse.data || []);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateUniqueId(),
      createdAt: new Date().toISOString()
    };

    try {
      const response = await GoogleSheetsService.addUser(newUser);
      if (response.success) {
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        await StorageService.setItem('users', updatedUsers);
      } else {
        throw new Error(response.error || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await GoogleSheetsService.updateUser(userId, updates);
      if (response.success) {
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, ...updates } : user
        );
        setUsers(updatedUsers);
        await StorageService.setItem('users', updatedUsers);
      } else {
        throw new Error(response.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await GoogleSheetsService.deleteUser(userId);
      if (response.success) {
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        await StorageService.setItem('users', updatedUsers);
      } else {
        throw new Error(response.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
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
      // Add to local state immediately
      const updatedAttendance = [...attendance, attendanceRecord];
      setAttendance(updatedAttendance);
      await StorageService.setItem('attendance', updatedAttendance);

      // Try to sync with server
      const response = await GoogleSheetsService.recordAttendance({
        ...attendanceRecord,
        synced: true
      });

      if (response.success) {
        // Mark as synced
        attendanceRecord.synced = true;
        const syncedAttendance = updatedAttendance.map(record =>
          record.id === attendanceRecord.id ? { ...record, synced: true } : record
        );
        setAttendance(syncedAttendance);
        await StorageService.setItem('attendance', syncedAttendance);
      }
    } catch (error) {
      console.error('Error recording attendance:', error);
      // Keep the record locally for later sync
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

  const syncOfflineData = async () => {
    try {
      const unsyncedRecords = attendance.filter(record => !record.synced);
      
      if (unsyncedRecords.length > 0) {
        const response = await GoogleSheetsService.batchCreateAttendance(unsyncedRecords);
        
        if (response.success) {
          const syncedAttendance = attendance.map(record => ({ ...record, synced: true }));
          setAttendance(syncedAttendance);
          await StorageService.setItem('attendance', syncedAttendance);
        }
      }
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  const value: GymContextType = {
    users,
    subscriptions,
    attendance,
    addUser,
    updateUser,
    deleteUser,
    recordAttendance,
    getAttendanceHistory,
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