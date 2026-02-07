<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Permission Demo</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Current User Info -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Current User</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p v-if="userPermissions">
            <strong>Role:</strong> {{ userPermissions.role }}<br />
            <strong>User ID:</strong> {{ userPermissions.userId }}
          </p>
          <p v-else-if="isLoading">Loading permissions...</p>
          <p v-else-if="error" class="error">{{ error }}</p>
          <p v-else>No permissions loaded. Please login first.</p>
        </ion-card-content>
      </ion-card>

      <!-- Permission Status -->
      <ion-card v-if="userPermissions">
        <ion-card-header>
          <ion-card-title>Permission Status</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>Is Admin</ion-label>
              <ion-badge :color="isAdmin ? 'success' : 'medium'">
                {{ isAdmin ? 'Yes' : 'No' }}
              </ion-badge>
            </ion-item>
            <ion-item>
              <ion-label>Is Manager</ion-label>
              <ion-badge :color="isManager ? 'success' : 'medium'">
                {{ isManager ? 'Yes' : 'No' }}
              </ion-badge>
            </ion-item>
            <ion-item>
              <ion-label>Is User</ion-label>
              <ion-badge :color="isUser ? 'success' : 'medium'">
                {{ isUser ? 'Yes' : 'No' }}
              </ion-badge>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Permissions List -->
      <ion-card v-if="userPermissions">
        <ion-card-header>
          <ion-card-title>Your Permissions</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item v-for="perm in userPermissions.permissions" :key="perm.resource">
              <ion-label>
                <h3>{{ perm.resource }}</h3>
                <p>
                  <ion-chip
                    v-for="action in perm.actions"
                    :key="action"
                    color="primary"
                    size="small"
                  >
                    {{ action }}
                  </ion-chip>
                </p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Action Buttons with Permission Check -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Action Buttons (Based on Permissions)</ion-card-title>
          <ion-card-subtitle>Buttons will be hidden if you don't have permission</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <!-- Users Management -->
          <h3>Users Management</h3>
          <div class="button-group">
            <ion-button
              v-if="hasPermission('users', 'view')"
              color="primary"
              @click="testAction('View Users')"
            >
              <ion-icon :icon="eyeOutline" slot="start" />
              View Users
            </ion-button>
            <ion-button
              v-if="hasPermission('users', 'create')"
              color="success"
              @click="testAction('Create User')"
            >
              <ion-icon :icon="addCircleOutline" slot="start" />
              Create User
            </ion-button>
            <ion-button
              v-if="hasPermission('users', 'edit')"
              color="warning"
              @click="testAction('Edit User')"
            >
              <ion-icon :icon="createOutline" slot="start" />
              Edit User
            </ion-button>
            <ion-button
              v-if="hasPermission('users', 'delete')"
              color="danger"
              @click="testAction('Delete User')"
            >
              <ion-icon :icon="trashOutline" slot="start" />
              Delete User
            </ion-button>
          </div>

          <!-- Products Management -->
          <h3 style="margin-top: 1rem">Products Management</h3>
          <div class="button-group">
            <ion-button
              v-if="hasPermission('products', 'view')"
              color="primary"
              @click="testAction('View Products')"
            >
              <ion-icon :icon="cubeOutline" slot="start" />
              View Products
            </ion-button>
            <ion-button
              v-if="hasPermission('products', 'create')"
              color="success"
              @click="testAction('Create Product')"
            >
              <ion-icon :icon="addCircleOutline" slot="start" />
              Create Product
            </ion-button>
            <ion-button
              v-if="hasPermission('products', 'export')"
              color="tertiary"
              @click="testAction('Export Products')"
            >
              <ion-icon :icon="downloadOutline" slot="start" />
              Export
            </ion-button>
          </div>

          <!-- Settings -->
          <h3 style="margin-top: 1rem">Settings</h3>
          <div class="button-group">
            <ion-button
              v-if="hasPermission('settings', 'view')"
              color="medium"
              @click="testAction('View Settings')"
            >
              <ion-icon :icon="settingsOutline" slot="start" />
              View Settings
            </ion-button>
            <ion-button
              v-if="hasPermission('settings', 'edit')"
              color="warning"
              @click="testAction('Edit Settings')"
            >
              <ion-icon :icon="createOutline" slot="start" />
              Edit Settings
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Using v-permission directive -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Using v-permission Directive</ion-card-title>
          <ion-card-subtitle>These buttons use v-permission directive</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-button
            v-permission="{ resource: 'users', action: 'delete' }"
            color="danger"
            @click="testAction('Delete User (v-permission)')"
          >
            <ion-icon :icon="trashOutline" slot="start" />
            Delete User (Admin Only)
          </ion-button>

          <ion-button
            v-permission="{ resource: 'reports', action: 'export' }"
            color="tertiary"
            @click="testAction('Export Reports (v-permission)')"
          >
            <ion-icon :icon="downloadOutline" slot="start" />
            Export Reports (Admin/Manager)
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Using v-role directive -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Using v-role Directive</ion-card-title>
          <ion-card-subtitle>These sections use v-role directive</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div v-role="'admin'" class="role-section admin">
            <h3>Admin Only Section</h3>
            <p>This is visible only to admins</p>
          </div>

          <div v-role="['admin', 'manager']" class="role-section manager">
            <h3>Admin/Manager Section</h3>
            <p>This is visible to admins and managers</p>
          </div>

          <div v-role="'user'" class="role-section user">
            <h3>User Section</h3>
            <p>This is visible to regular users</p>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Reload Button -->
      <ion-button expand="block" @click="reloadPermissions" :disabled="isLoading">
        <ion-icon :icon="refreshOutline" slot="start" />
        Reload Permissions
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonIcon,
  IonChip,
  alertController,
} from '@ionic/vue';
import {
  eyeOutline,
  addCircleOutline,
  createOutline,
  trashOutline,
  cubeOutline,
  downloadOutline,
  settingsOutline,
  refreshOutline,
} from 'ionicons/icons';
import { usePermissions } from '@/composables/usePermissions';
import { vPermission, vRole } from '@/directives/v-permission';

const {
  userPermissions,
  isLoading,
  error,
  isAdmin,
  isManager,
  isUser,
  loadPermissions,
  hasPermission,
} = usePermissions();

onMounted(async () => {
  await loadPermissions();
});

const reloadPermissions = async () => {
  await loadPermissions(true);
};

const testAction = async (actionName: string) => {
  const alert = await alertController.create({
    header: 'Action Triggered',
    message: `You triggered: ${actionName}`,
    buttons: ['OK'],
  });
  await alert.present();
};
</script>

<style scoped lang="scss">
.error {
  color: var(--ion-color-danger);
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.role-section {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;

  &.admin {
    background-color: rgba(var(--ion-color-danger-rgb), 0.1);
    border: 2px solid var(--ion-color-danger);
  }

  &.manager {
    background-color: rgba(var(--ion-color-warning-rgb), 0.1);
    border: 2px solid var(--ion-color-warning);
  }

  &.user {
    background-color: rgba(var(--ion-color-success-rgb), 0.1);
    border: 2px solid var(--ion-color-success);
  }

  h3 {
    margin-top: 0;
  }

  p {
    margin-bottom: 0;
  }
}
</style>

