import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import QRCodeDisplay from './QRCodeDisplay';
import { generateGymQRData } from '@/utils/qrCode';
import { QrCode, X } from 'lucide-react-native';

interface AdminQRGeneratorProps {
  style?: any;
}

const AdminQRGenerator: React.FC<AdminQRGeneratorProps> = ({ style }) => {
  const [showQRModal, setShowQRModal] = useState(false);

  const gymQRData = generateGymQRData();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.generateButton}
        onPress={() => setShowQRModal(true)}
      >
        <QrCode size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>إنشاء QR للحضور الذاتي</Text>
      </TouchableOpacity>

      <Modal
        visible={showQRModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>QR للحضور الذاتي</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQRModal(false)}
            >
              <X size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.instructionText}>
              يمكن للأعضاء مسح هذا الرمز لتسجيل حضورهم بأنفسهم
            </Text>
            
            <QRCodeDisplay
              value={gymQRData}
              title="رمز الحضور الذاتي - DADA GYM"
              size={250}
            />

            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionTitle}>تعليمات الاستخدام:</Text>
              <Text style={styles.instructionItem}>• اطبع هذا الرمز وضعه في مكان واضح بالنادي</Text>
              <Text style={styles.instructionItem}>• يمكن للأعضاء مسح الرمز من تطبيقهم</Text>
              <Text style={styles.instructionItem}>• سيتم تسجيل حضورهم تلقائياً</Text>
              <Text style={styles.instructionItem}>• يمكنهم أيضاً تسجيل الخروج يدوياً من التطبيق</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  generateButton: {
    backgroundColor: '#34C759',
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  instructionsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginTop: 30,
    width: '100%',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default AdminQRGenerator;