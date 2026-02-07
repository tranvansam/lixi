<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Form Example</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Login Form Example</h2>
      
      <form @submit="handleSubmit">
        <FormInput
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
        />

        <FormInput
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
        />

        <FormCheckbox
          name="rememberMe"
          label="Remember me"
          helper-text="Keep me logged in on this device"
        />

        <FormButton
          type="submit"
          expand="block"
          :loading="isSubmitting"
        >
          Login
        </FormButton>
      </form>

      <h2 style="margin-top: 2rem">Register Form Example</h2>
      
      <form @submit="handleRegisterSubmit">
        <FormInput
          name="registerName"
          label="Name"
          placeholder="Enter your name"
        />

        <FormInput
          name="registerEmail"
          label="Email"
          type="email"
          placeholder="Enter your email"
        />

        <FormInput
          name="registerPassword"
          label="Password"
          type="password"
          placeholder="Enter your password"
        />

        <FormInput
          name="registerConfirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
        />

        <FormRadio
          name="gender"
          label="Gender"
          :options="genderOptions"
        />

        <FormSelect
          name="country"
          label="Country"
          placeholder="Select your country"
          :options="countryOptions"
        />

        <FormCheckbox
          name="acceptTerms"
          label="I accept the terms and conditions"
        />

        <FormButton
          type="submit"
          expand="block"
          :loading="isRegisterSubmitting"
        >
          Register
        </FormButton>
      </form>

      <h2 style="margin-top: 2rem">Tabs Example</h2>
      
      <TabsWrapper
        v-model="activeTab"
        :tabs="tabs"
      >
        <div v-if="activeTab === 'tab1'">
          <h3>Tab 1 Content</h3>
          <p>This is the content of tab 1</p>
        </div>
        <div v-if="activeTab === 'tab2'">
          <h3>Tab 2 Content</h3>
          <p>This is the content of tab 2</p>
        </div>
        <div v-if="activeTab === 'tab3'">
          <h3>Tab 3 Content</h3>
          <p>This is the content of tab 3</p>
        </div>
      </TabsWrapper>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { 
  FormInput, 
  FormCheckbox, 
  FormRadio, 
  FormSelect, 
  FormButton,
  TabsWrapper,
} from '@/components/common';
import { useForm } from '@/composables/useForm';
import { loginSchema } from '@/utils';
import * as yup from 'yup';

// Login form
const { handleSubmit, isSubmitting } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: '',
    password: '',
    rememberMe: false,
  },
  onSubmit: async (values) => {
    console.log('Login form submitted:', values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Login successful!');
  },
});

// Register form
const registerValidationSchema = yup.object({
  registerName: yup.string().required('Name is required'),
  registerEmail: yup.string().required('Email is required').email('Invalid email'),
  registerPassword: yup.string().required('Password is required').min(6, 'Min 6 characters'),
  registerConfirmPassword: yup.string()
    .required('Please confirm password')
    .oneOf([yup.ref('registerPassword')], 'Passwords must match'),
  gender: yup.string().required('Please select gender'),
  country: yup.string().required('Please select country'),
  acceptTerms: yup.boolean().oneOf([true], 'You must accept terms'),
});

const { 
  handleSubmit: handleRegisterSubmit, 
  isSubmitting: isRegisterSubmitting 
} = useForm({
  validationSchema: registerValidationSchema,
  initialValues: {
    registerName: '',
    registerEmail: '',
    registerPassword: '',
    registerConfirmPassword: '',
    gender: '',
    country: '',
    acceptTerms: false,
  },
  onSubmit: async (values) => {
    console.log('Register form submitted:', values);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Registration successful!');
  },
});

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const countryOptions = [
  { label: 'United States', value: 'us' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Korea', value: 'kr' },
  { label: 'Vietnam', value: 'vn' },
  { label: 'China', value: 'cn' },
];

// Tabs example
const activeTab = ref('tab1');
const tabs = [
  { label: 'Tab 1', value: 'tab1' },
  { label: 'Tab 2', value: 'tab2' },
  { label: 'Tab 3', value: 'tab3' },
];
</script>

