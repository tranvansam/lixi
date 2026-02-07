# Hướng dẫn cấu hình Firebase

## Bước 1: Tạo dự án Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo dự án mới hoặc chọn dự án hiện có
3. Đặt tên dự án: "Yen Nguyen" hoặc tên bạn muốn

## Bước 2: Bật Authentication

1. Trong Firebase Console, vào **Authentication**
2. Bấm **Get Started**
3. Bật **Email/Password** provider
4. Lưu lại

## Bước 3: Tạo Realtime Database

1. Trong Firebase Console, vào **Realtime Database**
2. Bấm **Create Database**
3. Chọn vị trí (location) gần bạn nhất
4. Chọn **Start in test mode** (hoặc cấu hình rules sau)
5. Lưu lại

## Bước 4: Cấu hình Database Rules

Vào **Realtime Database** > **Rules** và cập nhật như sau:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true,
      "$roomId": {
        ".validate": "newData.hasChildren(['type', 'createdBy', 'roomCode', 'spins'])",
        "spins": {
          "$spinId": {
            ".validate": "newData.hasChildren(['playerName', 'amount', 'timestamp'])"
          }
        }
      }
    }
  }
}
```

## Bước 5: Lấy thông tin cấu hình

1. Vào **Project Settings** (biểu tượng bánh răng)
2. Cuộn xuống phần **Your apps**
3. Chọn **Web** (biểu tượng `</>`)
4. Đăng ký app với nickname (ví dụ: "Yen Nguyen Web")
5. Copy thông tin cấu hình Firebase

## Bước 6: Cập nhật file cấu hình

Mở file `src/config/firebase.ts` và thay thế các giá trị:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // Thay bằng apiKey của bạn
  authDomain: "YOUR_AUTH_DOMAIN",      // Thay bằng authDomain của bạn
  projectId: "YOUR_PROJECT_ID",        // Thay bằng projectId của bạn
  storageBucket: "YOUR_STORAGE_BUCKET", // Thay bằng storageBucket của bạn
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Thay bằng messagingSenderId của bạn
  appId: "YOUR_APP_ID",                // Thay bằng appId của bạn
  databaseURL: "YOUR_DATABASE_URL"     // Thay bằng databaseURL của bạn (từ Realtime Database)
};
```

## Bước 7: Kiểm tra

1. Chạy ứng dụng: `npm run dev`
2. Thử đăng ký tài khoản mới
3. Thử tạo phòng lì xì
4. Kiểm tra dữ liệu trong Firebase Console

## Lưu ý bảo mật

Sau khi hoàn thành, nên cập nhật Database Rules để bảo mật hơn:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": "auth != null || newData.child('createdBy').val() == auth.uid",
      "$roomId": {
        "spins": {
          ".write": true
        }
      }
    }
  }
}
```
