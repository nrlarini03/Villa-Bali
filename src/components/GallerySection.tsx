import React, { useState } from 'react';
import { useVilla } from '../context/VillaContext';
import { GalleryItem } from '../types';
import { ImageLightboxModal } from './ImageLightboxModal';
import { Maximize2 } from 'lucide-react';

export const GallerySection: React.FC = () => {
  const { data } = useVilla();
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const categories = ['Semua', ...Array.from(new Set(data.gallery.map((g) => g.category)))];

  const filteredPhotos =
    activeCategory === 'Semua'
      ? data.gallery
      : data.gallery.filter((g) => g.category === activeCategory);

  return (
    <section id="galeri" className="py-24 bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-300 font-semibold">
              <span>04. Galeri Eksklusif</span>
              <span aria-hidden="true">·</span>
              <span>Dokumentasi Visual</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight [text-wrap:balance]">
              Potret Keindahan Tepi Pantai
            </h2>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-amber-400 text-neutral-950 font-semibold shadow-md'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-800 cursor-pointer group border border-neutral-800"
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-6">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-amber-300 font-medium block">
                      {photo.category}
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                      {photo.title}
                    </h3>
                    {photo.caption && (
                      <p className="text-xs text-neutral-300 font-light line-clamp-1">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                  <div className="p-2 rounded-full bg-white/20 text-white backdrop-blur-sm group-hover:bg-amber-400 group-hover:text-black transition-colors shrink-0">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ImageLightboxModal item={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </section>
  );
};
