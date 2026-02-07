<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Device Info Demo</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refresh">
            <ion-icon :icon="refreshOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Loading State -->
      <ion-card v-if="!deviceInfo">
        <ion-card-content class="ion-text-center">
          <ion-spinner />
          <p>Loading device info...</p>
        </ion-card-content>
      </ion-card>

      <!-- Device Info -->
      <template v-else>
        <!-- Platform Detection -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="phonePortraitOutline" />
              Platform Detection
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>Native App</ion-label>
                <ion-badge :color="deviceInfo.isNativeApp ? 'success' : 'medium'">
                  {{ deviceInfo.isNativeApp ? 'Yes' : 'No' }}
                </ion-badge>
              </ion-item>
              <ion-item>
                <ion-label>Web Browser</ion-label>
                <ion-badge :color="deviceInfo.isWebBrowser ? 'success' : 'medium'">
                  {{ deviceInfo.isWebBrowser ? 'Yes' : 'No' }}
                </ion-badge>
              </ion-item>
              <ion-item>
                <ion-label>PWA</ion-label>
                <ion-badge :color="deviceInfo.isPWA ? 'success' : 'medium'">
                  {{ deviceInfo.isPWA ? 'Yes' : 'No' }}
                </ion-badge>
              </ion-item>
              <ion-item>
                <ion-label>Platform</ion-label>
                <ion-chip color="primary">{{ deviceInfo.platform }}</ion-chip>
              </ion-item>
              <ion-item>
                <ion-label>Operating System</ion-label>
                <ion-chip color="secondary">{{ deviceInfo.operatingSystem }}</ion-chip>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Device Type -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="tabletLandscapeOutline" />
              Device Type
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>Type</ion-label>
                <ion-chip :color="getDeviceTypeColor(deviceInfo.deviceType)">
                  {{ deviceInfo.deviceType }}
                </ion-chip>
              </ion-item>
              <ion-item>
                <ion-label>Mobile</ion-label>
                <ion-badge :color="deviceInfo.isMobile ? 'success' : 'medium'">
                  {{ deviceInfo.isMobile ? 'Yes' : 'No' }}
                </ion-badge>
              </ion-item>
              <ion-item>
                <ion-label>Tablet</ion-label>
                <ion-badge :color="deviceInfo.isTablet ? 'success' : 'medium'">
                  {{ deviceInfo.isTablet ? 'Yes' : 'No' }}
                </ion-badge>
              </ion-item>
              <ion-item>
                <ion-label>Desktop</ion-label>
                <ion-badge :color="deviceInfo.isDesktop ? 'success' : 'medium'">
                  {{ deviceInfo.isDesktop ? 'Yes' : 'No' }}
                </ion-badge>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Device Details -->
        <ion-card v-if="deviceInfo.manufacturer || deviceInfo.model">
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="hardwareChipOutline" />
              Device Details
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item v-if="deviceInfo.manufacturer">
                <ion-label>
                  <p>Manufacturer</p>
                  <h2>{{ deviceInfo.manufacturer }}</h2>
                </ion-label>
              </ion-item>
              <ion-item v-if="deviceInfo.model">
                <ion-label>
                  <p>Model</p>
                  <h2>{{ deviceInfo.model }}</h2>
                </ion-label>
              </ion-item>
              <ion-item v-if="deviceInfo.deviceName">
                <ion-label>
                  <p>Device Name</p>
                  <h2>{{ deviceInfo.deviceName }}</h2>
                </ion-label>
              </ion-item>
              <ion-item v-if="deviceInfo.uuid">
                <ion-label>
                  <p>UUID</p>
                  <h2 style="font-size: 0.875rem;">{{ deviceInfo.uuid }}</h2>
                </ion-label>
              </ion-item>
              <ion-item v-if="deviceInfo.osVersion">
                <ion-label>
                  <p>OS Version</p>
                  <h2>{{ deviceInfo.osVersion }}</h2>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Screen Info -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="desktopOutline" />
              Screen Info
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>
                  <p>Width</p>
                  <h2>{{ deviceInfo.screenWidth }}px</h2>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <p>Height</p>
                  <h2>{{ deviceInfo.screenHeight }}px</h2>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <p>Pixel Ratio</p>
                  <h2>{{ deviceInfo.pixelRatio }}x</h2>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Network Status -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="wifiOutline" />
              Network Status
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>Online</ion-label>
                <ion-badge :color="isOnline ? 'success' : 'danger'">
                  {{ isOnline ? 'Connected' : 'Offline' }}
                </ion-badge>
              </ion-item>
              <ion-item v-if="networkInfo">
                <ion-label>Connection Type</ion-label>
                <ion-chip>{{ networkInfo.connectionType }}</ion-chip>
              </ion-item>
              <ion-item v-if="networkInfo?.effectiveType">
                <ion-label>Effective Type</ion-label>
                <ion-chip>{{ networkInfo.effectiveType }}</ion-chip>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Battery -->
        <ion-card v-if="deviceInfo.batteryLevel !== undefined">
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="batteryChargingOutline" />
              Battery
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>Level</ion-label>
                <ion-badge :color="getBatteryColor(deviceInfo.batteryLevel)">
                  {{ Math.round((deviceInfo.batteryLevel || 0) * 100) }}%
                </ion-badge>
              </ion-item>
              <ion-item>
                <ion-label>Charging</ion-label>
                <ion-badge :color="deviceInfo.isCharging ? 'success' : 'medium'">
                  {{ deviceInfo.isCharging ? 'Yes' : 'No' }}
                </ion-badge>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Features Support -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="constructOutline" />
              Features Support
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-icon :icon="cameraOutline" slot="start" />
                <ion-label>Camera</ion-label>
                <ion-badge :color="deviceInfo.hasCamera ? 'success' : 'medium'">
                  {{ deviceInfo.hasCamera ? 'Yes' : 'No' }}
                </ion-badge>
              </ion-item>
              <ion-item>
                <ion-icon :icon="locateOutline" slot="start" />
                <ion-label>Geolocation</ion-label>
                <ion-badge :color="deviceInfo.hasGeolocation ? 'success' : 'medium'">
                  {{ deviceInfo.hasGeolocation ? 'Yes' : 'No' }}
                </ion-badge>
              </ion-item>
              <ion-item>
                <ion-icon :icon="bluetoothOutline" slot="start" />
                <ion-label>Bluetooth</ion-label>
                <ion-badge :color="deviceInfo.hasBluetooth ? 'success' : 'medium'">
                  {{ deviceInfo.hasBluetooth ? 'Yes' : 'No' }}
                </ion-badge>
              </ion-item>
              <ion-item>
                <ion-icon :icon="fingerPrintOutline" slot="start" />
                <ion-label>Biometric</ion-label>
                <ion-badge :color="deviceInfo.hasBiometric ? 'success' : 'medium'">
                  {{ deviceInfo.hasBiometric ? 'Yes' : 'No' }}
                </ion-badge>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Browser Info -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="globeOutline" />
              Browser Info
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>
                  <p>Language</p>
                  <h2>{{ deviceInfo.language }}</h2>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <p>User Agent</p>
                  <p style="font-size: 0.75rem; word-break: break-all;">{{ deviceInfo.userAgent }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Actions -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Test Features</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button 
              expand="block" 
              @click="testGeolocation"
              :disabled="!deviceInfo.hasGeolocation"
            >
              <ion-icon :icon="locateOutline" slot="start" />
              Get Location
            </ion-button>
            
            <ion-button 
              expand="block" 
              @click="testBluetooth"
              :disabled="!deviceInfo.hasBluetooth"
              color="secondary"
            >
              <ion-icon :icon="bluetoothOutline" slot="start" />
              Request Bluetooth
            </ion-button>
          </ion-card-content>
        </ion-card>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonChip,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  alertController,
} from '@ionic/vue';
import {
  refreshOutline,
  phonePortraitOutline,
  tabletLandscapeOutline,
  hardwareChipOutline,
  desktopOutline,
  wifiOutline,
  batteryChargingOutline,
  constructOutline,
  cameraOutline,
  locateOutline,
  bluetoothOutline,
  fingerPrintOutline,
  globeOutline,
} from 'ionicons/icons';
import { useDevice } from '@/composables/useDevice';
import type { DeviceType } from '@/types/device';

