<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="close"
    class="music-modal"
    :breakpoints="[0, 0.5, 0.85, 1]"
    :initial-breakpoint="0.85"
  >
    <ion-header class="music-modal-header">
      <ion-toolbar>
        <ion-title class="music-modal-header-title">Danh sách nhạc</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="close" aria-label="Đóng" type="button">
            <ion-icon :icon="closeOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="music-modal-content">
      <div class="music-modal-content-bg" :style="bgStyle" aria-hidden="true"></div>
      <div class="music-modal-content-inner ion-padding">
        <audio
          ref="audioRef"
          :src="currentSrc"
          playsinline
          preload="auto"
          @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata"
          @loadeddata="onLoadedData"
          @canplay="onCanPlay"
          @ended="onEnded"
          @play="isPlaying = true"
          @pause="isPlaying = false"
          @error="onAudioError"
        />
      <div v-if="tracks.length === 0" class="music-modal-empty">
        Chưa có bài nào trong thư mục nhạc.
      </div>
      <template v-else>
        <!-- Thanh phát hiện tại + điều khiển -->
        <div class="music-modal-now" :class="{ 'music-modal-now--playing': isPlaying }" :key="currentIndex">
          <div class="music-modal-now-top">
            <!-- Hiệu ứng sóng khi đang phát -->
            <div v-if="isPlaying" class="music-modal-waves" aria-hidden="true">
              <span v-for="i in 5" :key="i" class="music-modal-wave"></span>
            </div>
            <p class="music-modal-now-title">{{ currentTrackName }}</p>
          </div>
          <div class="music-modal-progress-wrap">
            <span class="music-modal-time">{{ formatTime(currentTime) }}</span>
            <input
              v-model.number="seekValue"
              type="range"
              min="0"
              :max="duration"
              step="0.1"
              class="music-modal-progress"
              @input="onSeek"
            />
            <span class="music-modal-time">{{ formatTime(duration) }}</span>
          </div>
          <div class="music-modal-controls">
            <ion-button fill="clear" size="small" @click="prev" :disabled="tracks.length <= 1" aria-label="Bài trước">
              <ion-icon :icon="playSkipBackOutline" />
            </ion-button>
            <ion-button fill="clear" size="large" @click="togglePlay" class="music-modal-play-btn" aria-label="Phát / Tạm dừng">
              <ion-icon :icon="isPlaying ? pauseCircleOutline : playCircleOutline" />
            </ion-button>
            <ion-button fill="clear" size="small" @click="next" aria-label="Bài tiếp theo">
              <ion-icon :icon="playSkipForwardOutline" />
            </ion-button>
            <ion-button fill="clear" size="small" @click="loop = !loop" :color="loop ? 'primary' : 'medium'" aria-label="Lặp">
              <ion-icon :icon="loop ? repeatOutline : repeatOutline" />
              <span v-if="loop" class="music-modal-loop-badge">1</span>
            </ion-button>
          </div>
        </div>
        <!-- Danh sách bài (chỉ khu vực này scroll) -->
        <div class="music-modal-list-wrap">
          <div class="music-modal-list">
          <button
            v-for="(track, idx) in tracks"
            :key="track.src"
            type="button"
            class="music-modal-item"
            :class="{ 'music-modal-item--active': idx === currentIndex }"
            @click="selectTrack(idx)"
          >
            <span class="music-modal-item-num">{{ idx + 1 }}</span>
            <span class="music-modal-item-name">{{ track.name }}</span>
            <ion-icon v-if="idx === currentIndex && isPlaying" :icon="volumeHighOutline" class="music-modal-item-icon" />
          </button>
          </div>
        </div>
      </template>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, inject, nextTick } from 'vue';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
} from '@ionic/vue';
import {
  closeOutline,
  playCircleOutline,
  pauseCircleOutline,
  playSkipBackOutline,
  playSkipForwardOutline,
  repeatOutline,
  volumeHighOutline,
} from 'ionicons/icons';
import nhacBg from '@/assets/images/nhac.webp';

export interface MusicTrack {
  src: string;
  name: string;
}

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    tracks: MusicTrack[];
  }>(),
  { tracks: () => [] }
);

const emit = defineEmits<{
  (e: 'update:isOpen', v: boolean): void;
  (e: 'close'): void;
}>();

const musicSwitch = inject<{
  muteMusic?: () => void;
  unmuteMusic?: () => void;
}>('musicSwitch');

const audioRef = ref<HTMLAudioElement | null>(null);
const currentIndex = ref(0);
const isPlaying = ref(false);
const loop = ref(true);
const currentTime = ref(0);
const duration = ref(0);
const seekValue = ref(0);
/** Gọi play() sau khi nguồn mới load xong (tránh lỗi khi đổi bài). */
const pendingPlay = ref(false);

