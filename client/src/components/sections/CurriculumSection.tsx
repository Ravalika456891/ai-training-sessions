import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { SegmentedTabs, type SegmentedTabItem } from '../ui/SegmentedTabs';
import {
  UiAccordion,
  UiAccordionItem,
  UiAccordionTrigger,
  UiAccordionContent,
} from '../ui/UiAccordion';
import { MotionReveal } from '../ui/MotionPrimitives';
import { CURRICULUM_DAYS } from '../../data/workshopData';

interface CurriculumSectionProps {
  onRegisterClick: () => void;
}

/** IIEM Part 5 "OUR COURSES" inspired 2-day institutional curriculum with single-line tool badges. */
export const CurriculumSection: React.FC<CurriculumSectionProps> = ({ onRegisterClick }) => {
  const [activeDay, setActiveDay] = useState<string>('day-1');

  const dayTabs: SegmentedTabItem[] = CURRICULUM_DAYS.map((day) => ({
    value: `day-${day.dayNumber}`,
    label: `Day ${day.dayNumber}: ${day.dayNumber === 1 ? 'Foundations & Creation' : 'Prototyping & Automation'}`,
    mobileLabel: `Day ${day.dayNumber}: ${day.dayNumber === 1 ? 'Foundations' : 'Automation'}`,
  }));

  const currentDayData =
    CURRICULUM_DAYS.find((d) => `day-${d.dayNumber}` === activeDay) || CURRICULUM_DAYS[0];

  const defaultExpanded = currentDayData.modules.map((m) => `mod-${currentDayData.dayNumber}-${m.order}`);

  return (
    <section
      id="curriculum"
      className="py-16 sm:py-20 bg-white relative scroll-mt-20 border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#222222] iiem-line-bottom-center">
            OUR <span className="text-[#E41937]">CURRICULUM</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-2">
            Explore our structured 2-day practical syllabus and live lab modules designed for immediate career impact.
          </p>
        </MotionReveal>

        {/* Day 1 / Day 2 Switcher Tabs */}
        <div className="mt-9">
          <SegmentedTabs
            value={activeDay}
            onValueChange={setActiveDay}
            items={dayTabs}
            layoutId="curriculumDayTabs"
            fullWidth
          />
        </div>

        {/* Day Banner + Accordion Modules */}
        <div className="mt-8 max-w-4xl mx-auto space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDayData.dayNumber}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Navy Banner Strip with Crimson Accent */}
              <div className="rounded-md bg-[#1F386B] text-white p-5 sm:p-6 shadow-lg border-l-4 border-[#E41937] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#E41937] text-white">
                      Day {currentDayData.dayNumber} Track
                    </span>
                    <span className="text-xs text-blue-100 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-blue-200" />
                      {currentDayData.scheduleTime}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white mt-2">
                    {currentDayData.title}
                  </h3>
                  <p className="text-blue-100/90 text-sm mt-1">
                    {currentDayData.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded bg-white hover:bg-[#E41937] text-[#1F386B] hover:text-white text-xs font-extrabold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                >
                  <span>Enroll in Cohort</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Institutional Module Accordion Cards */}
              <UiAccordion
                key={`acc-${currentDayData.dayNumber}`}
                type="multiple"
                defaultValue={defaultExpanded}
              >
                {currentDayData.modules.map((module) => (
                  <UiAccordionItem
                    key={module.order}
                    value={`mod-${currentDayData.dayNumber}-${module.order}`}
                  >
                    <UiAccordionTrigger>
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-10 h-10 rounded bg-[#1F386B] text-white font-mono font-bold text-sm flex items-center justify-center shrink-0">
                          0{module.order}
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#E41937]">
                            Interactive Lab Module • {module.duration}
                          </span>
                          <h4 className="text-base sm:text-lg font-extrabold text-[#222222] mt-0.5">
                            {module.moduleName}
                          </h4>
                        </div>
                      </div>
                    </UiAccordionTrigger>

                    <UiAccordionContent className="space-y-4">
                      <div>
                        <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 mt-2">
                          Core Topics Covered
                        </h5>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          {module.topics.map((topic, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E41937] mt-2 shrink-0" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-col gap-2.5 bg-[#F7F8FA] p-3.5 rounded border border-slate-200/90 min-w-0 max-w-full">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1F386B]">
                          <CheckCircle2 className="w-4 h-4 text-[#E41937] shrink-0" />
                          <span>{module.handsOnOutput}</span>
                        </div>

                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/80 flex-nowrap whitespace-nowrap overflow-x-auto no-scrollbar min-w-0 max-w-full">
                          <span className="text-[11px] text-slate-500 font-bold shrink-0">Tools:</span>
                          {module.toolsUsed.map((tool) => (
                            <span
                              key={tool}
                              className="text-[11px] px-2.5 py-0.5 rounded bg-white text-[#1F386B] border border-slate-200 font-bold shrink-0 whitespace-nowrap"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </UiAccordionContent>
                  </UiAccordionItem>
                ))}
              </UiAccordion>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
