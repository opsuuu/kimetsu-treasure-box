import { cn } from '@/lib/utils';

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
  align?: 'baseline' | 'start';
}

export default function InfoRow({ label, children, align = 'baseline' }: InfoRowProps) {
  return (
    <div className={cn('flex gap-4', align === 'baseline' && 'items-baseline')}>
      <dt
        className={cn(
          'text-[0.58rem] tracking-[0.3em] text-ink-faint w-16 shrink-0 font-sans',
          align === 'start' && 'pt-[0.15em]',
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          'min-w-0 text-[0.78rem] tracking-[0.15em] text-ink-mid font-mincho m-0',
          align === 'start' && 'leading-loose',
        )}
      >
        {children}
      </dd>
    </div>
  );
}
