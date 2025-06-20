# إعداد الحسابات الإدارية

## إضافة مديرين جدد عبر Google Sheets

### الطريقة 1: الإضافة المباشرة في Google Sheets

1. افتح Google Sheets الخاص بالتطبيق
2. اذهب إلى ورقة "users"
3. أضف صف جديد بالبيانات التالية:

```
| id | name | role | password | qrCode | subscriptionStatus | createdAt | phone | email |
|----|------|------|----------|--------|-------------------|-----------|-------|-------|
| admin_002 | اسم المدير | admin | كلمة_المرور | QR_admin_002 | active | 2024-01-15 | 966501234567 | admin@example.com |
```

### الطريقة 2: استخدام Google Apps Script

1. في Google Sheets، اذهب إلى Extensions > Apps Script
2. أضف الكود التالي:

```javascript
function createAdminUser() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
  
  // بيانات المدير الجديد
  const adminData = {
    id: `admin_${Date.now()}`,
    name: 'اسم المدير الجديد',
    role: 'admin',
    password: 'admin123', // غير كلمة المرور
    qrCode: `QR_admin_${Date.now()}`,
    subscriptionStatus: 'active',
    createdAt: new Date().toISOString(),
    phone: '966501234567',
    email: 'admin@dadagym.com'
  };
  
  // إضافة البيانات إلى الجدول
  const values = [
    adminData.id,
    adminData.name,
    adminData.role,
    adminData.password,
    adminData.qrCode,
    adminData.subscriptionStatus,
    adminData.createdAt,
    adminData.phone,
    adminData.email
  ];
  
  sheet.appendRow(values);
  
  Logger.log('تم إنشاء حساب المدير بنجاح');
  Logger.log('اسم المستخدم: ' + adminData.name);
  Logger.log('كلمة المرور: ' + adminData.password);
}
```

3. احفظ واشغل الدالة

### الطريقة 3: إنشاء نموذج Google Forms

1. أنشئ Google Form جديد
2. أضف الحقول التالية:
   - الاسم الكامل
   - رقم الهاتف
   - البريد الإلكتروني
   - كلمة المرور المؤقتة

3. اربط النموذج بـ Google Sheets
4. أضف Apps Script لمعالجة الردود:

```javascript
function onFormSubmit(e) {
  const responses = e.values;
  const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
  
  const adminData = [
    `admin_${Date.now()}`, // id
    responses[1], // name
    'admin', // role
    responses[4], // password
    `QR_admin_${Date.now()}`, // qrCode
    'active', // subscriptionStatus
    new Date().toISOString(), // createdAt
    responses[2], // phone
    responses[3] // email
  ];
  
  usersSheet.appendRow(adminData);
}
```

## إعداد الصلاحيات

### صلاحيات المدير الكاملة:
- إدارة جميع الأعضاء
- تسجيل الحضور للأعضاء
- الموافقة على الاشتراكات
- عرض التقارير والإحصائيات
- إدارة إعدادات النادي
- تصدير البيانات
- إنشاء نسخ احتياطية

### صلاحيات العضو العادي:
- عرض ملفه الشخصي فقط
- تسجيل حضوره الذاتي (إذا كان الاشتراك نشط)
- عرض تاريخ حضوره
- تحديث بياناته الشخصية

## أمان الحسابات الإدارية

### كلمات المرور القوية:
```javascript
// مولد كلمات مرور قوية
function generateStrongPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
```

### تشفير كلمات المرور (اختياري):
```javascript
function hashPassword(password) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password)
    .map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}
```

## مراقبة النشاط

### تسجيل عمليات المديرين:
```javascript
function logAdminActivity(adminId, action, details) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('admin_logs');
  
  const logEntry = [
    new Date().toISOString(),
    adminId,
    action,
    details,
    Session.getActiveUser().getEmail()
  ];
  
  logSheet.appendRow(logEntry);
}
```

## نصائح الأمان

1. **تغيير كلمات المرور الافتراضية فوراً**
2. **استخدام كلمات مرور قوية ومختلفة لكل مدير**
3. **مراجعة صلاحيات المديرين دورياً**
4. **تسجيل جميع العمليات الإدارية**
5. **إنشاء نسخ احتياطية منتظمة**
6. **تحديد عدد محدود من المديرين**

## إزالة صلاحيات المدير

لإزالة صلاحيات مدير:
1. غير `role` من `admin` إلى `member`
2. أو غير `subscriptionStatus` إلى `expired`
3. أو احذف الصف كاملاً

## استكشاف الأخطاء

### مشاكل شائعة:
- **لا يمكن تسجيل الدخول**: تحقق من كلمة المرور والاسم
- **لا تظهر الصفحات الإدارية**: تأكد من أن `role = admin`
- **مشاكل في المزامنة**: تحقق من اتصال الإنترنت وإعدادات Google Sheets

### حلول:
```javascript
// فحص حساب المدير
function checkAdminAccount(adminName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === adminName) {
      Logger.log('تم العثور على الحساب:');
      Logger.log('الاسم: ' + data[i][1]);
      Logger.log('الدور: ' + data[i][2]);
      Logger.log('حالة الاشتراك: ' + data[i][5]);
      return;
    }
  }
  
  Logger.log('لم يتم العث على الحساب');
}
```

## نموذج بيانات المدير

```json
{
  "id": "admin_1642234567890",
  "name": "أحمد محمد - مدير النادي",
  "role": "admin",
  "password": "SecurePass123!",
  "qrCode": "QR_admin_1642234567890",
  "subscriptionStatus": "active",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "phone": "966501234567",
  "email": "ahmed.admin@dadagym.com"
}
```

هذا الدليل يوفر طرق متعددة لإنشاء وإدارة الحسابات الإدارية بأمان وفعالية.