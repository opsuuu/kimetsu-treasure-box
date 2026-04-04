import { WasujiHeading } from '@/components';
import { CHARACTERS } from '@/constants/characters';
import CharacterCard from './CharacterCard';

export default function CharacterSection() {
  return (
    <section className='py-20 px-8 max-w-[1100px] mx-auto'>
      <WasujiHeading title='弐' label='角色周邊' />
      <div className='grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8'>
        {CHARACTERS.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </section>
  );
}
