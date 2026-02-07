<template>
  <div class="form-radio-group">
    <ion-label v-if="label">{{ label }}</ion-label>
    <ion-radio-group :value="value" @ion-change="handleChange">
      <ion-item v-for="option in options" :key="option.value">
        <ion-label>{{ option.label }}</ion-label>
        <ion-radio slot="start" :value="option.value" :disabled="disabled" />
      </ion-item>
    </ion-radio-group>
    <ion-note v-if="errorMessage" color="danger">{{ errorMessage }}</ion-note>
  </div>
</template>

<script setup lang="ts">
import { IonRadioGroup, IonRadio, IonItem, IonLabel, IonNote } from '@ionic/vue';
import { useField } from 'vee-validate';

export interface RadioOption {
  label: string;
  value: string | number;
}

export interface FormRadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  disabled?: boolean;
}

const props = withDefaults(defineProps<FormRadioGroupProps>(), {
  disabled: false,
});

const { value, errorMessage, handleChange } = useField(() => props.name);
</script>

<style scoped lang="scss">
.form-radio-group {
  margin: 1rem 0;

  ion-label {
    font-weight: 600;
    margin-bottom: 0.5rem;
    display: block;
  }

  ion-note {
    display: block;
    margin-top: 0.5rem;
    padding-left: 1rem;
  }
}
</style>

