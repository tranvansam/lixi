<template>
  <div class="form-select">
    <ion-item :class="{ 'ion-invalid': errorMessage, 'ion-touched': meta.touched }">
      <ion-label v-if="label" position="stacked">{{ label }}</ion-label>
      <ion-select
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :multiple="multiple"
        :value="selectValue"
        interface="popover"
        @ion-change="handleChange"
      >
        <ion-select-option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </ion-select-option>
      </ion-select>
      <ion-note v-if="errorMessage" slot="error">{{ errorMessage }}</ion-note>
    </ion-item>
  </div>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonNote, IonSelect, IonSelectOption } from '@ionic/vue';
import { useField } from 'vee-validate';
import type { SelectProps } from '@/types/form';

const props = defineProps<SelectProps>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]];
}>();

const {
  value: selectValue,
  errorMessage,
  meta,
} = useField(() => props.name, undefined, {
  initialValue: props.modelValue,
  syncVModel: true,
});

const handleChange = (event: CustomEvent) => {
  const value = event.detail.value;
  selectValue.value = value;
  emit('update:modelValue', value);
};
</script>

<style scoped lang="scss">
.form-select {
  margin-bottom: 1rem;

  ion-item {
    --border-color: var(--ion-color-medium);
    --highlight-color: var(--ion-color-primary);

    &.ion-invalid.ion-touched {
      --border-color: var(--ion-color-danger);
      --highlight-color: var(--ion-color-danger);
    }
  }

  ion-note {
    margin-top: 0.25rem;
    font-size: 0.875rem;
  }
}
</style>
