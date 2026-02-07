<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Quét Mã QR</ion-title>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="scan-content">
      <div class="scan-container">
        <div v-if="!scanning" class="scan-placeholder">
          <ion-icon :icon="qrCodeOutline" size="large"></ion-icon>
          <p>Bấm nút bên dưới để bắt đầu quét mã QR</p>
          <ion-button
            expand="block"
            color="primary"
            @click="startScanning"
            class="scan-button"
          >
            Bắt đầu quét
          </ion-button>
        </div>

        <div v-else class="scanner-container">
          <div id="qr-reader" class="qr-reader"></div>
          <ion-button
            expand="block"
            color="danger"
            @click="stopScanning"
            class="stop-button"
          >
            Dừng quét
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { qrCodeOutline } from 'ionicons/icons';
import { Html5Qrcode } from 'html5-qrcode';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton
} from '@ionic/vue';

const router = useRouter();
const scanning = ref(false);
let html5QrCode: Html5Qrcode | null = null;

const startScanning = async () => {
  try {
    scanning.value = true;
    
    html5QrCode = new Html5Qrcode('qr-reader');
    
    await html5QrCode.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText) => {
        handleQRCode(decodedText);
      },
      (errorMessage) => {
        // Ignore errors
      }
    );
  } catch (error) {
    console.error('Error starting QR scanner:', error);
    scanning.value = false;
  }
};

const stopScanning = async () => {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
      await html5QrCode.clear();
    } catch (error) {
      console.error('Error stopping QR scanner:', error);
    }
    html5QrCode = null;
  }
  scanning.value = false;
};

const handleQRCode = async (decodedText: string) => {
  // Extract room code from URL
  const match = decodedText.match(/\/room\/([A-Z0-9]+)/);
  if (match && match[1]) {
    await stopScanning();
    router.push(`/room/${match[1]}`);
  } else {
    // Try to use the decoded text directly as room code
    await stopScanning();
    router.push(`/room/${decodedText}`);
  }
};

onUnmounted(() => {
  stopScanning();
});
</script>

<style scoped>
.scan-content {
  --background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
}

.scan-container {
  padding: 20px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.scan-placeholder {
  text-align: center;
  color: #ec4899;
}

.scan-placeholder p {
  margin: 20px 0;
  color: #4b5563;
}

.scan-button {
  margin-top: 30px;
  --border-radius: 12px;
  height: 50px;
}

.scanner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-reader {
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}

.stop-button {
  --border-radius: 12px;
  height: 50px;
}
</style>
