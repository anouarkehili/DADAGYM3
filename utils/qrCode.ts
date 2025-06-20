import { User } from '@/types';

export const generateQRData = (user: User): string => {
  return JSON.stringify({
    id: user.id,
    name: user.name,
    role: user.role,
    timestamp: Date.now()
  });
};

export const generateGymQRData = (): string => {
  return JSON.stringify({
    type: 'gym_checkin',
    gym: 'DADA GYM',
    timestamp: Date.now()
  });
};

export const parseQRData = (qrData: string): { id: string; name: string; role: string; timestamp: number } | null => {
  try {
    const parsed = JSON.parse(qrData);
    if (parsed.id && parsed.name && parsed.role && parsed.timestamp) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Error parsing QR data:', error);
    return null;
  }
};

export const generateUniqueId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatTime = (date: Date): string => {
  return date.toTimeString().split(' ')[0];
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const isSubscriptionActive = (endDate: string): boolean => {
  const today = new Date();
  const subscriptionEnd = new Date(endDate);
  return subscriptionEnd >= today;
};

export const getDaysUntilExpiry = (endDate: string): number => {
  const today = new Date();
  const subscriptionEnd = new Date(endDate);
  const diffTime = subscriptionEnd.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const generateAdminCredentials = (name: string): { username: string; password: string } => {
  const username = name.replace(/\s+/g, '').toLowerCase();
  const password = `admin_${Math.random().toString(36).substr(2, 8)}`;
  return { username, password };
};

export const validateSubscriptionDates = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end > start;
};

export const calculateSubscriptionPrice = (type: 'monthly' | 'quarterly' | 'yearly'): number => {
  const prices = {
    monthly: 200,
    quarterly: 550,
    yearly: 2000
  };
  return prices[type];
};

export const formatCurrency = (amount: number): string => {
  return `${amount} ريال`;
};

export const getSubscriptionTypeLabel = (type: 'monthly' | 'quarterly' | 'yearly'): string => {
  const labels = {
    monthly: 'شهري',
    quarterly: 'ربع سنوي',
    yearly: 'سنوي'
  };
  return labels[type];
};

export const getStatusColor = (status: 'active' | 'expired' | 'pending'): string => {
  const colors = {
    active: '#34C759',
    expired: '#FF3B30',
    pending: '#FF9500'
  };
  return colors[status];
};

export const getStatusLabel = (status: 'active' | 'expired' | 'pending'): string => {
  const labels = {
    active: 'نشط',
    expired: 'منتهي',
    pending: 'معلق'
  };
  return labels[status];
};