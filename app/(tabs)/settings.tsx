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
import AdminQRGenerator from '@/components/AdminQRGenerator';
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
  Globe,
  Users,
  BarChart3,
  Download,
  Upload,
  QrCode
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { syncOfflineData, refreshData } = useGym();
  const router = useRouter();

  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [autoSync, setAutoSync] = React.useState(true);

  const isAdmin = user?.role === 'admin';

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

  const handleRefreshData = async () => {
    try {
      await refreshData();
      Alert.alert('تم بنجاح', 'تم تحديث البيانات بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث البيانات');
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

  const handleExportData = () => {
    Alert.alert(
      'تصدير البيانات',
      'سيتم تصدير جميع البيانات إلى ملف CSV',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تصدير',
          onPress: () => {
            // Implement data export functionality
            Alert.alert('قريباً', 'ميزة تصدير البيانات ستكون متاحة قريباً');
          }
        }
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      'نسخ احتياطي',
      'سيتم إنشاء نسخة احتياطية من جميع البيانات',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'إنشاء نسخة',
          onPress: () => {
            // Implement backup functionality
            Alert.alert('قريباً', 'ميزة النسخ الاحتياطي ستكون متاحة قريباً');
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
    danger = false,
    adminOnly = false
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
    adminOnly?: boolean;
  }) => {
    if (adminOnly && !isAdmin) return null;

    return (
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
  };

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
          {user?.phone && (
            <Text style={styles.userContact}>{user.phone}</Text>
          )}
          {user?.email && (
            <Text style={styles.userContact}>{user.email}</Text>
          )}
        </View>
      </View>

      {/* Admin QR Generator */}
      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أدوات الإدارة</Text>
          <AdminQRGenerator />
        </View>
      )}

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

        <SettingItem
          icon={<Sync size={20} color="#007AFF" />}
          title="المزامنة التلقائية"
          subtitle="مزامنة البيانات تلقائياً عند الاتصال بالإنترنت"
          rightElement={
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
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
          title="تحديث البيانات"
          subtitle="تحديث البيانات من الخادم"
          onPress={handleRefreshData}
        />

        <SettingItem
          icon={<Download size={20} color="#007AFF" />}
          title="تصدير البيانات"
          subtitle="تصدير البيانات إلى ملف CSV"
          onPress={handleExportData}
          adminOnly
        />

        <SettingItem
          icon={<Upload size={20} color="#007AFF" />}
          title="نسخ احتياطي"
          subtitle="إنشاء نسخة احتياطية من البيانات"
          onPress={handleBackupData}
          adminOnly
        />

        <SettingItem
          icon={<Trash2 size={20} color="#FF3B30" />}
          title="مسح البيانات المحلية"
          subtitle="حذف جميع البيانات المحفوظة على الجهاز"
          onPress={handleClearCache}
          danger
        />
      </View>

      {/* Admin Tools */}
      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أدوات الإدارة المتقدمة</Text>
          
          <SettingItem
            icon={<Users size={20} color="#007AFF" />}
            title="إدارة المستخدمين"
            subtitle="عرض وإدارة جميع المستخدمين"
            onPress={() => router.push('/(tabs)/members')}
          />

          <SettingItem
            icon={<BarChart3 size={20} color="#007AFF" />}
            title="تقارير الحضور"
            subtitle="عرض تقارير مفصلة عن الحضور"
            onPress={() => router.push('/(tabs)/attendance')}
          />

          <SettingItem
            icon={<QrCode size={20} color="#007AFF" />}
            title="إدارة أكواد QR"
            subtitle="إنشاء وإدارة أكواد QR للنادي"
          />

          <SettingItem
            icon={<SettingsIcon size={20} color="#007AFF" />}
            title="إعدادات النادي"
            subtitle="تخصيص إعدادات النادي والأسعار"
          />
        </View>
      )}

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
          adminOnly
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
        <Text style={styles.copyrightText}>© 2025 DADA GYM. جميع الحقوق محفوظة.</Text>
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
    marginBottom: 8,
  },
  userContact: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
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
  copyrightText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
});