import React, { useState } from 'react';
import { HelpCircle, Mail } from 'lucide-react';
import { SegmentedTabs, type SegmentedTabItem } from '../ui/SegmentedTabs';
import {
  UiAccordion,
  UiAccordionItem,
  UiAccordionTrigger,
  UiAccordionContent,
} from '../ui/UiAccordion';
import { MotionReveal } from '../ui/MotionPrimitives';
import { FAQ_DATA, WORKSHOP_CONFIG } from '../../data/workshopData';

/** IIEM-styled categorized FAQ accordion band. */
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
    <section id="faq" className="py-16 sm:py-20 bg-[#F7F8FA] relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#222222] iiem-line-bottom-center">
            FREQUENTLY ASKED <span className="text-[#E41937]">QUESTIONS</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-2">
            Everything you need to know about batch logistics, prerequisite hardware, recordings, and certificate verification.
          </p>
        </MotionReveal>

        <div className="mt-8">
          <SegmentedTabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            items={categoryTabs}
            layoutId="faqCategoryTabs"
          />
        </div>

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
                    <div className="w-8 h-8 rounded bg-[#1F386B]/10 border border-[#1F386B]/20 text-[#E41937] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#222222] leading-snug">
                      {faq.question}
                    </span>
                  </div>
                </UiAccordionTrigger>

                <UiAccordionContent className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  <p className="mt-2">{faq.answer}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#1F386B]/10 text-[#1F386B] border border-[#1F386B]/20 font-bold">
                      Category: {faq.category}
                    </span>
                  </div>
                </UiAccordionContent>
              </UiAccordionItem>
            ))}
          </UiAccordion>
        </div>

        <MotionReveal className="mt-12 text-center text-xs sm:text-sm text-slate-600">
          <span>Have an unanswered question? Email our academic helpdesk at </span>
          <a
            href={`mailto:${WORKSHOP_CONFIG.supportEmail}`}
            className="text-[#E41937] font-bold hover:underline inline-flex items-center gap-1 ml-1"
          >
            <Mail className="w-3.5 h-3.5" />
            {WORKSHOP_CONFIG.supportEmail}
          </a>
        </MotionReveal>
      </div>
    </section>
  );
};