const currentSrc = computed(() => props.tracks[currentIndex.value]?.src ?? '');
const currentTrackName = computed(() => props.tracks[currentIndex.value]?.name ?? '—');
const bgStyle = computed(() => ({
  backgroundImage: nhacBg ? `url(${nhacBg})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}));

function close() {
  isPlaying.value = false;
  audioRef.value?.pause();
  musicSwitch?.unmuteMusic?.();
  emit('update:isOpen', false);
  emit('close');
}

function togglePlay() {
  const el = audioRef.value;
  if (!el || !currentSrc.value) return;
  if (el.paused) {
    pendingPlay.value = true;
    if (el.readyState >= 2) {
      el.play().then(() => { pendingPlay.value = false; }).catch(() => { pendingPlay.value = false; });
    }
  } else {
    el.pause();
  }
}

function prev() {
  if (props.tracks.length <= 1) return;
  audioRef.value?.pause();
  resetPlayingUI();
  currentIndex.value = currentIndex.value <= 0 ? props.tracks.length - 1 : currentIndex.value - 1;
  nextTick(() => playCurrent());
}

function next() {
  if (props.tracks.length === 0) return;
  audioRef.value?.pause();
  resetPlayingUI();
  currentIndex.value = (currentIndex.value + 1) % props.tracks.length;
  nextTick(() => playCurrent());
}

function resetPlayingUI() {
  isPlaying.value = false;
  currentTime.value = 0;
  seekValue.value = 0;
  duration.value = 0;
}

function selectTrack(idx: number) {
  if (idx === currentIndex.value) return;
  audioRef.value?.pause();
  resetPlayingUI();
  currentIndex.value = idx;
  nextTick(() => playCurrent());
}

function playCurrent() {
  const el = audioRef.value;
  if (!el) return;
  if (!currentSrc.value) return;
  pendingPlay.value = true;
  if (el.readyState >= 2) {
    el.play()
      .then(() => { pendingPlay.value = false; })
      .catch((e) => { pendingPlay.value = false; console.warn('MusicModal play failed', e); });
  }
}

function onLoadedData() {
  tryPlayPending();
}

function onCanPlay() {
  tryPlayPending();
}

function tryPlayPending() {
  const el = audioRef.value;
  if (!el || !pendingPlay.value) return;
  pendingPlay.value = false;
  el.play().then(() => {}).catch((e) => { console.warn('MusicModal play after load failed', e); });
}

function onAudioError() {
  pendingPlay.value = false;
  isPlaying.value = false;
}

function onEnded() {
  if (loop.value) {
    const el = audioRef.value;
    if (el) {
      el.currentTime = 0;
      el.play().catch(() => {});
    }
  } else {
    next();
  }
}

function onTimeUpdate() {
  const el = audioRef.value;
  if (!el) return;
  currentTime.value = el.currentTime;
  seekValue.value = el.currentTime;
}

function onLoadedMetadata() {
  const el = audioRef.value;
  if (!el) return;
  duration.value = el.duration;
  seekValue.value = 0;
  currentTime.value = 0;
}

function onSeek(e: Event) {
  const el = audioRef.value;
  const target = e.target as HTMLInputElement;
  if (!el || !target) return;
  const v = parseFloat(target.value);
  el.currentTime = v;
  currentTime.value = v;
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      musicSwitch?.muteMusic?.();
      currentTime.value = 0;
      duration.value = 0;
      seekValue.value = 0;
      if (props.tracks.length > 0) {
        pendingPlay.value = true;
        nextTick(() => {
          if (audioRef.value && currentSrc.value) {
            playCurrent();
          } else {
            pendingPlay.value = false;
          }
        });
      }
    } else {
      musicSwitch?.unmuteMusic?.();
    }
  }
);

watch(currentSrc, () => {
  isPlaying.value = false;
  duration.value = 0;
  seekValue.value = 0;
  currentTime.value = 0;
});
</script>

<style scoped>
/* Nền đỏ đồ, theme Tết */
.music-modal-header {
  --background: linear-gradient(135deg, #b91c1c 0%, #dc2626 35%, #991b1b 70%, #7f1d1d 100%);
  --color: #fff;
}
.music-modal-header ion-toolbar {
  --background: transparent;
  --color: #fff;
  --min-height: 44px;
  --padding-top: 4px;
  --padding-bottom: 4px;
}
.music-modal-header-title {
  font-weight: 800;
  letter-spacing: 0.03em;
  color: #dc2626;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.4);
}
.music-modal-header ion-button {
  --color: #fef08a;
  --color-hover: #fde68a;
  --color-activated: #fcd34d;
}

.music-modal-content {
  --background: transparent;
  position: relative;
  --overflow: hidden;
}
.music-modal-content-inner {
  position: relative;
  height: 100%;
  min-height: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.music-modal-content-inner .music-modal-now {
  flex-shrink: 0;
}
.music-modal-content-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.music-modal-content-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(127, 29, 29, 0.5) 0%, rgba(185, 28, 28, 0.45) 50%, rgba(127, 29, 29, 0.55) 100%);
  pointer-events: none;
}

.music-modal-empty {
  text-align: center;
  padding: 2rem;
  color: rgba(254, 240, 138, 0.9);
  font-size: 1rem;
}

.music-modal-now {
  background: linear-gradient(145deg, rgba(254, 242, 242, 0.97) 0%, rgba(254, 226, 226, 0.92) 100%);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    0 0 0 2px rgba(254, 240, 138, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(185, 28, 28, 0.4);
  transition: box-shadow 0.35s ease;
}
.music-modal-now--playing {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    0 0 0 2px rgba(254, 240, 138, 0.6),
    0 0 28px rgba(254, 240, 138, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.music-modal-now-top {
  position: relative;
  margin-bottom: 14px;
}
.music-modal-waves {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 10px;
  height: 28px;
}
.music-modal-wave {
  width: 5px;
  border-radius: 3px;
  background: linear-gradient(180deg, #fef08a, #f59e0b);
  animation: music-wave 0.6s ease-in-out infinite alternate;
  box-shadow: 0 0 8px rgba(254, 240, 138, 0.5);
}
.music-modal-wave:nth-child(1) { height: 12px; animation-delay: 0s; }
.music-modal-wave:nth-child(2) { height: 20px; animation-delay: 0.1s; }
.music-modal-wave:nth-child(3) { height: 26px; animation-delay: 0.2s; }
.music-modal-wave:nth-child(4) { height: 18px; animation-delay: 0.3s; }
.music-modal-wave:nth-child(5) { height: 14px; animation-delay: 0.4s; }
@keyframes music-wave {
  from { transform: scaleY(0.4); opacity: 0.7; }
  to { transform: scaleY(1); opacity: 1; }
}

.music-modal-now-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #7f1d1d;
  text-align: center;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.music-modal-progress-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.music-modal-time {
  font-size: 0.8rem;
  color: #b91c1c;
  font-variant-numeric: tabular-nums;
  min-width: 2.5rem;
  text-align: center;
  font-weight: 700;
}

.music-modal-progress {
  flex: 1;
  height: 10px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(90deg, #fecaca 0%, #fca5a5 50%, #f87171 100%);
  border-radius: 5px;
  outline: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}
.music-modal-progress::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(145deg, #fef08a, #f59e0b);
  box-shadow: 0 2px 10px rgba(185, 28, 28, 0.5), 0 0 12px rgba(254, 240, 138, 0.4);
  cursor: pointer;
  transition: transform 0.15s ease;
  border: 2px solid rgba(185, 28, 28, 0.5);
}
.music-modal-progress::-webkit-slider-thumb:hover {
  transform: scale(1.12);
}
.music-modal-progress::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(145deg, #fef08a, #f59e0b);
  box-shadow: 0 2px 10px rgba(185, 28, 28, 0.5);
  cursor: pointer;
  border: 2px solid rgba(185, 28, 28, 0.5);
}

.music-modal-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.music-modal-controls ion-button {
  --padding-start: 12px;
  --padding-end: 12px;
  --color: #b91c1c;
  --color-hover: #7f1d1d;
  --color-activated: #991b1b;
}
.music-modal-play-btn {
  --padding-start: 8px;
  --padding-end: 8px;
  --color: #b91c1c;
}
.music-modal-play-btn ion-icon {
  font-size: 48px;
  filter: drop-shadow(0 2px 8px rgba(185, 28, 28, 0.4));
}
.music-modal-loop-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.6rem;
  font-weight: 700;
}

.music-modal-list-wrap {
  max-height: min(55vh, 380px);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: env(safe-area-inset-bottom, 12px);
  overscroll-behavior: contain;
}
.music-modal-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 2px;
  min-height: min-content;
}

.music-modal-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: none;
  border-radius: 14px;
  background: rgba(254, 242, 242, 0.92);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(185, 28, 28, 0.25);
  text-align: left;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
  font-size: 0.95rem;
  color: #7f1d1d;
}
.music-modal-item:hover {
  background: rgba(254, 226, 226, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  transform: translateX(4px);
  border-color: rgba(185, 28, 28, 0.4);
}
.music-modal-item--active {
  background: linear-gradient(135deg, rgba(254, 240, 138, 0.35) 0%, rgba(253, 224, 71, 0.25) 100%);
  border-color: rgba(245, 158, 11, 0.6);
  color: #7f1d1d;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 20px rgba(254, 240, 138, 0.2);
}
.music-modal-item-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: rgba(185, 28, 28, 0.2);
  color: #b91c1c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
}
.music-modal-item--active .music-modal-item-num {
  background: linear-gradient(145deg, #dc2626, #b91c1c);
  color: #fef08a;
  box-shadow: 0 2px 8px rgba(185, 28, 28, 0.5);
}
.music-modal-item-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.music-modal-item-icon {
  flex-shrink: 0;
  font-size: 1.2rem;
  color: #b91c1c;
  animation: music-icon-pulse 1s ease-in-out infinite;
}
@keyframes music-icon-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.08); }
}
</style>
