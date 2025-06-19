const SHEETS_API_BASE_URL = 'https://script.google.com/macros/s/AKfycbydy5mHmE5HCOBFwE7PX-2hwPiZaTVSicGcoVe3SaIVk8muhbsAUS54hzfHxDa5zI3a/exec';

export class GoogleSheetsService {
  private static async makeRequest(
    sheet: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any,
    action: string = 'get'
  ) {
    try {
      const url = new URL(SHEETS_API_BASE_URL);
      url.searchParams.append('sheet', sheet);
      url.searchParams.append('action', action);

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data && method === 'POST') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url.toString(), options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        data: result.data ?? result,
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
    return this.makeRequest('users', 'GET', null, 'get');
  }

  static async getUserByCredentials(name: string, password: string) {
    const url = new URL(SHEETS_API_BASE_URL);
    url.searchParams.append('sheet', 'users');
    url.searchParams.append('action', 'search');
    url.searchParams.append('name', name);
    url.searchParams.append('password', password);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return {
        success: true,
        data: result.data ?? result,
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

  static async addUser(user: any) {
    return this.makeRequest('users', 'POST', user, 'add');
  }

  // عمليات الاشتراكات
  static async getSubscriptions() {
    return this.makeRequest('subscriptions', 'GET', null, 'get');
  }

  static async addSubscription(subscription: any) {
    return this.makeRequest('subscriptions', 'POST', subscription, 'add');
  }

  // عمليات الحضور
  static async getAttendance() {
    return this.makeRequest('attendance', 'GET', null, 'get');
  }

  static async recordAttendance(record: any) {
    return this.makeRequest('attendance', 'POST', record, 'add');
  }

  // إعدادات
  static async getSettings() {
    return this.makeRequest('settings', 'GET', null, 'get');
  }
}
