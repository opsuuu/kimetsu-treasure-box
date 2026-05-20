import TraditionalDivider from './TraditionalDivider';

export default function WasujiHeading({ title, label }: { title: string; label: string }) {
  return (
    <div className='text-center mb-10'>
      <div className='inline-flex flex-col items-center gap-[0.6rem]'>
        <span className='font-mincho text-[1.7rem] text-gold tracking-widest leading-none'>
          {title}
        </span>
        <TraditionalDivider />
        <span
          className='font-mincho font-normal text-ink tracking-[0.3em]'
          style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
