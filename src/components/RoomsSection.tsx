import React, { useState } from 'react';
import { useVilla } from '../context/VillaContext';
import { Room } from '../types';
import { formatIDR } from '../data/defaultData';
import { RoomDetailModal } from './RoomDetailModal';
import { Users, Bed, Maximize2, ArrowRight, Eye } from 'lucide-react';

export const RoomsSection: React.FC = () => {
  const { data, setSelectedRoomForBooking } = useVilla();
  const [activeModalRoom, setActiveModalRoom] = useState<Room | null>(null);

  const handleSelectRoom = (room: Room) => {
    setSelectedRoomForBooking(room);
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="kamar" className="py-24 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-700 font-semibold">
              <span>02. Koleksi Akomodasi</span>
              <span aria-hidden="true">·</span>
              <span>Kamar & Villa Mewah</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-900 leading-tight [text-wrap:balance]">
              Pilihan Kamar, Suite & Villa Pribadi
            </h2>
          </div>
          <p className="text-sm sm:text-base text-neutral-600 max-w-md font-light">
            Setiap suite dirancang menghadap samudera luas, memberikan privasi maksimal dan kenyamanan tidur terbaik.
          </p>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {data.rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl overflow-hidden border border-neutral-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Room Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900">
                <img
                  src={room.image}
                  alt={room.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
                  <div className="w-full flex items-center justify-between text-white">
                    <span className="text-xs uppercase tracking-wider text-amber-300 font-medium">
                      {room.type}
                    </span>
                    <button
                      onClick={() => setActiveModalRoom(room)}
                      className="flex items-center gap-1 text-xs bg-black/60 hover:bg-black/80 px-2.5 py-1 rounded-md backdrop-blur-sm transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Detail</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Room Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="font-display text-2xl font-bold text-neutral-900 group-hover:text-amber-800 transition-colors">
                    {room.name}
                  </h3>

                  {/* Clean unboxed specs metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 py-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-700" />
                      {room.capacity} Tamu
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-amber-700" />
                      {room.bed}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-700" />
                      {room.size}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600 line-clamp-2 font-light leading-relaxed">
                    {room.description}
                  </p>
                </div>

                {/* Footer with Price and Booking Trigger */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-neutral-400 block">Tarif per malam:</span>
                    <span className="font-display text-xl sm:text-2xl font-bold text-neutral-900 tabular-nums">
                      {formatIDR(room.pricePerNight)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectRoom(room)}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span>Pilih Kamar Ini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Popup */}
      <RoomDetailModal
        room={activeModalRoom}
        onClose={() => setActiveModalRoom(null)}
        onSelectBooking={handleSelectRoom}
      />
    </section>
  );
};
