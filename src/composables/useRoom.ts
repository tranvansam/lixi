import { ref } from 'vue';
import { ref as dbRef, push, set, get, onValue, update, remove } from 'firebase/database';
import { database } from '@/config/firebase';
import type { Room, Spin, Flip, FlipAllReveal } from '@/types/room';

export const useRoom = () => {
  const db = database!;

  const createRoom = async (roomData: Omit<Room, 'id' | 'roomCode' | 'spins' | 'createdAt'>) => {
    try {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const roomRef = dbRef(db, 'rooms');
      const newRoomRef = push(roomRef);

      const payload: Record<string, unknown> = {
        id: newRoomRef.key!,
        ...roomData,
        roomCode,
        spins: [],
        flips: [],
        createdAt: Date.now()
      };
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) delete payload[key];
      });

      await set(newRoomRef, payload);
      return { success: true, room: payload as unknown as Room };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const getRoom = async (roomCode: string) => {
    try {
      const roomsRef = dbRef(db, 'rooms');
      const snapshot = await get(roomsRef);
      
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        const room = Object.values(rooms).find((r: any) => r.roomCode === roomCode) as Room;
        if (room) {
          // Đảm bảo spins luôn là mảng
          if (!room.spins) {
            room.spins = [];
          }
          // Đảm bảo flips luôn là mảng (mode lật thẻ)
          if (!room.flips) {
            room.flips = [];
          }
          if (!room.flipAllReveals) {
            room.flipAllReveals = [];
          }
          return { success: true, room };
        }
      }
      return { success: false, error: 'Room not found' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const subscribeRoom = (roomId: string, callback: (room: Room | null) => void) => {
    const roomRef = dbRef(db, `rooms/${roomId}`);
    return onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const room = snapshot.val() as Room;
        // Đảm bảo spins luôn là mảng
        if (!room.spins) {
          room.spins = [];
        }
        // Đảm bảo flips luôn là mảng (mode lật thẻ)
        if (!room.flips) {
          room.flips = [];
        }
        if (!room.flipAllReveals) {
          room.flipAllReveals = [];
        }
        callback(room);
      } else {
        callback(null);
      }
    });
  };

  const addSpin = async (roomId: string, playerName: string, amount: number, slotIndex?: number) => {
    try {
      const roomRef = dbRef(db, `rooms/${roomId}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Room not found' };
      }

      const room = snapshot.val() as Room;
      
      if (!room.spins) {
        room.spins = [];
      }
      
      if (room.spins.some(spin => spin.playerName === playerName)) {
        return { success: false, error: 'Tên người chơi đã tồn tại' };
      }

      const maxSpins = room.slots ? room.slots.length : (room.totalPeople ?? 0);
      if (room.type === 'total' && maxSpins > 0 && room.spins.length >= maxSpins) {
        return { success: false, error: 'Phòng đã đủ số người quay' };
      }

      const newSpin: Spin = {
        id: Date.now().toString(),
        playerName,
        amount,
        timestamp: Date.now(),
        ...(slotIndex !== undefined && { slotIndex })
      };

      const updatedSpins = [...room.spins, newSpin];
      await update(roomRef, { spins: updatedSpins });

      return { success: true, spin: newSpin };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const addFlip = async (
    roomId: string,
    flipperName: string,
    amount: number,
    cardIndex: number,
    slotIndex?: number
  ) => {
    try {
      const roomRef = dbRef(db, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        return { success: false, error: 'Room not found' };
      }

      const room = snapshot.val() as Room;
      if (!room.flips) room.flips = [];

      const totalPeople = room.totalPeople ?? 0;
      if (totalPeople > 0 && room.flips.length >= totalPeople) {
        return { success: false, error: 'Đã đủ số người lật' };
      }

      if (room.flips.some(f => f.flipperName === flipperName)) {
        return { success: false, error: 'Người này đã lật rồi' };
      }
      if (room.flips.some(f => f.cardIndex === cardIndex)) {
        return { success: false, error: 'Thẻ này đã được lật' };
      }

      const newFlip: Flip = {
        id: Date.now().toString(),
        flipperName,
        amount,
        timestamp: Date.now(),
        cardIndex,
        ...(slotIndex !== undefined && { slotIndex })
      };

      const updatedFlips = [...room.flips, newFlip];
      await update(roomRef, { flips: updatedFlips });
      return { success: true, flip: newFlip };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const setFlipAllReveals = async (roomId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const roomRef = dbRef(db, `rooms/${roomId}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        return { success: false, error: 'Room not found' };
      }
      const room = snapshot.val() as Room;
      const flips = room.flips || [];
      const totalPeople = room.totalPeople ?? 0;
      const extraCards = room.extraCards ?? (room.flipAll ? 3 : 0);
      const cardCount = totalPeople + extraCards;
      const flippedIndices = new Set(flips.map(f => f.cardIndex));
      const unflippedIndices: number[] = [];
      for (let i = 0; i < cardCount; i++) {
        if (!flippedIndices.has(i)) unflippedIndices.push(i);
      }
      // Cho phép "Lật all" ở mọi thời điểm (không phụ thuộc số thẻ chưa lật):
      // - Lật hết TẤT CẢ các thẻ còn chưa lật như một người lật bình thường
      // - Chỉ 3 thẻ là kết quả đặc biệt (Lật all)
      if (cardCount < 3) {
        return { success: false, error: 'Không đủ thẻ để Lật all' };
      }
      if (unflippedIndices.length === 0) {
        return { success: false, error: 'Không còn thẻ nào để lật' };
      }
      // 3 thẻ: 1 message "Chúc bạn may mắn", 1 số tiền max range (config), 1 số tiền ảo trúng giải (nhập khi tạo phòng, không clamp)
      const slotMins = (room.slots || []).map(s => Number(s.min) || 0);
      const slotMaxs = (room.slots || []).map(s => Number(s.max) || 0);
      const maxAllowed = slotMaxs.length ? Math.max(...slotMaxs) : (room.maxPerSpin ?? 0);

      const amountMaxRange = maxAllowed; // max của khoảng giải đã config
      const amountJackpot = Math.max(0, Number(room.flipJackpotAmount) || 1000000); // số tiền ảo nhập khi tạo phòng, hiển thị đúng giá trị (không clamp)

      const values: FlipAllReveal[] = [
        { cardIndex: -1, message: 'Chúc bạn may mắn' },
        { cardIndex: -1, amount: amountMaxRange },
        { cardIndex: -1, amount: amountJackpot }
      ];

      // Chọn 3 thẻ ĐẶC BIỆT trong các thẻ CHƯA lật (ưu tiên đúng thẻ chưa lật)
      const candidates = [...unflippedIndices];
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      const picked = candidates.slice(0, Math.min(3, candidates.length));
      const reveals: FlipAllReveal[] = values.map((v, idx) => ({
        ...v,
        cardIndex: picked[idx] ?? candidates[0] ?? 0
      }));

      // Lật hết các thẻ còn lại (trừ 3 thẻ đặc biệt) như một người lật bình thường
      const pickedSet = new Set(picked);
      const nextFlips: Flip[] = [];
      const flipperName = 'Lật all';
      let now = Date.now();

      // clone room tạm để generateRandomAmount không bị trùng slot trong cùng 1 lần "lật all"
      const tempRoom: Room = { ...room, flips: [...flips] };

      for (const cardIndex of unflippedIndices) {
        if (pickedSet.has(cardIndex)) continue;

        let amount: number;
        let slotIndex: number | undefined;
        if (room.cardAmounts && cardIndex >= 0 && cardIndex < room.cardAmounts.length && room.cardAmounts[cardIndex] !== undefined) {
          amount = room.cardAmounts[cardIndex];
          slotIndex = undefined;
        } else {
          const gen = generateRandomAmount(tempRoom);
          amount = typeof gen === 'number' ? gen : gen.amount;
          slotIndex = typeof gen === 'number' ? undefined : gen.slotIndex;
        }

        const newFlip: Flip = {
          id: `${now}-${cardIndex}`,
          flipperName,
          amount,
          timestamp: now,
          cardIndex,
          ...(slotIndex !== undefined && { slotIndex })
        };
        now += 1;
        nextFlips.push(newFlip);
        tempRoom.flips = [...(tempRoom.flips ?? []), newFlip];
      }

      const updatedFlips = [...flips, ...nextFlips];
      await update(roomRef, { flipAllReveals: reveals, flips: updatedFlips });
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  /** Làm tròn số tiền theo cấu hình phòng */
  const applyRoundAmount = (amount: number, option: Room['roundAmount'] | undefined): number => {
    if (option === undefined || option === 'none') return amount;
    if (option === 'thousand') return Math.round(amount / 1000) * 1000;
    if (option === 'ten_thousand') return Math.round(amount / 10000) * 10000;
    if (option === 'hundred_thousand') return Math.round(amount / 100000) * 100000;
    return amount;
  };

  /** Phòng có slots: trả về { amount, slotIndex } (slot random trong các slot còn lại). Không có slots: trả về number. */
  const generateRandomAmount = (room: Room): number | { amount: number; slotIndex: number } => {
    const spins = room.spins || [];
    const flips = room.flips || [];
    const roundOpt = room.roundAmount;

    // Phòng có slots: chọn random một slot chưa dùng, rồi random số tiền trong slot đó
    if (room.slots && room.slots.length > 0) {
      // Chặn trường hợp slot cấu hình 0 (hoặc < min mong muốn) làm ra 0 / dưới min
      const slotMinsAll = room.slots.map(s => Number(s.min) || 0);
      const slotMaxsAll = room.slots.map(s => Number(s.max) || 0);
      const positiveMins = slotMinsAll.filter(m => m > 0);
      const minAllowed = positiveMins.length ? Math.min(...positiveMins) : Math.min(...slotMinsAll);
      const maxAllowed = slotMaxsAll.length ? Math.max(...slotMaxsAll) : minAllowed;
      const clamp = (n: number) => Math.max(minAllowed, Math.min(maxAllowed, n));

      const usedIndices = new Set(
        [
          ...spins.map(s => s.slotIndex),
          ...flips.map(f => f.slotIndex)
        ].filter((i): i is number => i !== undefined)
      );
      const availableIndices = room.slots
        .map((_, i) => i)
        .filter(i => !usedIndices.has(i));
      if (availableIndices.length === 0) {
        const last = room.slots[room.slots.length - 1];
        const amt = clamp(last?.min ?? 0);
        return { amount: applyRoundAmount(amt, roundOpt), slotIndex: room.slots.length - 1 };
      }
      const chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const slot = room.slots[chosenIndex];
      const min = slot.min;
      const max = slot.max;
      const range = Math.max(0, max - min);
      const rawAmount = min + (range === 0 ? 0 : Math.floor(Math.random() * (range + 1)));
      const amount = applyRoundAmount(clamp(rawAmount), roundOpt);
      return { amount, slotIndex: chosenIndex };
    }

    if (room.type === 'minmax') {
      const min = room.minAmount ?? 0;
      const max = room.maxAmount ?? 0;
      const range = Math.max(0, max - min);
      const raw = min + (range === 0 ? 0 : Math.floor(Math.random() * (range + 1)));
      return applyRoundAmount(raw, roundOpt);
    }

    // Type: total – tổng tiền là giới hạn; totalPeople = 0 = không giới hạn số người quay
    const totalPeople = room.totalPeople ?? 0;
    const totalSpun = spins.reduce((sum, spin) => sum + spin.amount, 0);
    const totalAmount = room.totalAmount ?? 0;
    const remainingAmount = Math.max(0, totalAmount - totalSpun);
    const minPerSpin = room.minPerSpin ?? 0;
    const maxPerSpin = room.maxPerSpin ?? 0;

    if (totalPeople <= 0) {
      const cap = remainingAmount <= 0 ? maxPerSpin : Math.min(maxPerSpin, remainingAmount);
      const range = Math.max(0, cap - minPerSpin);
      const raw = minPerSpin + (range === 0 ? 0 : Math.floor(Math.random() * (range + 1)));
      return applyRoundAmount(raw, roundOpt);
    }

    const remainingSpins = totalPeople - spins.length;
    if (remainingSpins <= 0) {
      return applyRoundAmount(minPerSpin, roundOpt);
    }

    if (remainingSpins === 1) {
      return applyRoundAmount(remainingAmount, roundOpt);
    }
    const minNeededForOthers = (remainingSpins - 1) * minPerSpin;
    const maxAllowedForThisSpin = remainingAmount - minNeededForOthers;
    const effectiveMax = Math.min(maxPerSpin, Math.max(0, maxAllowedForThisSpin));
    const effectiveMin = Math.min(minPerSpin, remainingAmount);
    const finalMin = Math.min(effectiveMin, effectiveMax);
    const finalMax = Math.max(effectiveMin, effectiveMax);
    if (finalMin > finalMax) {
      const raw = remainingAmount > 0 ? Math.floor(remainingAmount / remainingSpins) : minPerSpin;
      return applyRoundAmount(raw, roundOpt);
    }
    const raw = finalMin + Math.floor(Math.random() * (finalMax - finalMin + 1));
    return applyRoundAmount(raw, roundOpt);
  };

  const getMyRooms = async (userId: string) => {
    try {
      const roomsRef = dbRef(db, 'rooms');
      const snapshot = await get(roomsRef);
      
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        const myRooms = Object.entries(rooms)
          .filter(([_, room]: [string, any]) => room.createdBy === userId)
          .map(([id, room]: [string, any]) => ({
            id,
            ...room,
            spins: room.spins || [],
            flips: room.flips || []
          } as Room))
          .sort((a, b) => b.createdAt - a.createdAt);
        
        return { success: true, rooms: myRooms };
      }
      return { success: true, rooms: [] };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    try {
      const roomRef = dbRef(db, `rooms/${roomId}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Room not found' };
      }

      const room = snapshot.val() as Room;
      
      // Không cho phép cập nhật nếu đã có người quay
      if (room.spins && room.spins.length > 0) {
        return { success: false, error: 'Không thể chỉnh sửa phòng đã có người quay' };
      }

      // Cập nhật các trường được phép
      const allowedUpdates: any = {};
      if (updates.minAmount !== undefined) allowedUpdates.minAmount = updates.minAmount;
      if (updates.maxAmount !== undefined) allowedUpdates.maxAmount = updates.maxAmount;
      if (updates.minPerSpin !== undefined) allowedUpdates.minPerSpin = updates.minPerSpin;
      if (updates.maxPerSpin !== undefined) allowedUpdates.maxPerSpin = updates.maxPerSpin;
      if (updates.totalAmount !== undefined) allowedUpdates.totalAmount = updates.totalAmount;
      if (updates.totalPeople !== undefined) allowedUpdates.totalPeople = updates.totalPeople;

      await update(roomRef, allowedUpdates);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      const roomRef = dbRef(db, `rooms/${roomId}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Room not found' };
      }

      await remove(roomRef);
      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  };

  return {
    createRoom,
    getRoom,
    subscribeRoom,
    addSpin,
    addFlip,
    setFlipAllReveals,
    generateRandomAmount,
    getMyRooms,
    updateRoom,
    deleteRoom
  };
};
