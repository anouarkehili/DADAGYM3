import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useGym } from '@/contexts/GymContext';
import MemberCard from '@/components/MemberCard';
import { User } from '@/types';
import { generateUniqueId, generateQRData } from '@/utils/qrCode';
import { Plus, Search, Filter, UserCheck, UserX, CreditCard as Edit, Trash2, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function MembersScreen() {
  const { user } = useAuth();
  const { 
    users, 
    subscriptions, 
    pendingUsers = [], 
    addUser, 
    updateUser, 
    deleteUser, 
    approveUser 
  } = useGym();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'pending'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [approvingUser, setApprovingUser] = useState<User | null>(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'member' | 'admin'>('member');

  // Approval form states
  const [subscriptionType, setSubscriptionType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  if (user?.role !== 'admin') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>غير مسموح لك بالوصول لهذه الصفحة</Text>
      </View>
    );
  }

  const allUsers = [...users, ...pendingUsers];
  
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const userSubscription = subscriptions.find(s => s.userId === u.id);
    
    let matchesFilter = true;
    if (filterStatus === 'active') {
      matchesFilter = userSubscription && new Date(userSubscription.endDate) >= new Date();
    } else if (filterStatus === 'expired') {
      matchesFilter = !userSubscription || new Date(userSubscription.endDate) < new Date();
    } else if (filterStatus === 'pending') {
      matchesFilter = u.subscriptionStatus === 'pending';
    }
    
    return matchesSearch && matchesFilter;
  });

  const calculateEndDate = (startDate: string, type: 'monthly' | 'quarterly' | 'yearly'): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    
    switch (type) {
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        break;
    }
    
    return end.toISOString().split('T')[0];
  };

  const handleAddUser = async () => {
    if (!formName.trim() || !formPassword.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    try {
      const newUser: Omit<User, 'id' | 'createdAt'> = {
        name: formName.trim(),
        password: formPassword.trim(),
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        role: formRole,
        qrCode: '', // Will be generated after creating user
        subscriptionStatus: 'pending'
      };

      await addUser(newUser);
      
      // Reset form
      resetForm();
      setShowAddModal(false);
      
      Alert.alert('تم بنجاح', 'تم إضافة العضو الجديد');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إضافة العضو');
    }
  };

  const handleEditUser = async () => {
    if (!editingUser || !formName.trim() || !formPassword.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال جميع البيانات المطلوبة');
      return;
    }

    try {
      await updateUser(editingUser.id, {
        name: formName.trim(),
        password: formPassword.trim(),
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        role: formRole
      });
      
      resetForm();
      setEditingUser(null);
      setShowAddModal(false);
      
      Alert.alert('تم بنجاح', 'تم تحديث بيانات العضو');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث بيانات العضو');
    }
  };

  const handleApproveUser = async () => {
    if (!approvingUser || !approveUser) return;

    try {
      const endDate = calculateEndDate(startDate, subscriptionType);
      
      await approveUser(approvingUser.id, {
        type: subscriptionType,
        startDate,
        endDate
      });

      setShowApprovalModal(false);
      setApprovingUser(null);
      Alert.alert('تم بنجاح', 'تم تفعيل اشتراك العضو');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تفعيل الاشتراك');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف العضو "${userName}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(userId);
              Alert.alert('تم بنجاح', 'تم حذف العضو');
            } catch (error) {
              Alert.alert('خطأ', 'فشل في حذف العضو');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormName(userToEdit.name);
    setFormPassword(userToEdit.password);
    setFormPhone(userToEdit.phone || '');
    setFormEmail(userToEdit.email || '');
    setFormRole(userToEdit.role);
    setShowAddModal(true);
  };

  const openApprovalModal = (userToApprove: User) => {
    setApprovingUser(userToApprove);
    setShowApprovalModal(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormPassword('');
    setFormPhone('');
    setFormEmail('');
    setFormRole('member');
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
    resetForm();
  };

  const renderUser = ({ item }: { item: User }) => {
    const userSubscription = subscriptions.find(s => s.userId === item.id);
    const isPending = item.subscriptionStatus === 'pending';
    
    return (
      <View style={styles.userContainer}>
        <MemberCard
          user={item}
          subscription={userSubscription}
        />
        <View style={styles.userActions}>
          {isPending && (
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => openApprovalModal(item)}
            >
              <CheckCircle size={16} color="#34C759" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Edit size={16} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteUser(item.id, item.name)}
          >
            <Trash2 size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>إدارة الأعضاء</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Pending Users Alert */}
      {pendingUsers.length > 0 && (
        <View style={styles.pendingAlert}>
          <Clock size={20} color="#FF9500" />
          <Text style={styles.pendingText}>
            {pendingUsers.length} عضو في انتظار الموافقة
          </Text>
        </View>
      )}

      {/* Search and Filter */}
      <View style={styles.controlsContainer}>
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
        
        <View style={styles.filterContainer}>
          {(['all', 'active', 'expired', 'pending'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.activeFilterButton
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.activeFilterButtonText
              ]}>
                {status === 'all' ? 'الكل' : 
                 status === 'active' ? 'نشط' : 
                 status === 'expired' ? 'منتهي' : 'معلق'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Add/Edit User Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingUser ? 'تعديل العضو' : 'إضافة عضو جديد'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.cancelButton}>إلغاء</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الاسم</Text>
              <TextInput
                style={styles.textInput}
                value={formName}
                onChangeText={setFormName}
                placeholder="اسم العضو"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>رقم الهاتف</Text>
              <TextInput
                style={styles.textInput}
                value={formPhone}
                onChangeText={setFormPhone}
                placeholder="رقم الهاتف (اختياري)"
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.textInput}
                value={formEmail}
                onChangeText={setFormEmail}
                placeholder="البريد الإلكتروني (اختياري)"
                keyboardType="email-address"
                autoCapitalize="none"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>كلمة المرور</Text>
              <TextInput
                style={styles.textInput}
                value={formPassword}
                onChangeText={setFormPassword}
                placeholder="كلمة المرور"
                secureTextEntry
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الدور</Text>
              <View style={styles.roleContainer}>
                {(['member', 'admin'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleButton,
                      formRole === role && styles.activeRoleButton
                    ]}
                    onPress={() => setFormRole(role)}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      formRole === role && styles.activeRoleButtonText
                    ]}>
                      {role === 'member' ? 'عضو' : 'مدير'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={editingUser ? handleEditUser : handleAddUser}
            >
              <Text style={styles.submitButtonText}>
                {editingUser ? 'تحديث' : 'إضافة'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Approval Modal */}
      <Modal
        visible={showApprovalModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تفعيل اشتراك العضو</Text>
            <TouchableOpacity onPress={() => setShowApprovalModal(false)}>
              <Text style={styles.cancelButton}>إلغاء</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.approvalUserName}>
              {approvingUser?.name}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>نوع الاشتراك</Text>
              <View style={styles.subscriptionContainer}>
                {(['monthly', 'quarterly', 'yearly'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.subscriptionButton,
                      subscriptionType === type && styles.activeSubscriptionButton
                    ]}
                    onPress={() => setSubscriptionType(type)}
                  >
                    <Text style={[
                      styles.subscriptionButtonText,
                      subscriptionType === type && styles.activeSubscriptionButtonText
                    ]}>
                      {type === 'monthly' ? 'شهري' : 
                       type === 'quarterly' ? 'ربع سنوي' : 'سنوي'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>تاريخ البداية</Text>
              <TextInput
                style={styles.textInput}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.dateInfo}>
              <Text style={styles.dateInfoText}>
                تاريخ الانتهاء: {calculateEndDate(startDate, subscriptionType)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.approveSubmitButton}
              onPress={handleApproveUser}
            >
              <Text style={styles.submitButtonText}>تفعيل الاشتراك</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingAlert: {
    backgroundColor: '#FFF3E0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  pendingText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  controlsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  userContainer: {
    marginBottom: 16,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginHorizontal: 16,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  approveButton: {
    backgroundColor: '#E8F5E8',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
    textAlign: 'right',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  activeRoleButton: {
    backgroundColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeRoleButtonText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  approvalUserName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  subscriptionContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  subscriptionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  activeSubscriptionButton: {
    backgroundColor: '#34C759',
  },
  subscriptionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeSubscriptionButtonText: {
    color: '#FFFFFF',
  },
  dateInfo: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateInfoText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  approveSubmitButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
});