import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Subscription } from '@/types';
import { isSubscriptionActive, getDaysUntilExpiry } from '@/utils/qrCode';
import { User as UserIcon, Calendar, Clock } from 'lucide-react-native';

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

  const getStatusColor = () => {
    if (!subscription) return '#8E8E93';
    if (isActive) {
      if (daysUntilExpiry <= 7) return '#FF9500';
      return '#34C759';
    }
    return '#FF3B30';
  };

  const getStatusText = () => {
    if (!subscription) return 'لا يوجد اشتراك';
    if (isActive) {
      if (daysUntilExpiry <= 0) return 'ينتهي اليوم';
      if (daysUntilExpiry === 1) return 'ينتهي غداً';
      return `${daysUntilExpiry} يوم متبقي`;
    }
    return 'منتهي الصلاحية';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <UserIcon size={24} color="#007AFF" />
          </View>
          <View style={styles.details}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.role}>
              {user.role === 'admin' ? 'مدير' : 'عضو'}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {subscription && (
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
});

export default MemberCard;