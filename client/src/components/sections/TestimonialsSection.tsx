import React from 'react';
import { Star, ShieldCheck, Quote, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../../data/workshopData';

/** IIEM Part 10 dark-scrimmed "OUR LEARNERS SAY" institutional testimonials band + partner ecosystem strip. */
export const TestimonialsSection: React.FC = () => {
  const aiEcosystemPartners = [
    'OpenAI ChatGPT-4o',
    'Anthropic Claude 3.5',
    'Vercel v0',
    'Make.com Automation',
    'Perplexity AI',
    'Midjourney & Ideogram',
  ];

  return (
    <>
      <section
        id="reviews"
        className="py-16 sm:py-20 bg-[#192e57] text-white relative scroll-mt-20 overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white iiem-line-bottom-center">
              OUR LEARNERS <span className="text-[#E41937] bg-white px-2 py-0.5 rounded-xs">SAY</span>
            </h2>
            <p className="text-blue-100/90 text-sm sm:text-base leading-relaxed pt-2">
              Hear how professionals, founders, and students apply practical generative AI immediately after our weekend training.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS_DATA.map((t) => (
              <div
                key={t.id}
                className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 border-b-[3px] border-b-[#E41937] p-6 flex flex-col justify-between hover:bg-white/15 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-white/25" />
                  </div>

                  <p className="text-blue-50 text-sm leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/15 flex items-center gap-3">
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#E41937] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-extrabold text-white truncate">{t.name}</h4>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    </div>
                    <p className="text-xs text-blue-200 truncate">
                      {t.role} • {t.company}
                    </p>
                    <p className="text-[10px] text-blue-300 mt-0.5">{t.cohort}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-blue-200/90 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>Representative illustrative alumni feedback. Verified learner records sync via MongoDB Atlas.</span>
          </div>
        </div>
      </section>

      {/* IIEM Part 12 AI Tools & Technology Strip */}
      <div className="bg-[#F7F8FA] py-6 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {aiEcosystemPartners.map((partner) => (
              <div
                key={partner}
                className="bg-white border border-slate-200 rounded px-3 py-3 text-center shadow-2xs flex items-center justify-center"
              >
                <span className="text-xs font-extrabold uppercase tracking-wide text-[#1F386B]">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
