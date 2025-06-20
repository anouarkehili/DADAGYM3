import { User, Subscription, Attendance, SheetResponse } from '@/types';

// Google Sheets configuration
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Replace with your actual Google Sheet ID
const API_KEY = 'YOUR_GOOGLE_SHEETS_API_KEY'; // Replace with your API key
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`;

// Alternative: Using Google Apps Script Web App
const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL'; // Replace with your script URL

export class GoogleSheetsService {
  // Helper method to make API requests
  private static async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Google Sheets API Error:', error);
      throw error;
    }
  }

  // Users methods
  static async getUsers(): Promise<User[]> {
    try {
      const url = `${BASE_URL}/users!A:I?key=${API_KEY}`;
      const response = await this.makeRequest(url);
      
      if (!response.values || response.values.length < 2) {
        return [];
      }

      const [headers, ...rows] = response.values;
      return rows.map((row: any[]) => ({
        id: row[0] || '',
        name: row[1] || '',
        role: row[2] || 'member',
        password: row[3] || '',
        qrCode: row[4] || '',
        subscriptionStatus: row[5] || 'pending',
        createdAt: row[6] || new Date().toISOString(),
        phone: row[7] || undefined,
        email: row[8] || undefined,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async addUser(userData: Omit<User, 'id'>): Promise<string> {
    try {
      const userId = `user_${Date.now()}`;
      const values = [[
        userId,
        userData.name,
        userData.role,
        userData.password,
        userData.qrCode,
        userData.subscriptionStatus,
        userData.createdAt,
        userData.phone || '',
        userData.email || ''
      ]];

      const url = `${BASE_URL}/users!A:I:append?valueInputOption=RAW&key=${API_KEY}`;
      await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify({ values }),
      });

      return userId;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      // First, find the user row
      const users = await this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const rowNumber = userIndex + 2; // +2 because sheets are 1-indexed and we have headers
      const user = users[userIndex];
      
      // Update the user object
      const updatedUser = { ...user, ...updates };
      
      const values = [[
        updatedUser.id,
        updatedUser.name,
        updatedUser.role,
        updatedUser.password,
        updatedUser.qrCode,
        updatedUser.subscriptionStatus,
        updatedUser.createdAt,
        updatedUser.phone || '',
        updatedUser.email || ''
      ]];

      const url = `${BASE_URL}/users!A${rowNumber}:I${rowNumber}?valueInputOption=RAW&key=${API_KEY}`;
      await this.makeRequest(url, {
        method: 'PUT',
        body: JSON.stringify({ values }),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      // Note: Google Sheets API doesn't have a direct delete row method
      // You would need to implement this using Google Apps Script
      // For now, we'll mark the user as deleted by updating their status
      await this.updateUser(userId, { subscriptionStatus: 'deleted' as any });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Subscriptions methods
  static async getSubscriptions(): Promise<Subscription[]> {
    try {
      const url = `${BASE_URL}/subscriptions!A:F?key=${API_KEY}`;
      const response = await this.makeRequest(url);
      
      if (!response.values || response.values.length < 2) {
        return [];
      }

      const [headers, ...rows] = response.values;
      return rows.map((row: any[]) => ({
        id: row[0] || '',
        userId: row[1] || '',
        startDate: row[2] || '',
        endDate: row[3] || '',
        type: row[4] || 'monthly',
        status: row[5] || 'active',
      }));
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  static async addSubscription(subscriptionData: Omit<Subscription, 'id'>): Promise<string> {
    try {
      const subscriptionId = `sub_${Date.now()}`;
      const values = [[
        subscriptionId,
        subscriptionData.userId,
        subscriptionData.startDate,
        subscriptionData.endDate,
        subscriptionData.type,
        subscriptionData.status
      ]];

      const url = `${BASE_URL}/subscriptions!A:F:append?valueInputOption=RAW&key=${API_KEY}`;
      await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify({ values }),
      });

      return subscriptionId;
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  }

  // Attendance methods
  static async getAttendance(): Promise<Attendance[]> {
    try {
      const url = `${BASE_URL}/attendance!A:F?key=${API_KEY}`;
      const response = await this.makeRequest(url);
      
      if (!response.values || response.values.length < 2) {
        return [];
      }

      const [headers, ...rows] = response.values;
      return rows.map((row: any[]) => ({
        id: row[0] || '',
        userId: row[1] || '',
        date: row[2] || '',
        time: row[3] || '',
        type: row[4] || 'check-in',
        synced: row[5] === 'true' || true,
      }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  }

  static async recordAttendance(attendanceData: Omit<Attendance, 'id'>): Promise<string> {
    try {
      const attendanceId = `att_${Date.now()}`;
      const values = [[
        attendanceId,
        attendanceData.userId,
        attendanceData.date,
        attendanceData.time,
        attendanceData.type,
        'true' // synced
      ]];

      const url = `${BASE_URL}/attendance!A:F:append?valueInputOption=RAW&key=${API_KEY}`;
      await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify({ values }),
      });

      return attendanceId;
    } catch (error) {
      console.error('Error recording attendance:', error);
      throw error;
    }
  }

  // Authentication methods
  static async getUserByCredentials(username: string, password: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return users.find(user => 
        user.name === username && 
        user.password === password &&
        user.subscriptionStatus !== 'deleted'
      ) || null;
    } catch (error) {
      console.error('Error getting user by credentials:', error);
      return null;
    }
  }

  static async getUserByQR(qrCode: string): Promise<User | null> {
    try {
      const users = await this.getUsers();
      return users.find(user => 
        user.qrCode === qrCode &&
        user.subscriptionStatus !== 'deleted'
      ) || null;
    } catch (error) {
      console.error('Error getting user by QR:', error);
      return null;
    }
  }

  // Admin methods
  static async getPendingUsers(): Promise<User[]> {
    try {
      const users = await this.getUsers();
      return users.filter(user => user.subscriptionStatus === 'pending');
    } catch (error) {
      console.error('Error getting pending users:', error);
      return [];
    }
  }

  static async approveUser(userId: string, subscriptionData: Omit<Subscription, 'id' | 'userId'>): Promise<void> {
    try {
      // Add subscription
      await this.addSubscription({
        ...subscriptionData,
        userId
      });

      // Update user status
      await this.updateUser(userId, {
        subscriptionStatus: 'active'
      });
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  }

  // Settings methods
  static async getSettings(): Promise<Record<string, string>> {
    try {
      const url = `${BASE_URL}/settings!A:B?key=${API_KEY}`;
      const response = await this.makeRequest(url);
      
      if (!response.values || response.values.length < 2) {
        return {};
      }

      const [headers, ...rows] = response.values;
      const settings: Record<string, string> = {};
      
      rows.forEach((row: any[]) => {
        if (row[0] && row[1]) {
          settings[row[0]] = row[1];
        }
      });

      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {};
    }
  }

  static async updateSetting(key: string, value: string): Promise<void> {
    try {
      // This would require finding the setting row and updating it
      // Implementation depends on your specific needs
      console.log(`Updating setting ${key} to ${value}`);
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  // Utility method to create admin users directly in sheets
  static async createAdminUser(adminData: {
    name: string;
    password: string;
    phone?: string;
    email?: string;
  }): Promise<string> {
    try {
      const adminUser: Omit<User, 'id'> = {
        name: adminData.name,
        role: 'admin',
        password: adminData.password,
        qrCode: `QR_admin_${Date.now()}`,
        subscriptionStatus: 'active',
        createdAt: new Date().toISOString(),
        phone: adminData.phone,
        email: adminData.email
      };

      return await this.addUser(adminUser);
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  // Batch operations for better performance
  static async batchUpdateUsers(updates: Array<{ userId: string; updates: Partial<User> }>): Promise<void> {
    try {
      // Implement batch update logic
      for (const update of updates) {
        await this.updateUser(update.userId, update.updates);
      }
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }

  // Data export methods
  static async exportData(): Promise<{
    users: User[];
    subscriptions: Subscription[];
    attendance: Attendance[];
  }> {
    try {
      const [users, subscriptions, attendance] = await Promise.all([
        this.getUsers(),
        this.getSubscriptions(),
        this.getAttendance()
      ]);

      return { users, subscriptions, attendance };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}