<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Tạo Phòng Lì Xì</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="create-room-content">
      <div class="create-room-container">
        <div class="page-intro">
          <div class="intro-icon">🎁</div>
          <h2>Thiết lập phòng mới</h2>
          <p>Tổng tiền, số người quay và các khoảng giải</p>
        </div>

        <form @submit.prevent="createRoom" class="create-room-form">
          <section class="form-section section-basic">
            <div class="section-header">
              <ion-icon :icon="walletOutline"></ion-icon>
              <span>Cơ bản</span>
            </div>
            <div class="section-body">
              <div class="input-group">
                <ion-label>Tên phòng <span class="label-required">*</span></ion-label>
                <ion-input
                  v-model="roomName"
                  type="text"
                  placeholder="Ví dụ: Lì xì Tết 2025"
                  class="styled-input"
                  :maxlength="100"
                ></ion-input>
              </div>
              <div class="input-group">
                <ion-label>Tổng tiền phòng (VNĐ) <span class="label-optional">(tùy chọn)</span></ion-label>
                <ion-input
                  :value="formatVnd(totalAmount)"
                  type="text"
                  inputmode="numeric"
                  placeholder="Ví dụ: 5.000.000"
                  class="styled-input"
                  @input="totalAmount = parseVnd(($event.target as any)?.value ?? '')"
                ></ion-input>
              </div>
              <div class="input-group">
                <ion-label>
                  Số người quay
                  <span v-if="flipAll" class="label-required">*</span>
                  <span v-else class="label-optional">(tùy chọn)</span>
                </ion-label>
                <ion-input
                  v-model="totalPeople"
                  type="number"
                  :placeholder="flipAll ? 'Bắt buộc khi bật lật thẻ' : 'Để trống = không giới hạn'"
                  min="1"
                  class="styled-input"
                ></ion-input>
              </div>
              <p class="field-hint" v-if="flipAll">Chế độ lật thẻ bắt buộc nhập số người quay (≥ 1).</p>
              <p class="field-hint" v-else>Để trống = không giới hạn số người quay. Hoặc nhập số hoặc dùng danh sách tên bên dưới.</p>
            </div>
          </section>

          <section class="form-section section-players" v-if="!flipAll">
            <div class="section-header">
              <ion-icon :icon="personAddOutline"></ion-icon>
              <span>Tên người quay (tùy chọn)</span>
            </div>
            <div class="section-body">
              <p class="section-desc">Nhập sẵn tên, vào màn quay chỉ cần chọn tên không cần gõ. Đủ số người quay thì không thêm được nữa.</p>
              <div
                v-for="(name, index) in playerNamesLocal"
                :key="index"
                class="player-name-row"
              >
                <ion-input
                  v-model="playerNamesLocal[index]"
                  type="text"
                  placeholder="Tên người quay"
                  class="player-name-input"
                ></ion-input>
                <ion-button
                  v-if="playerNamesLocal.length > 1"
                  fill="clear"
                  size="small"
                  type="button"
                  @click="removePlayerName(index)"
                  class="btn-remove-player"
                >
                  <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
              </div>
              <ion-button
                type="button"
                fill="outline"
                @click="addPlayerName"
                :disabled="!canAddMorePlayerName"
                class="btn-add-player"
              >
                <ion-icon :icon="addOutline"></ion-icon>
                Thêm tên người quay
              </ion-button>
            </div>
          </section>

          <section class="form-section section-flip">
            <div class="section-header">
              <ion-icon :icon="copyOutline"></ion-icon>
              <span>Option lật thẻ</span>
            </div>
            <div class="section-body">
              <ion-item lines="none" class="toggle-item">
                <ion-label>Lật all (mở màn lật thẻ)</ion-label>
                <ion-toggle v-model="flipAll"></ion-toggle>
              </ion-item>
              <p class="field-hint" v-if="flipAll">Sẽ tự cộng thêm <strong>3 thẻ</strong> so với số người lật.</p>
              <div v-if="flipAll" class="flip-jackpot-amount">
                <ion-item lines="none" class="ion-item-input">
                  <ion-label position="stacked">Số tiền ảo trúng giải (1 thẻ Lật all)</ion-label>
                  <ion-input
                    :value="formatVnd(flipJackpotAmount)"
                    type="text"
                    inputmode="numeric"
                    placeholder="1.000.000"
                    @input="flipJackpotAmount = parseInt(parseVnd(($event.target as any)?.value ?? ''), 10) || 0"
                  ></ion-input>
                </ion-item>
                <p class="field-hint">Mặc định 1.000.000 VNĐ. Một trong 3 thẻ không lật sẽ hiển thị số tiền này.</p>
              </div>
              <div v-if="flipAll" class="flip-name-mode">
                <ion-label class="flip-name-mode-title">Tên người lật</ion-label>
                <ion-radio-group v-model="flipNameMode" class="radio-group">
                  <ion-item lines="none" class="radio-item">
                    <ion-radio value="auto" label-placement="end">Tự render (Người chơi 1, 2, 3...)</ion-radio>
                  </ion-item>
                  <ion-item lines="none" class="radio-item">
                    <ion-radio value="manual" label-placement="end">Nhập tên</ion-radio>
                  </ion-item>
                </ion-radio-group>
                <p class="field-hint" v-if="flipNameMode === 'auto'">
                  Vào phòng sẽ <strong>không</strong> hiện ô chọn/nhập tên. Hệ thống tự dùng: Người chơi 1 → Người chơi 2 → ...
                </p>
                <p class="field-hint" v-else>
                  Vào phòng sẽ có ô nhập tên, gợi ý mặc định: Người chơi 1, Người chơi 2, ...
                </p>
              </div>
              <!-- Ô input tên theo từng thẻ khi chọn Nhập tên (số ô = số người quay) -->
              <div v-if="flipAll && flipNameMode === 'manual' && flipCardInputCount > 0" class="flip-card-names-section">
                <ion-label class="flip-card-names-title">Tên từng người lật (mỗi ô = 1 thẻ)</ion-label>
                <p class="field-hint">Để trống ô nào thì khi tạo phòng ô đó sẽ tự đặt "Người chơi 1", "Người chơi 2"... (theo thứ tự ô trống).</p>
                <div
                  v-for="(name, index) in flipCardNamesLocal"
                  :key="'flipcard-' + index"
                  class="player-name-row flip-card-name-row"
                >
                  <ion-label class="flip-card-index">Thẻ {{ index + 1 }}</ion-label>
                  <ion-input
                    v-model="flipCardNamesLocal[index]"
                    type="text"
                    :placeholder="'Tên người lật thẻ ' + (index + 1)"
                    class="player-name-input"
                  ></ion-input>
                </div>
              </div>
            </div>
          </section>

          <section class="form-section section-exact">
            <div class="section-header">
              <ion-icon :icon="giftOutline"></ion-icon>
              <span>Số tiền chính xác <span class="label-optional">(tùy chọn)</span></span>
            </div>
            <div class="section-body">
              <p class="section-desc">Đúng N thẻ sẽ nhận đúng số tiền này (thứ tự thẻ random). Ưu tiên: số tiền chính xác → khoảng giải → khoảng mặc định.</p>
              <div
                v-for="(exact, index) in exactAmounts"
                :key="'exact-' + index"
                class="range-row"
              >
                <ion-input
                  :value="formatVnd(exact.amount)"
                  type="text"
                  inputmode="numeric"
                  placeholder="Số tiền (VNĐ)"
                  class="range-input exact-amount-input"
                  @input="exact.amount = parseInt(parseVnd(($event.target as any)?.value ?? ''), 10) || 0"
                ></ion-input>
                <ion-input
                  v-model.number="exact.count"
                  type="number"
                  placeholder="Số thẻ"
                  min="1"
                  class="range-count-input"
                ></ion-input>
                <ion-button fill="clear" size="small" type="button" @click="removeExact(index)" class="btn-remove">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
              </div>
              <ion-button type="button" fill="outline" @click="addExact" class="btn-add-range">
                <ion-icon :icon="addOutline"></ion-icon>
                Thêm số tiền chính xác
              </ion-button>
            </div>
          </section>

          <section class="form-section section-ranges">
            <div class="section-header">
              <ion-icon :icon="giftOutline"></ion-icon>
              <span>Các khoảng giải <span class="label-optional">(tùy chọn)</span></span>
            </div>
            <div class="section-body">
              <p class="section-desc">Min – Max (VNĐ) và số thẻ rơi vào khoảng đó</p>
              <div
                v-for="(range, index) in prizeRanges"
                :key="'range-' + index"
                class="range-row"
              >
                <ion-input
                  :value="formatVnd(range.min)"
                  type="text"
                  inputmode="numeric"
                  placeholder="Min"
                  class="range-input"
                  @input="range.min = parseInt(parseVnd(($event.target as any)?.value ?? ''), 10) || 0"
                ></ion-input>
                <span class="range-dash">–</span>
                <ion-input
                  :value="formatVnd(range.max)"
                  type="text"
                  inputmode="numeric"
                  placeholder="Max"
                  class="range-input"
                  @input="range.max = parseInt(parseVnd(($event.target as any)?.value ?? ''), 10) || 0"
                ></ion-input>
                <ion-input
                  v-model.number="range.count"
                  type="number"
                  placeholder="Số thẻ"
                  min="1"
                  class="range-count-input"
                ></ion-input>
                <ion-button fill="clear" size="small" type="button" @click="removeRange(index)" class="btn-remove">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
              </div>
              <ion-button type="button" fill="outline" @click="addRange" class="btn-add-range">
                <ion-icon :icon="addOutline"></ion-icon>
                Thêm khoảng giải
              </ion-button>
            </div>
          </section>

          <section class="form-section section-default">
            <div class="section-header">
              <ion-icon :icon="peopleOutline"></ion-icon>
              <span>Khoảng mặc định <span class="label-required">*</span></span>
            </div>
            <div class="section-body">
              <p class="section-desc">Cho người còn lại (không rơi vào khoảng nào). Bắt buộc nhập.</p>
              <div class="default-row">
                <div class="input-group half">
                  <ion-label>Min (VNĐ) <span class="label-required">*</span></ion-label>
                  <ion-input
                    :value="formatVnd(defaultMin)"
                    type="text"
                    inputmode="numeric"
                    placeholder="10.000"
                    class="styled-input"
                    @input="defaultMin = parseVnd(($event.target as any)?.value ?? '')"
                  ></ion-input>
                </div>
                <div class="input-group half">
                  <ion-label>Max (VNĐ) <span class="label-required">*</span></ion-label>
                  <ion-input
                    :value="formatVnd(defaultMax)"
                    type="text"
                    inputmode="numeric"
                    placeholder="200.000"
                    class="styled-input"
                    @input="defaultMax = parseVnd(($event.target as any)?.value ?? '')"
                  ></ion-input>
                </div>
              </div>
            </div>
          </section>

          <section class="form-section section-round">
            <div class="section-header">
              <ion-icon :icon="walletOutline"></ion-icon>
              <span>Làm tròn tiền</span>
            </div>
            <div class="section-body">
              <p class="section-desc">Số tiền random ra sẽ được làm tròn theo lựa chọn (mặc định tròn hàng nghìn).</p>
              <ion-radio-group v-model="roundAmount" class="radio-group">
                <ion-item lines="none" class="radio-item">
                  <ion-radio value="none" label-placement="end">Không làm tròn</ion-radio>
                </ion-item>
                <ion-item lines="none" class="radio-item">
                  <ion-radio value="thousand" label-placement="end">Tròn hàng nghìn (1.000, 2.000, ...)</ion-radio>
                </ion-item>
                <ion-item lines="none" class="radio-item">
                  <ion-radio value="ten_thousand" label-placement="end">Tròn chục nghìn (10.000, 20.000, ...)</ion-radio>
                </ion-item>
                <ion-item lines="none" class="radio-item">
                  <ion-radio value="hundred_thousand" label-placement="end">Tròn trăm nghìn (100.000, 200.000, ...)</ion-radio>
                </ion-item>
              </ion-radio-group>
            </div>
          </section>

          <section class="form-section section-display">
            <div class="section-header">
              <ion-icon :icon="eyeOutline"></ion-icon>
              <span>Hiển thị kết quả</span>
            </div>
            <div class="section-body">
              <ion-radio-group v-model="showResultsImmediately" class="radio-group">
                <ion-item lines="none" class="radio-item">
                  <ion-radio value="true" label-placement="end">Hiển thị tiền từng người ngay khi quay</ion-radio>
                </ion-item>
                <ion-item lines="none" class="radio-item">
                  <ion-radio value="false" label-placement="end">Chỉ hiển thị khi đã quay hết lượt</ion-radio>
                </ion-item>
              </ion-radio-group>
            </div>
          </section>

          <section class="form-section section-password">
            <div class="section-header">
              <ion-icon :icon="lockClosedOutline"></ion-icon>
              <span>Mật khẩu (tùy chọn)</span>
            </div>
            <div class="section-body">
              <div class="input-group">
                <ion-input
                  v-model="roomPassword"
                  type="password"
                  placeholder="Để trống nếu không cần"
                  class="styled-input"
                ></ion-input>
              </div>
            </div>
          </section>

          <ion-button
            expand="block"
            type="submit"
            color="primary"
            :disabled="loading"
            class="btn-submit"
          >
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Tạo phòng</span>
          </ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  walletOutline,
  giftOutline,
  peopleOutline,
  lockClosedOutline,
  addOutline,
  trashOutline,
  eyeOutline,
  personAddOutline,
  copyOutline
} from 'ionicons/icons';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonInput,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonToggle,
  IonRadioGroup,
  IonRadio,
  IonItem,
  toastController
} from '@ionic/vue';
import { useAuth } from '@/composables/useAuth';
import { useRoom } from '@/composables/useRoom';
import type { Room, PrizeRange, PrizeSlot, ExactAmount } from '@/types/room';

