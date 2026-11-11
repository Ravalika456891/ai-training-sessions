import React, { useState } from 'react';
import { HelpCircle, Mail } from 'lucide-react';
import { Badge } from '../common/Badge';
import { SegmentedTabs, type SegmentedTabItem } from '../ui/SegmentedTabs';
import {
  UiAccordion,
  UiAccordionItem,
  UiAccordionTrigger,
  UiAccordionContent,
} from '../ui/UiAccordion';
import { MotionReveal } from '../ui/MotionPrimitives';
import { FAQ_DATA, WORKSHOP_CONFIG } from '../../data/workshopData';

export const FAQSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'General', 'Curriculum', 'Logistics', 'Pricing & Policy'];

  const categoryTabs: SegmentedTabItem[] = categories.map((cat) => ({
    value: cat,
    label: cat,
  }));

  const filteredFaqs =
    selectedCategory === 'All'
      ? FAQ_DATA
      : FAQ_DATA.filter((faq) => faq.category === selectedCategory);

  return (
    <section id="faq" className="py-16 sm:py-24 bg-[#F4F7FE] relative scroll-mt-20 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md" icon={<HelpCircle className="w-3.5 h-3.5 text-[#081e4a]" />}>
            Clear Answers
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Frequently Asked{' '}
            <span className="text-[#081e4a]">
              Questions
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Everything you need to know about batch logistics, prerequisite hardware, recordings, and certificate verification.
          </p>
        </MotionReveal>

        {/* Radix UI Category Switcher */}
        <div className="mt-8">
          <SegmentedTabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            items={categoryTabs}
            layoutId="faqCategoryTabs"
          />
        </div>

        {/* Radix UI Accordion List */}
        <div className="mt-10 max-w-4xl mx-auto">
          <UiAccordion
            key={selectedCategory}
            type="multiple"
            defaultValue={filteredFaqs.length > 0 ? [filteredFaqs[0].id] : []}
          >
            {filteredFaqs.map((faq) => (
              <UiAccordionItem key={faq.id} value={faq.id}>
                <UiAccordionTrigger>
                  <div className="flex items-start sm:items-center gap-3 pr-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-[#081e4a]/20 text-[#081e4a] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#0F172A] leading-snug">
                      {faq.question}
                    </span>
                  </div>
                </UiAccordionTrigger>

                <UiAccordionContent className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  <p className="mt-2">{faq.answer}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-blue-50 text-[#081e4a] border border-[#081e4a]/20 font-semibold">
                      Category: {faq.category}
                    </span>
                  </div>
                </UiAccordionContent>
              </UiAccordionItem>
            ))}
          </UiAccordion>
        </div>

        <MotionReveal delay={0.08} className="mt-12 text-center text-xs sm:text-sm text-slate-600">
          <span>Have an unanswered question? Email our lead academic advisor at </span>
          <a
            href={`mailto:${WORKSHOP_CONFIG.supportEmail}`}
            className="text-[#081e4a] font-bold hover:underline inline-flex items-center gap-1 ml-1"
          >
            <Mail className="w-3.5 h-3.5" />
            {WORKSHOP_CONFIG.supportEmail}
          </a>
        </MotionReveal>
      </div>
    </section>
  );
};
