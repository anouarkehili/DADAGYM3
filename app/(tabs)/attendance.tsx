import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '@/contexts/GymContext';
import { formatDateTime } from '@/utils/qrCode';
import { 
  Calendar,
  Clock,
  Search,
  Filter,
  TrendingUp,
  Users
} from 'lucide-react-native';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const { users, getAttendanceHistory } = useGym();
  
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'check-in' | 'check-out'>('all');

  if (user?.role !== 'admin') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>غير مسموح لك بالوصول لهذه الصفحة</Text>
      </View>
    );
  }

  const allAttendance = getAttendanceHistory(undefined, selectedDate);
  
  const filteredAttendance = allAttendance.filter(record => {
    const attendeeUser = users.find(u => u.id === record.userId);
    const matchesSearch = attendeeUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesFilter = filterType === 'all' || record.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const todayStats = {
    totalAttendance: allAttendance.length,
    uniqueMembers: new Set(allAttendance.map(r => r.userId)).size,
    checkIns: allAttendance.filter(r => r.type === 'check-in').length,
    checkOuts: allAttendance.filter(r => r.type === 'check-out').length,
  };

  const renderAttendanceItem = ({ item }: { item: any }) => {
    const attendeeUser = users.find(u => u.id === item.userId);
    
    return (
      <View style={styles.attendanceItem}>
        <View style={styles.attendanceHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {attendeeUser?.name || 'مستخدم مجهول'}
            </Text>
            <Text style={styles.attendanceTime}>
              {formatDateTime(new Date(`${item.date} ${item.time}`))}
            </Text>
          </View>
          <View style={[
            styles.typeBadge,
            item.type === 'check-in' ? styles.checkInBadge : styles.checkOutBadge
          ]}>
            <Text style={styles.typeText}>
              {item.type === 'check-in' ? 'دخول' : 'خروج'}
            </Text>
          </View>
        </View>
        {!item.synced && (
          <View style={styles.unsyncedIndicator}>
            <Text style={styles.unsyncedText}>غير مزامن</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>سجل الحضور</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <TrendingUp size={20} color="#007AFF" />
          <Text style={styles.statNumber}>{todayStats.totalAttendance}</Text>
          <Text style={styles.statLabel}>إجمالي السجلات</Text>
        </View>
        <View style={styles.statCard}>
          <Users size={20} color="#34C759" />
          <Text style={styles.statNumber}>{todayStats.uniqueMembers}</Text>
          <Text style={styles.statLabel}>الأعضاء الحاضرين</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={20} color="#FF9500" />
          <Text style={styles.statNumber}>{todayStats.checkIns}</Text>
          <Text style={styles.statLabel}>دخول</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Date Picker */}
        <View style={styles.dateContainer}>
          <Calendar size={20} color="#8E8E93" />
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث عن عضو..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
        
        {/* Filter */}
        <View style={styles.filterContainer}>
          {(['all', 'check-in', 'check-out'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                filterType === type && styles.activeFilterButton
              ]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[
                styles.filterButtonText,
                filterType === type && styles.activeFilterButtonText
              ]}>
                {type === 'all' ? 'الكل' : type === 'check-in' ? 'دخول' : 'خروج'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Attendance List */}
      <FlatList
        data={filteredAttendance}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد سجلات حضور</Text>
          </View>
        }
      />
    </View>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
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
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
  },
  controlsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  dateInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  attendanceItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  attendanceTime: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  typeBadge: {
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
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  unsyncedIndicator: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  unsyncedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
  },
});