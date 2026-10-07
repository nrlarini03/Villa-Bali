import React from 'react';
import { useVilla } from '../context/VillaContext';
import { Sparkles, Compass, Shield, HeartHandshake } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { data } = useVilla();

  return (
    <section id="tentang" className="py-24 bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-700 font-semibold">
            <span>01. Filosofi & Cerita Villa</span>
            <span aria-hidden="true">·</span>
            <span>Sanctuary Tropis</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-900 leading-tight [text-wrap:balance]">
            Kemewahan Murni Berpadu Panorama Samudera Lepas
          </h2>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-8">
            <p className="text-lg text-neutral-700 leading-relaxed font-light">
              {data.villaConfig.aboutStory}
            </p>

            {/* 4 Feature pillars with clean typography and affordance icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <div className="flex items-center gap-2 text-neutral-900 font-semibold text-base">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <h4>Lokasi Prima Oceanfront</h4>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Menghadap langsung ke laut lepas dengan hembusan angin sepoi tropis dan akses pantai tanpa sekat.
                </p>
              </div>

              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <div className="flex items-center gap-2 text-neutral-900 font-semibold text-base">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <h4>Privasi 100% Eksklusif</h4>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Dikelilingi taman hijau tropis yang menjamin kenyamanan santai pribadi tanpa gangguan.
                </p>
              </div>

              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <div className="flex items-center gap-2 text-neutral-900 font-semibold text-base">
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  <h4>Layanan Butler & Chef</h4>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Tim berpengalaman yang berdedikasi mengurus santapan istimewa, spa, hingga transportasi Anda.
                </p>
              </div>

              <div className="space-y-2 border-l-2 border-amber-500 pl-4">
                <div className="flex items-center gap-2 text-neutral-900 font-semibold text-base">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h4>Fasilitas Bintang Lima</h4>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Infinity pool pribadi, sound system premium, kamar mandi terbuka, dan ranjang super king.
                </p>
              </div>
            </div>

            {/* Numbers Strip (Tabular discipline) */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-neutral-100 text-center sm:text-left">
              <div>
                <span className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 tabular-nums">
                  100%
                </span>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Privasi Terjaga</p>
              </div>
              <div>
                <span className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 tabular-nums">
                  10m
                </span>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Jarak ke Bibir Pantai</p>
              </div>
              <div>
                <span className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 tabular-nums">
                  24 Jam
                </span>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mt-1">Pelayanan Butler</p>
              </div>
            </div>
          </div>

          {/* Right Visual Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] bg-neutral-100">
              <img
                src={data.villaConfig.heroImage}
                alt="Tentang Coastal Villa"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <p className="text-xs font-medium tracking-widest uppercase text-amber-300">Garis Pantai Pasir Putih</p>
                  <p className="text-sm font-light text-neutral-200">Suasana senja dengan deburan ombak yang syahdu.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
