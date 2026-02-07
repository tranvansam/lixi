<template>
  <ion-button
    :expand="expand"
    :fill="fill"
    :shape="shape"
    :size="size"
    :color="color"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <ion-spinner v-if="loading" name="crescent" slot="start" />
    <ion-icon v-else-if="icon" :icon="icon" :slot="iconSlot" />
    <slot />
  </ion-button>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonSpinner } from '@ionic/vue';

export interface BaseButtonProps {
  expand?: 'block' | 'full';
  fill?: 'clear' | 'outline' | 'solid' | 'default';
  shape?: 'round';
  size?: 'small' | 'default' | 'large';
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: string;
  iconSlot?: 'start' | 'end' | 'icon-only';
}

const props = withDefaults(defineProps<BaseButtonProps>(), {
  fill: 'solid',
  size: 'default',
  disabled: false,
  loading: false,
  type: 'button',
  iconSlot: 'start',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

