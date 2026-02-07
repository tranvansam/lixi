<template>
  <ion-button
    :type="type"
    :color="color"
    :fill="fill"
    :size="size"
    :expand="expand"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <ion-spinner v-if="loading" name="crescent" slot="start" />
    <slot />
  </ion-button>
</template>

<script setup lang="ts">
import { IonButton, IonSpinner } from '@ionic/vue';
import type { ButtonProps } from '@/types/form';

withDefaults(defineProps<ButtonProps>(), {
  type: 'button',
  color: 'primary',
  fill: 'solid',
  size: 'default',
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};
</script>

