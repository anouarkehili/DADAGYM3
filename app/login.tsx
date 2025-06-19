import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import QRCodeScanner from '@/components/QRCodeScanner';
import { QrCode, User, Lock, Camera } from 'lucide-react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, loginWithQR, user } = useAuth();
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
      whatsapp: 'https://wa.me/966123456789', // ضع رقم الواتساب الخاص بالنادي
      facebook: 'https://facebook.com/dadagym', // ضع رابط صفحة الفيسبوك
      instagram: 'https://instagram.com/dadagym', // ضع رابط الانستجرام
      tiktok: 'https://tiktok.com/@dadagym', // ضع رابط التيك توك
    };

    const url = urls[platform as keyof typeof urls];
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('خطأ', 'لا يمكن فتح الرابط');
      });
    }
  };

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
        
        {/* Social Media Links */}
        <View style={styles.socialContainer}>
          <Text style={styles.socialTitle}>تابعنا على</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, styles.whatsappButton]}
              onPress={() => handleSocialMediaPress('whatsapp')}
            >
              <Image
                source={{ uri: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop&crop=center' }}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.socialButton, styles.facebookButton]}
              onPress={() => handleSocialMediaPress('facebook')}
            >
              <Image
                source={{ uri: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop&crop=center' }}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.socialButton, styles.instagramButton]}
              onPress={() => handleSocialMediaPress('instagram')}
            >
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop&crop=center' }}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.socialButton, styles.tiktokButton]}
              onPress={() => handleSocialMediaPress('tiktok')}
            >
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop&crop=center' }}
                style={styles.socialIcon}
              />
            </TouchableOpacity>
          </View>
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
  socialContainer: {
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    opacity: 0.8,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  instagramButton: {
    backgroundColor: '#E4405F',
  },
  tiktokButton: {
    backgroundColor: '#000000',
  },
  socialIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  },
  qrButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});