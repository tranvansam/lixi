# Device Detection & Information Guide

Composable để detect device type và lấy thông tin thiết bị.

## 📦 Installation

```bash
npm install @capacitor/device
```

## 🚀 Quick Start

```vue
<script setup lang="ts">
import { useDevice } from '@/composables/useDevice';

const { 
  deviceInfo,
  isNativeApp,
  isWebBrowser,
  isMobile,
  isOnline,
} = useDevice();
</script>

<template>
  <div v-if="deviceInfo">
    <p v-if="isNativeApp">Running as Native App</p>
    <p v-if="isWebBrowser">Running in Browser</p>
    <p>Device: {{ deviceInfo.deviceType }}</p>
    <p>Platform: {{ deviceInfo.platform }}</p>
  </div>
</template>
```

---

## 🎯 Features

### 1. Platform Detection

Phát hiện app đang chạy trên platform nào:

```typescript
const { deviceInfo, isNativeApp, isWebBrowser } = useDevice();

// Check platform
if (isNativeApp.value) {
  console.log('Running as native app');
}

if (isWebBrowser.value) {
  console.log('Running in browser');
}

// Platform type
console.log(deviceInfo.value?.platform);
// 'ios' | 'android' | 'web' | 'pwa' | 'electron' | 'mobileweb'
```

### 2. Device Type Detection

Xác định loại thiết bị:

```typescript
const { isMobile, isTablet, isDesktop } = useDevice();

if (isMobile.value) {
  // Mobile-specific logic
}

if (isTablet.value) {
  // Tablet-specific logic
}

if (isDesktop.value) {
  // Desktop-specific logic
}
```

### 3. Device Information

Lấy thông tin chi tiết về thiết bị:

```typescript
const { deviceInfo } = useDevice();

// Device details
console.log(deviceInfo.value?.manufacturer); // 'Apple', 'Samsung', etc.
console.log(deviceInfo.value?.model); // 'iPhone 13', 'Galaxy S21', etc.
console.log(deviceInfo.value?.deviceName); // Device name
console.log(deviceInfo.value?.uuid); // Unique device ID
console.log(deviceInfo.value?.osVersion); // '15.0', '12.0', etc.
```

### 4. Screen Information

Thông tin màn hình:

```typescript
const { deviceInfo } = useDevice();

console.log(deviceInfo.value?.screenWidth); // 1920
console.log(deviceInfo.value?.screenHeight); // 1080
console.log(deviceInfo.value?.pixelRatio); // 2
```

### 5. Network Status

Kiểm tra kết nối mạng:

```typescript
const { isOnline, networkInfo, getNetworkInfo } = useDevice();

// Check online status
if (isOnline.value) {
  console.log('Device is online');
}

// Get network details
const network = getNetworkInfo();
console.log(network.connectionType); // 'wifi', 'cellular', etc.
console.log(network.effectiveType); // '4g', '3g', etc.
```

### 6. Battery Information

Thông tin pin (nếu có):

```typescript
const { deviceInfo, batteryInfo } = useDevice();

console.log(deviceInfo.value?.batteryLevel); // 0.85 (85%)
console.log(deviceInfo.value?.isCharging); // true/false

// Web Battery API
if (batteryInfo.value) {
  console.log(batteryInfo.value.level); // 0-1
  console.log(batteryInfo.value.charging); // boolean
}
```

### 7. Feature Support

Kiểm tra các tính năng được support:

```typescript
const { deviceInfo } = useDevice();

if (deviceInfo.value?.hasCamera) {
  // Camera is available
}

if (deviceInfo.value?.hasGeolocation) {
  // Geolocation is available
}

if (deviceInfo.value?.hasBluetooth) {
  // Bluetooth is available
}

if (deviceInfo.value?.hasBiometric) {
  // Biometric authentication available
}
```

### 8. Geolocation

Lấy vị trí hiện tại:

```typescript
const { getCurrentPosition } = useDevice();

try {
  const position = await getCurrentPosition();
  console.log(position.latitude);
  console.log(position.longitude);
  console.log(position.accuracy);
} catch (error) {
  console.error('Failed to get location:', error);
}
```

