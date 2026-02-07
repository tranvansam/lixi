<template>
  <ion-item :class="{ 'ion-invalid': errorMessage, 'ion-touched': meta.touched }">
    <ion-label v-if="label" :position="labelPosition">{{ label }}</ion-label>
    <ion-textarea
      :model-value="value as string"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :rows="rows"
      :auto-grow="autoGrow"
      @ion-input="handleChange"
      @ion-blur="handleBlur"
    />
    <ion-note v-if="errorMessage" slot="error">{{ errorMessage }}</ion-note>
  </ion-item>
</template>

<script setup lang="ts">
import { IonTextarea, IonItem, IonLabel, IonNote } from '@ionic/vue';
import { useField } from 'vee-validate';

export interface FormTextareaProps {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  rows?: number;
  autoGrow?: boolean;
  labelPosition?: 'stacked' | 'fixed' | 'floating';
}

const props = withDefaults(defineProps<FormTextareaProps>(), {
  disabled: false,
  readonly: false,
  required: false,
  rows: 4,
  autoGrow: false,
  labelPosition: 'stacked',
});

const { value, errorMessage, handleChange, handleBlur, meta } = useField(() => props.name);
</script>

<style scoped lang="scss">
ion-item {
  &.ion-invalid.ion-touched {
    --border-color: var(--ion-color-danger);
  }
}
</style>

