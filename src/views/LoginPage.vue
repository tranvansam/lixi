<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Yen Nguyen - Lì Xì Đầu Năm</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="login-content">
      <div class="login-container">
        <div class="app-logo">
          <h1>Yen Nguyen</h1>
          <p class="subtitle">Lì Xì Đầu Năm</p>
        </div>

        <ion-card class="login-card">
          <ion-card-header>
            <ion-card-title>Đăng Nhập</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form @submit.prevent="handleLogin">
              <ion-item>
                <ion-label position="stacked">Email</ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="Nhập email"
                  required
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Mật khẩu</ion-label>
                <ion-input
                  v-model="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  required
                ></ion-input>
              </ion-item>

              <ion-button
                expand="block"
                type="submit"
                color="primary"
                :disabled="loading"
                class="login-button"
              >
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                <span v-else>Đăng Nhập</span>
              </ion-button>
            </form>

            <div class="divider">
              <span>Hoặc</span>
            </div>

            <ion-button
              expand="block"
              fill="outline"
              color="primary"
              @click="$router.push('/register')"
            >
              Đăng Ký
            </ion-button>

            <div class="join-room-section">
              <ion-button
                expand="block"
                fill="clear"
                color="primary"
                @click="showJoinRoomModal = true"
              >
                Vào phòng bằng mã
              </ion-button>
              <ion-button
                expand="block"
                fill="clear"
                color="primary"
                @click="$router.push('/scan')"
              >
                <ion-icon :icon="qrCodeOutline" slot="start"></ion-icon>
                Quét mã QR
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>

    <ion-modal :is-open="showJoinRoomModal" @didDismiss="showJoinRoomModal = false">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Nhập mã phòng</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showJoinRoomModal = false">Đóng</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="modal-content">
          <ion-item>
            <ion-label position="stacked">Mã phòng</ion-label>
            <ion-input
              v-model="roomCode"
              placeholder="Nhập mã phòng"
              @keyup.enter="joinRoom"
            ></ion-input>
          </ion-item>
          <ion-button
            expand="block"
            color="primary"
            @click="joinRoom"
            :disabled="!roomCode || loading"
            class="join-button"
          >
            Vào phòng
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { qrCodeOutline } from 'ionicons/icons';
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
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonModal,
  IonButtons,
  IonIcon,
  toastController
} from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { login } = useAuth();

const email = ref('');
const password = ref('');
const loading = ref(false);
const showJoinRoomModal = ref(false);
const roomCode = ref('');

const handleLogin = async () => {
  if (!email.value || !password.value) {
    const toast = await toastController.create({
      message: 'Vui lòng nhập đầy đủ thông tin',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  loading.value = true;
  const result = await login(email.value, password.value);
  loading.value = false;

  if (result.success) {
    router.push('/home');
  } else {
    const toast = await toastController.create({
      message: result.error || 'Đăng nhập thất bại',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
};

const joinRoom = async () => {
  if (!roomCode.value) {
    const toast = await toastController.create({
      message: 'Vui lòng nhập mã phòng',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  loading.value = true;
  router.push(`/room/${roomCode.value}`);
  loading.value = false;
  showJoinRoomModal.value = false;
};
</script>

<style scoped>
.login-content {
  --background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.app-logo {
  text-align: center;
  margin-bottom: 30px;
}

.app-logo h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ec4899;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(236, 72, 153, 0.2);
}

.subtitle {
  color: #be185d;
  font-size: 1.2rem;
  margin-top: 10px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(236, 72, 153, 0.2);
}

.login-button {
  margin-top: 20px;
  --border-radius: 12px;
  height: 50px;
}

.divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #e5e7eb;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: white;
  padding: 0 10px;
  color: #9ca3af;
}

.join-room-section {
  margin-top: 20px;
  text-align: center;
}

.modal-content {
  padding: 20px;
}

.join-button {
  margin-top: 20px;
  --border-radius: 12px;
}
</style>
