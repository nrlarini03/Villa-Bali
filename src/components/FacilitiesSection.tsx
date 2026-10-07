import React from 'react';
import { useVilla } from '../context/VillaContext';
import {
  Waves,
  Sun,
  Utensils,
  Car,
  Wifi,
  Sparkles,
  Coffee,
  ShieldCheck,
  Tv,
  Compass,
  Bath,
  HelpCircle,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Waves,
  Sun,
  Utensils,
  Car,
  Wifi,
  Sparkles,
  Coffee,
  ShieldCheck,
  Tv,
  Compass,
  Bath,
};

export const FacilitiesSection: React.FC = () => {
  const { data } = useVilla();

  return (
    <section id="fasilitas" className="py-24 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-700 font-semibold">
            <span>03. Fasilitas Eksklusif</span>
            <span aria-hidden="true">·</span>
            <span>Kenyamanan Tanpa Batas</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-900 leading-tight [text-wrap:balance]">
            Kemewahan Bintang Lima Bernuansa Rumah Pribadi
          </h2>
          <p className="text-base text-neutral-600 font-light leading-relaxed">
            Dikelilingi fasilitas premium yang siap memanjakan setiap detik waktu berlibur Anda bersama orang terkasih.
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.facilities.map((fac) => {
            const IconComponent = iconMap[fac.icon] || HelpCircle;
            return (
              <div
                key={fac.id}
                className="p-6 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 hover:border-amber-400 hover:bg-white hover:shadow-md transition-all duration-300 space-y-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100/70 flex items-center justify-center text-amber-800 group-hover:bg-amber-400 group-hover:text-neutral-950 transition-colors">
                  <IconComponent className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-600 font-semibold block">
                    {fac.category}
                  </span>
                  <h3 className="font-display text-lg font-bold text-neutral-900 group-hover:text-amber-900 transition-colors">
                    {fac.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
                    {fac.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
