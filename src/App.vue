<template>
  <ion-app>
    <!-- Nhạc Tết (nền) và nhạc quay số (khi quay/lật → đóng modal mới tắt) -->
    <audio
      ref="tetAudioRef"
      :src="tetMusicSrc"
      loop
      preload="auto"
      playsinline
      @play="isMusicPlaying = true"
      @pause="isMusicPlaying = false"
    />
    <audio
      ref="quaysoAudioRef"
      :src="quaysoMusicSrc"
      loop
      preload="auto"
      playsinline
    />
    <ion-router-outlet />

    <!-- Nút bật/tắt nhạc Tết -->
    <button
      type="button"
      class="tet-music-toggle"
      :aria-label="isMusicPlaying ? 'Tắt nhạc' : 'Bật nhạc'"
      @click="toggleTetMusic"
    >
      <ion-icon :icon="isMusicPlaying ? volumeHighOutline : volumeMuteOutline" />
    </button>

    <!-- Sticker bottom-right -->
    <div class="yen-sticker" aria-hidden="true">
      <span class="yen-sticker-bubble">
        Yến nè !!!<br />
        xì đi, lì lì đê
        <span class="yen-sticker-emoji" aria-hidden="true">
          <span class="yen-sticker-emoji-normal">🙂</span>
          <span class="yen-sticker-emoji-haha">😂</span>
        </span>
      </span>
      <img class="yen-sticker-img" :src="yenStickerSrc" alt="Yến" loading="lazy" />
    </div>

    <!-- Footer: bản quyền SamTV -->
    <footer class="app-footer">
      <a href="https://samtv.vercel.app" target="_blank" rel="noopener noreferrer" class="app-footer-link">Bản quyền thuộc về SamTV</a>
    </footer>
    
    <!-- Global Error Modal -->
    <ErrorModal
      :is-open="errorModalState.isOpen"
      :status-code="errorModalState.statusCode"
      :message="errorModalState.message"
      :description="errorModalState.description"
      :title="errorModalState.title"
      :button-text="errorModalState.buttonText"
      :icon-color="errorModalState.iconColor"
      :button-color="errorModalState.buttonColor"
      @update:is-open="handleModalClose"
      @dismiss="handleErrorDismiss"
    />
  </ion-app>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, provide } from 'vue';
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/vue';
import { volumeHighOutline, volumeMuteOutline } from 'ionicons/icons';
import ErrorModal from './components/common/ErrorModal.vue';
import { useErrorModal } from './composables/useErrorModal';
import yenStickerSrc from './assets/images/yen.webp';
import tetMusicSrc from './assets/music/tet.mp3';
import quaysoMusicSrc from './assets/music/quayso.mp3';

const { errorModalState, hideError } = useErrorModal();
const tetAudioRef = ref<HTMLAudioElement | null>(null);
const quaysoAudioRef = ref<HTMLAudioElement | null>(null);
/** Mặc định mở loa khi vào app (icon loa bật; nhạc sẽ phát khi mount hoặc sau lần tương tác đầu). */
const isMusicPlaying = ref(true);
let tetPlayed = false;
let wasTetPlaying = false;

function playTetMusic() {
  const el = tetAudioRef.value;
  if (!el || tetPlayed) return;
  el.volume = 1;
  el.play().then(() => { tetPlayed = true; isMusicPlaying.value = true; }).catch(() => {});
}

/** Tạm dừng nhạc Tết, phát nhạc quay số (gọi khi bấm Quay hoặc Lật thẻ). */
function switchToQuaySoMusic() {
  const tet = tetAudioRef.value;
  const quayso = quaysoAudioRef.value;
  if (!quayso) return;
  wasTetPlaying = tet ? !tet.paused : false;
  if (tet) tet.pause();
  quayso.volume = 1;
  quayso.play().catch(() => {});
}

/** Dừng nhạc quay số, phát lại nhạc Tết (gọi khi đóng modal chúc mừng). */
function switchToTetMusic() {
  const tet = tetAudioRef.value;
  const quayso = quaysoAudioRef.value;
  if (quayso) quayso.pause();
  if (tet && wasTetPlaying) {
    tet.volume = 1;
    tet.play().then(() => { isMusicPlaying.value = true; }).catch(() => {});
  }
}

/** Giảm volume nhạc nền (khi đọc TTS); 0–1. */
function setMusicVolume(volume: number) {
  const v = Math.max(0, Math.min(1, volume));
  if (tetAudioRef.value) tetAudioRef.value.volume = v;
  if (quaysoAudioRef.value) quaysoAudioRef.value.volume = v;
}

/** Khôi phục volume nhạc nền về 1. */
function restoreMusicVolume() {
  if (tetAudioRef.value) tetAudioRef.value.volume = 1;
  if (quaysoAudioRef.value) quaysoAudioRef.value.volume = 1;
}

provide('musicSwitch', {
  switchToQuaySo: switchToQuaySoMusic,
  switchToTet: switchToTetMusic,
  setMusicVolume,
  restoreMusicVolume
});

