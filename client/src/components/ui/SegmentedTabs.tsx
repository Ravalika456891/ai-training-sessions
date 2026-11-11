import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import { cn } from './cn';

export interface SegmentedTabItem {
  value: string;
  label: string;
  mobileLabel?: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface SegmentedTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: SegmentedTabItem[];
  layoutId: string;
  className?: string;
  listClassName?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

/** Radix UI accessible tab strip with Framer Motion shared layout indicator. */
export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  value,
  onValueChange,
  items,
  layoutId,
  className,
  listClassName,
  fullWidth = false,
  children,
}) => {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange} className={cn('w-full', className)}>
      <div className="flex justify-center">
        <Tabs.List
          className={cn(
            'inline-flex flex-wrap sm:flex-nowrap items-center justify-center gap-1.5 p-1.5 rounded-2xl',
            'bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm',
            fullWidth && 'w-full max-w-2xl',
            listClassName
          )}
        >
          {items.map((item) => {
            const isActive = value === item.value;
            return (
              <Tabs.Trigger
                key={item.value}
                value={item.value}
                className={cn(
                  'relative z-10 inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl',
                  'text-xs sm:text-sm font-semibold transition-colors outline-none cursor-pointer select-none',
                  fullWidth && 'flex-1',
                  isActive
                    ? 'text-white'
                    : 'text-slate-600 hover:text-[#081e4a]'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    className="absolute inset-0 -z-10 rounded-xl bg-[#081e4a] shadow-md shadow-[#081e4a]/20"
                  />
                )}
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className={item.mobileLabel ? 'hidden sm:inline' : ''}>{item.label}</span>
                {item.mobileLabel && (
                  <span className="sm:hidden">{item.mobileLabel}</span>
                )}
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-md',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>
      </div>
      {children}
    </Tabs.Root>
  );
};

export const SegmentedTabContent = Tabs.Content;

