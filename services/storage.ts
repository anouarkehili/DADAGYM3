import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class StorageService {
  // Secure storage for sensitive data
  static async setSecureItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Fallback to localStorage on web
      localStorage.setItem(`secure_${key}`, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  static async getSecureItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(`secure_${key}`);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  }

  static async removeSecureItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(`secure_${key}`);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }

  // Regular storage for app data
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export default StorageService;