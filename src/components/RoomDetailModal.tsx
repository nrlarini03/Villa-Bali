import React from 'react';
import { Room } from '../types';
import { formatIDR } from '../data/defaultData';
import { X, Users, Bed, Maximize2, Bath, Check, CalendarCheck } from 'lucide-react';

interface RoomDetailModalProps {
  room: Room | null;
  onClose: () => void;
  onSelectBooking: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  onClose,
  onSelectBooking,
}) => {
  if (!room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors cursor-pointer"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Room Image Header */}
        <div className="relative aspect-[16/9] w-full bg-neutral-900 overflow-hidden">
          <img
            src={room.image}
            alt={room.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex items-end p-6">
            <div className="text-white space-y-1">
              <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold">
                {room.type}
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold">{room.name}</h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-neutral-100 text-xs sm:text-sm text-neutral-700">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Kapasitas {room.capacity} Tamu</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-amber-600" />
              <span>{room.bed}</span>
            </div>
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-amber-600" />
              <span>Luas {room.size}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-4 h-4 text-amber-600" />
              <span>{room.bathrooms} Kamar Mandi</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Deskripsi Kamar
            </h4>
            <p className="text-neutral-700 leading-relaxed text-sm sm:text-base font-light">
              {room.description}
            </p>
          </div>

          {/* Features Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Fasilitas Unggulan Kamar Ini
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {room.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Action and Pricing */}
          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-neutral-500 block">Tarif per malam:</span>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 tabular-nums">
                  {formatIDR(room.pricePerNight)}
                </span>
                <span className="text-xs text-neutral-500">/ malam (nett)</span>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectBooking(room);
                onClose();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Pilih Kamar Ini & Lanjut Reservasi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
