<template>
  <div class="base-tabs">
    <ion-segment :value="modelValue" @ion-change="handleChange">
      <ion-segment-button v-for="tab in tabs" :key="tab.value" :value="tab.value">
        <ion-icon v-if="tab.icon" :icon="tab.icon" />
        <ion-label>{{ tab.label }}</ion-label>
      </ion-segment-button>
    </ion-segment>
    
    <div class="tabs-content">
      <slot :name="modelValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonSegment, IonSegmentButton, IonLabel, IonIcon } from '@ionic/vue';

export interface Tab {
  label: string;
  value: string;
  icon?: string;
}

export interface BaseTabsProps {
  tabs: Tab[];
  modelValue: string;
}

defineProps<BaseTabsProps>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const handleChange = (event: CustomEvent) => {
  emit('update:modelValue', event.detail.value);
};
</script>

<style scoped lang="scss">
.base-tabs {
  .tabs-content {
    padding: 1rem;
  }
}
</style>

