import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
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
      className="py-20 sm:py-24 bg-[#F4F7FE] relative scroll-mt-20 border-b border-slate-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md" icon={<BookOpen className="w-3.5 h-3.5 text-[#1D4ED8]" />}>
            Interactive Syllabus
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Comprehensive{' '}
            <span className="bg-gradient-to-r from-[#0A2558] via-[#1D4ED8] to-[#0EA5E9] bg-clip-text text-transparent">
              2-Day Curriculum
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every module includes structured demonstrations, guided lab exercises, and tangible outputs. No passive lectures.
          </p>
        </MotionReveal>

        {/* Radix UI Day 1 / Day 2 Switcher */}
        <div className="mt-10">
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              {/* Roadmap Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-[#081E4A] via-[#0F3175] to-[#1D4ED8] text-white p-5 sm:p-6 shadow-lg shadow-blue-950/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-sky-200">
                      Day {currentDayData.dayNumber} Roadmap
                    </span>
                    <span className="text-xs text-blue-100 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-sky-300" />
                      {currentDayData.scheduleTime}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                    {currentDayData.title}
                  </h3>
                  <p className="text-blue-100/90 text-sm mt-1">
                    {currentDayData.subtitle}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRegisterClick}
                  className="shrink-0 bg-white hover:bg-blue-50 border-white text-[#0A2558] font-bold"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Enroll in Cohort
                </Button>
              </div>

              {/* Radix UI Accordion Modules */}
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
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#0A2558] font-mono font-bold text-sm flex items-center justify-center shrink-0">
                          0{module.order}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base sm:text-lg font-bold text-[#0F172A]">
                            {module.moduleName}
                          </h4>
                          <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {module.duration}
                            </span>
                            <span>•</span>
                            <span className="text-[#1D4ED8] font-semibold">
                              Interactive Live Lab
                            </span>
                          </div>
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
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] mt-2 shrink-0" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0A2558]">
                          <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] shrink-0" />
                          <span>{module.handsOnOutput}</span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-slate-500 font-medium">Tools:</span>
                          {module.toolsUsed.map((tool) => (
                            <span
                              key={tool}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-semibold"
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
