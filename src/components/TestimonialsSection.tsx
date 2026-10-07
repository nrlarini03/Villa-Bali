import React from 'react';
import { useVilla } from '../context/VillaContext';
import { Star, Quote } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const { data } = useVilla();

  return (
    <section id="ulasan" className="py-24 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-700 font-semibold">
            <span>06. Ulasan Tamu</span>
            <span aria-hidden="true">·</span>
            <span>Pengalaman Nyata</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-neutral-900 leading-tight [text-wrap:balance]">
            Kenangan Tak Terlupakan Dari Para Tamu
          </h2>
          <p className="text-base text-neutral-600 font-light leading-relaxed">
            Kepuasan dan kenyamanan Anda adalah prioritas tertinggi kami. Simak apa kata mereka yang telah menginap.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.testimonials.map((test) => (
            <div
              key={test.id}
              className="p-8 rounded-2xl bg-neutral-50 border border-neutral-200/90 flex flex-col justify-between space-y-6 relative hover:shadow-lg transition-all"
            >
              <div className="space-y-4">
                {/* Rating stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Comment quote */}
                <p className="text-sm sm:text-base text-neutral-700 font-light leading-relaxed italic">
                  "{test.comment}"
                </p>
              </div>

              {/* Author attribution (Claim-to-proof adjacency) */}
              <div className="pt-4 border-t border-neutral-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">{test.author}</h4>
                  <p className="text-xs text-neutral-500">{test.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-amber-800 font-medium block">
                    {test.room}
                  </span>
                  <span className="text-[10px] text-neutral-400">{test.stayDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
