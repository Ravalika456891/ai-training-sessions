import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Mail } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FAQ_DATA, WORKSHOP_CONFIG } from '../../data/workshopData';

export const FAQSection: React.FC = () => {
  const [openFaqIds, setOpenFaqIds] = useState<string[]>([FAQ_DATA[0].id]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'General', 'Curriculum', 'Logistics', 'Pricing & Policy'];

  const filteredFaqs = selectedCategory === 'All'
    ? FAQ_DATA
    : FAQ_DATA.filter((faq) => faq.category === selectedCategory);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section id="faq" className="py-20 bg-[#F8FAFC] relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md">
            Clear Answers
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
            Everything you need to know about batch logistics, prerequisite hardware, recordings, and certificate verification.
          </p>
        </div>

        {/* Category Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="mt-10 max-w-4xl mx-auto space-y-3.5">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqIds.includes(faq.id);

            return (
              <Card
                key={faq.id}
                className="border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-base sm:text-lg font-bold text-[#0F172A]">
                      {faq.question}
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0F172A]' : ''
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-1 text-[#475569] text-sm sm:text-base leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-200">
                    <p className="mt-3">{faq.answer}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                        Category: {faq.category}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Still have questions? */}
        <div className="mt-12 text-center text-xs sm:text-sm text-slate-500">
          <span>Have an unanswered question? Email our lead academic advisor at </span>
          <a
            href={`mailto:${WORKSHOP_CONFIG.supportEmail}`}
            className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 ml-1"
          >
            <Mail className="w-3.5 h-3.5" />
            {WORKSHOP_CONFIG.supportEmail}
          </a>
        </div>
      </div>
    </section>
  );
};