const router = useRouter();
const { currentUser } = useAuth();
const { createRoom: createRoomAPI } = useRoom();

/** Format số tiền realtime: 5000000 -> "5.000.000" */
function formatVnd(value: string | number): string {
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Lấy chỉ chữ số từ chuỗi đã format */
function parseVnd(value: string): string {
  return String(value).replace(/\D/g, '');
}

const roomName = ref('');
const totalAmount = ref('');
const totalPeople = ref('');
const playerNamesLocal = ref<string[]>(['']);
const flipAll = ref(true);
const flipNameMode = ref<'auto' | 'manual'>('auto');
/** Tên từng người lật (1 ô = 1 thẻ), khi flipAll + manual. Rỗng sẽ thành "Người chơi 1", "Người chơi 2"... */
const flipCardNamesLocal = ref<string[]>([]);
/** Số tiền ảo trúng giải (1 trong 3 thẻ Lật all), mặc định 1.000.000 */
const flipJackpotAmount = ref<number>(1000000);
/** Số tiền chính xác: đúng N thẻ nhận đúng số tiền (ưu tiên 1) */
const exactAmounts = ref<ExactAmount[]>([]);
const prizeRanges = ref<PrizeRange[]>([{ min: 0, max: 0, count: 1 }]);
const defaultMin = ref('');
const defaultMax = ref('');
const showResultsImmediately = ref<'true' | 'false'>('true');
/** Làm tròn tiền random: none / hàng nghìn / chục nghìn / trăm nghìn */
const roundAmount = ref<'none' | 'thousand' | 'ten_thousand' | 'hundred_thousand'>('thousand');
const roomPassword = ref('');
const loading = ref(false);

const canAddMorePlayerName = computed(() => {
  const people = parseInt(totalPeople.value, 10);
  if (!totalPeople.value || isNaN(people) || people < 1) return true;
  return playerNamesLocal.value.length < people;
});

function addPlayerName() {
  playerNamesLocal.value = [...playerNamesLocal.value, ''];
}

function removePlayerName(index: number) {
  playerNamesLocal.value = playerNamesLocal.value.filter((_, i) => i !== index);
  if (playerNamesLocal.value.length === 0) {
    playerNamesLocal.value = [''];
  }
}

/** Khi flipAll + manual, đồng bộ số ô nhập tên = số người quay (số thẻ người lật). */
const flipCardInputCount = computed(() => {
  if (!flipAll.value || flipNameMode.value !== 'manual') return 0;
  const n = parseInt(totalPeople.value, 10);
  return !totalPeople.value || isNaN(n) || n < 1 ? 0 : n;
});

watch(
  () => [flipAll.value, flipNameMode.value, totalPeople.value],
  () => {
    const n = flipCardInputCount.value;
    if (n <= 0) {
      flipCardNamesLocal.value = [];
      return;
    }
    const prev = flipCardNamesLocal.value;
    if (prev.length === n) return;
    if (prev.length < n) {
      flipCardNamesLocal.value = [...prev, ...Array(n - prev.length).fill('')];
    } else {
      flipCardNamesLocal.value = prev.slice(0, n);
    }
  },
  { immediate: true }
);

function addExact() {
  exactAmounts.value.push({ amount: 0, count: 1 });
}

function removeExact(index: number) {
  exactAmounts.value.splice(index, 1);
}

function addRange() {
  prizeRanges.value.push({ min: 0, max: 0, count: 1 });
}

function removeRange(index: number) {
  prizeRanges.value.splice(index, 1);
  if (prizeRanges.value.length === 0) {
    prizeRanges.value.push({ min: 0, max: 0, count: 1 });
  }
}

/** Build slots: ưu tiên 1) Số tiền chính xác, 2) Khoảng giải, 3) Khoảng mặc định. Đủ slotCount thì dừng. */
function buildSlots(slotCount: number): PrizeSlot[] {
  const slots: PrizeSlot[] = [];
  const defMin = parseInt(defaultMin.value, 10) || 0;
  const defMax = parseInt(defaultMax.value, 10) || 0;
  const dMin = Math.min(defMin, defMax);
  const dMax = Math.max(defMin, defMax) || dMin;

  let used = 0;

  // 1) Số tiền chính xác
  for (const e of exactAmounts.value) {
    const count = Math.max(0, Math.min(e.count, slotCount - used));
    if (count <= 0) continue;
    const amount = Math.max(0, Number(e.amount) || 0);
    for (let i = 0; i < count; i++) {
      slots.push({ min: amount, max: amount });
    }
    used += count;
  }

  // 2) Khoảng giải
  for (const r of prizeRanges.value) {
    const count = Math.max(0, Math.min(r.count, slotCount - used));
    const min = Number(r.min) || 0;
    const max = Number(r.max) || min;
    if (count <= 0) continue;
    if (min === 0 && max === 0) continue;
    for (let i = 0; i < count; i++) {
      slots.push({ min, max: Math.max(min, max) });
    }
    used += count;
  }

  // 3) Khoảng mặc định (đủ slotCount)
  const remaining = slotCount - slots.length;
  for (let i = 0; i < remaining; i++) {
    slots.push({ min: dMin, max: dMax });
  }

  return slots;
}

/** Resolve mỗi slot thành 1 số tiền (exact = min, range = random), làm tròn, shuffle. Thẻ lật sẽ lấy đúng cardAmounts[cardIndex]. */
function buildCardAmounts(slots: PrizeSlot[], roundOpt: 'none' | 'thousand' | 'ten_thousand' | 'hundred_thousand'): number[] {
  if (slots.length === 0) return [];
  const applyRound = (n: number): number => {
    if (roundOpt === 'none') return n;
    if (roundOpt === 'thousand') return Math.round(n / 1000) * 1000;
    if (roundOpt === 'ten_thousand') return Math.round(n / 10000) * 10000;
    if (roundOpt === 'hundred_thousand') return Math.round(n / 100000) * 100000;
    return n;
  };
  const resolved = slots.map(s => {
    const min = Number(s.min) || 0;
    const max = Number(s.max) || min;
    const amount = min === max ? min : min + Math.floor(Math.random() * (Math.max(min, max) - min + 1));
    return applyRound(Math.max(0, amount));
  });
  for (let i = resolved.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resolved[i], resolved[j]] = [resolved[j], resolved[i]];
  }
  return resolved;
}

