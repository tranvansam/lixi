<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Đăng Ký</ion-title>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="register-content">
      <div class="register-container">
        <ion-card class="register-card">
          <ion-card-header>
            <ion-card-title>Tạo Tài Khoản</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <form @submit.prevent="handleRegister">
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
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  required
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Xác nhận mật khẩu</ion-label>
                <ion-input
                  v-model="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  required
                ></ion-input>
              </ion-item>

              <ion-button
                expand="block"
                type="submit"
                color="primary"
                :disabled="loading"
                class="register-button"
              >
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                <span v-else>Đăng Ký</span>
              </ion-button>
            </form>

            <div class="login-link">
              <p>Đã có tài khoản? <a @click="$router.push('/login')">Đăng nhập</a></p>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
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
  IonButtons,
  IonBackButton,
  toastController
} from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { register } = useAuth();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

const handleRegister = async () => {
  if (!email.value || !password.value || !confirmPassword.value) {
    const toast = await toastController.create({
      message: 'Vui lòng nhập đầy đủ thông tin',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  if (password.value.length < 6) {
    const toast = await toastController.create({
      message: 'Mật khẩu phải có ít nhất 6 ký tự',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  if (password.value !== confirmPassword.value) {
    const toast = await toastController.create({
      message: 'Mật khẩu xác nhận không khớp',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  loading.value = true;
  const result = await register(email.value, password.value);
  loading.value = false;

  if (result.success) {
    const toast = await toastController.create({
      message: 'Đăng ký thành công!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
    router.push('/home');
  } else {
    const toast = await toastController.create({
      message: result.error || 'Đăng ký thất bại',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
};
</script>

<style scoped>
.register-content {
  --background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
}

.register-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 400px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(236, 72, 153, 0.2);
}

.register-button {
  margin-top: 20px;
  --border-radius: 12px;
  height: 50px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

.login-link a {
  color: #ec4899;
  cursor: pointer;
  text-decoration: underline;
}
</style>
