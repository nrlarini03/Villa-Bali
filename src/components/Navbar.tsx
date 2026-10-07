import React, { useState, useEffect } from 'react';
import { useVilla } from '../context/VillaContext';
import { Database, Menu, X, CalendarCheck, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { data, setIsAdminModalOpen, isAdminAuthenticated } = useVilla();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-900/95 backdrop-blur-md py-3 shadow-lg border-b border-white/10'
          : 'bg-gradient-to-b from-black/70 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Zone 1: Brand Wordmark (Single clean text element) */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-display text-2xl sm:text-3xl font-semibold tracking-wide text-white hover:text-amber-200 transition-colors shrink-0"
          >
            {data.villaConfig.brandName}
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-white/90">
            <button
              onClick={() => scrollToSection('tentang')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Tentang
            </button>
            <button
              onClick={() => scrollToSection('kamar')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Kamar & Suites
            </button>
            <button
              onClick={() => scrollToSection('fasilitas')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Fasilitas
            </button>
            <button
              onClick={() => scrollToSection('galeri')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Galeri
            </button>
            <button
              onClick={() => scrollToSection('lokasi')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Lokasi
            </button>
            <button
              onClick={() => scrollToSection('ulasan')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Ulasan
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-amber-200 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 rounded-lg transition-all duration-200 cursor-pointer"
              title="Akses Database Spreadsheet Pemilik Villa"
            >
              {isAdminAuthenticated ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Database className="w-4 h-4 text-amber-300" />
              )}
              <span className="whitespace-nowrap">
                {isAdminAuthenticated ? 'Database Aktif' : 'Database & Spreadsheet'}
              </span>
            </button>

            <button
              onClick={() => scrollToSection('booking')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Reservasi</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="p-2 text-amber-300 bg-black/40 rounded-lg border border-amber-500/30"
              title="Database"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-amber-300 transition-colors focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-neutral-900/98 border-t border-neutral-800 px-6 py-6 mt-3 space-y-4 shadow-2xl">
          <nav className="flex flex-col space-y-3 text-base font-medium text-white/90">
            <button
              onClick={() => scrollToSection('tentang')}
              className="text-left py-1 hover:text-amber-300 transition-colors"
            >
              Tentang Villa
            </button>
            <button
              onClick={() => scrollToSection('kamar')}
              className="text-left py-1 hover:text-amber-300 transition-colors"
            >
              Koleksi Kamar & Suites
            </button>
            <button
              onClick={() => scrollToSection('fasilitas')}
              className="text-left py-1 hover:text-amber-300 transition-colors"
            >
              Fasilitas Eksklusif
            </button>
            <button
              onClick={() => scrollToSection('galeri')}
              className="text-left py-1 hover:text-amber-300 transition-colors"
            >
              Galeri Foto
            </button>
            <button
              onClick={() => scrollToSection('lokasi')}
              className="text-left py-1 hover:text-amber-300 transition-colors"
            >
              Lokasi & Sekitarnya
            </button>
            <button
              onClick={() => scrollToSection('ulasan')}
              className="text-left py-1 hover:text-amber-300 transition-colors"
            >
              Ulasan Tamu
            </button>
          </nav>

          <div className="pt-4 border-t border-neutral-800 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAdminModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-200 bg-amber-950/60 border border-amber-500/40 rounded-lg"
            >
              <Database className="w-4 h-4 text-amber-300" />
              <span>Kelola Database & Spreadsheet (Pemilik)</span>
            </button>
            <button
              onClick={() => scrollToSection('booking')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Reservasi Villa</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
