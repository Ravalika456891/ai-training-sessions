import React from 'react';
import { Star, ShieldCheck, Quote, Award } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { TESTIMONIALS_DATA } from '../../data/workshopData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white relative scroll-mt-20 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md" icon={<Award className="w-3.5 h-3.5 text-[#081e4a]" />}>
            Alumni Outcomes
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Built by Builders,{' '}
            <span className="text-[#081e4a]">Reviewed by Learners</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            See how working professionals, founders, and creators put practical AI workflows into production right after the 2-day bootcamp.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS_DATA.map((t) => (
            <Card key={t.id} hoverable accentTop className="p-6 flex flex-col justify-between">
              <div className="space-y-4 pt-1">
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1" aria-label={`${t.rating} out of 5 stars`}>
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#081e4a]/15" />
                </div>

                {/* Quote Text */}
                <p className="text-slate-600 text-sm leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <img
                  src={t.avatarUrl}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#081e4a]/25 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-[#0F172A] truncate">
                      {t.name}
                    </h4>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#081e4a] shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {t.role} • {t.company}
                  </p>
                  <p className="text-[10px] font-semibold text-[#081e4a]/80 mt-0.5">
                    {t.cohort}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