const {
  deviceInfo,
  networkInfo,
  isOnline,
  refresh,
  getCurrentPosition,
  requestBluetoothDevice,
} = useDevice();

const getDeviceTypeColor = (type: DeviceType) => {
  switch (type) {
    case 'mobile': return 'primary';
    case 'tablet': return 'secondary';
    case 'desktop': return 'tertiary';
    default: return 'medium';
  }
};

const getBatteryColor = (level: number) => {
  if (level > 0.5) return 'success';
  if (level > 0.2) return 'warning';
  return 'danger';
};

const testGeolocation = async () => {
  try {
    const position = await getCurrentPosition();
    const alert = await alertController.create({
      header: 'Location',
      message: `
        Latitude: ${position.latitude.toFixed(6)}<br>
        Longitude: ${position.longitude.toFixed(6)}<br>
        Accuracy: ${position.accuracy.toFixed(2)}m
      `,
      buttons: ['OK'],
    });
    await alert.present();
  } catch (error) {
    const alert = await alertController.create({
      header: 'Error',
      message: error instanceof Error ? error.message : 'Failed to get location',
      buttons: ['OK'],
    });
    await alert.present();
  }
};

const testBluetooth = async () => {
  try {
    await requestBluetoothDevice();
    const alert = await alertController.create({
      header: 'Bluetooth',
      message: 'Bluetooth device request initiated',
      buttons: ['OK'],
    });
    await alert.present();
  } catch (error) {
    const alert = await alertController.create({
      header: 'Error',
      message: error instanceof Error ? error.message : 'Bluetooth request failed',
      buttons: ['OK'],
    });
    await alert.present();
  }
};
</script>

<style scoped lang="scss">
ion-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ion-icon {
    font-size: 1.5rem;
  }
}

ion-item {
  --padding-start: 1rem;
}
</style>

