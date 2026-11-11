import React from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from './cn';

export interface SelectDropdownOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  rightPrimary?: string;
  rightSecondary?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectDropdownOption[];
  label?: string;
  hintRight?: string;
  required?: boolean;
  icon?: React.ReactNode;
  placeholder?: string;
  ariaLabel?: string;
  error?: string;
  variant?: 'default' | 'rich' | 'compact';
  className?: string;
  triggerClassName?: string;
}

/** Accessible, touch-friendly Radix UI dropdown supporting rich cohort rows and compact controls. */
export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  value,
  onValueChange,
  options,
  label,
  hintRight,
  required,
  icon,
  placeholder = 'Select an option...',
  ariaLabel,
  error,
  variant = 'default',
  className,
  triggerClassName,
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn('w-full', className)}>
      {(label || hintRight) && (
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {label && (
            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              {icon && <span className="text-[#1D4ED8] shrink-0">{icon}</span>}
              <span>{label}</span>
              {required && <span className="text-rose-500">*</span>}
            </label>
          )}
          {hintRight && (
            <span className="text-[11px] font-semibold text-[#1D4ED8] bg-blue-50/90 border border-blue-200/80 px-2 py-0.5 rounded-full whitespace-nowrap">
              {hintRight}
            </span>
          )}
        </div>
      )}

      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger
          aria-label={ariaLabel || label || placeholder}
          className={cn(
            'group w-full flex items-center justify-between gap-2.5 text-left transition-all duration-150 outline-none cursor-pointer',
            'bg-white border rounded-xl shadow-sm',
            'hover:border-[#2563EB]/60 hover:bg-slate-50/50',
            'focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/15',
            'data-[state=open]:border-[#1D4ED8] data-[state=open]:ring-4 data-[state=open]:ring-blue-500/15',
            error ? 'border-rose-400 focus:ring-rose-500/15' : 'border-slate-200',
            variant === 'compact' && 'px-3 py-2.5 text-sm rounded-xl min-h-[44px]',
            variant === 'default' && 'px-3.5 py-2.5 text-sm rounded-xl min-h-[46px]',
            variant === 'rich' && 'px-4 py-3.5 rounded-2xl min-h-[58px] bg-gradient-to-b from-white to-slate-50/60',
            triggerClassName
          )}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {selectedOption?.icon && (
              <span className="shrink-0 text-[#1D4ED8]">{selectedOption.icon}</span>
            )}
            {variant === 'rich' && selectedOption ? (
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-[#0A2558] tracking-tight truncate">
                      {selectedOption.label}
                    </span>
                    {selectedOption.badge && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {selectedOption.badge}
                      </span>
                    )}
                  </div>
                  {selectedOption.sublabel && (
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {selectedOption.sublabel}
                    </p>
                  )}
                </div>

                {(selectedOption.rightPrimary || selectedOption.rightSecondary) && (
                  <div className="sm:text-right shrink-0 flex sm:block items-baseline gap-2">
                    {selectedOption.rightPrimary && (
                      <span className="text-sm sm:text-base font-black text-[#0F172A]">
                        {selectedOption.rightPrimary}
                      </span>
                    )}
                    {selectedOption.rightSecondary && (
                      <span className="text-[11px] text-slate-500 font-medium sm:block">
                        {selectedOption.rightSecondary}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <span className="truncate font-semibold text-[#0F172A] text-sm">
                <Select.Value placeholder={placeholder} />
              </span>
            )}
          </div>

          <Select.Icon asChild>
            <div
              className={cn(
                'shrink-0 flex items-center justify-center rounded-lg transition-all duration-200',
                variant === 'compact'
                  ? 'w-5 h-5 text-slate-500'
                  : 'w-7 h-7 bg-slate-100/90 group-hover:bg-blue-50 text-slate-600 group-hover:text-[#1D4ED8] group-data-[state=open]:bg-[#0A2558] group-data-[state=open]:text-white'
              )}
            >
              <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            align="start"
            className="z-[100] w-[var(--radix-select-trigger-width)] min-w-[200px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/15 animate-in fade-in-0 zoom-in-95"
          >
            <Select.Viewport className="p-1.5 max-h-72 overflow-y-auto space-y-1">
              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={cn(
                    'relative flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm outline-none select-none transition-colors cursor-pointer',
                    'text-[#0F172A] data-[highlighted]:bg-blue-50/90 data-[highlighted]:text-[#0A2558]',
                    'data-[state=checked]:bg-[#EFF6FF] data-[state=checked]:font-semibold',
                    'data-[disabled]:opacity-45 data-[disabled]:pointer-events-none'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-6">
                    {opt.icon && <span className="shrink-0 text-[#1D4ED8]">{opt.icon}</span>}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select.ItemText>{opt.label}</Select.ItemText>
                        {opt.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{opt.sublabel}</p>
                      )}
                    </div>
                    {opt.rightPrimary && (
                      <div className="text-right shrink-0">
                        <div className="text-xs font-extrabold text-[#0A2558]">
                          {opt.rightPrimary}
                        </div>
                        {opt.rightSecondary && (
                          <div className="text-[10px] text-slate-500">{opt.rightSecondary}</div>
                        )}
                      </div>
                    )}
                  </div>

                  <Select.ItemIndicator className="absolute right-3 flex items-center justify-center w-5 h-5 rounded-full bg-[#0A2558] text-white">
                    <Check className="w-3 h-3" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {error && (
        <p className="text-xs text-rose-600 font-medium mt-1.5">{error}</p>
      )}
    </div>
  );
};
