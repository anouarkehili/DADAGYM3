import { User } from '@/types';

export const generateQRData = (user: User): string => {
  return JSON.stringify({
    id: user.id,
    name: user.name,
    role: user.role,
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