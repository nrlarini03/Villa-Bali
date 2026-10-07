import React, { useState } from 'react';
import { useVilla } from '../context/VillaContext';
import { Calendar, Users, Home, ArrowRight, ShieldCheck } from 'lucide-react';

export const Hero: React.FC = () => {
  const { data, setSelectedRoomForBooking } = useVilla();
  const [selectedRoomId, setSelectedRoomId] = useState<string>(data.rooms[0]?.id || '');
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [guests, setGuests] = useState<number>(2);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoomId) {
      const found = data.rooms.find(r => r.id === selectedRoomId);
      if (found) {
        setSelectedRoomForBooking(found);
      }
    }
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between pt-28 pb-16 overflow-hidden">
      {/* Background Image with Fallback and Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={data.villaConfig.heroImage}
          alt={data.villaConfig.brandName}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
          onError={(e) => {
            // Elegant fallback
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Measured dark scrim for high contrast WCAG AA */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/70" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-12">
        <div className="max-w-3xl space-y-6">
          {/* Quiet Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm tracking-widest uppercase text-amber-300 font-medium">
            <span>Privat & Eksklusif</span>
            <span aria-hidden="true">·</span>
            <span>Oceanfront Sanctuary</span>
            <span aria-hidden="true">·</span>
            <span>Pelayanan Butler 24 Jam</span>
          </div>

          {/* Marquee Headline with text-wrap: balance */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight [text-wrap:balance]">
            {data.villaConfig.tagline || 'Private Oceanfront Sanctuary & Luxury Coastal Escape'}
          </h1>

          {/* Subtitle / Short Description */}
          <p className="text-base sm:text-lg md:text-xl text-neutral-200 leading-relaxed max-w-2xl font-light">
            {data.villaConfig.shortDescription}
          </p>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Jaminan Reservasi Langsung ke Pemilik</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{data.rooms.length} Pilihan Villa & Suite Mewah</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reservation Floating Bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <form
          onSubmit={handleQuickSearch}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center"
        >
          {/* Input 1: Pilihan Kamar */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5 uppercase tracking-wider">
              <Home className="w-3.5 h-3.5 text-amber-700" />
              Pilihan Kamar / Suite
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full text-sm font-medium text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer truncate"
            >
              {data.rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input 2: Tanggal Menginap */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              Rencana Check-In
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full text-sm font-medium text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
            />
          </div>

          {/* Input 3: Tamu */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              Jumlah Tamu
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full text-sm font-medium text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
            >
              <option value={1}>1 Tamu</option>
              <option value={2}>2 Tamu</option>
              <option value={4}>4 Tamu (Keluarga)</option>
              <option value={6}>6 Tamu</option>
              <option value={10}>10+ Tamu (Seluruh Villa)</option>
            </select>
          </div>

          {/* Action: Cari & Cek */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-neutral-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] rounded-lg shadow-md transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <span>Cek Ketersediaan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
