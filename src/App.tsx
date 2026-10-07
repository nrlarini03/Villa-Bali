import React from 'react';
import { VillaProvider, useVilla } from './context/VillaContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { RoomsSection } from './components/RoomsSection';
import { FacilitiesSection } from './components/FacilitiesSection';
import { GallerySection } from './components/GallerySection';
import { LocationSection } from './components/LocationSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { BookingForm } from './components/BookingForm';
import { Footer } from './components/Footer';
import { AdminModal } from './components/admin/AdminModal';
import { MessageCircle } from 'lucide-react';

const VillaAppContent: React.FC = () => {
  const { data, isLoading } = useVilla();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="font-display text-lg tracking-widest text-amber-200">
          Memuat Coastal Dream Villa...
        </p>
      </div>
    );
  }

  const cleanWaNumber = data.villaConfig.whatsappNumber.replace(/\D/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-800 selection:bg-amber-400 selection:text-neutral-950 font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Sections */}
      <main className="flex-1">
        <Hero />
        <AboutSection />
        <RoomsSection />
        <FacilitiesSection />
        <GallerySection />
        <LocationSection />
        <TestimonialsSection />
        <BookingForm />
      </main>

      {/* Footer */}
      <Footer />

      {/* Admin Spreadsheet & Password Protected Modal */}
      <AdminModal />

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://api.whatsapp.com/send?phone=${cleanWaNumber}&text=${encodeURIComponent(
          `Halo ${data.villaConfig.brandName}, saya ingin menanyakan ketersediaan villa.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 group cursor-pointer"
        aria-label="Hubungi via WhatsApp"
        title="Chat Langsung via WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline">
          Chat WhatsApp
        </span>
      </a>
    </div>
  );
};

export default function App() {
  return (
    <VillaProvider>
      <VillaAppContent />
    </VillaProvider>
  );
}
