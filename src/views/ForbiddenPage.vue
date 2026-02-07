<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Access Denied</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="forbidden-container">
        <ion-icon :icon="lockClosedOutline" class="forbidden-icon" />
        <h1>403 - Forbidden</h1>
        <p>You don't have permission to access this page.</p>
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
import { lockClosedOutline, homeOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push({ name: 'Home' });
};
</script>

<style scoped lang="scss">
.forbidden-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 70vh;
}

.forbidden-icon {
  font-size: 6rem;
  color: var(--ion-color-danger);
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

