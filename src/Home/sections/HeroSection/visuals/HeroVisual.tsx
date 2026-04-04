import {
  ButterflyArcs,
  SeigaihaBg,
  WanderingButterfly,
  WaterArcs,
  WisteriaCorner,
  WisteriaLeft,
} from '../../decorations';
import ButterflyGroup from './ButterflyGroup';
import WaterRippleGroup from './WaterRippleGroup';

export default function HeroVisual() {
  return (
    <>
      {/* Warm paper gradients */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_70%_85%_at_12%_65%,rgba(100,165,210,0.15)_0%,transparent_60%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_65%_80%_at_88%_38%,rgba(165,130,215,0.15)_0%,transparent_60%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_50%_50%,rgba(240,225,195,0.25)_0%,transparent_70%)]' />
      </div>

      <SeigaihaBg />
      <WaterArcs />

      {/* Wisteria + Butterflies */}
      <svg
        aria-hidden
        className='absolute inset-0 pointer-events-none w-full h-full'
        viewBox='0 0 1440 900'
        preserveAspectRatio='xMidYMid slice'
      >
        <WisteriaCorner />
        <ButterflyArcs />
        <ButterflyGroup />
      </svg>

      {/* Left-side wisteria */}
      <svg
        aria-hidden
        className='absolute inset-0 pointer-events-none w-full h-full'
        viewBox='0 0 1440 900'
        preserveAspectRatio='xMidYMid slice'
      >
        <WisteriaLeft />
      </svg>

      {/* Wandering butterflies */}
      <WanderingButterfly animName='bfFlight1' duration='18s' delay='2s' size={38} />
      <WanderingButterfly animName='bfFlight2' duration='14s' delay='9s' size={32} />
      <WanderingButterfly animName='bfFlight3' duration='22s' delay='5s' size={28} />

      {/* Water ripples */}
      <WaterRippleGroup />
    </>
  );
}
