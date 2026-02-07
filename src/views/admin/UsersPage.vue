<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Users Management (Admin)</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Users Management</h2>
      <p>This page requires admin role and users:view permission.</p>
      
      <ion-card>
        <ion-card-content>
          <p>Content for users management...</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent } from '@ionic/vue';
</script>

