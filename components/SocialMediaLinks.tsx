import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { MessageCircle, Facebook, Instagram, Music } from 'lucide-react-native';

interface SocialMediaLinksProps {
  size?: number;
  color?: string;
  style?: any;
  showLabels?: boolean;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  size = 24,
  color = '#FFFFFF',
  style,
  showLabels = false
}) => {
  const socialLinks = {
    whatsapp: {
      url: 'https://wa.me/966123456789', // ضع رقم الواتساب الخاص بالنادي
      icon: MessageCircle,
      color: '#25D366',
      label: 'واتساب'
    },
    facebook: {
      url: 'https://facebook.com/dadagym', // ضع رابط صفحة الفيسبوك
      icon: Facebook,
      color: '#1877F2',
      label: 'فيسبوك'
    },
    instagram: {
      url: 'https://instagram.com/dadagym', // ضع رابط الانستجرام
      icon: Instagram,
      color: '#E4405F',
      label: 'انستجرام'
    },
    tiktok: {
      url: 'https://tiktok.com/@dadagym', // ضع رابط التيك توك
      icon: Music,
      color: '#000000',
      label: 'تيك توك'
    }
  };

  const handlePress = async (url: string, platform: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('خطأ', `لا يمكن فتح ${platform}`);
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء فتح الرابط');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {Object.entries(socialLinks).map(([key, social]) => {
        const IconComponent = social.icon;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.socialButton,
              { backgroundColor: social.color }
            ]}
            onPress={() => handlePress(social.url, social.label)}
            activeOpacity={0.8}
          >
            <IconComponent size={size} color={color} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default SocialMediaLinks;