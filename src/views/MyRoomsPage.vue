<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Phòng Của Tôi</ion-title>
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="my-rooms-content">
      <!-- Thanh nút: Tạo phòng mới + Xóa tất cả (khi có phòng) -->
      <div v-if="!loading && rooms.length > 0" class="delete-all-bar">
        <ion-button @click="goCreateRoom" color="primary" fill="solid" size="small">
          <ion-icon :icon="addCircleOutline"></ion-icon>
          Tạo phòng mới
        </ion-button>
        <ion-button @click="confirmDeleteAll" color="danger" fill="outline" size="small">
          <ion-icon :icon="trashOutline"></ion-icon>
          Xóa tất cả phòng
        </ion-button>
      </div>

      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
        <p>Đang tải...</p>
      </div>

      <div v-else-if="rooms.length === 0" class="empty-container">
        <ion-icon :icon="folderOutline" size="large"></ion-icon>
        <p>Bạn chưa tạo phòng nào</p>
        <ion-button @click="goCreateRoom" color="primary">
          Tạo phòng mới
        </ion-button>
      </div>

      <div v-else class="rooms-container">
        <ion-list>
          <ion-item
            v-for="room in rooms"
            :key="room.id"
            button
            @click="viewRoom(room)"
            class="room-item"
            :detail="true"
          >
            <ion-label>
              <h2>Mã phòng: {{ room.roomCode }}</h2>
              <p>
                <span class="room-type">{{ room.slots?.length ? 'Tổng Tiền (khoảng giải)' : (room.type === 'minmax' ? 'Loại 1: Min-Max' : 'Loại 2: Tổng Tiền') }}</span>
              </p>
              <p v-if="room.type === 'minmax'">
                Min: {{ room.minAmount?.toLocaleString() }} VNĐ - 
                Max: {{ room.maxAmount?.toLocaleString() }} VNĐ
              </p>
              <p v-else>
                Tổng: {{ room.totalAmount?.toLocaleString() }} VNĐ - 
                {{ room.totalPeople }} người
              </p>
              <p class="room-stats">
                {{ (room.spins || []).length }} người đã quay
                <span class="room-date">{{ formatDate(room.createdAt) }}</span>
              </p>
            </ion-label>
            <ion-buttons slot="end">
              <ion-button
                v-if="!room.slots?.length"
                fill="clear"
                @click.stop="editRoom(room)"
                color="primary"
              >
                <ion-icon :icon="createOutline"></ion-icon>
              </ion-button>
              <ion-button
                fill="clear"
                @click.stop="confirmDelete(room)"
                color="danger"
              >
                <ion-icon :icon="trashOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>

    <!-- Edit Room Modal -->
    <ion-modal :is-open="showEditModal" @didDismiss="closeEditModal">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Chỉnh Sửa Phòng</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeEditModal">Đóng</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="edit-modal-content">
          <form @submit.prevent="saveRoom" v-if="editingRoom">
            <ion-item>
              <ion-label position="stacked">Mã phòng</ion-label>
              <ion-input :value="editingRoom.roomCode" disabled></ion-input>
            </ion-item>

            <template v-if="editingRoom.type === 'minmax'">
              <ion-item>
                <ion-label position="stacked">Số tiền tối thiểu (VNĐ)</ion-label>
                <ion-input
                  v-model="editForm.minAmount"
                  type="number"
                  placeholder="Ví dụ: 10000"
                  required
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Số tiền tối đa (VNĐ)</ion-label>
                <ion-input
                  v-model="editForm.maxAmount"
                  type="number"
                  placeholder="Ví dụ: 100000"
                  required
                ></ion-input>
              </ion-item>
            </template>

            <template v-else>
              <ion-item>
                <ion-label position="stacked">Số tiền tối thiểu mỗi lần (VNĐ)</ion-label>
                <ion-input
                  v-model="editForm.minPerSpin"
                  type="number"
                  placeholder="Ví dụ: 10000"
                  required
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Số tiền tối đa mỗi lần (VNĐ)</ion-label>
                <ion-input
                  v-model="editForm.maxPerSpin"
                  type="number"
                  placeholder="Ví dụ: 500000"
                  required
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Tổng số tiền tối đa (VNĐ)</ion-label>
                <ion-input
                  v-model="editForm.totalAmount"
                  type="number"
                  placeholder="Ví dụ: 3000000"
                  required
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Số người</ion-label>
                <ion-input
                  v-model="editForm.totalPeople"
                  type="number"
                  placeholder="Ví dụ: 10"
                  required
                ></ion-input>
              </ion-item>
            </template>

            <ion-button
              expand="block"
              type="submit"
              color="primary"
              :disabled="saving"
              class="save-button"
            >
              <ion-spinner v-if="saving" name="crescent"></ion-spinner>
              <span v-else>Lưu thay đổi</span>
            </ion-button>
          </form>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { folderOutline, createOutline, trashOutline, addCircleOutline } from 'ionicons/icons';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonModal,
  IonInput,
  alertController,
  toastController
} from '@ionic/vue';
import { useRoom } from '@/composables/useRoom';
import { useAuth } from '@/composables/useAuth';
import type { Room } from '@/types/room';