### 9. Bluetooth

Request bluetooth device:

```typescript
const { requestBluetoothDevice } = useDevice();

try {
  const device = await requestBluetoothDevice({
    acceptAllDevices: true
  });
  console.log('Device:', device);
} catch (error) {
  console.error('Bluetooth request failed:', error);
}
```

---

## 📋 DeviceInfo Interface

```typescript
interface DeviceInfo {
  // Platform detection
  isNativeApp: boolean;
  isWebBrowser: boolean;
  isPWA: boolean;
  isElectron: boolean;
  
  // Device type
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  
  // Platform
  platform: 'web' | 'ios' | 'android' | 'electron' | 'pwa' | 'mobileweb';
  operatingSystem: 'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'unknown';
  
  // Device details
  manufacturer?: string;
  model?: string;
  deviceName?: string;
  uuid?: string;
  osVersion?: string;
  
  // Screen info
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  
  // Browser info
  userAgent: string;
  language: string;
  languages: string[];
  
  // Network
  isOnline: boolean;
  connectionType?: string;
  
  // Features support
  hasCamera: boolean;
  hasGeolocation: boolean;
  hasBluetooth: boolean;
  hasNFC: boolean;
  hasBiometric: boolean;
  
  // Battery
  batteryLevel?: number;
  isCharging?: boolean;
}
```

---

## 🎨 Usage Examples

### Responsive Layout

```vue
<template>
  <div>
    <!-- Mobile Layout -->
    <MobileLayout v-if="isMobile" />
    
    <!-- Tablet Layout -->
    <TabletLayout v-else-if="isTablet" />
    
    <!-- Desktop Layout -->
    <DesktopLayout v-else />
  </div>
</template>

<script setup lang="ts">
import { useDevice } from '@/composables/useDevice';

const { isMobile, isTablet } = useDevice();
</script>
```

### Platform-Specific Features

```vue
<script setup lang="ts">
import { useDevice } from '@/composables/useDevice';

const { isNativeApp, deviceInfo } = useDevice();

const openCamera = async () => {
  if (isNativeApp.value) {
    // Use Capacitor Camera plugin
    const { Camera } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({ ... });
  } else {
    // Use Web API
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  }
};
</script>
```

### Network-Aware Loading

```vue
<script setup lang="ts">
import { watch } from 'vue';
import { useDevice } from '@/composables/useDevice';

const { isOnline, networkInfo } = useDevice();

watch(isOnline, (online) => {
  if (online) {
    // Sync data when online
    syncData();
  } else {
    // Show offline message
    showOfflineMessage();
  }
});

// Load different quality based on connection
const loadImages = () => {
  if (networkInfo.value?.connectionType === 'wifi') {
    loadHighQualityImages();
  } else {
    loadLowQualityImages();
  }
};
</script>
```

### Device-Specific Styling

```vue
<template>
  <div :class="deviceClasses">
    Content
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDevice } from '@/composables/useDevice';

const { deviceInfo } = useDevice();

const deviceClasses = computed(() => ({
  'is-mobile': deviceInfo.value?.isMobile,
  'is-tablet': deviceInfo.value?.isTablet,
  'is-desktop': deviceInfo.value?.isDesktop,
  'is-ios': deviceInfo.value?.platform === 'ios',
  'is-android': deviceInfo.value?.platform === 'android',
}));
</script>

<style>
.is-mobile {
  /* Mobile-specific styles */
}

.is-ios {
  /* iOS-specific styles */
}
</style>
```

---

## 🔄 Auto-Updates

Composable tự động update khi:

- ✅ **Window resize** - Update screen dimensions & device type
- ✅ **Online/Offline** - Track network status changes
- ✅ **Orientation change** - Detect when device rotates

```typescript
// Auto-updates are handled internally
const { deviceInfo } = useDevice();

// deviceInfo will automatically reflect:
// - Current screen width/height
// - Current online status
// - Current device type (on resize)
```