const createRoom = async () => {
  if (!currentUser.value) {
    router.push('/login');
    return;
  }

  const nameTrimmed = roomName.value?.trim() ?? '';
  if (!nameTrimmed) {
    const toast = await toastController.create({
      message: 'Vui lòng nhập tên phòng',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  // Chỉ khoảng mặc định là bắt buộc
  const defMin = parseInt(defaultMin.value, 10);
  const defMax = parseInt(defaultMax.value, 10);
  const defaultMinEmpty = !defaultMin.value || defaultMin.value.trim() === '';
  const defaultMaxEmpty = !defaultMax.value || defaultMax.value.trim() === '';
  if (defaultMinEmpty || defaultMaxEmpty) {
    const toast = await toastController.create({
      message: 'Vui lòng nhập đầy đủ khoảng mặc định (Min và Max VNĐ)',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }
  if (isNaN(defMin) || isNaN(defMax) || defMin < 0 || defMax < 0) {
    const toast = await toastController.create({
      message: 'Khoảng mặc định: Min và Max phải là số không âm',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }
  if (defMin > defMax) {
    const toast = await toastController.create({
      message: 'Khoảng mặc định: Min phải ≤ Max',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  const total = parseInt(totalAmount.value, 10) || 0;
  const namesFiltered = playerNamesLocal.value.map(s => s.trim()).filter(Boolean);
  let people = parseInt(totalPeople.value, 10);

  if (flipAll.value) {
    if (!totalPeople.value || isNaN(people) || people < 1) {
      const toast = await toastController.create({
        message: 'Chế độ lật thẻ bắt buộc nhập số người quay (≥ 1)',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }
  } else {
    if (!totalPeople.value || isNaN(people) || people < 1) {
      people = namesFiltered.length > 0 ? namesFiltered.length : 0;
    }
  }

  if (people > 0 && namesFiltered.length > people) {
    const toast = await toastController.create({
      message: `Số tên người quay (${namesFiltered.length}) không được vượt quá số người quay (${people})`,
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  let totalFromRanges = 0;
  for (const r of prizeRanges.value) {
    const min = Number(r.min) || 0;
    const max = Number(r.max) || min;
    const count = Math.max(0, r.count || 0);
    if (min > max) {
      const toast = await toastController.create({
        message: 'Khoảng giải: Min phải ≤ Max',
        duration: 2000,
        color: 'warning'
      });
      await toast.present();
      return;
    }
    totalFromRanges += count;
  }

  const extraCards = flipAll.value ? 3 : 0;
  const slotCount = people + extraCards;

  loading.value = true;
  const slots = slotCount > 0 ? buildSlots(slotCount) : [];
  const cardAmounts = buildCardAmounts(slots, roundAmount.value);
  const dMin = Math.min(defMin, defMax);
  const dMax = Math.max(defMin, defMax);
  const roomData: Record<string, unknown> = {
    type: 'total' as const,
    createdBy: currentUser.value.uid,
    roomName: nameTrimmed,
    totalAmount: total,
    totalPeople: people,
    slots,
    ...(cardAmounts.length > 0 && { cardAmounts }),
    showResultsImmediately: showResultsImmediately.value === 'true',
    flipAll: flipAll.value,
    flipNameMode: flipAll.value ? flipNameMode.value : undefined,
    extraCards: extraCards > 0 ? extraCards : undefined,
    roundAmount: roundAmount.value === 'none' ? undefined : roundAmount.value,
    password: roomPassword.value?.trim() || undefined
  };
  if (flipAll.value) {
    roomData.flipJackpotAmount = Math.max(0, Number(flipJackpotAmount.value) || 1000000);
    if (flipNameMode.value === 'auto') {
      roomData.playerNames = Array.from({ length: people }, (_, i) => `Người chơi ${i + 1}`);
    } else {
      // Manual: giữ tên đã nhập theo vị trí, ô trống → "Người chơi 1", "Người chơi 2"... (filter có tên lên trước, trống sau)
      let emptyCounter = 1;
      const flipNames = (flipCardNamesLocal.value.length >= people ? flipCardNamesLocal.value.slice(0, people) : [...flipCardNamesLocal.value, ...Array(people - flipCardNamesLocal.value.length).fill('')]).map(s => {
        const t = String(s ?? '').trim();
        if (t) return t;
        return `Người chơi ${emptyCounter++}`;
      });
      roomData.playerNames = flipNames;
    }
  } else {
    roomData.playerNames = namesFiltered.length > 0 ? namesFiltered : undefined;
  }
  if (people === 0) {
    roomData.minPerSpin = dMin;
    roomData.maxPerSpin = dMax;
  }

  const result = await createRoomAPI(roomData as Omit<Room, 'id' | 'roomCode' | 'spins' | 'createdAt'>);
  loading.value = false;

  if (result.success && result.room) {
    router.push(`/room/${result.room.roomCode}`);
  } else {
    const toast = await toastController.create({
      message: result.error || 'Tạo phòng thất bại',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
};
</script>

<style scoped>
.create-room-content {
  --background: linear-gradient(180deg, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 100%);
}

.create-room-container {
  padding: 24px 20px 32px;
  max-width: 480px;
  margin: 0 auto;
}

.page-intro {
  text-align: center;
  margin-bottom: 28px;
}

.intro-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  line-height: 1;
}

.page-intro h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #831843;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.page-intro p {
  font-size: 0.95rem;
  color: #9d174d;
  margin: 0;
  opacity: 0.9;
}

.create-room-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(190, 24, 93, 0.12);
  border: 1px solid rgba(251, 207, 232, 0.6);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(90deg, rgba(236, 72, 153, 0.12) 0%, rgba(251, 207, 232, 0.2) 100%);
  font-weight: 700;
  font-size: 1rem;
  color: #831843;
}

.section-header ion-icon {
  font-size: 1.35rem;
  color: #be185d;
}

.section-body {
  padding: 18px;
}

.section-desc {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 14px 0;
}

.input-group {
  margin-bottom: 16px;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-group ion-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #831843;
  margin-bottom: 6px;
}

.label-required {
  color: #dc2626;
  font-weight: 700;
}

.label-optional {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
}

.section-header .label-optional {
  font-size: 0.85rem;
}

.styled-input {
  --background: #fff;
  --padding-start: 14px;
  --padding-end: 14px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --border-radius: 14px;
  border: 1px solid rgba(236, 72, 153, 0.25);
  border-radius: 14px;
}

.input-group.half {
  flex: 1;
  min-width: 0;
}

.default-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.field-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 8px 0 0 0;
}

.range-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.range-input {
  flex: 1;
  min-width: 70px;
  --background: #fff;
  --padding-start: 12px;
  --padding-end: 12px;
  --border-radius: 12px;
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 12px;
}

.range-dash {
  color: #9ca3af;
  font-weight: 700;
  font-size: 1rem;
}

.range-count-input {
  width: 88px;
  --background: #fff;
  --padding-start: 12px;
  --padding-end: 12px;
  --border-radius: 12px;
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 12px;
}

.btn-remove {
  --color: #dc2626;
  margin: 0;
}

.btn-remove ion-icon {
  font-size: 1.25rem;
}

.btn-add-range {
  --border-radius: 14px;
  --border-width: 1px;
  --border-color: #f9a8d4;
  --color: #be185d;
  margin-top: 4px;
  font-weight: 600;
}

.btn-add-range ion-icon {
  margin-right: 6px;
  font-size: 1.1rem;
}

.section-players .section-desc {
  margin-bottom: 14px;
}

.player-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.player-name-input {
  flex: 1;
  min-width: 0;
  --background: #fff;
  --padding-start: 14px;
  --padding-end: 14px;
  --border-radius: 14px;
  border: 1px solid rgba(236, 72, 153, 0.25);
  border-radius: 14px;
}

.btn-remove-player {
  --color: #dc2626;
  margin: 0;
}

.btn-remove-player ion-icon {
  font-size: 1.25rem;
}

.flip-card-names-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.flip-card-names-title {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.flip-card-name-row {
  align-items: center;
  gap: 10px;
}

.flip-card-name-row .flip-card-index {
  flex-shrink: 0;
  width: 56px;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
}

.btn-add-player {
  --border-radius: 14px;
  --border-width: 1px;
  --border-color: #f9a8d4;
  --color: #be185d;
  margin-top: 4px;
  font-weight: 600;
}

.btn-add-player ion-icon {
  margin-right: 6px;
  font-size: 1.1rem;
}

.toggle-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
}

.radio-group {
  width: 100%;
}

.radio-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 4px;
}

.radio-item:last-child {
  margin-bottom: 0;
}

.radio-item ion-radio {
  margin-inline-end: 10px;
}

.btn-submit {
  --border-radius: 18px;
  height: 54px;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0.02em;
  box-shadow: 0 8px 24px rgba(236, 72, 153, 0.3);
  margin-top: 8px;
}
</style>
