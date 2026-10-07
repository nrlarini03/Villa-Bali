import React from 'react';
import { GalleryItem } from '../types';
import { X } from 'lucide-react';

interface ImageLightboxModalProps {
  item: GalleryItem | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="relative rounded-xl overflow-hidden shadow-2xl max-h-[75vh] bg-black">
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain max-h-[75vh]"
          />
        </div>

        <div className="mt-4 text-center text-white space-y-1">
          <span className="text-xs uppercase tracking-widest text-amber-300 font-medium">
            {item.category}
          </span>
          <h4 className="font-display text-xl sm:text-2xl font-bold">{item.title}</h4>
          {item.caption && (
            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xl mx-auto">
              {item.caption}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
