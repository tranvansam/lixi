# Testing Guide

Hướng dẫn test các tính năng của app.

## 🚀 Khởi động

### 1. Start Mock Server

```bash
npm run mock:server
```

Mock server sẽ chạy trên `http://localhost:4000`

**Test Accounts:**
- Admin: `admin@example.com` / `admin123`
- Manager: `manager@example.com` / `manager123`
- User: `user@example.com` / `user123`
- Guest: `guest@example.com` / `guest123`

### 2. Start Dev Server

Mở terminal khác:

```bash
npm run dev
```

App sẽ chạy trên `http://localhost:8100`

---

## 📋 Test Cases

### 1. **API Testing (HomePage)**

Ở HomePage, section "API Testing":

#### Test System Status (Public API)
1. Click button **"Fetch System Status"**
2. **Expected:**
   - Hiển thị loading spinner
   - Sau đó hiển thị **Success Card màu xanh** với data:
   ```json
   {
     "status": "ok",
     "version": "1.0.0",
     "uptime": 5823
   }
   ```

#### Test Posts (Public API)
1. Click button **"Fetch Posts"**
2. **Expected:**
   - Hiển thị loading spinner
   - Sau đó hiển thị **Success Card** với array of posts

#### Test Products (Public API)
1. Click button **"Fetch Products"**
2. **Expected:**
   - Hiển thị loading spinner
   - Sau đó hiển thị **Success Card** với array of products

#### Test Profile (Auth Required)
1. **Chưa login:** Click **"Fetch Profile"**
   - **Expected:** 
     - Error card màu đỏ: "HTTP 401: Missing access token"
     - **Error Modal popup tự động** với title "Unauthorized"

2. **Đã login:** Login trước, rồi click **"Fetch Profile"**
   - **Expected:** Success card với user info

---

### 2. **Error Modal Testing**

Ở HomePage, section "Test Error Modal":

#### Test 401 (Unauthorized)
1. Click **"Test 401 (Unauthorized)"**
2. **Expected:**
   - Error card đỏ xuất hiện: "HTTP 401: ..."
   - **Error Modal popup tự động**:
     - Title: "Unauthorized"
     - Message: dựa theo locale (EN/KO/ZH)
     - Icon màu warning (vàng)
     - Button "OK" để đóng

#### Test 403 (Forbidden)
1. Click **"Test 403 (Forbidden)"**
2. **Expected:**
   - Error card đỏ
   - **Error Modal popup**:
     - Title: "Forbidden"
     - Icon màu warning

#### Test 404 (Not Found)
1. Click **"Test 404 (Not Found)"**
2. **Expected:**
   - Error card đỏ
   - **Error Modal popup**:
     - Title: "Not Found"

#### Test 422 (Validation Error)
1. Click **"Test 422 (Validation Error)"**
2. **Expected:**
   - Error Modal: "Validation Error"

#### Test 429 (Too Many Requests)
1. Click **"Test 429 (Too Many Requests)"**
2. **Expected:**
   - Error Modal: "Too Many Requests"

#### Test 500 (Server Error)
1. Click **"Test 500 (Server Error)"**
2. **Expected:**
   - Error card đỏ
   - **Error Modal popup**:
     - Title: "Internal Server Error"
     - Icon màu danger (đỏ)

#### Test 502, 503, 504 (Gateway Errors)
1. Click các button tương ứng
2. **Expected:**
   - Error cards
   - Error modals với titles tương ứng

---

### 3. **Authentication Testing**

Ở HomePage, section với email/password inputs:

#### Login Success
1. Nhập:
   - Email: `admin@example.com`
   - Password: `admin123`
2. Click **"Login"**
3. **Expected:**
   - Loading spinner
   - Success message màu xanh: "Login successful!"
   - Hiển thị current user info

#### Login Failed
1. Nhập email/password sai
2. Click **"Login"**
3. **Expected:**
   - Error message màu đỏ

#### Logout
1. Click **"Logout"**
2. **Expected:**
   - Current user cleared
   - Cookies removed

---

### 4. **Permission Testing**

Navigate to `/permission-demo`:

#### Current User Info
- Hiển thị:
  - Role (admin/manager/user/guest)
  - User ID
  - Is Admin/Manager/User badges

#### Permissions List
- Hiển thị tất cả permissions với actions (view, create, edit, delete, etc.)

