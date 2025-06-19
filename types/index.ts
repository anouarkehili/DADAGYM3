export interface User {
  id: string;
  name: string;
  role: 'admin' | 'member';
  password: string;
  qrCode: string;
  subscriptionStatus: 'active' | 'expired' | 'pending';
  createdAt: string;
  phone?: string;
  email?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'expired';
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  time: string;
  type: 'check-in' | 'check-out';
  synced: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithQR: (qrData: string) => Promise<boolean>;
  register: (userData: {
    name: string;
    password: string;
    phone?: string;
    email?: string;
  }) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export interface GymContextType {
  users: User[];
  subscriptions: Subscription[];
  attendance: Attendance[];
  pendingUsers?: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  recordAttendance: (userId: string, type: 'check-in' | 'check-out') => Promise<void>;
  getAttendanceHistory: (userId?: string, date?: string) => Attendance[];
  approveUser?: (userId: string, subscriptionData: {
    type: 'monthly' | 'quarterly' | 'yearly';
    startDate: string;
    endDate: string;
  }) => Promise<void>;
  addSubscription?: (subscriptionData: Omit<Subscription, 'id'>) => Promise<void>;
  syncOfflineData: () => Promise<void>;
  refreshData: () => Promise<void>;
  loading: boolean;
}

export interface SheetResponse {
  success: boolean;
  data?: any;
  error?: string;
}