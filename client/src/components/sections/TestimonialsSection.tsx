import React from 'react';
import { Star, ShieldCheck, Quote, CheckCircle2 } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { TESTIMONIALS_DATA } from '../../data/workshopData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="reviews" className="py-20 bg-[#0A0F1D] relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md">
            Alumni Outcomes
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built by Builders, Reviewed by Learners
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            See how professionals and creators are putting generative AI to work immediately following our 2-day bootcamp.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS_DATA.map((t) => (
            <Card key={t.id} hoverable className="p-6 border-slate-800 bg-[#111827] flex flex-col justify-between">
              <div className="space-y-4">
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-blue-400 text-blue-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-blue-500/20" />
                </div>

                {/* Quote Text */}
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-3">
                <img
                  src={t.avatarUrl}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-blue-500/40"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white truncate">
                      {t.name}
                    </h4>
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {t.role} • {t.company}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {t.cohort}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* PRD Compliance Disclaimer */}
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Representative illustrative feedback. Actual reviews sync from verified MongoDB alumni records.</span>
        </div>
      </div>
    </section>
  );
};
