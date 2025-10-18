import { useUserChamas, useCreateChamaWithMembership, useJoinChamaWithMembership, useAvailableChamasToJoin } from './useChamasData';
import { useQuery } from '@tanstack/react-query';

// Use real implementation now
export const useChamas = useUserChamas;
export const useCreateChama = useCreateChamaWithMembership;
export const useJoinChama = useJoinChamaWithMembership;
export const useAvailableChamas = useAvailableChamasToJoin;

export const useChamaById = (chamaId: string | undefined) => {
  return useQuery({
    queryKey: ['chama', chamaId],
    queryFn: async () => {
      // Return mock data for now
      return null;
    },
    enabled: !!chamaId,
  });
};