import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Subscription } from '@/types';
import { isSubscriptionActive, getDaysUntilExpiry } from '@/utils/qrCode';
import { User as UserIcon, Calendar, Clock, AlertCircle } from 'lucide-react-native';

interface MemberCardProps {
  user: User;
  subscription?: Subscription;
  onPress?: () => void;
  showActions?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({
  user,
  subscription,
  onPress,
  showActions = false
}) => {
  const isActive = subscription ? isSubscriptionActive(subscription.endDate) : false;
  const daysUntilExpiry = subscription ? getDaysUntilExpiry(subscription.endDate) : 0;
  const isPending = user.subscriptionStatus === 'pending';

  const getStatusColor = () => {
    if (isPending) return '#FF9500';
    if (!subscription) return '#8E8E93';
    if (isActive) {
      if (daysUntilExpiry <= 7) return '#FF9500';
      return '#34C759';
    }
    return '#FF3B30';
  };

  const getStatusText = () => {
    if (isPending) return 'في انتظار الموافقة';
    if (!subscription) return 'لا يوجد اشتراك';
    if (isActive) {
      if (daysUntilExpiry <= 0) return 'ينتهي اليوم';
      if (daysUntilExpiry === 1) return 'ينتهي غداً';
      return `${daysUntilExpiry} يوم متبقي`;
    }
    return 'منتهي الصلاحية';
  };

  const getStatusIcon = () => {
    if (isPending) return <AlertCircle size={16} color="#FF9500" />;
    return null;
  };

  return (
    <TouchableOpacity
      style={[styles.container, isPending && styles.pendingContainer]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, isPending && styles.pendingAvatar]}>
            <UserIcon size={24} color={isPending ? "#FF9500" : "#007AFF"} />
          </View>
          <View style={styles.details}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.role}>
              {user.role === 'admin' ? 'مدير' : 'عضو'}
            </Text>
            {user.phone && (
              <Text style={styles.contact}>{user.phone}</Text>
            )}
            {user.email && (
              <Text style={styles.contact}>{user.email}</Text>
            )}
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <View style={styles.statusContent}>
            {getStatusIcon()}
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
      </View>

      {subscription && !isPending && (
        <View style={styles.subscriptionInfo}>
          <View style={styles.subscriptionRow}>
            <Calendar size={16} color="#8E8E93" />
            <Text style={styles.subscriptionText}>
              من {new Date(subscription.startDate).toLocaleDateString('ar-SA')}
            </Text>
          </View>
          <View style={styles.subscriptionRow}>
            <Clock size={16} color="#8E8E93" />
            <Text style={styles.subscriptionText}>
              إلى {new Date(subscription.endDate).toLocaleDateString('ar-SA')}
            </Text>
          </View>
          <View style={styles.subscriptionRow}>
            <Text style={styles.subscriptionType}>
              {subscription.type === 'monthly' ? 'شهري' : 
               subscription.type === 'quarterly' ? 'ربع سنوي' : 'سنوي'}
            </Text>
          </View>
        </View>
      )}

      {isPending && (
        <View style={styles.pendingInfo}>
          <Text style={styles.pendingText}>
            تم إنشاء الحساب في: {new Date(user.createdAt).toLocaleDateString('ar-SA')}
          </Text>
          <Text style={styles.pendingNote}>
            يحتاج إلى موافقة الإدارة لتفعيل الاشتراك
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    backgroundColor: '#FFFBF5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pendingAvatar: {
    backgroundColor: '#FFF3E0',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  contact: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  subscriptionInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  subscriptionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  subscriptionType: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  pendingInfo: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
  },
  pendingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  pendingNote: {
    fontSize: 12,
    color: '#FF9500',
    fontStyle: 'italic',
  },
});

export default MemberCard;