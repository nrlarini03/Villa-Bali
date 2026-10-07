import React from 'react';
import { useVilla } from '../context/VillaContext';
import { MapPin, Navigation, Clock, Plane, ExternalLink, ShieldCheck } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const { data } = useVilla();

  return (
    <section id="lokasi" className="py-24 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-700 font-semibold">
            <span>05. Lokasi & Akses</span>
            <span aria-hidden="true">·</span>
            <span>Strategis & Tenang</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-900 leading-tight [text-wrap:balance]">
            Surga Tersembunyi di Pesisir Pantai
          </h2>
          <p className="text-base text-neutral-600 font-light leading-relaxed">
            Terletak strategis di kawasan prestisius pesisir pantai, jauh dari kebisingan kota namun tetap mudah dijangkau dari bandara internasional.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Info Card */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-amber-700 font-semibold">
                  Alamat Lengkap
                </span>
                <p className="text-base font-medium text-neutral-900 leading-relaxed flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{data.villaConfig.address}</span>
                </p>
              </div>

              {/* Check-In / Check-Out times */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-100">
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Waktu Check-In
                  </span>
                  <p className="font-semibold text-neutral-900">{data.villaConfig.checkInTime}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Waktu Check-Out
                  </span>
                  <p className="font-semibold text-neutral-900">{data.villaConfig.checkOutTime}</p>
                </div>
              </div>

              {/* Nearby Points of Interest */}
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
                  Jarak & Destinasi Terdekat
                </span>
                <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-700">
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-amber-600" />
                      Bandara Internasional Ngurah Rai
                    </span>
                    <span className="font-semibold text-neutral-900 tabular-nums">25 Menit</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-amber-600" />
                      Beach Club & Sunset Cliff
                    </span>
                    <span className="font-semibold text-neutral-900 tabular-nums">7 Menit</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Private Marina & Water Sports
                    </span>
                    <span className="font-semibold text-neutral-900 tabular-nums">10 Menit</span>
                  </li>
                </ul>
              </div>
            </div>

            <a
              href={data.villaConfig.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(data.villaConfig.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Buka Petunjuk di Google Maps</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Right: Map Visual Container */}
          <div className="lg:col-span-7 bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm relative min-h-[350px]">
            {/* Visual Map Representation with satellite vibe */}
            <div className="w-full h-full relative bg-neutral-200 flex flex-col items-center justify-center p-8 text-center">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 max-w-md space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center mx-auto shadow-lg">
                  <MapPin className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-2xl font-bold text-neutral-900">
                    {data.villaConfig.brandName}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {data.villaConfig.address}
                  </p>
                </div>
                <div className="pt-2">
                  <a
                    href={data.villaConfig.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(data.villaConfig.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-900 bg-white border border-neutral-300 rounded-lg shadow-sm hover:bg-neutral-50 transition-colors"
                  >
                    <span>Navigasi GPS Langsung</span>
                    <Navigation className="w-3.5 h-3.5 text-amber-700" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
