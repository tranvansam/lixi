<template>
  <div class="form-radio">
    <ion-label v-if="label" class="form-radio__label">{{ label }}</ion-label>
    <ion-radio-group
      :name="name"
      :value="radioValue"
      @ion-change="handleChange"
    >
      <ion-item
        v-for="option in options"
        :key="option.value"
        :class="{ 'ion-invalid': errorMessage, 'ion-touched': meta.touched }"
      >
        <ion-radio
          :value="option.value"
          :disabled="disabled || option.disabled"
        >
          {{ option.label }}
        </ion-radio>
      </ion-item>
    </ion-radio-group>
    <ion-text v-if="errorMessage" color="danger" class="form-radio__error">
      <p>{{ errorMessage }}</p>
    </ion-text>
  </div>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonRadio, IonRadioGroup, IonText } from '@ionic/vue';
import { useField } from 'vee-validate';
import type { RadioProps } from '@/types/form';

const props = defineProps<RadioProps>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const {
  value: radioValue,
  errorMessage,
  meta,
} = useField(() => props.name, undefined, {
  initialValue: props.modelValue,
  syncVModel: true,
});

const handleChange = (event: CustomEvent) => {
  const value = event.detail.value;
  radioValue.value = value;
  emit('update:modelValue', value);
};
</script>

<style scoped lang="scss">
.form-radio {
  margin-bottom: 1rem;

  &__label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  ion-item {
    --border-color: transparent;
    --inner-padding-end: 0;

    &.ion-invalid.ion-touched {
      --border-color: var(--ion-color-danger);
    }
  }

  &__error {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.875rem;

    p {
      margin: 0;
    }
  }
}
</style>

