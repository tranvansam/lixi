<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Yen Nguyen</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleLogout">
            <ion-icon :icon="logOutOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="home-content">
      <div class="home-container">
        <div class="welcome-section">
          <div class="welcome-icon">🎉</div>
          <h1>Chào mừng!</h1>
          <p>Chọn một trong hai để bắt đầu</p>
        </div>

        <div class="action-buttons">
          <ion-button
            expand="block"
            class="action-btn action-btn-my-rooms"
            @click="$router.push('/my-rooms')"
          >
            <ion-icon :icon="folderOutline"></ion-icon>
            <span>Phòng của tôi</span>
          </ion-button>

          <ion-button
            expand="block"
            class="action-btn action-btn-create"
            @click="$router.push('/create-room')"
          >
            <ion-icon :icon="addCircleOutline"></ion-icon>
            <span>Tạo phòng</span>
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { logOutOutline, folderOutline, addCircleOutline } from 'ionicons/icons';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon
} from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  router.push('/login');
};
</script>

<style scoped>
.home-content {
  --background: linear-gradient(160deg, #fdf2f8 0%, #fce7f3 40%, #fbcfe8 100%);
}

.home-container {
  padding: 32px 24px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  line-height: 1;
}

.welcome-section h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #831843;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.welcome-section p {
  color: #9d174d;
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
}

.action-buttons {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-btn {
  --border-radius: 20px;
  --padding-top: 20px;
  --padding-bottom: 20px;
  --padding-start: 24px;
  --padding-end: 24px;
  height: auto;
  min-height: 64px;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0.02em;
  box-shadow: 0 8px 24px rgba(190, 24, 93, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.action-btn ion-icon {
  font-size: 1.75rem;
}

.action-btn-my-rooms {
  --background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  --color: #fff;
  --box-shadow: 0 8px 24px rgba(236, 72, 153, 0.35);
}

.action-btn-my-rooms:hover,
.action-btn-my-rooms:focus {
  --background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
}

.action-btn-create {
  --background: linear-gradient(135deg, #fff 0%, #fdf2f8 100%);
  --color: #be185d;
  --border-width: 2px;
  --border-style: solid;
  --border-color: #f9a8d4;
  --box-shadow: 0 8px 24px rgba(236, 72, 153, 0.15);
}

.action-btn-create:hover,
.action-btn-create:focus {
  --background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  --border-color: #ec4899;
}
</style>