#### Action Buttons
- **Admin login:**
  - Tất cả buttons hiện
  - Có thể: View, Create, Edit, Delete Users
  - Có thể: View, Create, Edit, Export Products
  - Có thể: View, Edit Settings

- **Manager login:**
  - Giới hạn buttons
  - Có thể: View, Edit Users (không Delete)
  - Có thể: View, Edit Products
  - Có thể: View Settings (không Edit)

- **User login:**
  - Minimal buttons
  - Có thể: View Products
  - Có thể: View, Create Posts
  - Không thấy Settings buttons

#### v-permission Directive
- Buttons "Delete User (Admin Only)" và "Export Reports"
- Chỉ hiện với đúng role

#### v-role Directive
- Sections màu khác nhau cho Admin/Manager/User
- Chỉ hiện với đúng role

---

### 5. **Route Protection Testing**

#### Admin Routes
1. Login as **User** (`user@example.com` / `user123`)
2. Navigate to `/admin/users`
3. **Expected:**
   - Redirect to `/forbidden` (403 page)

#### Protected Routes
1. **Chưa login**, navigate to `/products`
2. **Expected:**
   - Redirect to Home với query `?redirect=/products`

3. **Login**, navigate to `/products`
4. **Expected:**
   - Access granted nếu có permission

---

### 6. **Multi-language Testing**

Ở HomePage, chọn language dropdown:

1. Select **English**
   - Error modal messages in English
   - UI labels in English

2. Select **한국어 (Korean)**
   - Error modal messages in Korean
   - UI labels in Korean

3. Select **中文 (Chinese)**
   - Error modal messages in Chinese
   - UI labels in Chinese

---

### 7. **Form Components Testing**

Navigate to `/form-example`:

#### Login Form
1. Fill in email (invalid format)
2. **Expected:** Validation error "Invalid email format"

3. Fill in valid email, password < 6 chars
4. **Expected:** Validation error "Password must be at least 6 characters"

5. Fill valid data, submit
6. **Expected:** Success alert

#### Register Form
1. Test all validation:
   - Name required
   - Email required + format
   - Password required + min length
   - Confirm password must match
   - Gender required
   - Country required
   - Accept terms required

2. Fill all valid, submit
3. **Expected:** Success alert

---

## 🐛 Debugging

### Console Logs

Khi test error modal, check console for logs:

```
📢 Standalone showError called with: 401
🚨 showError called with statusCode: 401
✅ Error modal state updated: { isOpen: true, statusCode: 401, ... }
🔔 Error Modal state changed: OPEN
📋 Modal data: { statusCode: 401, message: "...", title: "..." }
```

### Error Modal Not Appearing?

1. Check console logs có chạy không
2. Check `App.vue` có `<ErrorModal>` component
3. Check `errorModalState.isOpen` có `true`
4. Restart dev server

### API Data Not Showing?

1. Check mock server đang chạy (`http://localhost:4000`)
2. Check console có errors
3. Check Network tab trong DevTools
4. Verify endpoint URL đúng

---

## ✅ Expected Results Summary

| Test | Expected Behavior |
|------|------------------|
| **API Success** | Green success card với JSON data |
| **API Error** | Red error card + Error modal popup tự động |
| **Error Modal** | Popup với title, message, icon color phù hợp |
| **Login Success** | Green success message + user info |
| **Login Failed** | Red error message |
| **Permission Check** | Buttons hiện/ẩn theo role |
| **Route Protection** | Redirect nếu không có quyền |
| **Form Validation** | Error messages dưới fields |
| **Multi-language** | UI và messages đổi theo language |

---

## 🎯 Quick Test Checklist

- [ ] Mock server chạy
- [ ] Dev server chạy
- [ ] API calls trả về data (success cards màu xanh)
- [ ] Error buttons show modal tự động
- [ ] Login/logout hoạt động
- [ ] Permission demo page hoạt động
- [ ] Route protection hoạt động
- [ ] Form validation hoạt động
- [ ] Multi-language hoạt động
- [ ] Console logs xuất hiện đúng

---

## 📞 Troubleshooting

### Port already in use?

```bash
# Mock server
lsof -ti:4000 | xargs kill -9

# Dev server
lsof -ti:8100 | xargs kill -9
```

### Clear cookies

```javascript
// Console
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

### Restart everything

```bash
# Stop all
Ctrl+C (both terminals)

# Start fresh
npm run mock:server
npm run dev
```

Chúc test vui vẻ! 🚀

