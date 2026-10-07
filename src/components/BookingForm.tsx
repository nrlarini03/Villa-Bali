import React, { useState, useEffect } from 'react';
import { useVilla } from '../context/VillaContext';
import { Room } from '../types';
import { formatIDR } from '../data/defaultData';
import {
  getConflictingBooking,
  getBookedRangesForRoom,
  getAvailableAlternativeRooms,
} from '../utils/availability';
import {
  Calendar,
  Users,
  Home,
  User,
  Phone,
  Mail,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Ban,
  ArrowRight,
  Info,
} from 'lucide-react';

export const BookingForm: React.FC = () => {
  const { data, selectedRoomForBooking, addBooking } = useVilla();

  // Tomorrow as default check-in, 3 days later as default check-out
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getDayAfterTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  };

  const [roomId, setRoomId] = useState<string>(data.rooms[0]?.id || '');
  const [checkIn, setCheckIn] = useState<string>(getTomorrowDate());
  const [checkOut, setCheckOut] = useState<string>(getDayAfterTomorrow());
  const [guests, setGuests] = useState<number>(2);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submittedBookingId, setSubmittedBookingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync when user clicks "Pilih Kamar" in room card
  useEffect(() => {
    if (selectedRoomForBooking) {
      setRoomId(selectedRoomForBooking.id);
    }
  }, [selectedRoomForBooking]);

  const selectedRoom: Room | undefined = data.rooms.find((r) => r.id === roomId) || data.rooms[0];

  // Conflict & Availability Detection
  const conflictingBooking = getConflictingBooking(roomId, checkIn, checkOut, data.bookings || []);
  const bookedRanges = getBookedRangesForRoom(roomId, data.bookings || []);
  const alternativeRooms = conflictingBooking
    ? getAvailableAlternativeRooms(data.rooms, roomId, checkIn, checkOut, data.bookings || [])
    : [];

  // Calculate nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const pricePerNight = selectedRoom ? selectedRoom.pricePerNight : 0;
  const totalPrice = pricePerNight * nights;

  // Clean owner's phone for WhatsApp API
  const getSanitizedWa = (raw: string) => {
    let cleaned = raw.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned || '6281234567890';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Double-check conflict prevention
    if (conflictingBooking) {
      setErrorMsg(
        `Kamar ini sudah dipesan pada tanggal ${conflictingBooking.checkIn} s/d ${conflictingBooking.checkOut}. Silakan pilih tanggal lain atau kamar alternatif agar tidak terjadi tabrakan pemesanan.`
      );
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Silakan masukkan nomor WhatsApp Anda.');
      return;
    }
    if (!checkIn || !checkOut) {
      setErrorMsg('Silakan pilih tanggal check-in dan check-out.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setErrorMsg('Tanggal check-out harus lebih besar dari tanggal check-in.');
      return;
    }

    const ownerWa = getSanitizedWa(data.villaConfig.whatsappNumber);
    const roomName = selectedRoom ? selectedRoom.name : 'Villa Suite';

    // Format WhatsApp message
    const waMessage = `*RESERVASI BARU - ${data.villaConfig.brandName}*
Halo Admin ${data.villaConfig.brandName}, saya ingin melakukan reservasi kamar dengan rincian berikut:

📋 *Data Pemesan:*
• Nama: ${name.trim()}
• WhatsApp: ${phone.trim()}
${email.trim() ? `• Email: ${email.trim()}\n` : ''}
🏡 *Detail Kamar:*
• Pilihan: ${roomName}
• Check-In: ${checkIn}
• Check-Out: ${checkOut} (${nights} Malam)
• Jumlah Tamu: ${guests} Orang

💰 *Estimasi Biaya:*
• Tarif per Malam: ${formatIDR(pricePerNight)}
• Total Estimasi: ${formatIDR(totalPrice)}

📝 *Catatan Khusus:*
${notes.trim() ? notes.trim() : '-'}

Mohon konfirmasi ketersediaan kamar dan instruksi pembayaran berikutnya. Terima kasih!`;

    // 1. Save to internal database / spreadsheet
    const bookingResult = await addBooking({
      guestName: name.trim(),
      guestPhone: phone.trim(),
      guestEmail: email.trim(),
      roomId: selectedRoom?.id || 'room-1',
      roomName: roomName,
      checkIn: checkIn,
      checkOut: checkOut,
      nights: nights,
      guests: guests,
      totalPrice: totalPrice,
      notes: notes.trim(),
    });

    setSubmittedBookingId(bookingResult.bookingId);

    // 2. Open WhatsApp Web or Mobile
    const waUrl = `https://api.whatsapp.com/send?phone=${ownerWa}&text=${encodeURIComponent(waMessage)}`;
    
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="booking" className="py-24 bg-neutral-900 text-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Information & Live Summary */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-300 font-semibold">
                <span>07. Reservasi Instan</span>
                <span aria-hidden="true">·</span>
                <span>Direct WhatsApp Booking</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight [text-wrap:balance]">
                Pesan Langsung ke Pemilik Villa
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
                Dilengkapi dengan <strong>sistem deteksi ketersediaan real-time</strong>. Jika kamar sudah dipesan di tanggal tersebut, sistem otomatis memberi tahu dan mencegah terjadinya bentrok atau <em>double-booking</em>.
              </p>
            </div>

            {/* Room Live Card Preview */}
            {selectedRoom && (
              <div className="bg-neutral-800/80 rounded-2xl p-5 border border-neutral-700/80 space-y-4">
                <div className="flex gap-4 items-center">
                  <img
                    src={selectedRoom.image}
                    alt={selectedRoom.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
                      {selectedRoom.type}
                    </span>
                    <h4 className="font-display text-lg font-bold text-white line-clamp-1">
                      {selectedRoom.name}
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Kapasitas hingga {selectedRoom.capacity} tamu · {selectedRoom.bed}
                    </p>
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="space-y-2 pt-3 border-t border-neutral-700 text-xs sm:text-sm">
                  <div className="flex justify-between text-neutral-300">
                    <span>Tarif per Malam</span>
                    <span className="font-medium text-white tabular-nums">
                      {formatIDR(pricePerNight)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Durasi Menginap</span>
                    <span className="font-medium text-white tabular-nums">
                      {nights} Malam
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Pajak & Biaya Layanan</span>
                    <span className="text-emerald-400 font-medium">Termasuk (0%)</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-700/60 flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-white">Total Estimasi</span>
                    <span className="font-display text-2xl font-bold text-amber-300 tabular-nums">
                      {formatIDR(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Booked Dates Reference for Selected Room */}
            {bookedRanges.length > 0 && (
              <div className="bg-neutral-800/60 rounded-xl p-4 border border-neutral-700 text-xs space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Info className="w-4 h-4" />
                  <span>Jadwal Terisi Kamar Ini:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bookedRanges.map((range, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-red-950/60 border border-red-500/30 text-red-300 rounded font-mono text-[11px]"
                    >
                      {range.checkIn} s/d {range.checkOut} ({range.status})
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-400">
                  Tanggal di atas sudah dibooking. Tamu tidak dapat memesan kamar ini pada tanggal tersebut.
                </p>
              </div>
            )}

            {/* Feature Badges */}
            <div className="space-y-3 pt-2 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pencegahan double-booking otomatis & jadwal real-time</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tanpa biaya administrasi atau markup perantara</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Respon cepat WhatsApp langsung dari pemilik villa</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-white text-neutral-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-neutral-200">
            {submittedBookingId ? (
              <div className="text-center py-8 space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900">
                    Reservasi Berhasil Dikirim!
                  </h3>
                  <p className="text-sm text-neutral-600 max-w-md mx-auto">
                    ID Reservasi Anda: <span className="font-mono font-bold text-neutral-900">{submittedBookingId}</span>
                  </p>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    Pesan telah disiapkan di WhatsApp pemilik villa. Jika jendela WhatsApp belum terbuka secara otomatis, Anda dapat mengklik tombol di bawah.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`https://api.whatsapp.com/send?phone=${getSanitizedWa(data.villaConfig.whatsappNumber)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Buka WhatsApp Sekarang</span>
                  </a>
                  <button
                    onClick={() => setSubmittedBookingId(null)}
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Buat Reservasi Baru
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-b border-neutral-100 pb-4 mb-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-neutral-900">
                      Formulir Reservasi Villa
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Sistem akan memeriksa ketersediaan tanggal secara otomatis.
                    </p>
                  </div>

                  {/* Status Indicator Badge */}
                  {conflictingBooking ? (
                    <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                      <Ban className="w-3.5 h-3.5 text-red-600" />
                      <span>Kamar Penuh / Terisi</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersedia untuk Tanggal Ini</span>
                    </span>
                  )}
                </div>

                {/* CONFLICT WARNING BANNER */}
                {conflictingBooking && (
                  <div className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 space-y-3 animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                      <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-red-800">
                          Maaf, Kamar Sudah Dipesan pada Tanggal Tersebut!
                        </h4>
                        <p className="text-xs text-red-700 leading-relaxed">
                          Kamar <strong>{selectedRoom?.name}</strong> telah dibooking untuk tanggal{' '}
                          <span className="font-semibold underline">
                            {conflictingBooking.checkIn} s/d {conflictingBooking.checkOut}
                          </span>.
                          Untuk mencegah tabrakan tamu (*double-booking*), formulir ini terkunci sementara untuk tanggal tersebut.
                        </p>
                      </div>
                    </div>

                    {/* Recommend Alternative Available Rooms */}
                    {alternativeRooms.length > 0 && (
                      <div className="pt-2 border-t border-red-200 text-xs">
                        <span className="font-semibold text-neutral-800 block mb-1.5">
                          Pilihan kamar lain yang MASIH TERSEDIA pada tanggal ini:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {alternativeRooms.map((alt) => (
                            <button
                              key={alt.id}
                              type="button"
                              onClick={() => setRoomId(alt.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-900 font-medium rounded-lg border border-neutral-300 shadow-sm transition-all cursor-pointer"
                            >
                              <span>{alt.name}</span>
                              <span className="text-amber-700 font-bold">
                                ({formatIDR(alt.pricePerNight)})
                              </span>
                              <ArrowRight className="w-3 h-3 text-neutral-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Field 1: Pilih Kamar */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Home className="w-3.5 h-3.5 text-amber-700" />
                    Pilih Kamar / Suite / Villa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full text-sm font-medium text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                  >
                    {data.rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {formatIDR(r.pricePerNight)}/malam
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates & Guests Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Check-In */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      Check-In <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                      className={`w-full text-sm font-medium text-neutral-900 bg-neutral-50 border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 ${
                        conflictingBooking
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-neutral-300 focus:ring-amber-500'
                      }`}
                    />
                  </div>

                  {/* Check-Out */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      Check-Out <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                      className={`w-full text-sm font-medium text-neutral-900 bg-neutral-50 border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 ${
                        conflictingBooking
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-neutral-300 focus:ring-amber-500'
                      }`}
                    />
                  </div>

                  {/* Jumlah Tamu */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 text-amber-700" />
                      Jumlah Tamu
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full text-sm font-medium text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value={1}>1 Orang</option>
                      <option value={2}>2 Orang</option>
                      <option value={3}>3 Orang</option>
                      <option value={4}>4 Orang</option>
                      <option value={6}>6 Orang</option>
                      <option value={8}>8 Orang</option>
                      <option value={12}>10-12 Orang</option>
                    </select>
                  </div>
                </div>

                {/* Guest Contact Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Lengkap */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <User className="w-3.5 h-3.5 text-amber-700" />
                      Nama Lengkap Pemesan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Rian Anggara"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full text-sm font-medium text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* No WhatsApp */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Phone className="w-3.5 h-3.5 text-amber-700" />
                      No. WhatsApp Anda <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full text-sm font-medium text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <Mail className="w-3.5 h-3.5 text-amber-700" />
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: nama@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm font-medium text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    Catatan / Permintaan Khusus
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Misal: Jemputan bandara jam 13:00, dekorasi anniversary, request extra pillow..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-sm text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Submit WhatsApp Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!!conflictingBooking}
                    className={`w-full flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all duration-200 ${
                      conflictingBooking
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed border border-neutral-300'
                        : 'text-neutral-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] hover:shadow-xl cursor-pointer'
                    }`}
                  >
                    {conflictingBooking ? (
                      <>
                        <Ban className="w-5 h-5 text-neutral-500" />
                        <span>Kamar Penuh pada Tanggal Ini (Pilih Tanggal / Kamar Lain)</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Kirim Booking via WhatsApp</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-neutral-400 text-center mt-2.5">
                    {conflictingBooking
                      ? 'Silakan ubah tanggal atau pilih kamar lain yang masih kosong di atas.'
                      : `Rincian pesanan akan otomatis terformat rapi dan terhubung ke WhatsApp resmi pemilik: ${data.villaConfig.whatsappNumber}`}
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

