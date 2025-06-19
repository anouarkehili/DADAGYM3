# إعداد Google Sheets للتطبيق

## الخطوة 1: إنشاء Google Sheets جديد

1. اذهب إلى [Google Sheets](https://sheets.google.com)
2. أنشئ مصنف جديد باسم "DADA GYM Database"
3. أنشئ الأوراق التالية:

### ورقة "users" (المستخدمين)
```
| id | name | role | password | qrCode | subscriptionStatus | createdAt | phone | email |
|----|----- |------|----------|--------|-------------------|-----------|-------|-------|
| admin_001 | مدير النادي | admin | admin123 | QR_admin_001 | active | 2024-01-01 | 966501234567 | admin@dadagym.com |
| member_001 | أحمد محمد | member | member123 | QR_member_001 | active | 2024-01-01 | 966501234568 | ahmed@example.com |
```

### ورقة "subscriptions" (الاشتراكات)
```
| id | userId | startDate | endDate | type | status | price | paymentMethod |
|----|--------|-----------|---------|------|--------|-------|---------------|
| sub_001 | member_001 | 2024-01-01 | 2024-02-01 | monthly | active | 200 | cash |
| sub_002 | admin_001 | 2024-01-01 | 2025-01-01 | yearly | active | 2000 | bank_transfer |
```

### ورقة "attendance" (الحضور)
```
| id | userId | date | time | type | synced | location |
|----|--------|------|------|------|--------|----------|
| att_001 | member_001 | 2024-01-15 | 08:30:00 | check-in | true | main_entrance |
| att_002 | member_001 | 2024-01-15 | 10:30:00 | check-out | true | main_entrance |
```

### ورقة "settings" (الإعدادات)
```
| key | value | description | updatedAt |
|-----|-------|-------------|-----------|
| gym_name | DADA GYM | اسم النادي | 2024-01-01 |
| gym_phone | 966501234567 | رقم هاتف النادي | 2024-01-01 |
| gym_address | الرياض، المملكة العربية السعودية | عنوان النادي | 2024-01-01 |
| monthly_price | 200 | سعر الاشتراك الشهري | 2024-01-01 |
| quarterly_price | 550 | سعر الاشتراك ربع السنوي | 2024-01-01 |
| yearly_price | 2000 | سعر الاشتراك السنوي | 2024-01-01 |
```

## الخطوة 2: اختيار طريقة الربط

### الخيار 1: SheetDB (الأسهل - مجاني حتى 200 طلب/شهر)

1. اذهب إلى [SheetDB.io](https://sheetdb.io)
2. أنشئ حساب جديد
3. أضف رابط Google Sheets الخاص بك
4. احصل على API URL
5. استبدل `YOUR_SHEET_ID` في ملف `services/googleSheets.ts`

### الخيار 2: Google Apps Script (مجاني تماماً)

1. في Google Sheets، اذهب إلى Extensions > Apps Script
2. أنشئ مشروع جديد
3. انسخ الكود التالي:

```javascript
function doGet(e) {
  const sheet = e.parameter.sheet || 'users';
  const action = e.parameter.action || 'get';
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ws = ss.getSheetByName(sheet);
    
    if (action === 'get') {
      const data = ws.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      const result = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data: result }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const sheet = e.parameter.sheet || 'users';
  const data = JSON.parse(e.postData.contents);
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ws = ss.getSheetByName(sheet);
    
    // إضافة صف جديد
    const headers = ws.getRange(1, 1, 1, ws.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => data[header] || '');
    ws.appendRow(newRow);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. احفظ المشروع ونشره كـ Web App
5. انسخ URL ووضعه في `services/googleSheets.ts`

### الخيار 3: NocodeAPI (مدفوع - أكثر مرونة)

1. اذهب إلى [NocodeAPI.com](https://nocodeapi.com)
2. أنشئ حساب وأضف Google Sheets API
3. اربط Google Sheets الخاص بك
4. احصل على API credentials
5. استبدل المتغيرات في `services/googleSheets.ts`

## الخطوة 3: تحديث التطبيق

1. افتح ملف `services/googleSheets.ts`
2. استبدل `YOUR_SHEET_ID` أو `YOUR_SCRIPT_ID` بالقيم الصحيحة
3. اختبر الاتصال من التطبيق

## الخطوة 4: الأمان

### لـ Google Apps Script:
- تأكد من تعيين الصلاحيات بشكل صحيح
- استخدم المصادقة إذا لزم الأمر

### لـ SheetDB/NocodeAPI:
- احتفظ بـ API keys آمنة
- استخدم متغيرات البيئة للمفاتيح الحساسة

## اختبار الاتصال

```javascript
// اختبار بسيط للاتصال
const testConnection = async () => {
  try {
    const response = await GoogleSheetsService.getUsers();
    console.log('Connection successful:', response);
  } catch (error) {
    console.error('Connection failed:', error);
  }
};
```

## ملاحظات مهمة

1. **النسخ الاحتياطي**: احتفظ بنسخة احتياطية من البيانات دورياً
2. **الحدود**: انتبه لحدود الطلبات لكل خدمة
3. **الأمان**: لا تشارك API keys أو روابط الوصول المباشر
4. **المراقبة**: راقب استخدام API والأخطاء

## روابط مفيدة

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [SheetDB Documentation](https://docs.sheetdb.io/)
- [NocodeAPI Documentation](https://docs.nocodeapi.com/)
- [Google Apps Script Guide](https://developers.google.com/apps-script)