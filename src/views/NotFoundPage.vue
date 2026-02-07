<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Page Not Found</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="notfound-container">
        <ion-icon :icon="alertCircleOutline" class="notfound-icon" />
        <h1>404 - Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <ion-button @click="goHome" color="primary">
          <ion-icon :icon="homeOutline" slot="start" />
          Go to Home
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { alertCircleOutline, homeOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push({ name: 'Home' });
};
</script>

<style scoped lang="scss">
.notfound-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 70vh;
}

.notfound-icon {
  font-size: 6rem;
  color: var(--ion-color-warning);
  margin-bottom: 1rem;
}

h1 {
  font-size: 2rem;
  margin: 1rem 0;
}

p {
  color: var(--ion-color-medium);
  margin-bottom: 2rem;
}
</style>

