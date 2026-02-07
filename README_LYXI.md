# Yen Nguyen - Ứng dụng Lì Xì Đầu Năm

Ứng dụng web về tính năng lì xì đầu năm với giao diện màu hồng chủ đạo.

## Tính năng

### 1. Đăng ký và Đăng nhập
- Đăng ký tài khoản mới bằng email và mật khẩu
- Đăng nhập vào hệ thống
- Sử dụng Firebase Authentication

### 2. Tạo phòng lì xì
Sau khi đăng nhập, người dùng có thể tạo phòng lì xì với 2 loại:

#### Loại 1: Min-Max
- Nhập số tiền tối thiểu và tối đa
- Mỗi lần quay sẽ random trong khoảng min-max
- Không giới hạn số lần quay
- Mỗi người chỉ có thể quay một lần với một tên

#### Loại 2: Tổng Tiền
- Nhập số tiền tối thiểu và tối đa mỗi lần quay
- Nhập tổng số tiền và số người
- Phòng chỉ được quay đúng số lần đã định
- Tổng số tiền các lần quay bằng đúng tổng tiền đã nhập
- Mỗi người chỉ có thể quay một lần với một tên

### 3. Tham gia phòng
- **Quét mã QR**: Sử dụng camera để quét mã QR của phòng
- **Nhập mã phòng**: Nhập mã phòng trực tiếp (không cần đăng nhập)
- Có thể tham gia từ màn hình login

### 4. Quay lì xì
- Nhập tên trước khi quay
- Tên người chơi không được trùng nhau trong cùng một phòng
- Có thể quay nhiều lần trên cùng một máy bằng cách đổi tên
- Hiển thị kết quả quay và danh sách tất cả người đã quay

### 5. Quản lý phòng
- Xem mã phòng và mã QR
- Chia sẻ phòng với người khác
- Xem danh sách kết quả quay realtime

## Cài đặt

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình Firebase
Xem file [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) để biết cách cấu hình Firebase.

Cập nhật file `src/config/firebase.ts` với thông tin Firebase của bạn.

### 3. Chạy ứng dụng
```bash
npm run dev
```

## Cấu trúc dự án

```
src/
├── config/
│   └── firebase.ts          # Cấu hình Firebase
├── composables/
│   ├── useAuth.ts           # Composable cho authentication
│   └── useRoom.ts           # Composable cho quản lý phòng
├── types/
│   └── room.ts              # Type definitions cho Room và Spin
├── views/
│   ├── LoginPage.vue        # Màn hình đăng nhập
│   ├── RegisterPage.vue     # Màn hình đăng ký
│   ├── HomePage.vue         # Màn hình chính (tạo phòng)
│   ├── RoomPage.vue         # Màn hình phòng lì xì
│   └── ScanQRPage.vue       # Màn hình quét QR
└── router/
    └── routes/
        └── lyxi.routes.ts   # Routes cho ứng dụng lì xì
```

## Sử dụng

### Tạo phòng mới
1. Đăng nhập vào hệ thống
2. Chọn loại phòng (Min-Max hoặc Tổng Tiền)
3. Nhập thông tin phòng
4. Bấm "Tạo Phòng"
5. Hệ thống sẽ hiển thị mã phòng và mã QR

### Tham gia phòng
**Cách 1: Quét QR**
1. Từ màn hình login, bấm "Quét mã QR"
2. Cho phép truy cập camera
3. Quét mã QR của phòng

**Cách 2: Nhập mã**
1. Từ màn hình login, bấm "Vào phòng bằng mã"
2. Nhập mã phòng
3. Bấm "Vào phòng"

### Quay lì xì
1. Vào phòng lì xì
2. Nhập tên của bạn
3. Bấm "Quay May Mắn"
4. Xem kết quả và danh sách người đã quay

### Quay lại với tên khác
1. Sau khi quay xong, bấm "Đổi tên"
2. Nhập tên mới
3. Quay lại

## Lưu ý

- Tên người chơi phải là duy nhất trong mỗi phòng
- Với loại phòng "Tổng Tiền", phòng sẽ đóng khi đủ số người quay
- Dữ liệu được lưu trữ realtime trên Firebase
- Có thể quay nhiều lần trên cùng một máy bằng cách đổi tên

## Công nghệ sử dụng

- **Vue 3** - Framework JavaScript
- **Ionic Vue** - UI Framework
- **Firebase Authentication** - Xác thực người dùng
- **Firebase Realtime Database** - Lưu trữ dữ liệu realtime
- **QRCode** - Tạo mã QR
- **html5-qrcode** - Quét mã QR

## Giao diện

- Màu chủ đạo: Hồng (#ec4899)
- Gradient background: Từ #fdf2f8 đến #fce7f3
- Thiết kế hiện đại, thân thiện với người dùng
