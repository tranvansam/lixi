<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Settings (Admin/Manager)</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Settings</h2>
      <p>This page requires admin or manager role and settings:view permission.</p>
      
      <ion-card>
        <ion-card-content>
          <p>Content for settings...</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent } from '@ionic/vue';
</script>

