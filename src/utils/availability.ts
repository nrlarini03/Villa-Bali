import { BookingRecord, Room } from '../types';

/**
 * Checks if two date ranges overlap.
 * Hotel standard: Guest A check-out on the same day as Guest B check-in is ALLOWED.
 */
export function doDatesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const dStartA = new Date(startA).getTime();
  const dEndA = new Date(endA).getTime();
  const dStartB = new Date(startB).getTime();
  const dEndB = new Date(endB).getTime();

  if (isNaN(dStartA) || isNaN(dEndA) || isNaN(dStartB) || isNaN(dEndB)) {
    return false;
  }

  // Overlap condition: startB < endA && endB > startA
  return dStartB < dEndA && dEndB > dStartA;
}

/**
 * Returns conflicting booking if the room is already booked for the given dates
 */
export function getConflictingBooking(
  roomId: string,
  checkIn: string,
  checkOut: string,
  bookings: BookingRecord[]
): BookingRecord | null {
  if (!roomId || !checkIn || !checkOut || !bookings) return null;

  for (const b of bookings) {
    // Ignore canceled bookings
    if (b.status === 'Dibatalkan') continue;

    // Check if same room (or entire estate vs individual rooms)
    const isSameRoom = b.roomId === roomId;
    const isEntireEstateBooked = b.roomId === 'room-4'; // Entire estate blocks everything
    const isBookingEntireEstate = roomId === 'room-4'; // Booking entire estate is blocked by any room

    if (isSameRoom || isEntireEstateBooked || isBookingEntireEstate) {
      if (doDatesOverlap(b.checkIn, b.checkOut, checkIn, checkOut)) {
        return b;
      }
    }
  }

  return null;
}

/**
 * Returns all active booked date ranges for a specific room
 */
export function getBookedRangesForRoom(
  roomId: string,
  bookings: BookingRecord[]
): { checkIn: string; checkOut: string; status: string; guestName?: string }[] {
  if (!bookings) return [];

  return bookings
    .filter((b) => {
      if (b.status === 'Dibatalkan') return false;
      return b.roomId === roomId || b.roomId === 'room-4' || roomId === 'room-4';
    })
    .map((b) => ({
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      status: b.status,
      guestName: b.guestName,
    }))
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());
}

/**
 * Returns list of alternative rooms available for the requested dates
 */
export function getAvailableAlternativeRooms(
  rooms: Room[],
  currentRoomId: string,
  checkIn: string,
  checkOut: string,
  bookings: BookingRecord[]
): Room[] {
  if (!checkIn || !checkOut || !rooms) return [];

  return rooms.filter((r) => {
    if (r.id === currentRoomId) return false;
    const conflict = getConflictingBooking(r.id, checkIn, checkOut, bookings);
    return !conflict;
  });
}
