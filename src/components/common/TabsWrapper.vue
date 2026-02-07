<template>
  <div class="tabs-wrapper">
    <ion-segment :value="modelValue" @ion-change="handleChange">
      <ion-segment-button
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :disabled="tab.disabled"
      >
        <ion-icon v-if="tab.icon" :icon="tab.icon" />
        <ion-label>{{ tab.label }}</ion-label>
      </ion-segment-button>
    </ion-segment>

    <div class="tabs-wrapper__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonLabel, IonSegment, IonSegmentButton } from '@ionic/vue';

export interface TabItem {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
}

interface TabsWrapperProps {
  tabs: TabItem[];
  modelValue: string;
}

defineProps<TabsWrapperProps>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const handleChange = (event: CustomEvent) => {
  emit('update:modelValue', event.detail.value);
};
</script>

<style scoped lang="scss">
.tabs-wrapper {
  &__content {
    padding: 1rem 0;
  }
}
</style>

