import { WasujiHeading, LoadingState, ErrorState, EmptyState } from '@/components';
import CharacterCard from './CharacterCard';
import { useCharacters } from '@/hooks';

export default function CharacterSection() {
  const { data: characters, isLoading, isError } = useCharacters();

  const renderContent = () => {
    if (isLoading) return <LoadingState />;
    if (isError) return <ErrorState />;
    if (!characters || characters.length === 0) return <EmptyState message='暫無角色資料' />;

    return (
      <div className='grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8'>
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    );
  };

  return (
    <section className='py-20 px-8 max-w-[1100px] mx-auto'>
      <WasujiHeading title='弐' label='角色周邊' />
      {renderContent()}
    </section>
  );
}