function toggleTetMusic() {
  const el = tetAudioRef.value;
  const quayso = quaysoAudioRef.value;
  if (!el) return;
  if (el.paused) {
    if (quayso) quayso.pause();
    el.volume = 1;
    el.play().then(() => { isMusicPlaying.value = true; tetPlayed = true; }).catch(() => {});
  } else {
    el.pause();
    isMusicPlaying.value = false;
  }
}

function onFirstInteraction() {
  playTetMusic();
  document.removeEventListener('click', onFirstInteraction);
  document.removeEventListener('touchstart', onFirstInteraction);
  document.removeEventListener('keydown', onFirstInteraction);
}

onMounted(() => {
  playTetMusic();
  /* Trình duyệt thường chặn autoplay có tiếng; thử phát lại khi user chạm/bấm lần đầu */
  setTimeout(() => {
    if (!tetPlayed) {
      document.addEventListener('click', onFirstInteraction, { once: true });
      document.addEventListener('touchstart', onFirstInteraction, { once: true });
      document.addEventListener('keydown', onFirstInteraction, { once: true });
    }
  }, 100);
});

onUnmounted(() => {
  document.removeEventListener('click', onFirstInteraction);
  document.removeEventListener('touchstart', onFirstInteraction);
  document.removeEventListener('keydown', onFirstInteraction);
});

const handleModalClose = (isOpen: boolean) => {
  if (!isOpen) {
    hideError();
  }
};

const handleErrorDismiss = () => {
  hideError();
};

// Debug: Log khi modal state thay đổi
watch(() => errorModalState.value.isOpen, (newValue, oldValue) => {
  console.log('🔔 Error Modal state changed:', oldValue, '->', newValue ? 'OPEN' : 'CLOSED');
  if (newValue) {
    console.log('📋 Modal data:', {
      statusCode: errorModalState.value.statusCode,
      message: errorModalState.value.message,
      title: errorModalState.value.title,
    });
  }
}, { immediate: true });

// Debug: Log state object itself
watch(() => errorModalState.value, (newValue) => {
  console.log('🔄 Full modal state:', JSON.stringify(newValue, null, 2));
}, { deep: true });
</script>

<style>
.tet-music-toggle {
  position: fixed;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  z-index: 9998;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: var(--ion-color-primary);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2), 0 0 20px rgba(236, 72, 153, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s, box-shadow 0.2s;
}
.tet-music-toggle:hover {
  transform: scale(1.08) translateY(-50%);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25), 0 0 24px rgba(236, 72, 153, 0.35);
}
.tet-music-toggle:active {
  transform: scale(0.98) translateY(-50%);
}
.tet-music-toggle ion-icon {
  font-size: 26px;
}

.yen-sticker {
  position: fixed;
  right: 0;
  bottom: 0;
  width: clamp(130px, 28vw, 240px);
  height: auto;
  z-index: 9999;
  pointer-events: none;
  display: block;
  transform-origin: 85% 85%;
  will-change: transform;
  animation: yen-sticker-pulse 2.2s ease-in-out infinite;
  filter:
    drop-shadow(0 10px 26px rgba(0, 0, 0, 0.42))
    drop-shadow(0 0 18px rgba(255, 215, 0, 0.22));
}

.yen-sticker-img {
  display: block;
  width: 100%;
  height: auto;
}

.yen-sticker-bubble {
  position: absolute;
  left: 10px;
  top: -10px;
  transform: translateY(-100%);
  max-width: 85%;
  padding: 8px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  color: #111827;
  font-weight: 800;
  font-size: clamp(0.9rem, 3.6vw, 1.1rem);
  line-height: 1.05;
  letter-spacing: 0.01em;
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.22),
    0 0 18px rgba(255, 215, 0, 0.18);
  border: 2px solid rgba(220, 38, 38, 0.65);
}

.yen-sticker-bubble::after {
  content: '';
  position: absolute;
  left: 16px;
  bottom: -8px;
  width: 14px;
  height: 14px;
  background: rgba(255, 255, 255, 0.92);
  border-left: 2px solid rgba(220, 38, 38, 0.65);
  border-bottom: 2px solid rgba(220, 38, 38, 0.65);
  transform: rotate(45deg);
}

.yen-sticker-emoji {
  position: relative;
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  margin-left: 6px;
  vertical-align: -0.15em;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.18));
}

.yen-sticker-emoji-normal,
.yen-sticker-emoji-haha {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  transform-origin: center;
}

.yen-sticker-emoji-normal {
  animation: yen-emoji-normal 1.8s ease-in-out infinite;
}

.yen-sticker-emoji-haha {
  animation: yen-emoji-haha 1.8s ease-in-out infinite;
}

@keyframes yen-emoji-normal {
  0%, 45% { opacity: 1; transform: scale(1); }
  55%, 100% { opacity: 0; transform: scale(0.92); }
}

@keyframes yen-emoji-haha {
  0%, 45% { opacity: 0; transform: scale(0.92); }
  55%, 100% { opacity: 1; transform: scale(1.05); }
}

@keyframes yen-sticker-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9997;
  padding: 8px 12px;
  text-align: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}

.app-footer-link {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
}

.app-footer-link:hover {
  color: #fff;
  text-decoration: underline;
}
</style>
