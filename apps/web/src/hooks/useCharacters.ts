import { useQuery } from '@tanstack/react-query';
import { fetchCharacters } from '@/services/characters';

export const useCharacters = () => {
  return useQuery({
    queryKey: ['characters'],
    queryFn: fetchCharacters,
  });
};
