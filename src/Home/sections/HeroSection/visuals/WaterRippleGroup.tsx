import { WaterRipple } from '../../decorations';
import { RIPPLES } from '../config/ripples';

export default function WaterRippleGroup() {
  return (
    <>
      {RIPPLES.map((r, i) => (
        <WaterRipple key={i} {...r} />
      ))}
    </>
  );
}
