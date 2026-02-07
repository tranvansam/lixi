import { ref, computed, onMounted, onUnmounted } from 'vue';
import { isPlatform } from '@ionic/vue';
import type { 
  DeviceInfo, 
  DeviceType, 
  PlatformType, 
  OperatingSystem,
  NetworkInfo,
  BatteryInfo,
  GeolocationPosition,
} from '@/types/device';

/**
 * Composable for device detection and information
 * 
 * Provides comprehensive device information including:
 * - Platform detection (web/native app)
 * - Device type (mobile/tablet/desktop)
 * - Screen info, network status, battery, etc.
 */
export const useDevice = () => {
  // Reactive state
  const deviceInfo = ref<DeviceInfo | null>(null);
  const networkInfo = ref<NetworkInfo | null>(null);
  const batteryInfo = ref<BatteryInfo | null>(null);
  const isOnline = ref(navigator.onLine);
  
  /**
   * Detect platform type
   */
  const detectPlatform = (): PlatformType => {
    if (isPlatform('capacitor')) {
      if (isPlatform('ios')) return 'ios';
      if (isPlatform('android')) return 'android';
      return 'unknown';
    }
    
    if (isPlatform('electron')) return 'electron';
    if (isPlatform('pwa')) return 'pwa';
    if (isPlatform('mobileweb')) return 'mobileweb';
    
    return 'web';
  };
  
  /**
   * Detect operating system
   */
  const detectOS = (): OperatingSystem => {
    const ua = navigator.userAgent.toLowerCase();
    
    if (isPlatform('ios') || /iphone|ipad|ipod/.test(ua)) return 'ios';
    if (isPlatform('android') || /android/.test(ua)) return 'android';
    if (/windows/.test(ua)) return 'windows';
    if (/mac/.test(ua)) return 'mac';
    if (/linux/.test(ua)) return 'linux';
    
    return 'unknown';
  };
  
  /**
   * Detect device type
   */
  const detectDeviceType = (): DeviceType => {
    const width = window.innerWidth;
    
    if (isPlatform('mobile')) return 'mobile';
    if (isPlatform('tablet')) return 'tablet';
    if (isPlatform('desktop')) return 'desktop';
    
    // Fallback to screen width
    if (width < 768) return 'mobile';
    if (width >= 768 && width < 1024) return 'tablet';
    if (width >= 1024) return 'desktop';
    
    return 'unknown';
  };
  
  /**
   * Check if running as native app
   */
  const isNativeApp = computed(() => isPlatform('capacitor') || isPlatform('cordova'));
  
  /**
   * Check if running in web browser
   */
  const isWebBrowser = computed(() => !isNativeApp.value);
  
  /**
   * Check feature support
   */
  const checkFeatureSupport = () => {
    return {
      hasCamera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      hasGeolocation: 'geolocation' in navigator,
      hasBluetooth: 'bluetooth' in navigator,
      hasNFC: 'NDEFReader' in window,
      hasBiometric: 'credentials' in navigator,
    };
  };
  
  /**
   * Get device info using Capacitor Device plugin (if available)
   */
  const getCapacitorDeviceInfo = async () => {
    try {
      // Dynamic import Capacitor Device plugin
      const { Device } = await import('@capacitor/device');
      
      const info = await Device.getInfo();
      const id = await Device.getId();
      const batteryInfo = await Device.getBatteryInfo();
      const languageCode = await Device.getLanguageCode();
      
      return {
        manufacturer: info.manufacturer,
        model: info.model,
        platform: info.platform,
        osVersion: info.osVersion,
        uuid: id.identifier,
        batteryLevel: batteryInfo.batteryLevel,
        isCharging: batteryInfo.isCharging,
        languageCode: languageCode.value,
      };
    } catch (error) {
      console.warn('Capacitor Device plugin not available:', error);
      return null;
    }
  };
  
  /**
   * Get network info
   */
  const getNetworkInfo = (): NetworkInfo => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (!connection) {
      return {
        connected: navigator.onLine,
        connectionType: 'unknown',
      };
    }
    
    return {
      connected: navigator.onLine,
      connectionType: connection.effectiveType || 'unknown',
      downlink: connection.downlink,
      downlinkMax: connection.downlinkMax,
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  };
  
  /**
   * Get battery info
   */
  const getBatteryInfo = async (): Promise<BatteryInfo | null> => {
    try {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        return {
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        };
      }
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
    return null;
  };
  
  /**
   * Get current geolocation
   */
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude ?? undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
            heading: position.coords.heading ?? undefined,
            speed: position.coords.speed ?? undefined,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };
  
  /**
   * Request bluetooth device
   */
  const requestBluetoothDevice = async (options?: RequestDeviceOptions) => {
    try {
      if (!('bluetooth' in navigator)) {
        throw new Error('Bluetooth not supported');
      }
      
      const device = await (navigator as any).bluetooth.requestDevice(
        options || {
          acceptAllDevices: true,
        }
      );
      
      return device;
    } catch (error) {
      console.error('Bluetooth request failed:', error);
      throw error;
    }
  };
  
  /**
   * Initialize and gather all device info
   */
  const initializeDeviceInfo = async () => {
    const platform = detectPlatform();
    const os = detectOS();
    const deviceType = detectDeviceType();
    const features = checkFeatureSupport();
    
    // Get Capacitor device info if available
    const capacitorInfo = isNativeApp.value ? await getCapacitorDeviceInfo() : null;
    
    deviceInfo.value = {
      // Platform detection
      isNativeApp: isNativeApp.value,
      isWebBrowser: isWebBrowser.value,
      isPWA: isPlatform('pwa'),
      isElectron: isPlatform('electron'),
      
      // Device type
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      deviceType,
      
      // Platform
      platform,
      operatingSystem: os,
      
      // Device details (from Capacitor if available)
      manufacturer: capacitorInfo?.manufacturer,
      model: capacitorInfo?.model,
      deviceName: capacitorInfo?.model || navigator.platform,
      uuid: capacitorInfo?.uuid,
      osVersion: capacitorInfo?.osVersion,
      
      // Screen info
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
      
      // Browser info
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: Array.from(navigator.languages),
      
      // Network
      isOnline: navigator.onLine,
      connectionType: getNetworkInfo().connectionType,
      
      // Features support
      ...features,
      
      // Battery (from Capacitor if available)
      batteryLevel: capacitorInfo?.batteryLevel,
      isCharging: capacitorInfo?.isCharging,
    };
    
    // Update network info
    networkInfo.value = getNetworkInfo();
    
    // Get battery info (web API)
    if (!capacitorInfo) {
      batteryInfo.value = await getBatteryInfo();
    }
  };
  
  /**
   * Event listeners for online/offline
   */
  const handleOnline = () => {
    isOnline.value = true;
    if (deviceInfo.value) {
      deviceInfo.value.isOnline = true;
    }
  };
  
  const handleOffline = () => {
    isOnline.value = false;
    if (deviceInfo.value) {
      deviceInfo.value.isOnline = false;
    }
  };
  
  /**
   * Event listener for window resize
   */
  const handleResize = () => {
    if (deviceInfo.value) {
      deviceInfo.value.screenWidth = window.innerWidth;
      deviceInfo.value.screenHeight = window.innerHeight;
      deviceInfo.value.deviceType = detectDeviceType();
      deviceInfo.value.isMobile = deviceInfo.value.deviceType === 'mobile';
      deviceInfo.value.isTablet = deviceInfo.value.deviceType === 'tablet';
      deviceInfo.value.isDesktop = deviceInfo.value.deviceType === 'desktop';
    }
  };
  
  // Lifecycle
  onMounted(() => {
    initializeDeviceInfo();
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('resize', handleResize);
  });
  
  onUnmounted(() => {
    // Remove event listeners
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('resize', handleResize);
  });
  
  return {
    // State - direct refs
    deviceInfo,
    networkInfo,
    batteryInfo,
    isOnline,
    
    // Computed
    isNativeApp,
    isWebBrowser,
    isMobile: computed(() => deviceInfo.value?.isMobile ?? false),
    isTablet: computed(() => deviceInfo.value?.isTablet ?? false),
    isDesktop: computed(() => deviceInfo.value?.isDesktop ?? false),
    
    // Methods
    refresh: initializeDeviceInfo,
    getCurrentPosition,
    requestBluetoothDevice,
    getNetworkInfo: () => {
      networkInfo.value = getNetworkInfo();
      return networkInfo.value;
    },
  };
};

