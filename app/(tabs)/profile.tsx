import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '@/contexts/GymContext';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { generateQRData, formatDateTime, getDaysUntilExpiry } from '@/utils/qrCode';
import { 
  User,
  Calendar,
  Clock,
  QrCode,
  Activity,
  Award,
  TrendingUp
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { subscriptions, getAttendanceHistory } = useGym();
  const [showQRCode, setShowQRCode] = useState(false);

  if (!user) return null;

  const userSubscription = subscriptions.find(s => s.userId === user.id);
  const myAttendance = getAttendanceHistory(user.id);
  const recentAttendance = myAttendance.slice(0, 5);
  
  const stats = {
    totalAttendance: myAttendance.length,
    thisMonth: myAttendance.filter(record => {
      const recordDate = new Date(record.date);
      const now = new Date();
      return recordDate.getMonth() === now.getMonth() && 
             recordDate.getFullYear() === now.getFullYear();
    }).length,
    thisWeek: myAttendance.filter(record => {
      const recordDate = new Date(record.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return recordDate >= weekAgo;
    }).length,
  };

  const daysUntilExpiry = userSubscription ? getDaysUntilExpiry(userSubscription.endDate) : 0;
  const isActive = userSubscription && daysUntilExpiry > 0;

  const getSubscriptionStatusText = () => {
    if (!userSubscription) return 'لا يوجد اشتراك';
    if (isActive) {
      if (daysUntilExpiry <= 7) return `ينتهي خلال ${daysUntilExpiry} أيام`;
      return `نشط - ${daysUntilExpiry} يوم متبقي`;
    }
    return 'منتهي الصلاحية';
  };

  const getSubscriptionColor = () => {
    if (!userSubscription) return '#8E8E93';
    if (isActive) {
      if (daysUntilExpiry <= 7) return '#FF9500';
      return '#34C759';
    }
    return '#FF3B30';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <User size={40} color="#007AFF" />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>
          {user.role === 'admin' ? 'مدير النادي' : 'عضو'}
        </Text>
      </View>

      {/* Subscription Status */}
      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <Text style={styles.subscriptionTitle}>حالة الاشتراك</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getSubscriptionColor() }
          ]}>
            <Text style={styles.statusText}>
              {getSubscriptionStatusText()}
            </Text>
          </View>
        </View>
        
        {userSubscription && (
          <View style={styles.subscriptionDetails}>
            <View style={styles.subscriptionRow}>
              <Calendar size={16} color="#8E8E93" />
              <Text style={styles.subscriptionText}>
                من: {new Date(userSubscription.startDate).toLocaleDateString('ar-SA')}
              </Text>
            </View>
            <View style={styles.subscriptionRow}>
              <Clock size={16} color="#8E8E93" />
              <Text style={styles.subscriptionText}>
                إلى: {new Date(userSubscription.endDate).toLocaleDateString('ar-SA')}
              </Text>
            </View>
            <View style={styles.subscriptionRow}>
              <Award size={16} color="#8E8E93" />
              <Text style={styles.subscriptionText}>
                النوع: {userSubscription.type === 'monthly' ? 'شهري' : 
                       userSubscription.type === 'quarterly' ? 'ربع سنوي' : 'سنوي'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>إحصائياتي</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#007AFF" />
            <Text style={styles.statNumber}>{stats.totalAttendance}</Text>
            <Text style={styles.statLabel}>إجمالي الحضور</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={24} color="#34C759" />
            <Text style={styles.statNumber}>{stats.thisMonth}</Text>
            <Text style={styles.statLabel}>هذا الشهر</Text>
          </View>
          <View style={styles.statCard}>
            <Activity size={24} color="#FF9500" />
            <Text style={styles.statNumber}>{stats.thisWeek}</Text>
            <Text style={styles.statLabel}>هذا الأسبوع</Text>
          </View>
        </View>
      </View>

      {/* QR Code Section */}
      <View style={styles.qrSection}>
        <Text style={styles.sectionTitle}>رمز QR الخاص بي</Text>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => setShowQRCode(!showQRCode)}
        >
          <QrCode size={24} color="#007AFF" />
          <Text style={styles.qrButtonText}>
            {showQRCode ? 'إخفاء الرمز' : 'عرض رمز QR'}
          </Text>
        </TouchableOpacity>
        
        {showQRCode && (
          <View style={styles.qrContainer}>
            <QRCodeDisplay
              value={generateQRData(user)}
              title="امسح هذا الرمز لتسجيل الحضور"
              size={180}
            />
          </View>
        )}
      </View>

      {/* Recent Attendance */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>آخر مرات الحضور</Text>
        {recentAttendance.length > 0 ? (
          recentAttendance.map((record, index) => (
            <View key={record.id} style={styles.attendanceItem}>
              <View style={styles.attendanceInfo}>
                <Text style={styles.attendanceType}>
                  {record.type === 'check-in' ? 'تسجيل دخول' : 'تسجيل خروج'}
                </Text>
                <Text style={styles.attendanceTime}>
                  {formatDateTime(new Date(`${record.date} ${record.time}`))}
                </Text>
              </View>
              <View style={[
                styles.attendanceTypeBadge,
                record.type === 'check-in' ? styles.checkInBadge : styles.checkOutBadge
              ]}>
                <Text style={styles.attendanceTypeText}>
                  {record.type === 'check-in' ? 'دخول' : 'خروج'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>لا توجد سجلات حضور بعد</Text>
          </View>
        )}
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
    backgroundColor: '#007AFF',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 16,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subscriptionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  statsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  qrSection: {
    margin: 20,
    marginTop: 0,
  },
  qrButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  qrContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  recentSection: {
    margin: 20,
    marginTop: 0,
  },
  attendanceItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  attendanceTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  attendanceTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  checkInBadge: {
    backgroundColor: '#E8F5E8',
  },
  checkOutBadge: {
    backgroundColor: '#FFF3E0',
  },
  attendanceTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});