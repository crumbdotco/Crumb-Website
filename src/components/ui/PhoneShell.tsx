import { cn } from '@/lib/utils';

interface PhoneShellProps {
  children: React.ReactNode;
  className?: string;
  screenClassName?: string;
}

export function PhoneShell({ children, className, screenClassName }: PhoneShellProps) {
  return (
    <div
      className={cn(
        'relative bg-[#050302] rounded-[44px] p-3',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_40px_120px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)]',
        className
      )}
    >
      <div
        className={cn(
          'relative bg-[#1A1208] rounded-[34px] overflow-hidden',
          screenClassName
        )}
      >
        {/* Notch — INSIDE the screen, attached to top of screen rim */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[88px] h-[24px] bg-black rounded-full z-20" />
        {children}
      </div>
    </div>
  );
}
