<template>
  <ion-page>
    <!-- Header ẩn trên màn lật thẻ -->
    <ion-header v-if="room && !room.flipAll" class="room-header-transparent">
      <ion-toolbar>
        <div class="room-header-newyear-wrap" aria-hidden="true">
          <span
            v-for="(char, i) in newYearChars"
            :key="i"
            class="room-header-char"
            :style="{ animationDelay: (i * 0.14) + 's' }"
          >{{ char }}</span>
          <span class="room-header-caret"></span>
        </div>
        <ion-buttons slot="end" class="room-header-icon-column">
          <ion-button v-if="room" fill="clear" size="small" @click="showInfoModal = true" class="room-header-btn room-header-icon-btn" aria-label="Thông tin phòng">
            <ion-icon :icon="informationCircleOutline"></ion-icon>
          </ion-button>
          <ion-button v-if="room" @click="showQRModal = true" class="room-header-btn room-header-icon-btn" aria-label="Mã QR phòng">
            <ion-icon :icon="qrCodeOutline"></ion-icon>
          </ion-button>
          <ion-button fill="clear" size="small" class="room-header-btn room-header-icon-btn" :aria-label="isMuted ? 'Bật nhạc' : 'Tắt nhạc'" @click="toggleMute">
            <ion-icon :icon="isMuted ? volumeMuteOutline : volumeHighOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="room-content" :class="{ 'room-content-flip': room?.flipAll }">
      <!-- Khung ảnh ngựa: ngua1/ngua2 + label position absolute trong cùng khung -->
      <div v-if="room" class="room-corner-ngua-wrap">
        <div class="room-corner-ngua" aria-hidden="true">
          <img :src="ngua1Src" alt="" class="room-corner-ngua-img" :class="{ 'room-corner-ngua-active': !nguaToggle }" />
          <img :src="ngua2Src" alt="" class="room-corner-ngua-img" :class="{ 'room-corner-ngua-active': nguaToggle }" />
          <p v-if="room.flipAll" class="room-flip-ngua-label">
            <template v-if="activeFlipperName">Mời <span class="flip-invite-name">{{ formatDisplayName(activeFlipperName) }}</span> nhận tiền lì xì</template>
            <template v-else>Đã hết lượt lật</template>
          </p>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <ion-spinner></ion-spinner>
      </div>

      <div v-else-if="!room" class="error-container">
        <p>Không tìm thấy phòng</p>
        <ion-button @click="$router.push('/login')">Quay lại</ion-button>
      </div>

      <div v-else class="room-container">
        <!-- Mode lật thẻ: không header; cột icon dọc (thông tin, QR, loa) góc phải -->
        <div v-if="room.flipAll" class="flip-fullscreen-content">
          <!-- Cột trái: Chỉnh sửa + Lật all (style giống tet-music-toggle), không đụng bên phải -->
          <div class="room-flip-left-buttons">
            <button
              type="button"
              class="room-flip-left-btn"
              aria-label="Chỉnh sửa danh sách người lật"
              @click="showFlipEditModal = true"
            >
              <ion-icon :icon="createOutline"></ion-icon>
            </button>
            <button
              type="button"
              class="room-flip-left-btn"
              aria-label="Lật all"
              :disabled="!!room.flipAllReveals?.length || flipAllRevealsLoading"
              @click="handleFlipAllReveals"
            >
              <ion-spinner v-if="flipAllRevealsLoading" name="crescent"></ion-spinner>
              <ion-icon v-else :icon="layersOutline"></ion-icon>
            </button>
          </div>
          <div class="room-flip-right-block">
            <div class="room-flip-icon-column">
              <button type="button" class="room-flip-icon-btn" aria-label="Thông tin phòng" @click="showInfoModal = true">
                <ion-icon :icon="informationCircleOutline"></ion-icon>
              </button>
              <button type="button" class="room-flip-icon-btn" aria-label="Mã QR phòng" @click="showQRModal = true">
                <ion-icon :icon="qrCodeOutline"></ion-icon>
              </button>
              <button type="button" class="room-flip-icon-btn" :aria-label="isMuted ? 'Bật nhạc' : 'Tắt nhạc'" @click="toggleMute">
                <ion-icon :icon="isMuted ? volumeMuteOutline : volumeHighOutline"></ion-icon>
              </button>
            </div>
          </div>
          <!-- Dãy chip (scroll ngang) -->
          <div v-show="showChipListInFlip" class="flip-chip-row">
            <div
              v-show="showChipListInFlip"
              ref="flipChipScrollRef"
              class="flip-chip-list-scroll"
              :class="{ 'flip-chip-list-scroll-dragging': chipScrollDragging }"
              @mousedown="onChipScrollMouseDown"
            >
              <div class="flip-chip-list">
                <span
                  v-for="(name, idx) in flipOrderForTurn"
                  :key="'flip-chip-' + idx"
                  class="flip-chip"
                  :class="{
                    'flip-chip-done': hasFlipped(name),
                    'flip-chip-active': activeFlipperName === name,
                    'flip-chip-clickable': !hasFlipped(name)
                  }"
                  :data-flip-chip-name="name"
                  role="button"
                  tabindex="0"
                  :aria-label="hasFlipped(name) ? name + ' (đã lật)' : 'Chọn ' + name + ' lật lượt này'"
                  @click="onChipClick(name, $event)"
                  @keydown.enter.prevent="onChipClick(name, $event)"
                >
                  <span class="flip-chip-name-text">{{ formatDisplayName(name) }}</span>
                </span>
              </div>
            </div>
          </div>
          <div class="flip-grid">
            <button
              v-for="i in cardCount"
              :key="i - 1"
              type="button"
              class="flip-card"
              :class="{
                flipped: flippedByCardIndex.has(i - 1),
                opening: openingCardIndices.has(i - 1),
                highCard: allCardsFlipped && flipHighCardIndices.has(i - 1),
                amountPending: cardIndicesPendingReveal.has(i - 1),
                amountRevealed: cardIndicesJustRevealed.has(i - 1)
              }"
              @click="handleFlip(i - 1)"
            >
              <div class="flip-card-inner">
                <div class="flip-card-face flip-card-front">
                  <div class="flip-envelope">
                    <div class="flip-envelope-body"></div>
                    <div class="flip-envelope-flap"></div>
                    <span class="flip-front-text">Lì xì</span>
                  </div>
                </div>
                <div class="flip-card-face flip-card-back">
                  <!-- Badge người may mắn nhất (chỉ thẻ cao nhất) -->
                  <div v-if="allCardsFlipped && flipHighCardIndices.has(i - 1)" class="flip-high-badge">
                    <span class="flip-high-badge-text">Người may mắn nhất</span>
                    <span class="flip-high-badge-star">★</span>
                  </div>
                  <!-- Kim tiền tỏa xung quanh khi ra tiền -->
                  <div class="flip-coins-scatter" aria-hidden="true">
                    <span v-for="n in 12" :key="n" class="flip-coin-dot" :class="'flip-coin-dot-' + n"></span>
                  </div>
                  <div class="flip-back-content">
                    <!-- Tiền kéo từ bì lên (vài tờ lần lượt) -->
                    <div class="flip-money-stack" aria-hidden="true">
                      <span class="flip-bill flip-bill-1"></span>
                      <span class="flip-bill flip-bill-2"></span>
                      <span class="flip-bill flip-bill-3"></span>
                    </div>
                    <div class="flip-money-pull"></div>
                    <div v-if="flippedByCardIndex.get(i - 1)?.name && flippedByCardIndex.get(i - 1)?.name !== 'Lật all'" class="flip-flipper-name">{{ formatDisplayName(flippedByCardIndex.get(i - 1)?.name) }}</div>
                    <template v-if="flippedByCardIndex.get(i - 1)?.message">
                      <div class="flip-message flip-reveal-text">{{ flippedByCardIndex.get(i - 1)?.message }}</div>
                    </template>
                    <template v-else>
                      <div class="flip-amount">
                        <span
                          v-for="(char, idx) in getAmountCharList(i - 1)"
                          :key="idx"
                          class="flip-amount-char"
                          :style="{ animationDelay: (1.15 + idx * 0.1) + 's' }"
                        >{{ char }}</span>
                      </div>
                      <div class="flip-vnd flip-reveal-text">VNĐ</div>
                    </template>
                  </div>
                </div>
              </div>
            </button>
          </div>

        </div>

        <!-- Spin Section: chỉ khi KHÔNG phải mode lật thẻ -->
        <ion-card v-else-if="!isRoomFull" class="spin-card">
          <ion-card-content>
            <!-- Danh sách tên cài sẵn: chọn nhanh (ẩn người đã quay) -->
            <div v-if="hasPreSetNames" class="pre-set-names-section">
              <p class="pre-set-title">Chọn người quay</p>
              <div v-if="remainingPreSetNames.length > 0" class="pre-set-list">
                <button
                  v-for="(name, idx) in remainingPreSetNames"
                  :key="preSetNameKey(name, idx)"
                  type="button"
                  class="pre-set-name-chip"
                  @click="selectPreSetName(name)"
                >
                  <span class="chip-name">{{ formatDisplayName(name) }}</span>
                </button>
              </div>
              <p v-else class="pre-set-empty">Tất cả mọi người đã quay xong.</p>
            </div>

            <div v-if="!playerName || hasSpun" class="name-input-section">
              <!-- Chỉ hiện input khi: không có tên cài sẵn HOẶC có tên cài sẵn nhưng chưa đủ số người (còn chỗ nhập tay) -->
              <template v-if="!showNameInputOnlyFromList">
                <p v-if="hasSpun" class="next-person-hint">Tên "{{ formatDisplayName(playerName) }}" đã quay. Nhập tên người tiếp theo:</p>
                <ion-item lines="none" class="name-item" :class="{ 'name-item-error': nameError }">
                  <ion-label position="stacked">{{ hasSpun ? 'Tên người tiếp theo' : 'Tên của bạn' }}</ion-label>
                  <ion-input
                    v-model="inputName"
                    :placeholder="hasSpun ? 'Nhập tên để quay' : 'Nhập tên để quay'"
                    @keyup.enter="setPlayerName"
                    @input="nameError = ''"
                    class="name-input"
                  ></ion-input>
                </ion-item>
                <p v-if="nameError" class="name-error">{{ nameError }}</p>
                <ion-button
                  expand="block"
                  color="primary"
                  @click="setPlayerName"
                  :disabled="!inputName"
                  class="name-button"
                >
                  Xác nhận
                </ion-button>
              </template>
              <p v-else class="next-person-hint">Chọn tên ở trên để quay. Người đã quay hiển thị "Đã quay".</p>
            </div>

            <div v-else class="spin-section">
              <p class="player-name">
                <span>Người chơi: <strong class="player-name-strong">{{ formatDisplayName(playerName) }}</strong></span>
              </p>

              <div v-if="canSpin" class="spin-wheel-container">
                <div
                  class="wheel"
                  :class="{ 'wheel-done': lastResult != null && !isSpinning }"
                  @click="handleSpin"
                >
                  <div class="wheel-content">
                    <div v-if="!isSpinning && lastResult == null" class="wheel-placeholder">
                      <ion-icon :icon="giftOutline"></ion-icon>
                      <p>Chạm để quay</p>
                    </div>
                    <div v-else-if="isSpinning" class="wheel-spinning wheel-spinning-images">
                      <div class="spin-images-wrap">
                        <Transition name="spin-img">
                          <img
                            :key="spinImageIndex"
                            :src="spinImages[spinImageIndex]"
                            alt=""
                            class="spin-image"
                          />
                        </Transition>
                      </div>
                      <p>Đang quay số...</p>
                    </div>
                    <div v-else class="wheel-result">
                      <span class="wheel-amount">{{ lastResult?.toLocaleString() }}</span>
                      <span class="wheel-currency">VNĐ</span>
                    </div>
                  </div>
                </div>
                <p class="wheel-hint">Chạm vào ô tròn để quay</p>
              </div>

              <div v-else class="cannot-spin">
                <p v-if="room.type === 'total' && (room.totalPeople ?? 0) > 0 && (room.spins || []).length >= (room.totalPeople ?? 0)">
                  Phòng đã đủ số người quay
                </p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Màn chúc mừng full màn + tên + pháo hoa; đóng khi chạm hoặc 2.5s sau khi đọc xong -->
        <Teleport to="body">
          <Transition name="congrats">
            <div v-if="showCongratulations" class="congrats-fullscreen" @click="closeCongratulations" role="button" tabindex="0" aria-label="Chạm để đóng">
              <div class="fireworks">
                <div v-for="i in 14" :key="i" class="firework" :style="getFireworkStyle(i)">
                  <div v-for="j in 18" :key="j" class="firework-particle" :style="getParticleStyle(i, j)"></div>
                </div>
              </div>
              <div class="congrats-fullscreen-text">
                <h1 class="congrats-big-title">Chúc Mừng!</h1>
                <p v-if="congratsPlayerName" class="congrats-big-name">{{ formatDisplayName(congratsPlayerName) }}</p>
                <p v-if="congratsAmount != null" class="congrats-big-amount">{{ congratsAmount.toLocaleString() }} VNĐ</p>
                <p v-if="congratsNewYearMessage" class="congrats-newyear-msg">
                  <span class="congrats-newyear-quote">“</span>
                  <template v-for="(word, wi) in congratsMessageWords" :key="wi">
                    <span
                      :class="{ 'congrats-word-highlight': speakingWordIndex === wi }"
                      class="congrats-word"
                    >{{ word }}</span><span v-if="wi < congratsMessageWords.length - 1">&nbsp;</span>
                  </template>
                  <span class="congrats-newyear-quote">”</span>
                </p>
              </div>
            </div>
          </Transition>
        </Teleport>

        <!-- Results List -->
        <ion-card class="results-card" v-if="showResults && !room.flipAll">
          <ion-card-header>
            <ion-card-title>Kết Quả</ion-card-title>
            <ion-card-subtitle v-if="room.flipAll">{{ (room.flips || []).length }}/{{ room.totalPeople }} người đã lật</ion-card-subtitle>
            <ion-card-subtitle v-else>{{ (room.totalPeople ?? 0) > 0 ? (room.spins || []).length + '/' + room.totalPeople + ' người đã quay' : (room.spins || []).length + ' người đã quay' }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <!-- Kết quả lật thẻ (flipAll) -->
            <template v-if="room.flipAll">
              <ion-list>
                <ion-item v-for="f in sortedFlips" :key="f.id" button @click="openResultDetail({ name: f.flipperName, amount: f.amount, timestamp: f.timestamp })">
                  <ion-label>
                    <h2>{{ formatDisplayName(f.flipperName) }}</h2>
                    <p>{{ new Date(f.timestamp).toLocaleString('vi-VN') }}</p>
                  </ion-label>
                  <ion-note slot="end" color="primary">{{ f.amount.toLocaleString() }} VNĐ</ion-note>
                </ion-item>
                <template v-for="(r, idx) in room.flipAllReveals" :key="'rev-' + idx">
                  <ion-item>
                    <ion-label>
                      <h2>Thẻ {{ r.cardIndex + 1 }} (Lật all)</h2>
                    </ion-label>
                    <ion-note v-if="r.message" slot="end">{{ r.message }}</ion-note>
                    <ion-note v-else slot="end" color="primary">{{ (r.amount ?? 0).toLocaleString() }} VNĐ</ion-note>
                  </ion-item>
                </template>
                <ion-item v-if="(room.flips || []).length === 0 && !(room.flipAllReveals?.length)">
                  <ion-label><p>Chưa có ai lật</p></ion-label>
                </ion-item>
              </ion-list>
            </template>
            <!-- Kết quả quay số (spin) -->
            <template v-else>
            <!-- Winner Celebration -->
            <div v-if="isComplete && winner" class="winner-celebration">
              <div class="confetti-container">
                <div class="confetti" v-for="i in 50" :key="i" :style="getConfettiStyle(i)"></div>
              </div>
              <div class="winner-content">
                <h2>🎉 Chúc Mừng! 🎉</h2>
                <p class="winner-name">{{ formatDisplayName(winner.playerName) }}</p>
                <p class="winner-amount">{{ winner.amount.toLocaleString() }} VNĐ</p>
                <p class="winner-message">Người nhận được số tiền lì xì cao nhất!</p>
              </div>
            </div>

            <ion-list>
              <ion-item v-for="spin in sortedSpins" :key="spin.id" button :class="{ 'winner-item': winner && spin.id === winner.id }" @click="openResultDetail({ name: spin.playerName, amount: spin.amount, timestamp: spin.timestamp })">
                <ion-label>
                  <h2>{{ formatDisplayName(spin.playerName) }}</h2>
                  <p>{{ new Date(spin.timestamp).toLocaleString('vi-VN') }}</p>
                </ion-label>
                <ion-note slot="end" color="primary">
                  {{ spin.amount.toLocaleString() }} VNĐ
                </ion-note>
              </ion-item>
              <ion-item v-if="(room.spins || []).length === 0">
                <ion-label>
                  <p>Chưa có ai quay</p>
                </ion-label>
              </ion-item>
            </ion-list>
            </template>
          </ion-card-content>
        </ion-card>

        <!-- Ẩn kết quả: khi chọn "chỉ hiển thị khi quay hết" và chưa đủ lượt (không áp dụng cho mode lật thẻ) -->
        <ion-card v-else-if="!showResults && !room.flipAll && (room.type === 'total' || room.slots?.length)" class="results-card">
          <ion-card-header>
            <ion-card-title>Kết Quả</ion-card-title>
            <ion-card-subtitle>{{ (room.totalPeople ?? 0) > 0 ? (room.spins || []).length + '/' + room.totalPeople + ' người đã quay' : (room.spins || []).length + ' người đã quay' }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <div class="hidden-results-message">
              <ion-icon :icon="lockClosedOutline" size="large"></ion-icon>
              <p>Danh sách kết quả sẽ được hiển thị sau khi tất cả người đã quay xong</p>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>

    <!-- Info Modal: thông tin phòng (có thể bị khóa mật khẩu) -->
    <ion-modal :is-open="showInfoModal" @didDismiss="showInfoModal = false">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-button @click="showInfoModal = false; router.back()">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
              Về
            </ion-button>
          </ion-buttons>
          <ion-title>Thông tin phòng</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showInfoModal = false">Đóng</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="info-modal-content">
          <template v-if="!hasAccessToDetails && room?.password">
            <p class="info-locked-text">Thông tin phòng đã được bảo mật</p>
            <ion-button expand="block" color="primary" @click="showInfoModal = false; showPasswordModal = true">
              <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
              Nhập mật khẩu để xem
            </ion-button>
          </template>
          <template v-else-if="room">
            <p class="info-row"><strong>Tên phòng:</strong> {{ room.roomName || '—' }}</p>
            <p class="info-row"><strong>Mã phòng:</strong> {{ room.roomCode }}</p>
            <p class="info-row">
              <strong>Tổng số lượt {{ room.flipAll ? 'lật' : 'quay' }}:</strong>
              {{ (room.totalPeople ?? 0) > 0 ? room.totalPeople : 'Không giới hạn' }}
            </p>
            <p class="info-row">
              <strong>Số lượt đã {{ room.flipAll ? 'lật' : 'quay' }}:</strong>
              {{ room.flipAll ? (room.flips || []).length : (room.spins || []).length }}
            </p>
            <p class="info-row">
              <strong>Số tiền cao nhất đã {{ room.flipAll ? 'lật' : 'quay' }}:</strong>
              {{ (room.flipAll ? maxFlipped : maxSpun).toLocaleString() }} VNĐ
            </p>
            <p class="info-row">
              <strong>Tổng số tiền đã {{ room.flipAll ? 'lật' : 'quay' }}:</strong>
              {{ (room.flipAll ? totalFlipped : totalSpun).toLocaleString() }} VNĐ
            </p>
          </template>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Password Modal -->
    <ion-modal :is-open="showPasswordModal" @didDismiss="showPasswordModal = false">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Nhập mật khẩu</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showPasswordModal = false">Đóng</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="password-modal-content">
          <p>Vui lòng nhập mật khẩu để xem chi tiết phòng</p>
          <ion-item>
            <ion-label position="stacked">Mật khẩu</ion-label>
            <ion-input
              v-model="passwordInput"
              type="password"
              placeholder="Nhập mật khẩu"
              @keyup.enter="checkPassword"
            ></ion-input>
          </ion-item>
          <ion-button
            expand="block"
            color="primary"
            @click="checkPassword"
            :disabled="!passwordInput"
            class="password-button"
          >
            Xác nhận
          </ion-button>
          <p v-if="passwordError" class="password-error">{{ passwordError }}</p>
        </div>
      </ion-content>
    </ion-modal>

    <!-- QR Code Modal -->
    <ion-modal 
      :is-open="showQRModal" 
      @didDismiss="showQRModal = false"
      @didPresent="onQRModalPresent"
    >
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Mã QR Phòng</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showQRModal = false">Đóng</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="qr-modal-content">
          <div class="qr-code-container">
            <canvas ref="qrCanvas" v-if="showQRModal"></canvas>
          </div>
          <p class="room-code-text">Mã phòng: <strong>{{ room?.roomCode }}</strong></p>
          <ion-button
            expand="block"
            color="primary"
            @click="shareRoom"
            class="share-button"
          >
            Chia sẻ phòng
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Modal chỉnh sửa danh sách người lật: kéo thả đổi thứ tự, sửa tên, chọn người active -->
    <ion-modal :is-open="showFlipEditModal" @didDismiss="showFlipEditModal = false" class="flip-edit-modal">
      <ion-header>
        <ion-toolbar class="flip-edit-toolbar">
          <ion-title>Danh sách người lật</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="solid" color="primary" @click="showFlipEditModal = false">Xong</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="flip-edit-content">
        <div class="flip-edit-modal-content">
          <div class="flip-edit-section">
            <span class="flip-edit-section-label">Tùy chọn</span>
            <div class="flip-edit-toggle-wrap">
              <span class="flip-edit-toggle-label">Hiển thị danh sách chip trên màn hình</span>
              <label class="flip-edit-checkbox-wrap">
                <input
                  type="checkbox"
                  :checked="showChipListInFlip"
                  @change="showChipListInFlip = ($event.target as HTMLInputElement).checked"
                  class="flip-edit-checkbox"
                />
                <span class="flip-edit-checkbox-ui"></span>
              </label>
            </div>
          </div>
          <div class="flip-edit-section">
            <span class="flip-edit-section-label">Thứ tự lật (trái → phải)</span>
            <p class="flip-edit-hint">Kéo dòng để đổi thứ tự. Bấm <strong>Lật lượt này</strong> để chọn người đang lật.</p>
            <div class="flip-edit-list">
              <div
                v-for="(name, index) in flipEditList"
                :key="'flip-edit-' + index"
                class="flip-edit-row"
                :class="{ 'flip-edit-row-active': activeFlipperOverride === flipEditList[index], 'flip-edit-row-done': hasFlipped(flipEditList[index]) }"
                draggable="true"
                @dragstart="onFlipEditDragStart($event, index)"
                @dragend="onFlipEditDragEnd"
                @dragover.prevent="onFlipEditDragOver($event, index)"
                @drop="onFlipEditDrop($event, index)"
              >
                <span class="flip-edit-order">{{ index + 1 }}</span>
                <span class="flip-edit-drag-handle" aria-hidden="true">≡</span>
                <ion-input
                  :model-value="flipEditList[index]"
                  @update:model-value="(v: string) => setFlipEditName(index, v)"
                  type="text"
                  :placeholder="'Người ' + (index + 1)"
                  class="flip-edit-input"
                ></ion-input>
                <ion-button
                  size="small"
                  :fill="activeFlipperOverride === flipEditList[index] ? 'solid' : 'outline'"
                  :color="hasFlipped(flipEditList[index]) ? 'medium' : (activeFlipperOverride === flipEditList[index] ? 'primary' : 'primary')"
                  :disabled="hasFlipped(flipEditList[index])"
                  class="flip-edit-action-btn"
                  @click="setActiveFlipperFromEdit(flipEditList[index])"
                >
                  {{ hasFlipped(flipEditList[index]) ? 'Đã lật' : (activeFlipperOverride === flipEditList[index] ? 'Đang lật' : 'Lật lượt này') }}
                </ion-button>
              </div>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Modal chi tiết người đã quay/lật: tên, số tiền, câu chúc Tết (giao diện Tết) -->
    <ion-modal
      :is-open="!!selectedResultDetail"
      @didDismiss="selectedResultDetail = null"
      class="result-detail-modal"
    >
      <ion-header class="result-detail-modal-header">
        <ion-toolbar>
          <ion-title>Lì xì</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="selectedResultDetail = null">Đóng</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="result-detail-modal-content">
        <div v-if="selectedResultDetail" class="result-detail-card">
          <p class="result-detail-name">{{ formatDisplayName(selectedResultDetail.name) }}</p>
          <p class="result-detail-amount">{{ selectedResultDetail.amount.toLocaleString() }} VNĐ</p>
          <p v-if="selectedResultDetail.timestamp" class="result-detail-time">{{ new Date(selectedResultDetail.timestamp).toLocaleString('vi-VN') }}</p>
          <div class="result-detail-wish">
            <p class="result-detail-wish-label">🌸 Câu chúc ý nghĩa 🌸</p>
            <p class="result-detail-wish-text">"{{ detailWishMessage }}"</p>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { giftOutline, qrCodeOutline, lockClosedOutline, informationCircleOutline, arrowBackOutline, createOutline, volumeHighOutline, volumeMuteOutline, layersOutline } from 'ionicons/icons';
import QRCode from 'qrcode';
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
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonModal,
  IonList,
  IonNote,
  toastController,
  alertController
} from '@ionic/vue';
import { useRoom } from '@/composables/useRoom';
import { useAuth } from '@/composables/useAuth';
import { playVietnameseTTS } from '@/utils/functions/tts';
import type { Room, Spin } from '@/types/room';

const route = useRoute();
const router = useRouter();
const { currentUser } = useAuth();
const { getRoom, subscribeRoom, addSpin, addFlip, setFlipAllReveals, generateRandomAmount } = useRoom();

const musicSwitch = inject<{
  switchToQuaySo: () => void;
  switchToTet: () => void;
  setMusicVolume?: (volume: number) => void;
  restoreMusicVolume?: () => void;
  muteMusic?: () => void;
  unmuteMusic?: () => void;
  startMusic?: () => void;
}>('musicSwitch');

const roomCode = route.params.roomCode as string;
const newYearChars = 'Chúc mừng năm mới'.split('');

const room = ref<Room | null>(null);
const loading = ref(true);
const playerName = ref('');
const inputName = ref('');
const nameError = ref('');
const isSpinning = ref(false);
const lastResult = ref<number | null>(null);
const showQRModal = ref(false);
const showPasswordModal = ref(false);
const showInfoModal = ref(false);
const showCongratulations = ref(false);
const isMuted = ref(false);

function toggleMute() {
  isMuted.value = !isMuted.value;
  if (isMuted.value) {
    musicSwitch?.muteMusic?.();
  } else {
    musicSwitch?.unmuteMusic?.();
  }
}
const congratsAmount = ref<number | null>(null);
const congratsPlayerName = ref('');
const congratsNewYearMessage = ref('');
/** Index từ đang được TTS đọc (để highlight); -1 = không đọc. */
const speakingWordIndex = ref(-1);
/** Hàm hủy TTS Google (khi đóng modal chúc mừng). */
const googleTTSCancel = ref<(() => void) | null>(null);
/** Timer highlight từng từ (clear khi đóng modal / TTS end). */
const wordHighlightTimeoutId = ref<number | ReturnType<typeof setTimeout> | null>(null);
const wordHighlightIntervalId = ref<ReturnType<typeof setInterval> | null>(null);
/** Tự đóng modal chúc mừng 1s sau khi đọc xong. */
const congratsAutoCloseTimeoutId = ref<number | ReturnType<typeof setTimeout> | null>(null);
const congratsFallbackCloseId = ref<number | ReturnType<typeof setTimeout> | null>(null);

function clearWordHighlightTimers() {
  if (wordHighlightTimeoutId.value != null) {
    clearTimeout(wordHighlightTimeoutId.value);
    wordHighlightTimeoutId.value = null;
  }
  if (wordHighlightIntervalId.value != null) {
    clearInterval(wordHighlightIntervalId.value);
    wordHighlightIntervalId.value = null;
  }
}

/** Tách câu chúc thành mảng từ (để highlight từng từ khi đọc). */
const congratsMessageWords = computed(() => {
  const msg = congratsNewYearMessage.value;
  if (!msg || typeof msg !== 'string') return [];
  return msg.trim().split(/\s+/).filter(Boolean);
});

/** 50 lời chúc năm mới dài, có ý nghĩa nhân văn — kiểu bốc thăm đầu xuân ở chùa */
const NEW_YEAR_WISHES = [
  'Đầu xuân gặp lộc là điều quý. Biết đủ, biết dừng, lòng thanh thản — năm mới an khang, gia đạo hưng thịnh.',
  'Nhân duyên tốt đẹp sẽ tới với ai biết sống chân thành. Giữ tâm thiện, làm việc thiện, phúc đời dài.',
  'Lộc trời ban cho kẻ có tâm. Năm mới bình an, sức khỏe dồi dào, sum vầy ấm áp bên người thân.',
  'Xuân về cây cối đâm chồi — đời người cũng vậy, gặp thời thì nở. Cố gắng từng ngày, may mắn sẽ tới.',
  'Sống đủ, sống lành, không tham sân si. Đầu năm giữ tâm thanh tịnh, cả năm an vui.',
  'Gia đình hòa thuận là phúc lớn nhất. Năm mới chúc nhà cửa yên ấm, con cháu hiếu thảo, bình an mỗi ngày.',
  'Làm điều tốt không mong báo đáp, phúc sẽ tự tìm về. Xuân mới gặp lộc, cả năm hanh thông.',
  'Quá khứ đã qua, tương lai chưa tới — sống trọn từng ngày với lòng biết ơn. Năm mới an lành.',
  'Gieo nhân lành ắt gặt quả ngọt. Đầu xuân gặp lộc, cả năm làm ăn thuận buồm xuôi gió.',
  'Sức khỏe là vàng. Năm mới chúc thân tâm an lạc, ít bệnh ít lo, vui bên gia đình.',
  'Trung thực với người, với mình — lòng thanh thản, đời bớt sóng gió. Xuân về cát tường.',
  'Học cách buông những gì không thuộc về mình, giữ những gì đáng trân trọng. Năm mới bình an.',
  'Lộc đầu xuân là lời nhắc: sống tử tế, làm việc chăm chỉ, phúc sẽ theo chân. Cả năm hanh thông.',
  'Gặp nhau là duyên, giữ được là phúc. Năm mới chúc tình thân bền chặt, bạn bè gần gũi.',
  'Khó khăn rồi cũng qua. Tin vào bản thân, bước từng bước vững — năm mới thịnh vượng.',
  'Biết ơn cha mẹ, biết ơn đời. Đầu năm tâm an, cả năm làm ăn phát đạt, gia đạo hưng vượng.',
  'Không so sánh với người, chỉ so với mình hôm qua. Mỗi ngày tiến một chút — xuân mới cát tường.',
  'Lời nói hòa ái, việc làm chân chính. Năm mới gặp quý nhân, công việc thuận lợi, bình an.',
  'Sống chậm lại, lắng nghe nhiều hơn. Xuân về an khang, gia đình sum vầy, sức khỏe dồi dào.',
  'Phúc không tự nhiên tới — từ tâm thiện và nỗ lực mỗi ngày. Năm mới vạn sự như ý.',
  'Tiền bạc đến đi, tình người mới quý. Năm mới chúc được nhiều yêu thương, ấm áp bên nhau.',
  'Đầu năm gặp lộc là điềm lành. Giữ tâm trong sáng, làm việc đàng hoàng — cả năm an khang.',
  'Thất bại dạy ta đứng dậy. Năm mới bước đi vững vàng, gặp may, gặp phúc, gặp người tốt.',
  'Cha mẹ khỏe, con cháu ngoan là phúc lớn. Xuân mới chúc gia đình bình an, hạnh phúc trọn năm.',
  'Cho đi không tính toán, nhận lại không tham. Lòng thanh thản — năm mới an lành, tài lộc dồi dào.',
  'Mỗi ngày là một cơ hội mới. Đầu xuân gặp lộc, cả năm nỗ lực, thành công sẽ tới.',
  'Sống có trách nhiệm với bản thân và gia đình. Năm mới sức khỏe, bình an, làm ăn phát đạt.',
  'Giữ lòng bao dung, bớt oán giận — tâm an thì đời nhẹ. Xuân về vạn sự cát tường.',
  'Học từ quá khứ, sống cho hiện tại, hướng tới tương lai. Năm mới thịnh vượng, gia đạo hưng thịnh.',
  'Lộc xuân nhắc ta: biết đủ là giàu. Năm mới an khang, sức khỏe dồi dào, sum vầy ấm áp.',
  'Kính trên nhường dưới, trên thuận dưới hòa. Gia đình êm ấm — xuân mới bình an, phúc lộc tràn đầy.',
  'Không vội vàng, không bon chen. Bước chậm mà chắc — năm mới hanh thông, vạn sự như ý.',
  'Sức khỏe là nền tảng của mọi hạnh phúc. Năm mới chúc thân tâm an lạc, ít bệnh ít lo.',
  'Làm việc thiện không cần ai biết, trời đất chứng giám. Đầu xuân gặp lộc, cả năm an khang.',
  'Biết ơn từng bữa cơm, từng ngày bình yên. Năm mới sống trọn, yêu thương đủ đầy.',
  'Gặp khó không nản, gặp thuận không kiêu. Giữ tâm bình — xuân về cát tường, vạn sự hanh thông.',
  'Tình thân là bến đỗ. Năm mới chúc gia đình đoàn viên, bạn bè gần gũi, bình an mỗi ngày.',
  'Lời nói nhẹ nhàng, việc làm đúng đắn. Năm mới gặp quý nhân, công việc thuận lợi.',
  'Sống đơn giản, lòng thanh thảnh. Đầu xuân gặp lộc, cả năm an vui, không phiền não.',
  'Cha mẹ là phúc lớn đời người. Năm mới chúc song thân khỏe mạnh, gia đình sum vầy.',
  'Cố gắng hôm nay, ngày mai sẽ đổi thay. Xuân mới gặp lộc, cả năm nỗ lực — thành công tới.',
  'Không tranh giành, không hơn thua. Sống đủ, sống lành — năm mới bình an, phúc lộc dồi dào.',
  'Lộc đầu năm là lời chúc: tâm an, thân khỏe, gia đạo hưng. Cả năm hanh thông, vạn sự như ý.',
  'Biết dừng đúng lúc là trí tuệ. Năm mới làm ăn chắc chắn, gia đình ấm no, bình an.',
  'Yêu thương không tính toán. Năm mới chúc được cho đi nhiều và nhận lại bình an.',
  'Mỗi sáng thức dậy là một món quà. Xuân về an khang, sống trọn từng ngày với lòng biết ơn.',
  'Gieo thiện ắt gặt lành. Đầu xuân gặp lộc, cả năm giữ tâm thiện — phúc đời dài.',
  'Gia đình là nơi ta trở về. Năm mới chúc nhà cửa yên ấm, con cháu hiếu thảo, bình an.',
  'Khó khăn rèn luyện ta. Năm mới bước đi vững vàng, gặp may, gặp phúc, gặp duyên lành.',
  'Sống có đức, không sợ không may. Xuân về cát tường, làm ăn thuận lợi, gia đạo hưng thịnh.',
  'Lộc xuân đến với người biết sống chân thành. Năm mới an khang, sức khỏe dồi dào, sum vầy ấm áp.',
  'Trên kính dưới nhường, trong ấm ngoài êm. Năm mới gia đình hòa thuận, bình an cả năm.',
  'Đầu năm gặp lộc — cả năm gắng sức, giữ tâm trong sáng. Vạn sự như ý, an khang thịnh vượng.'
];
const spinImageIndex = ref(0);
let spinImageTimeout: number | null = null;

const spinImages = [
  new URL('../assets/images/anh1.jfif', import.meta.url).href,
  new URL('../assets/images/anh2.jfif', import.meta.url).href,
  new URL('../assets/images/anh3.jfif', import.meta.url).href,
  new URL('../assets/images/anh4.jpg', import.meta.url).href,
  new URL('../assets/images/anh5.jpg', import.meta.url).href
];

const ngua1Src = new URL('../assets/images/ngua1.webp', import.meta.url).href;
const ngua2Src = new URL('../assets/images/ngua2.webp', import.meta.url).href;
const nguaToggle = ref(false);
let nguaInterval: ReturnType<typeof setInterval> | null = null;

const passwordInput = ref('');
const passwordError = ref('');
const hasAccessToDetails = ref(false);
const qrCanvas = ref<HTMLCanvasElement | null>(null);
let unsubscribe: (() => void) | null = null;
let congratsTimer: number | ReturnType<typeof setTimeout> | null = null;
let delayCongratsTimer: number | ReturnType<typeof setTimeout> | null = null;

// ===== Mode lật thẻ =====
const flipAllRevealsLoading = ref(false);
const openingCardIndices = ref<Set<number>>(new Set());
/** Thứ tự người lật (trái → phải). Khởi tạo từ room.playerNames, có thể chỉnh trong modal. */
const flipOrderLocal = ref<string[]>([]);
/** User chọn người lật ngay bây giờ (từ modal). Null = dùng lượt trái sang phải. */
const activeFlipperOverride = ref<string | null>(null);
const showFlipEditModal = ref(false);
/** Ẩn/hiện danh sách chip. Mặc định: chế độ random (auto) = ẩn, nhập tên (manual) = hiện. */
const showChipListInFlip = ref(true);
/** Modal chi tiết người đã quay/lật: { name, amount, timestamp? }. Null = đóng. */
const selectedResultDetail = ref<{ name: string; amount: number; timestamp?: number } | null>(null);
/** Câu chúc Tết hiển thị trong modal chi tiết (random khi mở). */
const detailWishMessage = ref('');
/** Thẻ đang chờ đóng modal: số tiền hiện dần từng chữ số nhưng chưa "rõ"; đóng modal mới hiện rõ. */
const cardIndicesPendingReveal = ref<Set<number>>(new Set());
const cardIndicesJustRevealed = ref<Set<number>>(new Set());
const lastFlippedCardIndex = ref<number | null>(null);
/** Bản copy để chỉnh trong modal; khi mở modal = copy từ flipOrderLocal, khi đóng = ghi lại flipOrderLocal. */
const flipEditList = ref<string[]>([]);
let flipEditDragFromIndex = -1;
const flipChipScrollRef = ref<HTMLElement | null>(null);
/** Kéo scroll ngang trên web: khi true thì click vào chip không trigger (tránh nhầm với click). */
let chipScrollDidDrag = false;
let chipScrollStartX = 0;
let chipScrollStartLeft = 0;
let chipScrollMoveHandler: ((e: MouseEvent) => void) | null = null;
let chipScrollUpHandler: (() => void) | null = null;
const chipScrollDragging = ref(false);

function onChipScrollMouseDown(e: MouseEvent) {
  const el = flipChipScrollRef.value;
  if (!el) return;
  chipScrollDidDrag = false;
  chipScrollDragging.value = true;
  chipScrollStartX = e.clientX;
  chipScrollStartLeft = el.scrollLeft;
  chipScrollMoveHandler = (e2: MouseEvent) => {
    const dx = e2.clientX - chipScrollStartX;
    if (Math.abs(dx) > 4) chipScrollDidDrag = true;
    el.scrollLeft = chipScrollStartLeft - dx;
  };
  chipScrollUpHandler = () => {
    document.removeEventListener('mousemove', chipScrollMoveHandler!);
    document.removeEventListener('mouseup', chipScrollUpHandler!);
    chipScrollMoveHandler = null;
    chipScrollUpHandler = null;
    chipScrollDragging.value = false;
    setTimeout(() => { chipScrollDidDrag = false; }, 0);
  };
  document.addEventListener('mousemove', chipScrollMoveHandler);
  document.addEventListener('mouseup', chipScrollUpHandler);
}

function onChipClick(name: string, e: Event) {
  if (chipScrollDidDrag) return;
  if (hasFlipped(name)) openResultDetailByFlipperName(name);
  else setActiveFlipperFromEdit(name);
}

const flipsCountLimit = computed(() => room.value?.totalPeople ?? 0);
const isFlipAutoName = computed(() => (room.value?.flipAll && room.value?.flipNameMode === 'auto') ?? false);
const nextAutoFlipName = computed(() => {
  const idx = (room.value?.flips ?? []).length + 1;
  return `Người chơi ${idx}`;
});

/** Tên mặc định "Người chơi N" — đưa những người này xuống cuối danh sách. */
const defaultNamePattern = /^Người chơi \d+$/;
function isDefaultFlipName(name: string): boolean {
  return defaultNamePattern.test(String(name).trim());
}
function defaultNameSort(a: string, b: string): number {
  const numA = parseInt(String(a).replace(/\D/g, ''), 10) || 0;
  const numB = parseInt(String(b).replace(/\D/g, ''), 10) || 0;
  return numA - numB;
}

/** Danh sách dùng để tính "người lật tiếp theo" (trái sang phải). Tên tùy chỉnh trước, "Người chơi 1, 2..." sau cùng. */
const flipOrderForTurn = computed(() => {
  if (!room.value?.flipAll) return [];
  let list: string[];
  if (isFlipAutoName.value) {
    const n = room.value.totalPeople ?? 0;
    list = Array.from({ length: Math.max(0, n) }, (_, i) => `Người chơi ${i + 1}`);
  } else {
    list = flipOrderLocal.value.length > 0 ? [...flipOrderLocal.value] : [...(room.value.playerNames ?? [])];
  }
  const custom = list.filter(n => !isDefaultFlipName(n));
  const defaults = list.filter(n => isDefaultFlipName(n)).sort(defaultNameSort);
  return [...custom, ...defaults];
});

/** Người đang được mời lật: từ lúc lật xong (đã set congratsPlayerName) đến khi tắt màn chúc mừng thì giữ người vừa lật, tắt xong mới chuyển sang người tiếp theo. */
const activeFlipperName = computed(() => {
  if (congratsPlayerName.value) {
    return congratsPlayerName.value;
  }
  const order = flipOrderForTurn.value;
  if (order.length === 0) return '';
  if (activeFlipperOverride.value != null && activeFlipperOverride.value.trim() !== '' && !hasFlipped(activeFlipperOverride.value)) {
    return activeFlipperOverride.value.trim();
  }
  const first = order.find(n => !hasFlipped(n));
  return first ?? '';
});

/** Chuỗi đầy đủ dòng "Mời X chọn lì xì nè" / "Đã lật hết lượt" (để hiện khi chạm xem full). */
const flipProminentLabelFull = computed(() => {
  const name = activeFlipperName.value;
  return name ? `Mời ${formatDisplayName(name)} chọn lì xì nè` : 'Đã lật hết lượt';
});

async function showFlipLabelFullText() {
  const alert = await alertController.create({
    header: 'Nội dung',
    message: flipProminentLabelFull.value,
    buttons: ['Đóng'],
    cssClass: 'flip-label-full-alert'
  });
  await alert.present();
}

const cardCount = computed(() => {
  const base = room.value?.totalPeople ?? (room.value?.playerNames?.length ?? 0);
  const extra = room.value?.extraCards ?? (room.value?.flipAll ? 5 : 0);
  return Math.max(0, base + extra);
});

const flippedByCardIndex = computed(() => {
  const map = new Map<number, { name?: string; amount?: number; message?: string }>();
  for (const f of room.value?.flips ?? []) {
    map.set(f.cardIndex, { name: f.flipperName, amount: f.amount });
  }
  for (const r of room.value?.flipAllReveals ?? []) {
    // Không ghi đè kết quả thẻ đã lật (để "Lật all" bấm mọi thời điểm không làm đổi thẻ đã mở)
    if (!map.has(r.cardIndex)) {
      map.set(r.cardIndex, { amount: r.amount, message: r.message });
    }
  }
  return map;
});

function hasFlipped(name: string): boolean {
  return (room.value?.flips ?? []).some(f => f.flipperName === name);
}

/** Viết hoa chữ cái đầu mỗi từ (tên người). */
function formatDisplayName(name: string | undefined | null): string {
  if (name == null || String(name).trim() === '') return '';
  return String(name)
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function scrollActiveChipIntoView() {
  nextTick(() => {
    const el = flipChipScrollRef.value?.querySelector('.flip-chip-active');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
}

watch(
  () => [activeFlipperName.value, (room.value?.flips ?? []).length],
  () => {
    if (activeFlipperName.value) scrollActiveChipIntoView();
  }
);

const remainingFlippersFromPreset = computed(() => {
  const list = room.value?.playerNames ?? [];
  return list.filter(n => !hasFlipped(n));
});

watch(
  () => room.value?.id,
  (id, oldId) => {
    if (id !== oldId) flipOrderLocal.value = [];
  }
);
watch(
  () => [room.value?.flipAll, room.value?.playerNames],
  () => {
    if (room.value?.flipAll && room.value?.playerNames?.length && flipOrderLocal.value.length === 0) {
      flipOrderLocal.value = [...room.value.playerNames];
    }
  },
  { immediate: true }
);

/** Mặc định ẩn/hiện chip list: random (auto) = ẩn, nhập tên (manual) = hiện. Chỉ set khi vào phòng (room.id đổi). */
watch(
  () => room.value?.id,
  (newId, oldId) => {
    if (newId && newId !== oldId && room.value?.flipAll) {
      showChipListInFlip.value = (room.value?.flipNameMode !== 'auto');
    }
  },
  { immediate: true }
);

watch(showFlipEditModal, (open) => {
  if (open) {
    flipEditList.value = [...flipOrderLocal.value];
  } else {
    if (flipEditList.value.length > 0) {
      flipOrderLocal.value = [...flipEditList.value];
    }
  }
});

/** Mở modal chúc mừng → đọc mở đầu rồi câu ý nghĩa (TTS), highlight từng từ. */
watch(showCongratulations, (open) => {
  if (open && congratsNewYearMessage.value) {
    const name = congratsPlayerName.value ? formatDisplayName(congratsPlayerName.value) : 'bạn';
    const intro = `Chúc mừng năm mới ${name}, tớ có câu này muốn tặng bạn.`;
    const fullText = `${intro} ${congratsNewYearMessage.value}`;
    const messageWordCount = congratsMessageWords.value.length;
    speakCongratsMessage(fullText, messageWordCount);
  }
});

const allHaveFlippedFlip = computed(() => {
  if (!room.value?.flipAll) return false;
  const flips = room.value.flips ?? [];
  const totalPeople = room.value.totalPeople ?? 0;
  return totalPeople > 0 && flips.length >= totalPeople;
});

const sortedFlips = computed(() => {
  const flips = room.value?.flips ?? [];
  return [...flips].sort((a, b) => a.timestamp - b.timestamp);
});

/** Đã lật hết tất cả thẻ chưa (cần đủ mới kích hoạt hiệu ứng người may mắn nhất) */
const allCardsFlipped = computed(() => {
  const map = flippedByCardIndex.value;
  const total = cardCount.value;
  if (total === 0) return false;
  for (let i = 0; i < total; i++) {
    if (!map.has(i)) return false;
  }
  return true;
});

/** Thẻ có số tiền cao nhất trong số thẻ do người chơi lật (bỏ qua Lật all). Chỉ có giá trị khi đã mở hết thẻ. */
const flipHighCardIndices = computed(() => {
  if (!allCardsFlipped.value) return new Set<number>();
  const map = flippedByCardIndex.value;
  const total = cardCount.value;
  if (total === 0) return new Set<number>();
  let maxAmount = -1;
  const indices: number[] = [];
  map.forEach((data, cardIndex) => {
    if (data.name === 'Lật all' || data.name === undefined) return;
    const amount = data.amount;
    if (amount == null || amount < 0) return;
    if (amount > maxAmount) {
      maxAmount = amount;
      indices.length = 0;
      indices.push(cardIndex);
    } else if (amount === maxAmount) {
      indices.push(cardIndex);
    }
  });
  return new Set(indices);
});

async function handleFlipAllReveals() {
  if (!room.value?.flipAll) return;
  flipAllRevealsLoading.value = true;
  const result = await setFlipAllReveals(room.value.id);
  flipAllRevealsLoading.value = false;
  if (!result.success) {
    const toast = await toastController.create({
      message: result.error || 'Lật all thất bại',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}

function setFlipEditName(index: number, value: unknown) {
  if (index >= 0 && index < flipEditList.value.length) {
    flipEditList.value = flipEditList.value.map((s, i) => (i === index ? String(value ?? '') : s));
  }
}

function setActiveFlipperFromEdit(name: string) {
  if (hasFlipped(name)) return;
  activeFlipperOverride.value = name.trim() || null;
}

function openResultDetail(item: { name: string; amount: number; timestamp?: number }) {
  selectedResultDetail.value = item;
  detailWishMessage.value = NEW_YEAR_WISHES[Math.floor(Math.random() * NEW_YEAR_WISHES.length)];
}

function openResultDetailByFlipperName(flipperName: string) {
  const f = (room.value?.flips ?? []).find(x => x.flipperName === flipperName);
  if (f) openResultDetail({ name: f.flipperName, amount: f.amount, timestamp: f.timestamp });
}

function onFlipEditDragStart(e: DragEvent, index: number) {
  flipEditDragFromIndex = index;
  e.dataTransfer!.effectAllowed = 'move';
  e.dataTransfer!.setData('text/plain', String(index));
  (e.target as HTMLElement)?.classList?.add('flip-edit-dragging');
}

function onFlipEditDragOver(e: DragEvent, index: number) {
  e.preventDefault();
  e.dataTransfer!.dropEffect = 'move';
}

function onFlipEditDrop(e: DragEvent, toIndex: number) {
  e.preventDefault();
  const from = flipEditDragFromIndex;
  if (from < 0 || from === toIndex) return;
  const list = [...flipEditList.value];
  const [item] = list.splice(from, 1);
  list.splice(toIndex, 0, item);
  flipEditList.value = list;
  flipEditDragFromIndex = -1;
}

function onFlipEditDragEnd(e: DragEvent) {
  (e.target as HTMLElement)?.classList?.remove('flip-edit-dragging');
  flipEditDragFromIndex = -1;
}

/** Trả về mảng ký tự số tiền đã format (để hiện từng số một) */
function getAmountCharList(cardIndex: number): string[] {
  const amount = flippedByCardIndex.value.get(cardIndex)?.amount;
  if (amount == null) return [];
  const str = Number(amount).toLocaleString('vi-VN');
  return str.split('');
}

async function handleFlip(cardIndex: number) {
  if (!room.value || !room.value.flipAll) return;
  // Trigger hiệu ứng "mở lì xì" ngay khi click (không chờ realtime update)
  if (!openingCardIndices.value.has(cardIndex)) {
    openingCardIndices.value.add(cardIndex);
    // cleanup sau khi animation mở bì chạy xong (kéo dài để hiệu ứng mở thẻ rõ hơn)
    window.setTimeout(() => {
      const next = new Set(openingCardIndices.value);
      next.delete(cardIndex);
      openingCardIndices.value = next;
    }, 2600);
  }
  const name = activeFlipperName.value;
  if (!name) {
    const toast = await toastController.create({
      message: 'Chưa có người nào để lật (đã lật hết lượt)',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }
  if (hasFlipped(name)) {
    const toast = await toastController.create({
      message: 'Người này đã lật rồi',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }
  if (flippedByCardIndex.value.has(cardIndex)) {
    return;
  }
  if (flipsCountLimit.value > 0 && (room.value.flips ?? []).length >= flipsCountLimit.value) {
    const toast = await toastController.create({
      message: 'Đã đủ số người lật',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  /* Khóa nhãn "Mời ... chọn lì xì" ngay từ lúc bấm để tránh nhấp nháy khi Firebase cập nhật flips trước khi addFlip trả về */
  congratsPlayerName.value = name;

  musicSwitch?.switchToQuaySo();

  let amount: number;
  let slotIndex: number | undefined;
  const cardAmounts = room.value.cardAmounts;
  if (cardAmounts && cardIndex >= 0 && cardIndex < cardAmounts.length && cardAmounts[cardIndex] !== undefined) {
    amount = cardAmounts[cardIndex];
    slotIndex = undefined;
  } else {
    const gen = generateRandomAmount(room.value);
    amount = typeof gen === 'object' ? gen.amount : gen;
    slotIndex = typeof gen === 'object' ? gen.slotIndex : undefined;
  }

  const result = await addFlip(room.value.id, name, amount, cardIndex, slotIndex);
  if (result.success) {
    congratsAmount.value = amount;
    activeFlipperOverride.value = null;
    /* Ngay khi lật: số tiền sẽ hiện dần từng chữ số (chưa rõ). Sau 2s mở modal; đóng modal thì số tiền hiện rõ. */
    lastFlippedCardIndex.value = cardIndex;
    cardIndicesPendingReveal.value = new Set([...cardIndicesPendingReveal.value, cardIndex]);
    if (delayCongratsTimer) clearTimeout(delayCongratsTimer);
    if (congratsTimer) clearTimeout(congratsTimer);
    delayCongratsTimer = setTimeout(() => {
      delayCongratsTimer = null;
      congratsNewYearMessage.value = NEW_YEAR_WISHES[Math.floor(Math.random() * NEW_YEAR_WISHES.length)];
      showCongratulations.value = true;
      // Không đóng sau 8s — chỉ đóng khi user chạm hoặc 1s sau khi TTS đọc xong (onEnd)
    }, 2000);
  } else {
    congratsPlayerName.value = '';
    musicSwitch?.switchToTet();
    const toast = await toastController.create({
      message: result.error || 'Lật thẻ thất bại',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}

const hasSpun = computed(() => {
  if (!room.value || !playerName.value) return false;
  return (room.value.spins || []).some(spin => spin.playerName === playerName.value);
});

const canSpin = computed(() => {
  if (!room.value || !playerName.value) return false;
  if (hasSpun.value) return false;
  const totalPeople = room.value.totalPeople ?? 0;
  if (totalPeople > 0 && (room.value.spins || []).length >= totalPeople) {
    return false;
  }
  return true;
});

const totalSpun = computed(() => {
  if (!room.value) return 0;
  return (room.value.spins || []).reduce((sum, spin) => sum + spin.amount, 0);
});

/** Tổng tiền đã lật (mode lật thẻ). */
const totalFlipped = computed(() => {
  if (!room.value?.flips) return 0;
  return room.value.flips.reduce((sum, f) => sum + f.amount, 0);
});

/** Số tiền cao nhất đã quay (mode quay). */
const maxSpun = computed(() => {
  const list = room.value?.spins;
  if (!list?.length) return 0;
  return Math.max(...list.map((s) => s.amount));
});

/** Số tiền cao nhất đã lật (mode lật thẻ). */
const maxFlipped = computed(() => {
  const list = room.value?.flips;
  if (!list?.length) return 0;
  return Math.max(...list.map((f) => f.amount));
});

const sortedSpins = computed(() => {
  if (!room.value) return [];
  return [...(room.value.spins || [])].sort((a, b) => b.timestamp - a.timestamp);
});

const isRoomOwner = computed(() => {
  return currentUser.value && room.value && room.value.createdBy === currentUser.value.uid;
});

const isComplete = computed(() => {
  if (!room.value || room.value.type !== 'total') return true;
  const totalPeople = room.value.totalPeople ?? 0;
  if (totalPeople <= 0) return false;
  return (room.value.spins || []).length >= totalPeople;
});

const isRoomFull = computed(() => {
  if (!room.value) return false;
  const totalPeople = room.value.totalPeople ?? 0;
  if (totalPeople <= 0) return false;
  const maxSpins = room.value.slots?.length ?? totalPeople;
  return (room.value.spins || []).length >= maxSpins;
});

const hasPreSetNames = computed(() => (room.value?.playerNames?.length ?? 0) > 0);

const preSetNamesList = computed(() => room.value?.playerNames ?? []);
const remainingPreSetNames = computed(() => preSetNamesList.value.filter(n => !isNameSpun(n)));

/** Khi có đủ tên cài sẵn = totalPeople thì chỉ hiện list, không hiện input nhập tay (totalPeople > 0) */
const showNameInputOnlyFromList = computed(() => {
  const totalPeople = room.value?.totalPeople ?? 0;
  if (totalPeople <= 0 || !room.value?.playerNames?.length) return false;
  return room.value.playerNames.length >= totalPeople;
});

function preSetNameKey(name: string, index: number): string {
  return `${name}-${index}`;
}

function isNameSpun(name: string): boolean {
  return (room.value?.spins ?? []).some(s => s.playerName === name);
}

async function selectPreSetName(name: string) {
  if (isNameSpun(name)) {
    const toast = await toastController.create({
      message: 'Người này đã quay rồi',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }
  playerName.value = name;
  inputName.value = '';
  nameError.value = '';
}

const showResults = computed(() => {
  if (!room.value) return false;
  if (room.value.flipAll) {
    const flips = room.value.flips ?? [];
    const totalPeople = room.value.totalPeople ?? 0;
    const hasFlipAllReveals = (room.value.flipAllReveals?.length ?? 0) > 0;
    return flips.length >= totalPeople || hasFlipAllReveals;
  }
  const spins = room.value.spins || [];
  const totalPeople = room.value.totalPeople ?? 0;
  if (totalPeople <= 0) {
    return spins.length >= 1;
  }
  const imm = room.value.showResultsImmediately;
  if (imm === true) {
    return spins.length >= 1;
  }
  if (imm === false) {
    return isComplete.value;
  }
  if (room.value.type === 'total') {
    return isComplete.value;
  }
  return true;
});

const winner = computed(() => {
  if (!room.value || !isComplete.value || (room.value.spins || []).length === 0) return null;
  const spins = room.value.spins || [];
  return spins.reduce((max, spin) => spin.amount > max.amount ? spin : max, spins[0]);
});

const loadRoom = async () => {
  loading.value = true;
  const result = await getRoom(roomCode);
  loading.value = false;

  if (result.success && result.room) {
    room.value = result.room;
    // Kiểm tra quyền truy cập ban đầu
    if (isRoomOwner.value || !result.room.password) {
      hasAccessToDetails.value = true;
    }
    subscribeToRoom();
  } else {
    const toast = await toastController.create({
      message: result.error || 'Không tìm thấy phòng',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
};

const subscribeToRoom = () => {
  if (!room.value) return;
  unsubscribe = subscribeRoom(room.value.id, (updatedRoom) => {
    if (updatedRoom) {
      room.value = updatedRoom;
      // Nếu là chủ phòng, tự động có quyền xem chi tiết
      if (isRoomOwner.value) {
        hasAccessToDetails.value = true;
      }
      // Nếu không có mật khẩu, tự động có quyền xem chi tiết
      if (!updatedRoom.password) {
        hasAccessToDetails.value = true;
      }
    }
  });
};

const checkPassword = () => {
  if (!room.value) return;
  
  if (passwordInput.value === room.value.password) {
    hasAccessToDetails.value = true;
    showPasswordModal.value = false;
    passwordInput.value = '';
    passwordError.value = '';
  } else {
    passwordError.value = 'Mật khẩu không đúng';
  }
};

const getConfettiStyle = (index: number) => {
  const colors = ['#ec4899', '#f472b6', '#fbcfe8', '#fdf2f8', '#be185d'];
  const left = (index * 2) % 100;
  const delay = (index * 0.1) % 3;
  const color = colors[index % colors.length];
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    background: color,
    borderRadius: index % 2 === 0 ? '50%' : '0'
  };
};

const setPlayerName = () => {
  const name = inputName.value.trim();
  if (!name) {
    return;
  }
  if (room.value && (room.value.spins || []).some(spin => spin.playerName === name)) {
    nameError.value = 'Tên này đã quay rồi. Vui lòng nhập tên khác.';
    return;
  }
  nameError.value = '';
  playerName.value = name;
  inputName.value = '';
};

const resetPlayerName = () => {
  playerName.value = '';
  lastResult.value = null;
};

const handleSpin = async () => {
  if (!room.value || !playerName.value || !canSpin.value || isSpinning.value) return;

  musicSwitch?.switchToQuaySo();
  isSpinning.value = true;
  lastResult.value = null;
  spinImageIndex.value = 0;

  // Nhảy ảnh chậm rồi nhanh dần (bắt đầu ~500ms, cuối ~100ms)
  if (spinImageTimeout) clearTimeout(spinImageTimeout);
  const spinStartTime = Date.now();
  const SPIN_DURATION = 5000;
  const scheduleNextImage = () => {
    const elapsed = Date.now() - spinStartTime;
    if (elapsed >= SPIN_DURATION) {
      spinImageTimeout = null;
      return;
    }
    spinImageIndex.value = (spinImageIndex.value + 1) % 5;
    const delay = Math.max(100, 500 - elapsed * 0.2);
    spinImageTimeout = window.setTimeout(scheduleNextImage, delay);
  };
  spinImageTimeout = window.setTimeout(scheduleNextImage, 500);

  await new Promise(resolve => setTimeout(resolve, SPIN_DURATION));

  if (spinImageTimeout) {
    clearTimeout(spinImageTimeout);
    spinImageTimeout = null;
  }

  const gen = generateRandomAmount(room.value);
  const amount = typeof gen === 'object' ? gen.amount : gen;
  const slotIndex = typeof gen === 'object' ? gen.slotIndex : undefined;
  lastResult.value = amount;

  const result = await addSpin(room.value.id, playerName.value, amount, slotIndex);
  isSpinning.value = false;

  if (result.success) {
    congratsAmount.value = amount;
    congratsPlayerName.value = playerName.value;
    congratsNewYearMessage.value = NEW_YEAR_WISHES[Math.floor(Math.random() * NEW_YEAR_WISHES.length)];
    showCongratulations.value = true;
    if (congratsTimer) clearTimeout(congratsTimer);
    // Không đóng sau 8s — chỉ đóng khi user chạm hoặc 1s sau khi TTS đọc xong (onEnd)
  } else {
    musicSwitch?.switchToTet();
    const toast = await toastController.create({
      message: result.error || 'Quay thất bại',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
    lastResult.value = null;
  }
};

/** Giọng tiếng Việt từ Web Speech (nếu có). */
function getVietnameseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const byLang = voices.find((v) => (v.lang || '').replace('_', '-').toLowerCase() === 'vi-vn' || (v.lang || '').toLowerCase().startsWith('vi'));
  if (byLang) return byLang;
  const names = ['vietnamese', 'tiếng việt', 'tieng viet', 'an', 'mai', 'linh'];
  return voices.find((v) => names.some((k) => (v.name || '').toLowerCase().includes(k))) ?? null;
}

/** Fallback: đọc bằng Web Speech API (khi Google TTS không có trên production). Gọi onEnd khi đọc xong hoặc lỗi để modal vẫn tự tắt. */
function speakWithWebSpeech(text: string, onEnd?: () => void) {
  const raw = text?.trim();
  if (!raw || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  const u = new SpeechSynthesisUtterance(raw);
  u.lang = 'vi-VN';
  const vi = getVietnameseVoice();
  if (vi) u.voice = vi;
  u.rate = 1.0;
  u.volume = 1;
  const done = () => {
    speakingWordIndex.value = -1;
    musicSwitch?.restoreMusicVolume?.();
    onEnd?.();
  };
  u.addEventListener('end', done);
  u.addEventListener('error', done);
  const syn = window.speechSynthesis;
  const trySpeak = () => {
    const v = getVietnameseVoice();
    if (v) u.voice = v;
    syn.speak(u);
  };
  const runSpeak = () => {
    if (syn.getVoices().length > 0) trySpeak();
    else syn.addEventListener('voiceschanged', () => { trySpeak(); }, { once: true });
  };
  if (typeof (window as any)?.Capacitor?.isNativePlatform === 'function' && (window as any).Capacitor.isNativePlatform()) {
    setTimeout(runSpeak, 50);
  } else {
    runSpeak();
  }
}

/** Đọc nhanh hơn + highlight từng từ câu chúc (ước lượng theo thời gian). */
function speakCongratsMessage(fullText: string, messageWordCount: number) {
  const raw = fullText?.trim();
  if (!raw || typeof window === 'undefined') return;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  googleTTSCancel.value?.();
  clearWordHighlightTimers();
  speakingWordIndex.value = -1;
  musicSwitch?.setMusicVolume?.(0.22);

  const messageLen = congratsNewYearMessage.value?.length ?? 0;
  const introLen = Math.max(0, raw.length - messageLen - 1);
  const TTS_PLAYBACK_RATE = 1.0;
  const CHARS_PER_SEC = 11;
  const totalDurationSec = raw.length / CHARS_PER_SEC;
  const introDurationSec = totalDurationSec * (introLen / raw.length);
  const messageDurationSec = totalDurationSec - introDurationSec;
  const wordIntervalMs = messageWordCount > 0 ? (messageDurationSec * 1000) / messageWordCount : 0;

  const onEnd = () => {
    clearWordHighlightTimers();
    speakingWordIndex.value = -1;
    musicSwitch?.restoreMusicVolume?.();
    congratsAutoCloseTimeoutId.value = setTimeout(() => {
      congratsAutoCloseTimeoutId.value = null;
      closeCongratulations();
    }, 2500);
  };

  const FALLBACK_CLOSE_MS = 15000;
  congratsFallbackCloseId.value = window.setTimeout(() => {
    congratsFallbackCloseId.value = null;
    if (showCongratulations.value) {
      clearWordHighlightTimers();
      speakingWordIndex.value = -1;
      musicSwitch?.restoreMusicVolume?.();
      closeCongratulations();
    }
  }, FALLBACK_CLOSE_MS);

  const clearFallback = () => {
    if (congratsFallbackCloseId.value != null) {
      clearTimeout(congratsFallbackCloseId.value);
      congratsFallbackCloseId.value = null;
    }
  };

  googleTTSCancel.value = playVietnameseTTS(raw, {
    lang: 'vi',
    playbackRate: TTS_PLAYBACK_RATE,
    onEnd: () => {
      clearFallback();
      onEnd();
    },
    onUnavailable: () => {
      clearFallback();
      speakWithWebSpeech(raw, onEnd);
    }
  });

  if (messageWordCount > 0 && wordIntervalMs > 0) {
    wordHighlightTimeoutId.value = setTimeout(() => {
      wordHighlightTimeoutId.value = null;
      let idx = 0;
      wordHighlightIntervalId.value = setInterval(() => {
        speakingWordIndex.value = idx;
        idx++;
        if (idx >= messageWordCount) {
          clearWordHighlightTimers();
        }
      }, wordIntervalMs);
    }, introDurationSec * 1000);
  }
}

const closeCongratulations = () => {
  if (congratsAutoCloseTimeoutId.value != null) {
    clearTimeout(congratsAutoCloseTimeoutId.value);
    congratsAutoCloseTimeoutId.value = null;
  }
  if (congratsFallbackCloseId.value != null) {
    clearTimeout(congratsFallbackCloseId.value);
    congratsFallbackCloseId.value = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  googleTTSCancel.value?.();
  googleTTSCancel.value = null;
  clearWordHighlightTimers();
  speakingWordIndex.value = -1;
  musicSwitch?.restoreMusicVolume?.();
  musicSwitch?.switchToTet();
  const cardToReveal = lastFlippedCardIndex.value;
  if (cardToReveal !== null) {
    cardIndicesPendingReveal.value = new Set([...cardIndicesPendingReveal.value].filter((idx) => idx !== cardToReveal));
    cardIndicesJustRevealed.value = new Set([...cardIndicesJustRevealed.value, cardToReveal]);
    setTimeout(() => {
      cardIndicesJustRevealed.value = new Set([...cardIndicesJustRevealed.value].filter((idx) => idx !== cardToReveal));
    }, 2500);
    lastFlippedCardIndex.value = null;
  }
  showCongratulations.value = false;
  congratsAmount.value = null;
  congratsPlayerName.value = '';
  congratsNewYearMessage.value = '';
  playerName.value = '';
  inputName.value = '';
  lastResult.value = null;
  nameError.value = '';
  if (delayCongratsTimer) {
    clearTimeout(delayCongratsTimer);
    delayCongratsTimer = null;
  }
  if (congratsTimer) {
    clearTimeout(congratsTimer);
    congratsTimer = null;
  }
};

const getFireworkStyle = (index: number) => {
  const positions = [
    { left: '10%', top: '20%' },
    { left: '90%', top: '25%' },
    { left: '50%', top: '12%' },
    { left: '25%', top: '75%' },
    { left: '75%', top: '70%' },
    { left: '5%', top: '50%' },
    { left: '95%', top: '45%' },
    { left: '30%', top: '35%' },
    { left: '70%', top: '40%' },
    { left: '20%', top: '55%' },
    { left: '80%', top: '60%' },
    { left: '50%', top: '80%' },
    { left: '40%', top: '15%' },
    { left: '60%', top: '65%' }
  ];
  const pos = positions[index % positions.length];
  return {
    left: pos.left,
    top: pos.top,
    animationDelay: `${(index % 5) * 0.25}s`
  };
};

const getParticleStyle = (fireworkIndex: number, particleIndex: number) => {
  const angle = (particleIndex / 18) * 360;
  const colors = ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#ec4899', '#a855f7', '#22d3ee', '#f472b6'];
  const color = colors[(fireworkIndex + particleIndex) % colors.length];
  const delay = (fireworkIndex % 6) * 0.35 + particleIndex * 0.015;
  return {
    '--angle': `${angle}deg`,
    '--color': color,
    animationDelay: `${delay}s`
  };
};

const generateQRCode = async () => {
  if (!room.value) {
    console.warn('Room not available for QR code generation');
    return;
  }
  
  // Đợi DOM render xong
  await nextTick();
  
  // Đợi thêm một chút để đảm bảo canvas đã được render
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (!qrCanvas.value) {
    console.error('QR Canvas element not found');
    return;
  }
  
  const url = `${window.location.origin}/room/${room.value.roomCode}`;
  console.log('Generating QR code for URL:', url);
  
  try {
    // Clear canvas trước
    const ctx = qrCanvas.value.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, qrCanvas.value.width, qrCanvas.value.height);
    }
    
    await QRCode.toCanvas(qrCanvas.value, url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#ec4899',
        light: '#ffffff'
      }
    });
    console.log('✅ QR code generated successfully');
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
  }
};

const onQRModalPresent = async () => {
  // Đợi modal hoàn toàn hiển thị
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 200));
  await generateQRCode();
};

const shareRoom = async () => {
  if (!room.value) return;
  
  const url = `${window.location.origin}/room/${room.value.roomCode}`;
  const text = `Tham gia phòng lì xì: ${room.value.roomCode}\n${url}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Phòng Lì Xì',
        text: text,
        url: url
      });
    } catch (error) {
      // User cancelled or error
    }
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(text);
    const toast = await toastController.create({
      message: 'Đã sao chép link phòng',
      duration: 2000,
      color: 'success'
    });
    await toast.present();
  }
};

// Sử dụng @didPresent thay vì watch để đảm bảo modal đã render xong

onMounted(() => {
  loadRoom();
  /* Mới vào phòng thì mở nhạc luôn (nếu chưa phát). */
  musicSwitch?.startMusic?.();
  nguaInterval = setInterval(() => {
    nguaToggle.value = !nguaToggle.value;
  }, 1800);
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
  if (delayCongratsTimer) clearTimeout(delayCongratsTimer);
  if (congratsTimer) clearTimeout(congratsTimer);
  if (spinImageTimeout) clearTimeout(spinImageTimeout);
  if (nguaInterval) clearInterval(nguaInterval);
});
</script>

<style scoped>
/* Header trong suốt, chữ nổi bật — thêm safe-area để không bị che trên mobile */
.room-header-transparent ion-toolbar {
  --background: transparent;
  --border-width: 0;
  --min-height: calc(56px + env(safe-area-inset-top, 0px));
  --padding-top: calc(8px + env(safe-area-inset-top, 0px));
  --padding-bottom: 8px;
  position: relative;
}

.room-header-newyear-wrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  pointer-events: none;
  padding: 0 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
}

/* Gõ từng chữ: c h ú c ... (có dấu cách giữa các chữ) */
.room-header-char {
  display: inline-block;
  margin-right: 0.18em;
  font-family: 'Dancing Script', cursive;
  font-size: clamp(1.35rem, 5.5vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 0;
  color: #fef08a;
  text-shadow:
    0 0 2px rgba(255, 255, 255, 0.95),
    0 1px 12px rgba(0, 0, 0, 0.5),
    0 0 28px rgba(251, 191, 36, 0.6),
    0 0 48px rgba(245, 158, 11, 0.35);
  -webkit-text-stroke: 2px #dc2626;
  paint-order: stroke fill;
  filter: drop-shadow(0 0 10px rgba(220, 38, 38, 0.6));
  opacity: 0;
  animation: room-header-char-in 5s ease-in-out infinite both;
}

/* Con trỏ + hiệu ứng kim tuyến (lấp lánh) khi gõ */
.room-header-caret {
  display: inline-block;
  width: 2px;
  height: 0.85em;
  margin-left: 0;
  vertical-align: -0.12em;
  background: linear-gradient(180deg, #fef08a 0%, #fcd34d 40%, #dc2626 100%);
  border-radius: 1px;
  box-shadow:
    0 0 8px rgba(254, 240, 138, 0.9),
    0 0 16px rgba(251, 191, 36, 0.7),
    0 0 24px rgba(245, 158, 11, 0.5),
    0 0 6px rgba(220, 38, 38, 0.8);
  animation:
    room-header-caret-blink 0.9s steps(1, end) infinite,
    room-header-glitter 1.2s ease-in-out infinite;
}

@keyframes room-header-char-in {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes room-header-caret-blink {
  0%, 45% { opacity: 1; }
  50%, 100% { opacity: 0.35; }
}

@keyframes room-header-glitter {
  0%, 100% { filter: brightness(1) drop-shadow(0 0 6px rgba(254, 240, 138, 0.9)); }
  50% { filter: brightness(1.35) drop-shadow(0 0 14px rgba(254, 240, 138, 0.95)) drop-shadow(0 0 20px rgba(251, 191, 36, 0.8)); }
}

.room-header-title {
  color: #fff;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.02em;
}

.room-header-title-hidden {
  pointer-events: none;
}

.room-header-title-shadow {
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.8),
    0 2px 8px rgba(0, 0, 0, 0.5),
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 0 1px rgba(0, 0, 0, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
}

.room-header-btn {
  --color: #fff;
  --color-hover: #fff;
  --color-activated: rgba(255, 255, 255, 0.8);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.room-header-icon-btn {
  --padding-start: 10px;
  --padding-end: 10px;
  --border-radius: 20px;
  --color: rgba(255, 255, 255, 0.92);
  --color-hover: rgba(255, 255, 255, 0.98);
  --color-activated: rgba(255, 255, 255, 0.85);
  margin-inline-start: 4px;
  background: rgba(255, 255, 255, 0.18);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.35),
    0 2px 8px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  filter: drop-shadow(0 2px 4px #00000080) drop-shadow(0 0 12px #0000004d);
}

.room-header-icon-btn ion-icon {
  font-size: 1.35rem;
  color: rgba(255, 255, 255, 0.92);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
}

.room-header-transparent ion-back-button::part(native) {
  color: #fff;
}

/* Cột 3 icon theo chiều dọc: thông tin, QR, loa */
.room-header-icon-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.room-header-icon-column .room-header-icon-btn {
  margin-inline-start: 0;
  margin: 2px 0;
}

.room-content {
  --background: url('../assets/images/nen.webp') top center / cover no-repeat;
  /* Tránh header che nội dung — vừa đủ cho header ~44px */
  --padding-top: calc(52px + env(safe-area-inset-top, 0px));
}
.room-content-flip {
  --padding-top: 0;
}

/* Wrap: ảnh ngựa + chữ như lời nói (top-right của ảnh) */
.room-corner-ngua-wrap {
  position: fixed;
  top: calc(8px + env(safe-area-inset-top, 0px));
  left: calc(-28px + env(safe-area-inset-left, 0px));
  z-index: 90;
  pointer-events: none;
}

.room-corner-ngua {
  position: relative;
  width: clamp(96px, 24vw, 220px);
  height: clamp(96px, 24vw, 220px);
}
.room-corner-ngua-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transform: scale(0.98);
  transition:
    opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  filter:
    drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))
    drop-shadow(0 8px 24px rgba(0, 0, 0, 0.35))
    drop-shadow(0 0 14px rgba(255, 255, 255, 0.85))
    drop-shadow(0 0 28px rgba(255, 255, 255, 0.5));
}
.room-corner-ngua-img.room-corner-ngua-active {
  opacity: 1;
  transform: scale(1.02);
}

/* Chữ "lời nói" của ngựa: bong bóng to hơn, sát ảnh; kiểu giống Yến */
.room-flip-ngua-label {
  position: absolute;
  left: 60%;
  top: 12px;
  margin: 0 0 0 2px;
  padding: 10px 14px 12px;
  font-size: clamp(1rem, 4vw, 1.25rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: 0.01em;
  color: #111827;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  border: 2px solid rgba(220, 38, 38, 0.65);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.22),
    0 0 18px rgba(255, 215, 0, 0.18);
  text-align: left;
  white-space: nowrap;
}

.room-flip-ngua-label .flip-invite-name {
  color: #b45309;
  font-size: 1em;
}

.room-content::part(background) {
  opacity: 0.92;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.room-container {
  padding: 20px;
  position: relative;
}

/* Màn hình lớn: giảm padding-top cho gọn */
@media (min-width: 769px) {
  .room-content {
    --padding-top: calc(48px + env(safe-area-inset-top, 0px));
  }
  .room-container {
    padding-top: 12px;
  }
}

@media (max-width: 768px) {
  .room-container {
    padding-top: 12px;
  }

  .room-content {
    --padding-top: calc(52px + env(safe-area-inset-top, 0px));
  }
  .room-header-char {
    font-size: clamp(1.2rem, 4.5vw, 1.65rem);
  }
}
@media (max-width: 480px) {
  .room-content {
    --padding-top: calc(52px + env(safe-area-inset-top, 0px));
  }
}

.spin-card,
.results-card {
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(236, 72, 153, 0.25);
  margin-bottom: 20px;
  overflow: hidden;
}

.spin-card {
  background: linear-gradient(160deg, rgba(236, 72, 153, 0.18) 0%, rgba(251, 207, 232, 0.25) 50%, rgba(253, 242, 248, 0.9) 100%);
  border: 1px solid rgba(236, 72, 153, 0.2);
}

.results-card {
  background: rgba(255, 255, 255, 0.95);
}

.spin-card ion-card-content {
  padding: 24px 20px;
}

.info-modal-content {
  padding: 20px;
}

.info-modal-content p,
.info-modal-content .info-row {
  margin: 12px 0;
  color: #4b5563;
}

.info-modal-content .info-divider {
  margin: 16px 0;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.info-locked-text {
  text-align: center;
  margin-bottom: 20px !important;
  color: #6b7280;
}

.pre-set-names-section {
  margin-bottom: 20px;
}

.pre-set-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  margin: 0 0 12px 0;
}

.pre-set-empty {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  text-align: center;
}

.pre-set-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.flip-open-btn {
  --border-radius: 18px;
  height: 52px;
  font-weight: 800;
  font-size: 1.05rem;
  text-transform: none;
  box-shadow: 0 10px 28px rgba(236, 72, 153, 0.35);
}

.flip-fullscreen-content {
  padding: calc(20px + env(safe-area-inset-top, 0px)) 16px 32px;
  min-height: 100%;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  overflow: visible;
  position: relative;
}

/* Khối góc phải: chỉ cột icon (thông tin, QR, loa) */
/* Cột trái: Chỉnh sửa + Lật all, căn giữa chiều dọc — hiệu ứng giống tet-music-toggle */
.room-flip-left-buttons {
  position: fixed;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-left: env(safe-area-inset-left, 0px);
}
.room-flip-left-btn {
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
.room-flip-left-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25), 0 0 24px rgba(236, 72, 153, 0.35);
}
.room-flip-left-btn:active {
  transform: scale(0.98);
}
.room-flip-left-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.room-flip-left-btn ion-icon {
  font-size: 26px;
}
.room-flip-left-btn ion-spinner {
  width: 26px;
  height: 26px;
}

.room-flip-right-block {
  position: fixed;
  top: calc(12px + env(safe-area-inset-top, 0px));
  right: 12px;
  z-index: 100;
}

.room-flip-icon-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 6px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.15) 100%);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}
.room-flip-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.room-flip-icon-btn ion-icon {
  font-size: 1.25rem;
}
.room-flip-icon-btn:active {
  background: rgba(255, 255, 255, 0.35);
}

.flip-fullscreen-content .flip-section-title {
  margin-top: 20px;
}

.flip-fullscreen-content .next-person-hint {
  color: #831843;
  text-shadow: none;
}

/* Hàng chỉ còn 2 nút Lật all + Chỉnh sửa */
.flip-label-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 0 14px 0;
  padding: 0 4px;
}

.flip-prominent-label-btn {
  flex: 1 1 0;
  min-width: 0;
  display: block;
  margin: 0;
  padding: 0 4px 0 0;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
}

/* Chọn người lật / Chạm để lật — chỉ chữ, nổi bật; dài thì ... và chạm xem full */
.flip-prominent-label {
  margin: 0;
  padding: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.04em;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.6),
    0 4px 14px rgba(0, 0, 0, 0.45),
    0 0 24px rgba(190, 24, 93, 0.5),
    0 0 40px rgba(236, 72, 153, 0.35);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Tên người chơi trong câu "Mời ... chọn lì xì nè" — nổi bật vàng */
.flip-invite-name {
  display: inline-block;
  margin: 0 2px;
  padding: 2px 10px 4px;
  font-size: 1.1em;
  font-weight: 900;
  color: #fef3c7;
  letter-spacing: 0.05em;
  text-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.35),
    0 2px 6px rgba(0, 0, 0, 0.5),
    0 0 18px rgba(251, 191, 36, 0.65),
    0 0 28px rgba(245, 158, 11, 0.45);
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.3) 100%);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

/* Tên người lật cùng hàng với "Chọn người lật:", nổi bật */
.flip-selected-name {
  display: inline-block;
  margin-left: 2px;
  padding: 2px 10px 4px;
  font-size: 1.15em;
  font-weight: 900;
  color: #fef3c7;
  letter-spacing: 0.06em;
  text-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.3),
    0 2px 6px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(251, 191, 36, 0.6),
    0 0 32px rgba(245, 158, 11, 0.4);
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.25) 100%);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.flip-fullscreen-content .flip-grid {
  margin-top: 14px;
}

.flip-label-row-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.flip-chip-row-buttons {
  margin-left: 8px;
}

.flip-label-row-buttons .flip-all-btn-inline,
.flip-label-row-buttons .flip-edit-btn-inline {
  flex: 0 0 auto;
  min-width: 40px;
  width: 40px;
}

.flip-all-btn-inline {
  --border-radius: 12px;
  height: 40px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: none;
  margin: 0;
  --padding-start: 0;
  --padding-end: 0;
}

.flip-all-btn-inline ion-icon {
  font-size: 1.5rem;
}

.flip-edit-btn-inline {
  --border-radius: 12px;
  height: 40px;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: none;
  margin: 0;
  white-space: nowrap;
  --padding-start: 0;
  --padding-end: 0;
}

.flip-edit-btn-inline::part(native) {
  white-space: nowrap;
}

.flip-edit-btn-inline ion-icon {
  font-size: 1.5rem;
  margin-right: 0;
  vertical-align: middle;
}

@media (max-width: 768px) {
  .room-flip-ngua-label {
    font-size: 0.82rem;
    padding: 5px 8px 6px;
  }
}

.flip-chip-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 4px;
  min-height: 0;
}

.flip-chip-list-scroll {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: grab;
  user-select: none;
}

.flip-chip-list-scroll:active {
  cursor: grabbing;
}

.flip-chip-list-scroll-dragging {
  cursor: grabbing;
  user-select: none;
}

.flip-chip-list-scroll::-webkit-scrollbar {
  display: none;
}

.flip-chip-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  padding: 4px 0;
}

.flip-chip {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.06);
  color: #374151;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.flip-chip-name-text {
  font-weight: 700;
  letter-spacing: 0.02em;
}

.flip-chip-clickable {
  cursor: pointer;
}

.flip-chip-clickable:hover {
  background: rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.12);
}

.flip-chip-active {
  background: rgba(34, 197, 94, 0.2);
  color: #15803d;
  border-color: rgba(34, 197, 94, 0.5);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.35);
}

.flip-chip-done {
  background: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
  border-color: rgba(239, 68, 68, 0.3);
  cursor: pointer;
}


.flip-modal-content {
  padding: 18px 16px 28px;
}

.flip-section-title {
  margin: 14px 0 10px;
  font-size: 1rem;
  font-weight: 800;
  color: #831843;
}

.flip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  gap: 12px;
  margin-top: 10px;
  width: 100%;
  max-width: 100%;
  overflow: visible;
}

.flip-card {
  border: none;
  border-radius: 14px;
  padding: 0;
  width: 100%;
  min-width: 176px;
  height: auto;
  aspect-ratio: 176 / 216;
  cursor: pointer;
  background: transparent;
  perspective: 480px;
  -webkit-tap-highlight-color: transparent;
  overflow: visible;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 14px;
  transform-style: preserve-3d;
  box-shadow: 0 4px 16px rgba(190, 24, 93, 0.2);
  overflow: visible;
}

/* Thẻ cao nhất: viền vàng cam đỏ + shadow (chỉ khi đã mở hết thẻ) */
.flip-card.highCard .flip-card-inner {
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.35),
    0 12px 32px rgba(0, 0, 0, 0.25),
    0 0 0 4px rgba(251, 191, 36, 0.95),
    0 0 16px rgba(245, 158, 11, 0.6),
    0 0 28px rgba(220, 38, 38, 0.4);
  animation: high-card-glow 1.8s ease-in-out infinite;
}

.flip-card.highCard.flipped {
  transform: scale(1.16);
  z-index: 10;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 10px 28px rgba(0, 0, 0, 0.4));
}

/* Ghi đè animation: none để highCard vẫn chạy glow */
.flip-card.highCard.flipped .flip-card-inner {
  animation: high-card-glow 1.8s ease-in-out infinite !important;
}

/* Badge "Người may mắn nhất" + sao: căn giữa, không dùng pseudo để tránh lệch */
.flip-high-badge {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 2;
  pointer-events: none;
}

.flip-high-badge-text {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fef3c7;
  letter-spacing: 0.03em;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.9),
    0 2px 4px rgba(0, 0, 0, 0.6),
    0 0 8px rgba(251, 191, 36, 0.6);
  white-space: nowrap;
}

.flip-high-badge-star {
  font-size: 1.35rem;
  font-weight: 900;
  color: #fcd34d;
  line-height: 1;
  text-shadow:
    0 0 12px rgba(251, 191, 36, 0.95),
    0 0 24px rgba(245, 158, 11, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.7);
  animation: high-card-star 1.5s ease-in-out infinite;
}

@keyframes high-card-star {
  0%, 100% { opacity: 1; transform: scale(1); filter: brightness(1); }
  50% { opacity: 0.95; transform: scale(1.15); filter: brightness(1.2); }
}

@keyframes high-card-glow {
  0%, 100% {
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.35),
      0 12px 32px rgba(0, 0, 0, 0.25),
      0 0 0 4px rgba(251, 191, 36, 0.95),
      0 0 16px rgba(245, 158, 11, 0.6),
      0 0 28px rgba(220, 38, 38, 0.4);
    filter: brightness(1.05);
  }
  50% {
    box-shadow:
      0 10px 28px rgba(0, 0, 0, 0.4),
      0 14px 36px rgba(0, 0, 0, 0.28),
      0 0 0 5px rgba(253, 224, 71, 0.95),
      0 0 22px rgba(245, 158, 11, 0.7),
      0 0 36px rgba(220, 38, 38, 0.5);
    filter: brightness(1.1);
  }
}

/* Mở lì xì (không lật thẻ): chuyển mặt trước -> mặt sau bằng opacity */
.flip-card.flipped .flip-card-inner {
  animation: none;
}

.flip-card:not(.flipped) .flip-card-inner {
  transform: none;
}

@keyframes flip-card-open {
  0% {
    transform: rotateY(0deg) rotateZ(0deg);
  }
  10% {
    transform: rotateY(18deg) rotateZ(-2deg);
  }
  22% {
    transform: rotateY(36deg) rotateZ(1.8deg);
  }
  34% {
    transform: rotateY(54deg) rotateZ(-1.5deg);
  }
  46% {
    transform: rotateY(72deg) rotateZ(1.2deg);
  }
  58% {
    transform: rotateY(90deg) rotateZ(-0.8deg);
  }
  70% {
    transform: rotateY(108deg) rotateZ(0.5deg);
  }
  82% {
    transform: rotateY(126deg) rotateZ(-0.3deg);
  }
  92% {
    transform: rotateY(162deg) rotateZ(0.1deg);
  }
  100% {
    transform: rotateY(180deg) rotateZ(0deg);
  }
}

.flip-card-face {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: opacity 0.35s ease;
}
/* Mặt trước luôn cho bì lì xì tràn ra khi phóng to */
.flip-card-face.flip-card-front {
  overflow: visible;
}

.flip-card-front { opacity: 1; overflow: visible; z-index: 1; }
.flip-card-back { opacity: 0; z-index: 0; }
/* Khi mở: mặt trước (bì lì xì) luôn nổi trên, không bị cắt khi phóng to */
.flip-card.flipped .flip-card-front,
.flip-card.opening .flip-card-front {
  z-index: 10;
  overflow: visible !important;
}
.flip-card.flipped .flip-card-inner,
.flip-card.opening .flip-card-inner {
  overflow: visible !important;
}
.flip-card.flipped .flip-envelope,
.flip-card.opening .flip-envelope {
  z-index: 999;
}
.flip-card.flipped .flip-card-front { opacity: 0; transition-delay: 1.35s; }
.flip-card.flipped .flip-card-back { opacity: 1; transition-delay: 1.35s; }

.flip-card-front {
  background:
    linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)),
    url('../assets/images/bia.webp') center / cover no-repeat;
  border: 2px solid rgba(255, 255, 255, 0.35);
  box-shadow: inset 0 2px 12px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
}

/* Rung rinh bì lì xì khi chưa lật */
.flip-card:not(.flipped) .flip-envelope {
  animation: envelope-wobble 2.5s ease-in-out infinite;
}

.flip-card.flipped .flip-envelope,
.flip-card.opening .flip-envelope {
  animation: envelope-zoom-open 2.2s cubic-bezier(0.18, 0.95, 0.2, 1) 0.02s both;
}

@keyframes envelope-zoom-open {
  0% {
    transform: scale(1) translateY(0) rotateZ(0deg);
    opacity: 1;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
  }
  25% {
    transform: scale(1.38) translateY(-22px) rotateZ(-1deg);
    opacity: 1;
    filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.22))
      drop-shadow(0 0 28px rgba(251, 191, 36, 0.6))
      drop-shadow(0 0 44px rgba(245, 158, 11, 0.3))
      brightness(1.12);
  }
  35% {
    transform: scale(1.48) translateY(-28px) rotateZ(-1.2deg);
    opacity: 1;
    filter: drop-shadow(0 8px 22px rgba(0, 0, 0, 0.2))
      drop-shadow(0 0 36px rgba(251, 191, 36, 0.7))
      drop-shadow(0 0 52px rgba(245, 158, 11, 0.35))
      brightness(1.18);
  }
  70% {
    transform: scale(1.32) translateY(-18px) rotateZ(0.8deg);
    opacity: 0.95;
    filter: drop-shadow(0 5px 16px rgba(0, 0, 0, 0.2))
      drop-shadow(0 0 22px rgba(251, 191, 36, 0.4))
      brightness(1.08);
  }
  100% {
    transform: scale(1.04) translateY(4px) rotateZ(0deg);
    opacity: 0;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
  }
}

@keyframes envelope-wobble {
  0%, 100% {
    transform: rotateZ(-1.2deg) scale(1) translateY(0);
  }
  25% {
    transform: rotateZ(1.1deg) scale(1.06) translateY(-1px);
  }
  50% {
    transform: rotateZ(-1deg) scale(0.96) translateY(0.5px);
  }
  75% {
    transform: rotateZ(1.2deg) scale(1.05) translateY(-0.5px);
  }
}

.flip-envelope {
  position: relative;
  width: 128px;
  height: 156px;
  perspective: 700px;
  z-index: 2;
}

.flip-envelope-body {
  position: absolute;
  inset: 0;
  background: url('../assets/images/bi.webp') center / cover no-repeat;
  border-radius: 8px 8px 16px 16px;
  box-shadow: inset 0 2px 8px rgba(255, 255, 255, 0.15), inset 0 -2px 6px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.flip-envelope-flap {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 56px solid transparent;
  border-right: 56px solid transparent;
  border-top: 48px solid #fef2f2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transform-origin: 50% 0%;
  backface-visibility: hidden;
}

/* Hiệu ứng mở nắp lì xì khi lật */
.flip-card.flipped .flip-envelope-flap,
.flip-card.opening .flip-envelope-flap {
  animation: envelope-flap-open 1.1s cubic-bezier(0.2, 0.9, 0.2, 1) 0.22s both;
}

.flip-card.flipped .flip-envelope-body,
.flip-card.opening .flip-envelope-body {
  animation: envelope-shine 1.55s ease-out 0.35s both;
}

.flip-envelope-body::after {
  content: '';
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle at 50% 40%, rgba(251, 191, 36, 0.0), rgba(251, 191, 36, 0.0) 45%, rgba(251, 191, 36, 0.0) 70%);
  opacity: 0;
  pointer-events: none;
}

.flip-card.flipped .flip-envelope-body::after,
.flip-card.opening .flip-envelope-body::after {
  animation: envelope-burst 1.25s ease-out 0.45s both;
}

@keyframes envelope-flap-open {
  0% {
    transform: translateX(-50%) rotateX(0deg) rotateZ(0deg);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
  55% {
    transform: translateX(-50%) rotateX(78deg) rotateZ(-4deg);
    filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.18));
  }
  100% {
    transform: translateX(-50%) rotateX(88deg) rotateZ(0deg);
    filter: drop-shadow(0 14px 14px rgba(0, 0, 0, 0.12));
  }
}

@keyframes envelope-shine {
  0% {
    filter: brightness(1) saturate(1);
    box-shadow: inset 0 2px 8px rgba(255, 255, 255, 0.15), inset 0 -2px 6px rgba(0, 0, 0, 0.2);
  }
  35% {
    filter: brightness(1.22) saturate(1.12);
    box-shadow:
      inset 0 2px 12px rgba(255, 255, 255, 0.32),
      inset 0 -2px 8px rgba(0, 0, 0, 0.18),
      0 0 22px rgba(251, 191, 36, 0.55),
      0 0 42px rgba(245, 158, 11, 0.28);
  }
  100% {
    filter: brightness(1.05) saturate(1.03);
    box-shadow:
      inset 0 2px 8px rgba(255, 255, 255, 0.18),
      inset 0 -2px 6px rgba(0, 0, 0, 0.2);
  }
}

@keyframes envelope-burst {
  0% {
    opacity: 0;
    transform: scale(0.65);
    background: radial-gradient(circle at 50% 40%, rgba(251, 191, 36, 0.0), rgba(251, 191, 36, 0.0) 40%, rgba(251, 191, 36, 0.0) 70%);
  }
  35% {
    opacity: 1;
    transform: scale(1);
    background: radial-gradient(circle at 50% 40%, rgba(251, 191, 36, 0.52), rgba(251, 191, 36, 0.2) 45%, rgba(251, 191, 36, 0) 75%);
  }
  100% {
    opacity: 0;
    transform: scale(1.25);
    background: radial-gradient(circle at 50% 40%, rgba(251, 191, 36, 0.0), rgba(251, 191, 36, 0.0) 50%, rgba(251, 191, 36, 0.0) 80%);
  }
}

/* Chữ "Lì xì" động: vừa lắc vừa to nhỏ */
.flip-card:not(.flipped) .flip-front-text {
  animation: lixi-bounce 1.8s ease-in-out infinite;
}

.flip-card.flipped .flip-front-text {
  animation: none;
}

.flip-front-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.35rem;
  font-weight: 900;
  color: #fff;
  text-shadow:
    0 0 2px #000,
    0 0 4px #000,
    1px 1px 0 #000,
    -1px -1px 0 #000,
    -1px 1px 0 #000,
    1px -1px 0 #000,
    0 2px 4px rgba(0, 0, 0, 0.8),
    0 0 16px rgba(255, 255, 255, 0.5),
    0 0 24px rgba(251, 191, 36, 0.4);
  -webkit-text-stroke: 1.5px rgba(0, 0, 0, 0.85);
  paint-order: stroke fill;
  letter-spacing: 0.08em;
  transform-origin: center center;
}

@keyframes lixi-bounce {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1) rotateZ(-1deg);
  }
  25% {
    transform: translate(-50%, -50%) scale(1.12) rotateZ(1.2deg);
  }
  50% {
    transform: translate(-50%, -50%) scale(0.95) rotateZ(-1deg);
  }
  75% {
    transform: translate(-50%, -50%) scale(1.08) rotateZ(0.8deg);
  }
}

.flip-card-back {
  transform: none;
  background: url('../assets/images/ruột.webp') center / cover no-repeat;
  border: 2px solid rgba(251, 191, 36, 0.45);
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
  overflow: hidden;
  border-radius: 16px;
}

/* Kim tiền tỏa xung quanh trong card khi ra tiền */
.flip-coins-scatter {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.flip-coin-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  background: radial-gradient(circle at 30% 30%, #fef08a, #fcd34d 40%, #f59e0b 80%);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(251, 191, 36, 0.8);
  opacity: 0;
  transform: translate(0, 0) scale(0.3);
}

.flip-coin-dot-1 { --angle: 0deg; }
.flip-coin-dot-2 { --angle: 30deg; }
.flip-coin-dot-3 { --angle: 60deg; }
.flip-coin-dot-4 { --angle: 90deg; }
.flip-coin-dot-5 { --angle: 120deg; }
.flip-coin-dot-6 { --angle: 150deg; }
.flip-coin-dot-7 { --angle: 180deg; }
.flip-coin-dot-8 { --angle: 210deg; }
.flip-coin-dot-9 { --angle: 240deg; }
.flip-coin-dot-10 { --angle: 270deg; }
.flip-coin-dot-11 { --angle: 300deg; }
.flip-coin-dot-12 { --angle: 330deg; }

.flip-card.flipped .flip-coin-dot-1 { animation: coin-scatter-0 1.6s ease-out 0.7s both; }
.flip-card.flipped .flip-coin-dot-2 { animation: coin-scatter-30 1.6s ease-out 0.72s both; }
.flip-card.flipped .flip-coin-dot-3 { animation: coin-scatter-60 1.6s ease-out 0.74s both; }
.flip-card.flipped .flip-coin-dot-4 { animation: coin-scatter-90 1.6s ease-out 0.76s both; }
.flip-card.flipped .flip-coin-dot-5 { animation: coin-scatter-120 1.6s ease-out 0.78s both; }
.flip-card.flipped .flip-coin-dot-6 { animation: coin-scatter-150 1.6s ease-out 0.8s both; }
.flip-card.flipped .flip-coin-dot-7 { animation: coin-scatter-180 1.6s ease-out 0.82s both; }
.flip-card.flipped .flip-coin-dot-8 { animation: coin-scatter-210 1.6s ease-out 0.84s both; }
.flip-card.flipped .flip-coin-dot-9 { animation: coin-scatter-240 1.6s ease-out 0.86s both; }
.flip-card.flipped .flip-coin-dot-10 { animation: coin-scatter-270 1.6s ease-out 0.88s both; }
.flip-card.flipped .flip-coin-dot-11 { animation: coin-scatter-300 1.6s ease-out 0.9s both; }
.flip-card.flipped .flip-coin-dot-12 { animation: coin-scatter-330 1.6s ease-out 0.92s both; }

@keyframes coin-scatter-0 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(120deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(50px, -4px) scale(0.95) rotate(260deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(56px, 2px) scale(0.75) rotate(420deg); filter: brightness(1); } }
@keyframes coin-scatter-30 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(110deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(44px, -28px) scale(0.95) rotate(250deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(50px, -30px) scale(0.75) rotate(410deg); filter: brightness(1); } }
@keyframes coin-scatter-60 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(100deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(28px, -44px) scale(0.95) rotate(240deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(30px, -50px) scale(0.75) rotate(400deg); filter: brightness(1); } }
@keyframes coin-scatter-90 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(95deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(0, -52px) scale(0.95) rotate(235deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(0, -58px) scale(0.75) rotate(395deg); filter: brightness(1); } }
@keyframes coin-scatter-120 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(100deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(-28px, -44px) scale(0.95) rotate(240deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(-30px, -50px) scale(0.75) rotate(400deg); filter: brightness(1); } }
@keyframes coin-scatter-150 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(110deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(-44px, -28px) scale(0.95) rotate(250deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(-50px, -30px) scale(0.75) rotate(410deg); filter: brightness(1); } }
@keyframes coin-scatter-180 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(120deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(-50px, 4px) scale(0.95) rotate(260deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(-56px, -2px) scale(0.75) rotate(420deg); filter: brightness(1); } }
@keyframes coin-scatter-210 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(130deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(-44px, 28px) scale(0.95) rotate(270deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(-50px, 30px) scale(0.75) rotate(430deg); filter: brightness(1); } }
@keyframes coin-scatter-240 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(140deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(-28px, 44px) scale(0.95) rotate(280deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(-30px, 50px) scale(0.75) rotate(440deg); filter: brightness(1); } }
@keyframes coin-scatter-270 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(150deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(0, 52px) scale(0.95) rotate(290deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(0, 58px) scale(0.75) rotate(450deg); filter: brightness(1); } }
@keyframes coin-scatter-300 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(160deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(28px, 44px) scale(0.95) rotate(300deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(30px, 50px) scale(0.75) rotate(460deg); filter: brightness(1); } }
@keyframes coin-scatter-330 { 0% { opacity: 0; transform: translate(0, 0) scale(0.2) rotate(0deg); filter: brightness(1); } 18% { opacity: 1; transform: translate(0, 0) scale(1.15) rotate(170deg); filter: brightness(1.1); } 55% { opacity: 1; transform: translate(44px, 28px) scale(0.95) rotate(310deg); filter: brightness(1.15); } 100% { opacity: 0; transform: translate(50px, 30px) scale(0.75) rotate(470deg); filter: brightness(1); } }

.flip-back-content {
  position: relative;
  padding: 8px;
  text-align: center;
  overflow: hidden;
  z-index: 1;
}

/* Tên người lật hiển thị trên số tiền trong thẻ — nổi bật */
.flip-flipper-name {
  font-size: 0.85rem;
  font-weight: 800;
  color: #701a75;
  margin-bottom: 4px;
  line-height: 1.2;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

/* Ánh sáng vàng lan tỏa tròn từ tâm, dần ra hết cả thẻ */
.flip-card-back::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(234, 179, 8, 0.6) 0%,
    rgba(245, 158, 11, 0.42) 28%,
    rgba(251, 191, 36, 0.26) 52%,
    rgba(253, 224, 71, 0.12) 75%,
    rgba(254, 240, 138, 0.03) 92%,
    transparent 100%
  );
  animation: flip-glow 1.6s ease-out 0.55s both;
  pointer-events: none;
  z-index: 0;
}

/* Chồng tiền kéo từ dưới (bì) lên từ từ */
.flip-money-stack {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 50%;
  pointer-events: none;
}

.flip-bill {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 24px;
  height: 12px;
  background: linear-gradient(180deg, #fde68a 0%, #fcd34d 30%, #f59e0b 70%, #d97706 100%);
  border-radius: 2px;
  transform: translateX(-50%) translateY(100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(217, 119, 6, 0.4);
}

.flip-card.flipped .flip-bill-1 {
  animation: flip-bill-up 1s ease-out 0.7s both;
}

.flip-card.flipped .flip-bill-2 {
  animation: flip-bill-up 1s ease-out 0.9s both;
}

.flip-card.flipped .flip-bill-3 {
  animation: flip-bill-up 1s ease-out 1.1s both;
}

@keyframes flip-bill-up {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 1;
  }
  to {
    transform: translateX(-50%) translateY(-80%);
    opacity: 0.85;
  }
}

.flip-money-pull {
  position: absolute;
  top: 0;
  left: 50%;
  width: 6px;
  height: 28px;
  background: linear-gradient(180deg, transparent, #fcd34d 15%, #f59e0b 50%, #d97706 85%, transparent);
  transform: translateX(-50%) translateY(-100%);
  border-radius: 3px;
  opacity: 0;
  animation: flip-money-pull 1.25s ease-out 0.75s both;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
}

.flip-money-pull::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 4px;
  transform: translateX(-50%);
  width: 10px;
  height: 10px;
  background: #fbbf24;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.9);
  animation: flip-coin-pop 0.7s ease-out 1.35s both;
}

/* Số tiền + VNĐ hiện sau khi kéo tiền — kiểu chúc mừng */
/* Số tiền khi chưa đóng modal: số đầu tỏ, số 2 mờ, mờ dần về sau */
.flip-card.flipped.amountPending .flip-amount .flip-amount-char:nth-child(1) {
  opacity: 1;
  filter: none;
}
.flip-card.flipped.amountPending .flip-amount .flip-amount-char:nth-child(2) {
  opacity: 0.4;
  filter: blur(2.5px);
}
.flip-card.flipped.amountPending .flip-amount .flip-amount-char:nth-child(3) {
  opacity: 0.28;
  filter: blur(3.2px);
}
.flip-card.flipped.amountPending .flip-amount .flip-amount-char:nth-child(4) {
  opacity: 0.2;
  filter: blur(4px);
}
.flip-card.flipped.amountPending .flip-amount .flip-amount-char:nth-child(5) {
  opacity: 0.16;
  filter: blur(4.8px);
}
.flip-card.flipped.amountPending .flip-amount .flip-amount-char:nth-child(n+6) {
  opacity: 0.12;
  filter: blur(5.5px);
}
.flip-card.flipped.amountPending .flip-amount .flip-amount-char,
.flip-card.flipped.amountPending .flip-vnd {
  transition: opacity 0.35s ease, filter 0.35s ease;
}
.flip-card.flipped.amountPending .flip-vnd {
  opacity: 0.12;
  filter: blur(5.5px);
}

/* Đóng modal chúc mừng xong → toàn bộ số tiền hiện rõ */
.flip-card.flipped.amountRevealed .flip-amount,
.flip-card.flipped.amountRevealed .flip-amount .flip-amount-char,
.flip-card.flipped.amountRevealed .flip-vnd {
  opacity: 1 !important;
  filter: none !important;
}
.flip-card.flipped.amountRevealed .flip-amount,
.flip-card.flipped.amountRevealed .flip-vnd {
  animation: flip-amount-clear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes flip-amount-clear {
  from {
    opacity: 0.52;
    filter: blur(2.5px);
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    filter: none;
    transform: scale(1);
  }
}

.flip-reveal-text {
  animation: flip-amount-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 1.6s both;
}

.flip-vnd.flip-reveal-text {
  animation-delay: 2.8s;
}

@keyframes flip-glow {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes flip-coin-pop {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.3);
  }
  70% {
    transform: translateX(-50%) scale(1.15);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

@keyframes flip-amount-pop {
  from {
    opacity: 0;
    transform: scale(0.4);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes flip-money-pull {
  from {
    transform: translateX(-50%) translateY(40%);
    opacity: 1;
  }
  to {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0.9;
  }
}

.flip-amount {
  font-size: 1.45rem;
  font-weight: 900;
  color: #dc2626;
  text-align: center;
  line-height: 1.2;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 1px;
  text-shadow:
    0 0 2px #fff,
    0 0 4px rgba(255, 255, 255, 0.5),
    0 1px 4px rgba(0, 0, 0, 0.4),
    0 2px 10px rgba(0, 0, 0, 0.25),
    0 0 24px rgba(251, 191, 36, 0.55);
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.7);
  letter-spacing: 0.02em;
  filter: drop-shadow(0 0 6px rgba(220, 38, 38, 0.4));
}

.flip-amount-char {
  display: inline-block;
  opacity: 0;
  transform: scale(0.3);
  animation: flip-amount-char-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes flip-amount-char-in {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.flip-vnd {
  font-size: 0.95rem;
  text-align: center;
  color: #b45309;
  margin-top: 4px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-shadow:
    0 0 2px rgba(255, 255, 255, 0.9),
    0 1px 4px rgba(0, 0, 0, 0.35),
    0 0 14px rgba(251, 191, 36, 0.65);
}

.flip-message {
  font-size: 0.8rem;
  font-weight: 700;
  color: #b91c1c;
  text-align: center;
  padding: 4px 6px;
  line-height: 1.25;
}

.flip-results-list {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.flip-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  font-weight: 600;
}

.flip-result-name {
  color: #831843;
}

.flip-result-amount {
  color: #be185d;
}

.flip-result-message {
  color: #6b7280;
  font-size: 0.9rem;
}

.flip-all-btn {
  margin-top: 16px;
  --border-radius: 18px;
  height: 52px;
  font-weight: 700;
}

.flip-all-reveals {
  margin-top: 16px;
}

.pre-set-name-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.pre-set-name-chip:active {
  transform: scale(0.98);
}

.pre-set-name-chip:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.7);
}

.pre-set-name-chip.has-spun {
  background: rgba(34, 197, 94, 0.4);
  border-color: rgba(34, 197, 94, 0.7);
  opacity: 0.9;
}

.chip-name {
  font-weight: 700;
  letter-spacing: 0.02em;
}

.chip-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.25);
  text-transform: uppercase;
}

.name-input-section {
  margin-top: 8px;
}

.name-error {
  color: #dc2626;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 8px 0 0 0;
  padding: 0 4px;
}

.name-item-error .name-input {
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.3);
}

.next-person-hint {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.6),
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 0, 0, 0.25);
  margin: 0 0 14px 0;
  text-align: center;
  letter-spacing: 0.02em;
}

.name-item {
  --background: transparent;
  --padding-start: 0;
  --inner-padding-end: 0;
  --border-radius: 0;
  --min-height: auto;
}

.name-item ion-label {
  color: #fff;
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 0.03em;
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.7),
    0 2px 6px rgba(0, 0, 0, 0.5),
    0 0 24px rgba(0, 0, 0, 0.3);
  margin-bottom: 10px;
  display: block;
}

.name-item .name-input {
  --background: #fff;
  --color: #701a75;
  --placeholder-color: #9d174d;
  --placeholder-opacity: 0.85;
  --padding-start: 20px;
  --padding-end: 20px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --border-radius: 24px;
  border-radius: 24px;
  margin-top: 0;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(236, 72, 153, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.02em;
  overflow: hidden;
}

.name-item:focus-within .name-input,
.name-item .name-input.ion-focused {
  border-color: #ec4899;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.22),
    0 0 0 3px rgba(236, 72, 153, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.name-button {
  margin-top: 22px;
  --border-radius: 18px;
  height: 52px;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.03em;
  --box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
  box-shadow: 0 6px 24px rgba(236, 72, 153, 0.3);
}

.player-name {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #fff;
  letter-spacing: 0.02em;
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.65),
    0 2px 8px rgba(0, 0, 0, 0.45),
    0 0 20px rgba(0, 0, 0, 0.25);
}

.player-name strong {
  color: #fff;
  font-weight: 800;
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.7),
    0 2px 6px rgba(0, 0, 0, 0.5);
}

.spin-wheel-container {
  text-align: center;
  padding: 8px 0;
}

.wheel {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  background: linear-gradient(145deg, #ec4899 0%, #db2777 50%, #be185d 100%);
  box-shadow:
    0 12px 40px rgba(190, 24, 93, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border: 4px solid rgba(255, 255, 255, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.wheel:active {
  transform: scale(0.98);
}

.wheel.spinning {
  pointer-events: none;
  animation: wheel-spin 1.2s ease-in-out infinite;
}

.wheel.wheel-done {
  animation: wheel-pop 0.5s ease-out;
}

@keyframes wheel-spin {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.02); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) scale(1.02); }
}

@keyframes wheel-pop {
  0% { transform: scale(1.1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.wheel-content {
  text-align: center;
  color: #fff;
  padding: 24px;
}

.wheel-placeholder ion-icon {
  font-size: 56px;
  margin-bottom: 8px;
  opacity: 0.95;
}

.wheel-placeholder p,
.wheel-spinning p {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.wheel-spinning {
  padding: 20px 0;
}

/* Nhảy ảnh anh1 -> anh5 khi đang quay */
.wheel-spinning-images {
  padding: 8px 0 4px;
}

.spin-images-wrap {
  width: 140px;
  height: 140px;
  margin: 0 auto 8px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spin-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.spin-img-enter-active {
  animation: spin-img-bounce 0.2s ease-out;
}

.spin-img-leave-active {
  animation: spin-img-out 0.15s ease-in forwards;
}

@keyframes spin-img-bounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  60% {
    transform: scale(1.15);
    opacity: 1;
  }
  80% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin-img-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

.spinner-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.spinner-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  animation: dot-bounce 0.6s ease-in-out infinite alternate;
}

.spinner-dots span:nth-child(2) { animation-delay: 0.1s; }
.spinner-dots span:nth-child(3) { animation-delay: 0.2s; }

@keyframes dot-bounce {
  from { transform: translateY(0); opacity: 0.6; }
  to { transform: translateY(-8px); opacity: 1; }
}

.wheel-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.wheel-amount {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.wheel-currency {
  font-size: 0.95rem;
  font-weight: 600;
  opacity: 0.95;
}

.wheel-hint {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0;
}

.cannot-spin {
  text-align: center;
  padding: 24px 16px;
  color: #6b7280;
  font-size: 0.95rem;
}

.qr-modal-content {
  padding: 20px;
  text-align: center;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.room-code-text {
  font-size: 1.2rem;
  margin: 20px 0;
  color: #4b5563;
}

.share-button {
  margin-top: 20px;
  --border-radius: 12px;
}

.password-modal-content {
  padding: 20px;
}

.password-button {
  margin-top: 20px;
  --border-radius: 12px;
  height: 50px;
}

.password-error {
  color: #ef4444;
  text-align: center;
  margin-top: 10px;
}

/* Modal chỉnh sửa danh sách người lật */
.flip-edit-modal {
  --border-radius: 20px;
  --box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

.flip-edit-toolbar {
  --background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  --color: #fef08a;
  --padding-top: 12px;
  --padding-bottom: 12px;
}

.flip-edit-toolbar ion-title {
  font-weight: 700;
  letter-spacing: 0.02em;
}

.flip-edit-content {
  --background: #f8fafc;
}

.flip-edit-modal-content {
  padding: 20px 20px 28px;
  max-width: 480px;
  margin: 0 auto;
}

.flip-edit-section {
  margin-bottom: 24px;
}

.flip-edit-section:last-child {
  margin-bottom: 0;
}

.flip-edit-section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin-bottom: 10px;
  padding-left: 2px;
}

.flip-edit-toggle-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.flip-edit-toggle-label {
  font-size: 0.9375rem;
  color: #334155;
  font-weight: 500;
  flex: 1;
  min-width: 0;
}

.flip-edit-checkbox-wrap {
  flex-shrink: 0;
  position: relative;
  display: inline-flex;
  cursor: pointer;
}

.flip-edit-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.flip-edit-checkbox-ui {
  position: relative;
  display: block;
  width: 44px;
  height: 26px;
  border-radius: 13px;
  background: #cbd5e1;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.flip-edit-checkbox-ui::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.flip-edit-checkbox:checked + .flip-edit-checkbox-ui {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.flip-edit-checkbox:checked + .flip-edit-checkbox-ui::after {
  transform: translateX(18px);
}

.flip-edit-hint {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0 0 14px 0;
  line-height: 1.45;
}

.flip-edit-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flip-edit-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: grab;
  transition: box-shadow 0.2s, border-color 0.2s, background 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.flip-edit-row:hover {
  border-color: rgba(185, 28, 28, 0.25);
  box-shadow: 0 4px 12px rgba(185, 28, 28, 0.08);
}

.flip-edit-row:active {
  cursor: grabbing;
}

.flip-edit-row.flip-edit-row-active {
  border-color: #b91c1c;
  background: linear-gradient(135deg, rgba(254, 240, 138, 0.15) 0%, rgba(251, 191, 36, 0.08) 100%);
  box-shadow: 0 4px 14px rgba(185, 28, 28, 0.12);
}

.flip-edit-row.flip-edit-row-done {
  opacity: 0.88;
  background: #f1f5f9;
}

.flip-edit-row.flip-edit-dragging {
  opacity: 0.9;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.flip-edit-order {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: linear-gradient(180deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  font-size: 0.8125rem;
  font-weight: 700;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.flip-edit-drag-handle {
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 1.125rem;
  user-select: none;
  padding: 4px 2px;
  line-height: 1;
}

.flip-edit-input {
  flex: 1;
  min-width: 0;
  --padding-start: 12px;
  --padding-end: 12px;
  --background: #f8fafc;
  --border-radius: 10px;
  font-size: 0.9375rem;
  border-radius: 10px;
}

.flip-edit-action-btn {
  flex-shrink: 0;
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  --border-radius: 10px;
  text-transform: none;
}

/* Modal chi tiết người đã quay/lật — bo tròn, giao diện Tết (đỏ, vàng) */
.result-detail-modal {
  --border-radius: 24px;
  --box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
}

.result-detail-modal-header {
  border-radius: 24px 24px 0 0;
  overflow: hidden;
}

.result-detail-modal-header ion-toolbar {
  --background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  --color: #fef08a;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --min-height: 56px;
}

.result-detail-modal-header ion-title {
  font-weight: 700;
  letter-spacing: 0.02em;
}

.result-detail-modal-content {
  --background: linear-gradient(180deg, #fef2f2 0%, #fef9c3 40%, #fef3c7 100%);
  border-radius: 0 0 24px 24px;
  overflow: hidden;
}

.result-detail-card {
  margin: 20px 20px 28px;
  padding: 28px 24px;
  border-radius: 24px;
  background: linear-gradient(145deg, #b91c1c 0%, #991b1b 35%, #7f1d1d 100%);
  border: 2px solid rgba(254, 240, 138, 0.85);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 12px 40px rgba(0, 0, 0, 0.22),
    0 0 32px rgba(251, 191, 36, 0.15);
  text-align: center;
  overflow: hidden;
}

.result-detail-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fef08a;
  margin: 0 0 12px 0;
  letter-spacing: 0.03em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.result-detail-amount {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fef3c7;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.result-detail-time {
  font-size: 0.85rem;
  color: rgba(254, 240, 138, 0.9);
  margin: 0 0 20px 0;
}

.result-detail-wish {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(254, 240, 138, 0.5);
}

.result-detail-wish-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fef08a;
  margin: 0 0 10px 0;
  letter-spacing: 0.02em;
}

.result-detail-wish-text {
  font-size: 1rem;
  line-height: 1.55;
  color: #fffbeb;
  margin: 0;
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.hidden-results-message {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.hidden-results-message ion-icon {
  color: #ec4899;
  margin-bottom: 20px;
}

.winner-celebration {
  position: relative;
  text-align: center;
  padding: 30px 20px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%);
  border-radius: 16px;
  overflow: hidden;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #ec4899;
  animation: confetti-fall 3s linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.winner-content {
  position: relative;
  z-index: 1;
}

.winner-content h2 {
  color: #ec4899;
  font-size: 2rem;
  margin: 0 0 10px 0;
}

.winner-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: #be185d;
  margin: 10px 0;
  letter-spacing: 0.02em;
}

.winner-amount {
  font-size: 2rem;
  font-weight: bold;
  color: #ec4899;
  margin: 10px 0;
}

.winner-message {
  color: #6b7280;
  margin-top: 10px;
}

.winner-item {
  --background: #fce7f3;
  border-left: 4px solid #ec4899;
}

/* ========== Màn chúc mừng full màn + pháo hoa, tự ẩn sau 2s ========== */
.congrats-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  padding: 20px;
  box-sizing: border-box;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.congrats-fullscreen-text {
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
  animation: congrats-text-in 0.5s ease-out;
}

@keyframes congrats-text-in {
  from {
    opacity: 0;
    transform: scale(0.7);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Tiêu đề "Chúc Mừng" — nhỏ lại một chút */
.congrats-big-title {
  font-size: clamp(1.75rem, 12vw, 3.5rem);
  font-weight: 900;
  color: #fff;
  margin: 0 0 8px 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-shadow:
    0 2px 16px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(236, 72, 153, 0.4);
  -webkit-text-stroke: 1px rgba(190, 24, 93, 0.35);
}

/* Tên người — nổi bật, làm trung tâm */
.congrats-big-name {
  font-size: clamp(1.75rem, 11vw, 4rem);
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px 0;
  text-shadow:
    0 2px 12px rgba(0, 0, 0, 0.5),
    0 0 32px rgba(251, 191, 36, 0.6),
    0 0 48px rgba(251, 191, 36, 0.4);
  letter-spacing: 0.04em;
  -webkit-text-stroke: 1px rgba(251, 191, 36, 0.5);
  animation: congrats-name-in 0.6s ease-out 0.15s both;
}
@keyframes congrats-name-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Số tiền — hiệu ứng nhẹ (glow + pulse) */
.congrats-big-amount {
  font-size: clamp(1.5rem, 9vw, 3.25rem);
  font-weight: 800;
  color: #fef08a;
  margin: 0 0 4px 0;
  text-shadow:
    0 2px 12px rgba(0, 0, 0, 0.4),
    0 0 24px rgba(251, 191, 36, 0.5);
  animation: congrats-amount-pulse 2s ease-in-out 0.5s infinite;
}
@keyframes congrats-amount-pulse {
  0%, 100% {
    opacity: 1;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4), 0 0 24px rgba(251, 191, 36, 0.5);
  }
  50% {
    opacity: 0.95;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35), 0 0 32px rgba(251, 191, 36, 0.65);
  }
}

/* Khối câu ý nghĩa — nền đỏ Tết, viền vàng lộc */
.congrats-newyear-msg {
  margin: 20px auto 0;
  max-width: 92%;
  font-size: clamp(1rem, 4.8vw, 1.45rem);
  line-height: 1.55;
  font-weight: 600;
  color: #fffbeb;
  text-shadow:
    0 1px 4px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(254, 240, 138, 0.4);
  padding: 18px 22px;
  border-radius: 18px;
  background: linear-gradient(145deg, #b91c1c 0%, #991b1b 35%, #7f1d1d 100%);
  border: 2px solid rgba(254, 240, 138, 0.85);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 6px 28px rgba(0, 0, 0, 0.35),
    0 0 32px rgba(185, 28, 28, 0.4);
  animation: congrats-newyear-in 0.6s ease-out 0.3s both;
  position: relative;
  overflow: hidden;
}
.congrats-newyear-msg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0.08) 45%, transparent 55%);
  animation: congrats-shimmer 2.5s ease-in-out 1s infinite;
  pointer-events: none;
}
.congrats-newyear-quote {
  color: #fef08a;
  font-size: 1.45em;
  vertical-align: -0.12em;
  margin: 0 4px;
  text-shadow: 0 0 12px rgba(254, 240, 138, 0.9);
}
.congrats-word {
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  border-radius: 4px;
  padding: 0 2px;
}
.congrats-word-highlight {
  background: rgba(254, 240, 138, 0.45);
  color: #fef9c3;
  box-shadow: 0 0 12px rgba(254, 240, 138, 0.5);
}
@keyframes congrats-newyear-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes congrats-shimmer {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* Pháo hoa */
.fireworks {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

/* Cụm pháo hoa: các particle tỏa ra từ tâm */
.firework {
  position: absolute;
  width: 0;
  height: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.firework-particle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color, #ffd93d);
  box-shadow: 0 0 12px var(--color);
  opacity: 0;
  animation: firework-particle 1.8s ease-out infinite;
  transform: translate(-50%, -50%) rotate(var(--angle, 0deg)) translateY(0) scale(1);
}

@keyframes firework-particle {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-140px) scale(0.15);
  }
}

/* Transition màn chúc mừng */
.congrats-enter-active,
.congrats-leave-active {
  transition: opacity 0.3s ease;
}

.congrats-enter-from,
.congrats-leave-to {
  opacity: 0;
}

.congrats-enter-active .congrats-fullscreen-text,
.congrats-leave-active .congrats-fullscreen-text {
  transition: transform 0.3s ease;
}

.congrats-leave-to .congrats-fullscreen-text {
  transform: scale(0.9);
  opacity: 0;
}
</style>
