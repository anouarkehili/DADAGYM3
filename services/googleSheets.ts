// Google Sheets API integration service
// يمكنك استخدام Google Apps Script أو خدمات مثل SheetDB أو NocodeAPI

// خيار 1: استخدام SheetDB (الأسهل)
const SHEETS_API_BASE_URL = 'https://sheetdb.io/api/v1/YOUR_SHEET_ID';

// خيار 2: استخدام Google Apps Script
// const SHEETS_API_BASE_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// خيار 3: استخدام NocodeAPI
// const SHEETS_API_BASE_URL = 'https://v1.nocodeapi.com/YOUR_WORKSPACE/google_sheets/YOUR_PROJECT_ID';

export class GoogleSheetsService {
  private static async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any) {
    try {
      const url = `${SHEETS_API_BASE_URL}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          // إضافة API Key إذا كنت تستخدم NocodeAPI
          // 'Authorization': 'Bearer YOUR_API_KEY',
        },
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      return {
        success: true,
        data: result,
        error: null
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // عمليات المستخدمين
  static async getUsers() {
    return this.makeRequest('/users');
  }

  static async getUserByCredentials(username: string, password: string) {
    // البحث عن المستخدم بالاسم وكلمة المرور
    return this.makeRequest(`/users/search?name=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
  }

  static async getUserByQR(qrCode: string) {
    return this.makeRequest(`/users/search?qrCode=${encodeURIComponent(qrCode)}`);
  }

  static async addUser(user: any) {
    return this.makeRequest('/users', 'POST', user);
  }

  static async updateUser(userId: string, updates: any) {
    return this.makeRequest(`/users/${userId}`, 'PUT', updates);
  }

  static async deleteUser(userId: string) {
    return this.makeRequest(`/users/${userId}`, 'DELETE');
  }

  // عمليات الاشتراكات
  static async getSubscriptions() {
    return this.makeRequest('/subscriptions');
  }

  static async getUserSubscription(userId: string) {
    return this.makeRequest(`/subscriptions/search?userId=${userId}`);
  }

  static async addSubscription(subscription: any) {
    return this.makeRequest('/subscriptions', 'POST', subscription);
  }

  static async updateSubscription(subscriptionId: string, updates: any) {
    return this.makeRequest(`/subscriptions/${subscriptionId}`, 'PUT', updates);
  }

  // عمليات الحضور
  static async getAttendance() {
    return this.makeRequest('/attendance');
  }

  static async getAttendanceByDate(date: string) {
    return this.makeRequest(`/attendance/search?date=${date}`);
  }

  static async getAttendanceByUser(userId: string) {
    return this.makeRequest(`/attendance/search?userId=${userId}`);
  }

  static async recordAttendance(attendance: any) {
    return this.makeRequest('/attendance', 'POST', attendance);
  }

  // عمليات مجمعة للمزامنة غير المتصلة
  static async batchCreateAttendance(attendanceRecords: any[]) {
    return this.makeRequest('/attendance/batch', 'POST', { records: attendanceRecords });
  }

  // إحصائيات النادي
  static async getGymStats() {
    return this.makeRequest('/stats');
  }

  // تحديث حالة الاشتراك
  static async updateSubscriptionStatus(userId: string, status: string) {
    return this.makeRequest(`/users/${userId}/subscription-status`, 'PUT', { status });
  }
}

// مساعد لإنشاء Google Sheets جديد
export const createGoogleSheetsStructure = () => {
  return {
    users: {
      headers: ['id', 'name', 'role', 'password', 'qrCode', 'subscriptionStatus', 'createdAt', 'phone', 'email'],
      sampleData: [
        ['admin_001', 'مدير النادي', 'admin', 'admin123', 'QR_admin_001', 'active', '2024-01-01', '966501234567', 'admin@dadagym.com'],
        ['member_001', 'أحمد محمد', 'member', 'member123', 'QR_member_001', 'active', '2024-01-01', '966501234568', 'ahmed@example.com']
      ]
    },
    subscriptions: {
      headers: ['id', 'userId', 'startDate', 'endDate', 'type', 'status', 'price', 'paymentMethod'],
      sampleData: [
        ['sub_001', 'member_001', '2024-01-01', '2024-02-01', 'monthly', 'active', '200', 'cash'],
        ['sub_002', 'admin_001', '2024-01-01', '2025-01-01', 'yearly', 'active', '2000', 'bank_transfer']
      ]
    },
    attendance: {
      headers: ['id', 'userId', 'date', 'time', 'type', 'synced', 'location'],
      sampleData: [
        ['att_001', 'member_001', '2024-01-15', '08:30:00', 'check-in', 'true', 'main_entrance'],
        ['att_002', 'member_001', '2024-01-15', '10:30:00', 'check-out', 'true', 'main_entrance']
      ]
    },
    settings: {
      headers: ['key', 'value', 'description', 'updatedAt'],
      sampleData: [
        ['gym_name', 'DADA GYM', 'اسم النادي', '2024-01-01'],
        ['gym_phone', '966501234567', 'رقم هاتف النادي', '2024-01-01'],
        ['gym_address', 'الرياض، المملكة العربية السعودية', 'عنوان النادي', '2024-01-01'],
        ['monthly_price', '200', 'سعر الاشتراك الشهري', '2024-01-01'],
        ['quarterly_price', '550', 'سعر الاشتراك ربع السنوي', '2024-01-01'],
        ['yearly_price', '2000', 'سعر الاشتراك السنوي', '2024-01-01']
      ]
    }
  };
};