---

## 🧪 Demo Page

Navigate to `/device-demo` để test:

```
http://localhost:8100/device-demo
```

**Features:**
- ✅ View all device information
- ✅ Test geolocation
- ✅ Test bluetooth request
- ✅ Real-time network status
- ✅ Battery level (if available)
- ✅ Refresh button to reload info

---

## 📱 Native App vs Web

### Native App (Capacitor)

Khi build native app, composable sẽ sử dụng Capacitor Device plugin:

```bash
# Build for iOS
ionic capacitor build ios

# Build for Android
ionic capacitor build android
```

**Available Info:**
- ✅ Device manufacturer
- ✅ Device model
- ✅ Device UUID
- ✅ OS version
- ✅ Battery level
- ✅ All native APIs

### Web Browser

Khi chạy trên web, composable sử dụng Web APIs:

```bash
npm run dev
```

**Available Info:**
- ✅ User agent
- ✅ Screen dimensions
- ✅ Network status
- ✅ Geolocation (with permission)
- ✅ Battery API (if supported)

---

## 🔒 Permissions

### Geolocation

```typescript
// Automatically requests permission
const position = await getCurrentPosition();
```

**Browser:** Shows permission prompt
**Native:** Requires config in `capacitor.config.ts`

### Bluetooth

```typescript
// Requires user gesture
const device = await requestBluetoothDevice();
```

**Browser:** Shows device picker
**Native:** Requires bluetooth permissions

---

## ⚡ Performance

### Optimizations

- ✅ **Single initialization** - Device info loaded once
- ✅ **Cached results** - No repeated API calls
- ✅ **Efficient updates** - Only relevant changes trigger re-renders
- ✅ **Lazy imports** - Capacitor plugins loaded on-demand

### Best Practices

```typescript
// ✅ Good - Use computed for reactive checks
const showMobileMenu = computed(() => isMobile.value);

// ❌ Bad - Direct value access
const showMobileMenu = isMobile.value; // Not reactive
```

---

## 🎯 Common Use Cases

### 1. Adaptive UI

```typescript
const { isMobile, isDesktop } = useDevice();

const menuStyle = computed(() => 
  isMobile.value ? 'bottom' : 'sidebar'
);
```

### 2. Feature Detection

```typescript
const { deviceInfo } = useDevice();

const canUseCamera = computed(() => 
  deviceInfo.value?.hasCamera ?? false
);
```

### 3. Platform-Specific Logic

```typescript
const { isNativeApp, platform } = useDevice();

if (isNativeApp.value && platform === 'ios') {
  // iOS-specific code
}
```

### 4. Offline Support

```typescript
const { isOnline } = useDevice();

watch(isOnline, (online) => {
  if (!online) {
    enableOfflineMode();
  }
});
```

---

## 🐛 Troubleshooting

### Device info is null

```typescript
// Wait for initialization
watch(deviceInfo, (info) => {
  if (info) {
    console.log('Device info loaded:', info);
  }
}, { immediate: true });
```

### Permissions denied

```typescript
try {
  const position = await getCurrentPosition();
} catch (error) {
  if (error.code === 1) {
    // Permission denied
    showPermissionMessage();
  }
}
```

### Bluetooth not available

```typescript
if (!deviceInfo.value?.hasBluetooth) {
  showMessage('Bluetooth not supported');
  return;
}
```

---

## ✅ Summary

| Feature | Web | Native App | Support |
|---------|-----|------------|---------|
| **Platform detection** | ✅ | ✅ | Always |
| **Device type** | ✅ | ✅ | Always |
| **Screen info** | ✅ | ✅ | Always |
| **Network status** | ✅ | ✅ | Always |
| **Device model** | ❌ | ✅ | Native only |
| **Device UUID** | ❌ | ✅ | Native only |
| **Battery** | ⚠️ | ✅ | Limited web support |
| **Geolocation** | ✅ | ✅ | With permission |
| **Bluetooth** | ✅ | ✅ | With permission |

Happy coding! 🚀

