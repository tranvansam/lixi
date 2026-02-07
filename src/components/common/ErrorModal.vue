<template>
  <!-- Mobile: Full Screen Modal -->
  <ion-modal 
    v-if="isMobile"
    :is-open="isOpen" 
    @willDismiss="handleDismiss"
    :breakpoints="[0, 1]"
    :initial-breakpoint="1"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleDismiss">
            <ion-icon :icon="closeOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="error-modal error-modal--mobile">
        <ion-icon :icon="alertCircleOutline" class="error-modal__icon" :color="iconColor" />
        <h2 class="error-modal__title">{{ message }}</h2>
        <p v-if="description" class="error-modal__description">{{ description }}</p>
        <ion-button expand="block" @click="handleDismiss" :color="buttonColor" size="large">
          {{ buttonText }}
        </ion-button>
      </div>
    </ion-content>
  </ion-modal>

  <!-- Desktop: Centered Card Modal -->
  <ion-modal 
    v-else
    :is-open="isOpen" 
    @willDismiss="handleDismiss"
    class="error-modal-desktop"
  >
    <div class="error-modal error-modal--desktop">
      <div class="error-modal__header">
        <h3 class="error-modal__header-title">{{ title }}</h3>
        <ion-button fill="clear" @click="handleDismiss" class="error-modal__close-btn">
          <ion-icon :icon="closeOutline" />
        </ion-button>
      </div>
      
      <div class="error-modal__content">
        <div class="error-modal__icon-wrapper">
          <ion-icon :icon="alertCircleOutline" class="error-modal__icon" :color="iconColor" />
        </div>
        <h2 class="error-modal__title">{{ message }}</h2>
        <p v-if="description" class="error-modal__description">{{ description }}</p>
      </div>

      <div class="error-modal__footer">
        <ion-button @click="handleDismiss" :color="buttonColor" expand="block">
          {{ buttonText }}
        </ion-button>
      </div>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
  isPlatform,
} from '@ionic/vue';
import { alertCircleOutline, closeOutline } from 'ionicons/icons';
import type { ErrorModalProps } from '@/types/error-modal';

withDefaults(defineProps<ErrorModalProps>(), {
  title: 'Error',
  buttonText: 'OK',
  iconColor: 'danger',
  buttonColor: 'primary',
});

const emit = defineEmits<{
  'update:isOpen': [value: boolean];
  dismiss: [];
}>();

// Detect mobile vs desktop
const isMobile = computed(() => {
  // Check if running on mobile platform
  if (isPlatform('mobile') || isPlatform('mobileweb')) {
    return true;
  }
  
  // Fallback: check screen width
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768;
  }
  
  return false;
});

const handleDismiss = () => {
  console.log('🚫 Error Modal dismissed');
  emit('update:isOpen', false);
  emit('dismiss');
};
</script>

<style scoped lang="scss">
// Desktop Modal Styles
.error-modal-desktop {
  --width: 480px;
  --height: auto;
  --border-radius: 16px;
  --box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);

  ion-modal {
    --background: transparent;
  }
}

.error-modal {
  // Mobile Styles
  &--mobile {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem 1rem;
    min-height: 100%;
    justify-content: center;

    .error-modal__icon {
      font-size: 5rem;
      margin-bottom: 1.5rem;
    }

    .error-modal__title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 1rem;
      line-height: 1.4;
    }

    .error-modal__description {
      color: var(--ion-color-medium);
      margin: 0 0 2rem;
      line-height: 1.6;
      font-size: 1rem;
    }

    ion-button {
      margin-top: auto;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  // Desktop Styles
  &--desktop {
    background: var(--ion-background-color, #fff);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    width: 480px;
    max-width: 90vw;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--ion-color-light);
    background: var(--ion-color-light);
  }

  &__header-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--ion-color-dark);
  }

  &__close-btn {
    margin: 0;
    --padding-start: 0;
    --padding-end: 0;
    
    ion-icon {
      font-size: 1.5rem;
    }
  }

  &__content {
    padding: 2rem 1.5rem;
    text-align: center;
  }

  &__icon-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  &__icon {
    font-size: 4rem;
  }

  &__title {
    font-size: 1.375rem;
    font-weight: 600;
    margin: 0 0 0.75rem;
    line-height: 1.4;
    color: var(--ion-color-dark);
  }

  &__description {
    color: var(--ion-color-medium);
    margin: 0;
    line-height: 1.6;
    font-size: 0.9375rem;
  }

  &__footer {
    padding: 1rem 1.5rem 1.5rem;
    border-top: 1px solid var(--ion-color-light);
    
    ion-button {
      font-weight: 600;
      --border-radius: 8px;
      height: 44px;
    }
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .error-modal {
    &--desktop {
      background: var(--ion-background-color, #1e1e1e);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }

    &__header {
      background: var(--ion-color-step-50);
      border-bottom-color: var(--ion-color-step-100);
    }

    &__header-title {
      color: var(--ion-color-light);
    }

    &__title {
      color: var(--ion-color-light);
    }

    &__footer {
      border-top-color: var(--ion-color-step-100);
    }
  }
}

// Tablet breakpoint
@media (min-width: 768px) and (max-width: 1024px) {
  .error-modal-desktop {
    --width: 420px;
  }
}

// Large desktop
@media (min-width: 1440px) {
  .error-modal-desktop {
    --width: 520px;
  }
}
</style>
