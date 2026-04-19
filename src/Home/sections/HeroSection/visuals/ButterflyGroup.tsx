import { Butterfly } from '../../decorations';
import { BUTTERFLIES } from '../config/butterflies';

export default function ButterflyGroup() {
  return (
    <>
      {BUTTERFLIES.map((b, i) => (
        <Butterfly key={i} {...b} />
      ))}
    </>
  );
}
