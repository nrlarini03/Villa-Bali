import React from 'react';
import { useVilla } from '../context/VillaContext';
import { Database, Lock, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { data, setIsAdminModalOpen, isAdminAuthenticated } = useVilla();

  return (
    <footer className="bg-neutral-950 text-white pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-800/80">
          {/* Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-2xl font-bold tracking-wide text-white">
              {data.villaConfig.brandName}
            </h3>
            <p className="text-sm text-neutral-400 font-light leading-relaxed max-w-sm">
              {data.villaConfig.shortDescription}
            </p>
            <div className="pt-2 text-xs text-neutral-500">
              <span>Instagram: </span>
              <span className="text-amber-300 font-medium">{data.villaConfig.instagram}</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-300">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400 font-light">
              <li>
                <a href="#tentang" className="hover:text-white transition-colors">
                  Tentang Villa
                </a>
              </li>
              <li>
                <a href="#kamar" className="hover:text-white transition-colors">
                  Kamar & Suites
                </a>
              </li>
              <li>
                <a href="#fasilitas" className="hover:text-white transition-colors">
                  Fasilitas Unggulan
                </a>
              </li>
              <li>
                <a href="#galeri" className="hover:text-white transition-colors">
                  Galeri Foto
                </a>
              </li>
              <li>
                <a href="#booking" className="hover:text-white transition-colors">
                  Reservasi WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-300">
              Kontak Resmi
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-400 font-light">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>WA: +{data.villaConfig.whatsappNumber}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{data.villaConfig.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{data.villaConfig.address}</span>
              </li>
            </ul>
          </div>

          {/* Owner Portal / Database */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-300">
              Akses Pemilik
            </h4>
            <p className="text-xs text-neutral-400 font-light">
              Kelola data nama villa, foto, kamar, harga, nomor WA, dan spreadsheet dengan kata sandi.
            </p>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-medium text-amber-200 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 rounded-lg transition-all cursor-pointer"
            >
              {isAdminAuthenticated ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-4 h-4 text-amber-400" />
              )}
              <span>{isAdminAuthenticated ? 'Buka Spreadsheet' : 'Kelola Database (Login)'}</span>
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>
            © {new Date().getFullYear()} {data.villaConfig.brandName}. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Dibuat dengan rasa cinta <Heart className="w-3 h-3 text-red-500 fill-red-500" /> untuk liburan terbaik
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
