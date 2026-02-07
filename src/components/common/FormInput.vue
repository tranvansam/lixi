<template>
  <div class="form-input">
    <ion-item :class="{ 'ion-invalid': errorMessage, 'ion-touched': meta.touched }">
      <ion-label v-if="label" position="stacked">{{ label }}</ion-label>
      <ion-input
        :name="name"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :model-value="inputValue"
        @ion-input="handleInput"
        @ion-blur="handleBlur"
      />
      <ion-note v-if="errorMessage" slot="error">{{ errorMessage }}</ion-note>
    </ion-item>
  </div>
</template>

<script setup lang="ts">
import { IonInput, IonItem, IonLabel, IonNote } from '@ionic/vue';
import { useField } from 'vee-validate';
import type { InputProps } from '@/types/form';

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  modelValue?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

const {
  value: inputValue,
  errorMessage,
  handleBlur,
  meta,
} = useField(() => props.name, undefined, {
  initialValue: props.modelValue,
  syncVModel: true,
});

const handleInput = (event: CustomEvent) => {
  const value = event.detail.value;
  inputValue.value = value;
  emit('update:modelValue', value);
};
</script>

<style scoped lang="scss">
.form-input {
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