const router = useRouter();
const { currentUser } = useAuth();
const { getMyRooms, updateRoom, deleteRoom } = useRoom();

const rooms = ref<Room[]>([]);
const loading = ref(true);
const showEditModal = ref(false);
const editingRoom = ref<Room | null>(null);
const editForm = ref<any>({});
const saving = ref(false);

const loadRooms = async () => {
  if (!currentUser.value) {
    router.push('/login');
    return;
  }

  loading.value = true;
  const result = await getMyRooms(currentUser.value.uid);
  loading.value = false;

  if (result.success) {
    rooms.value = result.rooms || [];
  } else {
    const toast = await toastController.create({
      message: result.error || 'Không thể tải danh sách phòng',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
};

const viewRoom = async (room: Room) => {
  await router.push(`/room/${room.roomCode}`);
};

const goCreateRoom = () => {
  router.push('/create-room');
};

const editRoom = (room: Room) => {
  editingRoom.value = room;
  editForm.value = {
    minAmount: room.minAmount,
    maxAmount: room.maxAmount,
    minPerSpin: room.minPerSpin,
    maxPerSpin: room.maxPerSpin,
    totalAmount: room.totalAmount,
    totalPeople: room.totalPeople
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingRoom.value = null;
  editForm.value = {};
};

const saveRoom = async () => {
  if (!editingRoom.value) return;

  // Validation
  if (editingRoom.value.type === 'minmax') {
    if (!editForm.value.minAmount || !editForm.value.maxAmount) {
      const toast = await toastController.create({
        message: 'Vui lòng nhập đầy đủ thông tin',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (parseInt(editForm.value.minAmount) >= parseInt(editForm.value.maxAmount)) {
      const toast = await toastController.create({
        message: 'Số tiền tối đa phải lớn hơn số tiền tối thiểu',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }
  } else {
    if (!editForm.value.minPerSpin || !editForm.value.maxPerSpin || 
        !editForm.value.totalAmount || !editForm.value.totalPeople) {
      const toast = await toastController.create({
        message: 'Vui lòng nhập đầy đủ thông tin',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    const total = parseInt(editForm.value.totalAmount);
    const people = parseInt(editForm.value.totalPeople);
    const minPer = parseInt(editForm.value.minPerSpin);
    const maxPer = parseInt(editForm.value.maxPerSpin);
    const minTotal = minPer * people;

    // Tổng tiền phải ít nhất bằng minPerSpin * totalPeople
    if (total < minTotal) {
      const toast = await toastController.create({
        message: `Tổng số tiền tối đa phải ít nhất ${minTotal.toLocaleString()} VNĐ (${minPer.toLocaleString()} x ${people} người)`,
        duration: 3000,
        color: 'warning'
      });
      await toast.present();
      return;
    }

    if (minPer >= maxPer) {
      const toast = await toastController.create({
        message: 'Số tiền tối đa mỗi lần phải lớn hơn số tiền tối thiểu',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }
  }

  saving.value = true;
  const result = await updateRoom(editingRoom.value.id, editForm.value);
  saving.value = false;

  if (result.success) {
    const toast = await toastController.create({
      message: 'Cập nhật phòng thành công!',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
    closeEditModal();
    await loadRooms();
  } else {
    const toast = await toastController.create({
      message: result.error || 'Cập nhật thất bại',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
};

const confirmDelete = async (room: Room) => {
  const alert = await alertController.create({
    header: 'Xác nhận xóa',
    message: `Bạn có chắc chắn muốn xóa phòng ${room.roomCode}? Hành động này không thể hoàn tác.`,
    buttons: [
      {
        text: 'Hủy',
        role: 'cancel'
      },
      {
        text: 'Xóa',
        role: 'destructive',
        handler: async () => {
          const result = await deleteRoom(room.id);
          if (result.success) {
            const toast = await toastController.create({
              message: 'Đã xóa phòng thành công',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
            await loadRooms();
          } else {
            const toast = await toastController.create({
              message: result.error || 'Xóa phòng thất bại',
              duration: 2000,
              color: 'danger'
            });
            await toast.present();
          }
        }
      }
    ]
  });

  await alert.present();
};

const confirmDeleteAll = async () => {
  const list = rooms.value;
  if (list.length === 0) return;

  const alert = await alertController.create({
    header: 'Xóa tất cả phòng',
    message: `Bạn có chắc chắn muốn xóa tất cả ${list.length} phòng? Hành động này không thể hoàn tác.`,
    buttons: [
      {
        text: 'Hủy',
        role: 'cancel'
      },
      {
        text: 'Xóa tất cả',
        role: 'destructive',
        handler: async () => {
          const toDelete = list.map(r => r.id);
          const total = toDelete.length;
          let failed = 0;
          for (const roomId of toDelete) {
            const result = await deleteRoom(roomId);
            if (!result.success) failed++;
          }
          await loadRooms();
          const toast = await toastController.create({
            message: failed === 0
              ? `Đã xóa tất cả ${total} phòng`
              : `Đã xóa nhưng ${failed} phòng xóa thất bại`,
            duration: 2500,
            color: failed === 0 ? 'success' : 'warning'
          });
          await toast.present();
        }
      }
    ]
  });

  await alert.present();
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('vi-VN');
};

onMounted(() => {
  loadRooms();
});
</script>

<style scoped>
/* Padding-top đủ lớn để nội dung + nút Xóa tất cả nằm hẳn dưới header */
.my-rooms-content {
  --background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  --padding-top: calc(56px + env(safe-area-inset-top, 0px) + 80px);
}

.delete-all-bar {
  padding: 12px 16px 14px;
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(236, 72, 153, 0.2);
  background: rgba(255, 255, 255, 0.6);
}

.delete-all-bar ion-button {
  margin: 0;
}

.loading-container,
.empty-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
  padding-top: 32px;
  text-align: center;
}

.empty-container ion-icon {
  color: #ec4899;
  margin-bottom: 20px;
}

.empty-container p {
  color: #4b5563;
  margin: 10px 0;
}

.rooms-container {
  padding: 24px 10px 16px;
}

.room-item {
  margin-bottom: 10px;
  border-radius: 12px;
  --background: white;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.1);
}

.room-type {
  color: #ec4899;
  font-weight: 600;
}

.room-stats {
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 5px;
}

.room-date {
  float: right;
  color: #9ca3af;
}

.edit-modal-content {
  padding: 20px;
}

.save-button {
  margin-top: 20px;
  --border-radius: 12px;
  height: 50px;
}
</style>
