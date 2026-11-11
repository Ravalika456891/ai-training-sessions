import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from './cn';

export interface UiAccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (val: any) => void;
  collapsible?: boolean;
  className?: string;
}

/** Radix UI accessible accordion root wrapper with clean spacing. */
export const UiAccordion: React.FC<UiAccordionProps> = ({
  children,
  type = 'multiple',
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  className,
}) => {
  if (type === 'single') {
    return (
      <Accordion.Root
        type="single"
        collapsible={collapsible}
        value={value as string | undefined}
        defaultValue={defaultValue as string | undefined}
        onValueChange={onValueChange}
        className={cn('space-y-3', className)}
      >
        {children}
      </Accordion.Root>
    );
  }

  return (
    <Accordion.Root
      type="multiple"
      value={value as string[] | undefined}
      defaultValue={defaultValue as string[] | undefined}
      onValueChange={onValueChange}
      className={cn('space-y-3', className)}
    >
      {children}
    </Accordion.Root>
  );
};

export const UiAccordionItem: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ value, children, className }) => (
  <Accordion.Item
    value={value}
    className={cn(
      'group rounded-2xl bg-white border border-slate-200/90 shadow-sm transition-all duration-200 overflow-hidden',
      'data-[state=open]:border-[#081e4a]/45 data-[state=open]:shadow-md data-[state=open]:shadow-[#081e4a]/8',
      'hover:border-slate-300',
      className
    )}
  >
    {children}
  </Accordion.Item>
);

export const UiAccordionTrigger: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <Accordion.Header className="flex w-full">
    <Accordion.Trigger
      className={cn(
        'flex flex-1 items-center justify-between gap-3 p-4 sm:p-5 text-left transition-colors outline-none cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-blue-500/40',
        className
      )}
    >
      <div className="flex-1 min-w-0">{children}</div>
      <div className="w-8 h-8 rounded-xl bg-slate-100/90 text-slate-600 flex items-center justify-center shrink-0 transition-all duration-200 group-data-[state=open]:bg-[#081e4a] group-data-[state=open]:text-white">
        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </div>
    </Accordion.Trigger>
  </Accordion.Header>
);

export const UiAccordionContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
    <div className={cn('px-4 pb-5 sm:px-5 pt-1 border-t border-slate-100', className)}>
      {children}
    </div>
  </Accordion.Content>
);

