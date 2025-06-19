import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import QRCodeScanner from '@/components/QRCodeScanner';
import { QrCode, User, Lock, UserPlus, Phone, Mail } from 'lucide-react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Registration form states
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  
  const { login, loginWithQR, register, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username.trim(), password.trim());
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('خطأ في تسجيل الدخول', 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName.trim() || !regPassword.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم وكلمة المرور');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور وتأكيد كلمة المرور غير متطابقتين');
      return;
    }

    if (regPassword.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    try {
      const success = await register({
        name: regName.trim(),
        password: regPassword.trim(),
        phone: regPhone.trim() || undefined,
        email: regEmail.trim() || undefined
      });

      if (success) {
        Alert.alert(
          'تم التسجيل بنجاح',
          'تم إنشاء حسابك بنجاح. يرجى انتظار موافقة الإدارة لتفعيل اشتراكك.',
          [
            {
              text: 'موافق',
              onPress: () => {
                setShowRegister(false);
                router.replace('/(tabs)');
              }
            }
          ]
        );
      } else {
        Alert.alert('خطأ', 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء الحساب.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async (data: string) => {
    setShowScanner(false);
    setIsLoading(true);
    
    try {
      const success = await loginWithQR(data);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('خطأ', 'رمز QR غير صالح أو غير مسجل');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء قراءة رمز QR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialMediaPress = (platform: string) => {
    const urls = {
      whatsapp: 'https://wa.me/966123456789',
      facebook: 'https://facebook.com/dadagym',
      instagram: 'https://instagram.com/dadagym',
      tiktok: 'https://tiktok.com/@dadagym',
    };

    const url = urls[platform as keyof typeof urls];
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('خطأ', 'لا يمكن فتح الرابط');
      });
    }
  };

  const resetRegisterForm = () => {
    setRegName('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegPhone('');
    setRegEmail('');
  };

  if (showRegister) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>DADA GYM</Text>
              <Text style={styles.subtitle}>تسجيل حساب جديد</Text>
            </View>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.title}>إنشاء حساب جديد</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <User size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="الاسم الكامل"
                  value={regName}
                  onChangeText={setRegName}
                  autoCapitalize="words"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Phone size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="رقم الهاتف (اختياري)"
                  value={regPhone}
                  onChangeText={setRegPhone}
                  keyboardType="phone-pad"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Mail size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="البريد الإلكتروني (اختياري)"
                  value={regEmail}
                  onChangeText={setRegEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="كلمة المرور"
                  value={regPassword}
                  onChangeText={setRegPassword}
                  secureTextEntry
                  textAlign="right"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="تأكيد كلمة المرور"
                  value={regConfirmPassword}
                  onChangeText={setRegConfirmPassword}
                  secureTextEntry
                  textAlign="right"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>إنشاء الحساب</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setShowRegister(false);
                resetRegisterForm();
              }}
            >
              <Text style={styles.switchButtonText}>لديك حساب بالفعل؟ تسجيل الدخول</Text>
            </TouchableOpacity>

            <Text style={styles.noteText}>
              ملاحظة: بعد إنشاء الحساب، يرجى انتظار موافقة الإدارة لتفعيل اشتراكك
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>DADA GYM</Text>
          <Text style={styles.subtitle}>نظام إدارة النادي الرياضي</Text>
        </View>
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.title}>تسجيل الدخول</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <User size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="اسم المستخدم"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              textAlign="right"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="كلمة المرور"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textAlign="right"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>دخول</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>أو</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => setShowScanner(true)}
          disabled={isLoading}
        >
          <QrCode size={24} color="#007AFF" />
          <Text style={styles.qrButtonText}>تسجيل الدخول بـ QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => setShowRegister(true)}
          disabled={isLoading}
        >
          <UserPlus size={24} color="#34C759" />
          <Text style={styles.registerButtonText}>إنشاء حساب جديد</Text>
        </TouchableOpacity>
      </View>

      <QRCodeScanner
        isVisible={showScanner}
        onScan={handleQRScan}
        onClose={() => setShowScanner(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    color: '#1A1A1A',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 54,
    fontSize: 16,
    color: '#1A1A1A',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 16,
    height: 54,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    marginBottom: 16,
  },
  qrButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#34C759',
    borderRadius: 16,
    height: 54,
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
  },
  registerButtonText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
});