/**
 * Device Types and Interfaces
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export type PlatformType = 
  | 'web' 
  | 'ios' 
  | 'android' 
  | 'electron' 
  | 'pwa' 
  | 'mobileweb'
  | 'unknown';

export type OperatingSystem = 
  | 'ios' 
  | 'android' 
  | 'windows' 
  | 'mac' 
  | 'linux' 
  | 'unknown';

export interface DeviceInfo {
  // Platform detection
  isNativeApp: boolean;
  isWebBrowser: boolean;
  isPWA: boolean;
  isElectron: boolean;
  
  // Device type
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
  
  // Platform
  platform: PlatformType;
  operatingSystem: OperatingSystem;
  
  // Device details
  manufacturer?: string;
  model?: string;
  deviceName?: string;
  uuid?: string; // Device unique ID
  osVersion?: string;
  
  // Screen info
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  
  // Browser info (if web)
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
  
  // Battery (if available)
  batteryLevel?: number;
  isCharging?: boolean;
}

export interface NetworkInfo {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
  downlink?: number;
  downlinkMax?: number;
  effectiveType?: string;
  rtt?: number;
  saveData?: boolean;
}

export interface BatteryInfo {
  level: number; // 0-1
  charging: boolean;
  chargingTime?: number;
  dischargingTime?: number;
}

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

