/** Số tiền chính xác: đúng N thẻ nhận đúng số tiền này (random thứ tự thẻ) */
export interface ExactAmount {
  amount: number;
  count: number;
}

/** Khoảng giải: min-max (VNĐ) và số thẻ rơi vào khoảng này */
export interface PrizeRange {
  min: number;
  max: number;
  count: number;
}

/** Một slot quay: người quay thứ i nhận số tiền random trong [min, max] */
export interface PrizeSlot {
  min: number;
  max: number;
}

export interface Room {
  id: string;
  type: 'minmax' | 'total';
  createdBy: string;
  createdAt: number;
  /** Tên phòng (bắt buộc khi tạo) */
  roomName?: string;
  minAmount?: number;
  maxAmount?: number;
  totalAmount?: number;
  totalPeople?: number;
  minPerSpin?: number;
  maxPerSpin?: number;
  /** Phòng mới: danh sách slot (mỗi người quay = 1 slot), thứ tự quay = index slot */
  slots?: PrizeSlot[];
  /** true = hiển thị tiền từng người ngay khi quay; false = chỉ hiển thị khi đã quay hết lượt */
  showResultsImmediately?: boolean;
  /** Tên người quay cài sẵn (tùy chọn). Nếu đủ bằng totalPeople thì màn quay chỉ hiển thị list, không có input */
  playerNames?: string[];
  /** Mode lật thẻ: vào phòng có nút "Quay may mắn" -> lật thẻ nhận tiền random */
  flipAll?: boolean;
  /** Mode tên khi lật thẻ: auto = tự render Người chơi 1..n; manual = nhập tay */
  flipNameMode?: 'auto' | 'manual';
  /** Số thẻ cộng thêm so với số người lật (mặc định 0). Theo yêu cầu: +3 */
  extraCards?: number;
  /** Số tiền ảo trúng giải (1 thẻ trong 3 thẻ Lật all), mặc định 1000000 */
  flipJackpotAmount?: number;
  /** Danh sách lượt lật thẻ */
  flips?: Flip[];
  /** Sau khi bấm "Lật all": 3 thẻ chưa lật — 1 message "Chúc bạn may mắn", 1 max range, 1 flipJackpotAmount */
  flipAllReveals?: FlipAllReveal[];
  /** Làm tròn số tiền random: none = không làm tròn, thousand/chục nghìn/trăm nghìn */
  roundAmount?: 'none' | 'thousand' | 'ten_thousand' | 'hundred_thousand';
  /** Số tiền gán sẵn cho từng thẻ (index = cardIndex), đúng logic ưu tiên exact → khoảng giải → mặc định */
  cardAmounts?: number[];
  spins: Spin[];
  roomCode: string;
  password?: string;
}

export interface FlipAllReveal {
  cardIndex: number;
  amount?: number;
  message?: string;
}

export interface Spin {
  id: string;
  playerName: string;
  amount: number;
  timestamp: number;
  /** Chỉ có khi phòng dùng slots: index slot được random (người quay không theo thứ tự config) */
  slotIndex?: number;
}

export interface Flip {
  id: string;
  flipperName: string;
  amount: number;
  timestamp: number;
  cardIndex: number;
  /** Chỉ có khi phòng dùng slots: index slot được random */
  slotIndex?: number;
}
