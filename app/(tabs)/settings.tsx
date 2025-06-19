import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '@/contexts/GymContext';
import { useRouter } from 'expo-router';
import StorageService from '@/services/storage';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import { 
  LogOut,
  Sync,
  Database,
  Settings as SettingsIcon,
  Info,
  Shield,
  Moon,
  Bell,
  Trash2,
  Phone,
  MapPin,
  Globe
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { syncOfflineData } = useGym();
  const router = useRouter();

  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج');
            }
          }
        }
      ]
    );
  };

  const handleSyncData = async () => {
    try {
      await syncOfflineData();
      Alert.alert('تم بنجاح', 'تم مزامنة البيانات بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في مزامنة البيانات');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'مسح البيانات المحلية',
      'هذا سيحذف جميع البيانات المحفوظة محلياً. هل أنت متأكد؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مسح',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAll();
              Alert.alert('تم بنجاح', 'تم مسح البيانات المحلية');
            } catch (error) {
              Alert.alert('خطأ', 'فشل في مسح البيانات');
            }
          }
        }
      ]
    );
  };

  const handleContactPress = (type: 'phone' | 'location' | 'website') => {
    const contacts = {
      phone: 'tel:+966123456789',
      location: 'https://maps.google.com/?q=DADA+GYM+Riyadh',
      website: 'https://dadagym.com'
    };

    Linking.openURL(contacts[type]).catch(() => {
      Alert.alert('خطأ', 'لا يمكن فتح الرابط');
    });
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    danger = false 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIcon]}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>الإعدادات</Text>
      </View>

      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'admin' ? 'مدير النادي' : 'عضو'}
          </Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات التواصل</Text>
        
        <SettingItem
          icon={<Phone size={20} color="#007AFF" />}
          title="الهاتف"
          subtitle="+966 12 345 6789"
          onPress={() => handleContactPress('phone')}
        />

        <SettingItem
          icon={<MapPin size={20} color="#007AFF" />}
          title="الموقع"
          subtitle="الرياض، المملكة العربية السعودية"
          onPress={() => handleContactPress('location')}
        />

        <SettingItem
          icon={<Globe size={20} color="#007AFF" />}
          title="الموقع الإلكتروني"
          subtitle="www.dadagym.com"
          onPress={() => handleContactPress('website')}
        />
      </View>

      {/* Social Media */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>تابعنا على مواقع التواصل</Text>
        <View style={styles.socialMediaContainer}>
          <SocialMediaLinks size={28} color="#FFFFFF" />
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إعدادات التطبيق</Text>
        
        <SettingItem
          icon={<Bell size={20} color="#007AFF" />}
          title="الإشعارات"
          subtitle="تلقي إشعارات حول انتهاء الاشتراك والأحداث"
          rightElement={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
            />
          }
        />

        <SettingItem
          icon={<Moon size={20} color="#007AFF" />}
          title="الوضع الليلي"
          subtitle="تفعيل المظهر الداكن للتطبيق"
          rightElement={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
            />
          }
        />
      </View>

      {/* Data & Sync */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>البيانات والمزامنة</Text>
        
        <SettingItem
          icon={<Sync size={20} color="#007AFF" />}
          title="مزامنة البيانات"
          subtitle="مزامنة البيانات المحلية مع الخادم"
          onPress={handleSyncData}
        />

        <SettingItem
          icon={<Database size={20} color="#007AFF" />}
          title="إدارة البيانات"
          subtitle="عرض وإدارة البيانات المحفوظة محلياً"
        />

        <SettingItem
          icon={<Trash2 size={20} color="#FF3B30" />}
          title="مسح البيانات المحلية"
          subtitle="حذف جميع البيانات المحفوظة على الجهاز"
          onPress={handleClearCache}
          danger
        />
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>معلومات التطبيق</Text>
        
        <SettingItem
          icon={<Info size={20} color="#007AFF" />}
          title="حول التطبيق"
          subtitle="معلومات عن DADA GYM وإصدار التطبيق"
        />

        <SettingItem
          icon={<Shield size={20} color="#007AFF" />}
          title="الخصوصية والأمان"
          subtitle="سياسة الخصوصية وإعدادات الأمان"
        />

        <SettingItem
          icon={<SettingsIcon size={20} color="#007AFF" />}
          title="إعدادات متقدمة"
          subtitle="خيارات إضافية للمطورين والمديرين"
        />
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <SettingItem
          icon={<LogOut size={20} color="#FF3B30" />}
          title="تسجيل الخروج"
          subtitle="الخروج من الحساب الحالي"
          onPress={handleLogout}
          danger
        />
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>DADA GYM v1.0.0</Text>
        <Text style={styles.buildText}>Build 2025.01.01</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  userSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  socialMediaContainer: {
    padding: 20,
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerIcon: {
    backgroundColor: '#FFEBEE',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  dangerText: {
    color: '#FF3B30',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  buildText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
});