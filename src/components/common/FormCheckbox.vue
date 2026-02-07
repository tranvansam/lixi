<template>
  <div class="form-checkbox">
    <ion-item :class="{ 'ion-invalid': errorMessage, 'ion-touched': meta.touched }">
      <ion-checkbox
        :name="name"
        :disabled="disabled"
        :checked="checkboxValue"
        @ion-change="handleChange"
      >
        {{ label }}
      </ion-checkbox>
    </ion-item>
    <ion-text v-if="helperText" color="medium" class="form-checkbox__helper">
      <p>{{ helperText }}</p>
    </ion-text>
    <ion-text v-if="errorMessage" color="danger" class="form-checkbox__error">
      <p>{{ errorMessage }}</p>
    </ion-text>
  </div>
</template>

<script setup lang="ts">
import { IonCheckbox, IonItem, IonText } from '@ionic/vue';
import { useField } from 'vee-validate';
import type { CheckboxProps } from '@/types/form';

const props = defineProps<CheckboxProps>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const {
  value: checkboxValue,
  errorMessage,
  meta,
} = useField(() => props.name, undefined, {
  initialValue: props.modelValue ?? false,
  type: 'checkbox',
  syncVModel: true,
});

const handleChange = (event: CustomEvent) => {
  const value = event.detail.checked;
  checkboxValue.value = value;
  emit('update:modelValue', value);
};
</script>

<style scoped lang="scss">
.form-checkbox {
  margin-bottom: 1rem;

  ion-item {
    --border-color: transparent;
    --inner-padding-end: 0;

    &.ion-invalid.ion-touched {
      --border-color: var(--ion-color-danger);
    }
  }

  &__helper,
  &__error {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    line-height: 1.4;

    p {
      margin: 0;
    }
  }
}
</style>
