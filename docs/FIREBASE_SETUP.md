# إعداد Firebase للتطبيق

## الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. انقر على "إنشاء مشروع" أو "Create a project"
3. أدخل اسم المشروع: "DADA GYM"
4. اختر إعدادات Google Analytics (اختياري)
5. انقر على "إنشاء المشروع"

## الخطوة 2: إعداد Firestore Database

1. في لوحة تحكم Firebase، اذهب إلى "Firestore Database"
2. انقر على "إنشاء قاعدة بيانات" أو "Create database"
3. اختر "Start in test mode" للبداية (يمكن تغيير القواعد لاحقاً)
4. اختر موقع قاعدة البيانات (اختر الأقرب لك)

## الخطوة 3: إعداد Authentication (اختياري)

1. اذهب إلى "Authentication"
2. انقر على "البدء" أو "Get started"
3. في تبويب "Sign-in method"، يمكنك تفعيل طرق المصادقة المطلوبة

## الخطوة 4: الحصول على إعدادات المشروع

1. اذهب إلى إعدادات المشروع (أيقونة الترس)
2. في تبويب "عام"، انزل إلى "تطبيقاتك"
3. انقر على أيقونة الويب `</>`
4. أدخل اسم التطبيق: "DADA GYM App"
5. انسخ إعدادات Firebase

## الخطوة 5: تحديث ملف Firebase في التطبيق

استبدل المحتوى في `services/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration - استبدل هذه القيم بقيم مشروعك
const firebaseConfig = {
  apiKey: "AIzaSyC...", // ضع API Key الخاص بك
  authDomain: "dada-gym-12345.firebaseapp.com", // ضع Auth Domain الخاص بك
  projectId: "dada-gym-12345", // ضع Project ID الخاص بك
  storageBucket: "dada-gym-12345.appspot.com", // ضع Storage Bucket الخاص بك
  messagingSenderId: "123456789", // ضع Messaging Sender ID الخاص بك
  appId: "1:123456789:web:abcdef123456" // ضع App ID الخاص بك
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
```

## الخطوة 6: إنشاء Collections في Firestore

### 1. Users Collection
```
Collection: users
Document fields:
- name (string): اسم المستخدم
- role (string): admin أو member
- password (string): كلمة المرور
- qrCode (string): رمز QR الخاص بالمستخدم
- subscriptionStatus (string): active, expired, أو pending
- phone (string, optional): رقم الهاتف
- email (string, optional): البريد الإلكتروني
- createdAt (timestamp): تاريخ الإنشاء
```

### 2. Subscriptions Collection
```
Collection: subscriptions
Document fields:
- userId (string): معرف المستخدم
- startDate (string): تاريخ بداية الاشتراك
- endDate (string): تاريخ انتهاء الاشتراك
- type (string): monthly, quarterly, أو yearly
- status (string): active أو expired
- createdAt (timestamp): تاريخ الإنشاء
```

### 3. Attendance Collection
```
Collection: attendance
Document fields:
- userId (string): معرف المستخدم
- date (string): التاريخ بصيغة YYYY-MM-DD
- time (string): الوقت بصيغة HH:MM:SS
- type (string): check-in أو check-out
- synced (boolean): true
- createdAt (timestamp): تاريخ الإنشاء
```

## الخطوة 7: إعداد قواعد الأمان

في Firestore Rules، استبدل القواعد الافتراضية بـ:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if true; // للتطوير فقط
      // في الإنتاج، استخدم قواعد أكثر تقييداً
    }
    
    // Subscriptions collection
    match /subscriptions/{subscriptionId} {
      allow read, write: if true; // للتطوير فقط
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      allow read, write: if true; // للتطوير فقط
    }
  }
}
```

## الخطوة 8: إضافة بيانات تجريبية

### إضافة مدير النظام:
```json
{
  "name": "مدير النادي",
  "role": "admin",
  "password": "admin123",
  "qrCode": "QR_admin_001",
  "subscriptionStatus": "active",
  "phone": "966501234567",
  "email": "admin@dadagym.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### إضافة عضو تجريبي:
```json
{
  "name": "أحمد محمد",
  "role": "member", 
  "password": "member123",
  "qrCode": "QR_member_001",
  "subscriptionStatus": "active",
  "phone": "966501234568",
  "email": "ahmed@example.com",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## الخطوة 9: اختبار الاتصال

1. قم بتشغيل التطبيق
2. جرب تسجيل الدخول بالحسابات التجريبية
3. تأكد من عمل جميع الوظائف

## ملاحظات مهمة

### الأمان:
- لا تشارك إعدادات Firebase مع أي شخص
- استخدم قواعد أمان صارمة في الإنتاج
- فعّل المصادقة إذا لزم الأمر

### الأداء:
- استخدم Indexes للاستعلامات المعقدة
- راقب استخدام قاعدة البيانات
- استخدم Offline Persistence للأداء الأفضل

### النسخ الاحتياطي:
- فعّل النسخ الاحتياطي التلقائي
- صدّر البيانات دورياً
- احتفظ بنسخة محلية من البيانات المهمة

## قواعد الأمان المتقدمة (للإنتاج)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Subscriptions collection - admins can manage all, users can read their own
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Attendance collection - users can create their own records, admins can manage all
    match /attendance/{attendanceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth != null && 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## روابط مفيدة

- [Firebase Console](https://console.firebase.google.com)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Pricing](https://firebase.google.com/pricing)