import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CURRICULUM_DAYS } from '../../data/workshopData';

interface CurriculumSectionProps {
  onRegisterClick: () => void;
}

export const CurriculumSection: React.FC<CurriculumSectionProps> = ({ onRegisterClick }) => {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [expandedModules, setExpandedModules] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);

  const toggleModule = (moduleOrder: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleOrder)
        ? prev.filter((id) => id !== moduleOrder)
        : [...prev, moduleOrder]
    );
  };

  const currentDayData = CURRICULUM_DAYS.find((d) => d.dayNumber === activeDay) || CURRICULUM_DAYS[0];

  return (
    <section id="curriculum" className="py-20 bg-[#0A0F1D] relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md">
            Interactive Syllabus
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Comprehensive 2-Day Curriculum
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Every module includes structured demonstrations, guided lab exercises, and tangible outputs. No passive lectures.
          </p>
        </div>

        {/* Day 1 vs Day 2 Interactive Toggle Tabs */}
        <div className="mt-10 flex justify-center">
          <div className="p-1.5 rounded-2xl bg-[#111827] border border-slate-800 flex items-center gap-2 max-w-xl w-full">
            {CURRICULUM_DAYS.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDay(day.dayNumber)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 ${
                  activeDay === day.dayNumber
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>Day {day.dayNumber}:</span>
                <span className="font-normal opacity-90 hidden sm:inline">
                  {day.dayNumber === 1 ? 'Foundations & Creation' : 'Prototyping & Automation'}
                </span>
                <span className="font-normal opacity-90 sm:hidden">
                  {day.dayNumber === 1 ? 'Foundations' : 'Prototyping'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Day Overview Banner */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">
                  Day {currentDayData.dayNumber} Roadmap
                </Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {currentDayData.scheduleTime}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {currentDayData.title}
              </h3>
              <p className="text-slate-300 text-sm mt-1">
                {currentDayData.subtitle}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onRegisterClick}
              className="shrink-0"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Enroll in Cohort
            </Button>
          </div>
        </div>

        {/* Module Breakdown Accordions */}
        <div className="mt-6 max-w-4xl mx-auto space-y-4">
          {currentDayData.modules.map((module) => {
            const isExpanded = expandedModules.includes(module.order);

            return (
              <Card
                key={module.order}
                className="border-slate-800 transition-all hover:border-slate-700 bg-[#111827]"
              >
                {/* Module Header Bar */}
                <button
                  onClick={() => toggleModule(module.order)}
                  className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0A0F1D] border border-slate-700/60 text-blue-400 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                      0{module.order}
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-white">
                        {module.moduleName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {module.duration}
                        </span>
                        <span>•</span>
                        <span className="text-blue-400 font-medium">
                          Interactive Live Lab
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#0A0F1D] text-slate-400 hover:text-white transition-transform shrink-0">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Module Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-6 sm:px-6 border-t border-slate-800/70 pt-4 space-y-4 animate-in fade-in-50 duration-200">
                    {/* Topics Bullet List */}
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Core Topics Covered
                      </h5>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
                        {module.topics.map((topic, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deliverable & Tools Row */}
                    <div className="pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0F1D] p-3.5 rounded-xl">
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{module.handsOnOutput}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-slate-400 font-medium">
                          Tools:
                        </span>
                        {module.toolsUsed.map((tool) => (
                          <span
                            key={tool}
                            className="text-[11px] px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-slate-700/60"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
