import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Mock implementation since investment-related tables don't exist
export const useInvestmentData = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['investment-data', user?.id],
    queryFn: async () => {
      // Return mock data for now
      return {
        investments: [],
        availableProjects: [],
        statistics: {
          totalInvested: 0,
          totalReturns: 0,
          activeInvestments: 0,
          portfolioValue: 0,
          overallROI: 0,
        },
        categoryDistribution: {},
        performanceData: [],
      };
    },
    enabled: !!user,
  });
};

export const useCreateInvestment = () => {
  const { toast } = useToast();

  return {
    mutate: async (investmentData: any) => {
      toast({
        title: "Feature Not Available",
        description: "Investment features are not available in this version",
        variant: "destructive",
      });
      throw new Error("Investment tables not available");
    },
    isLoading: false,
    isPending: false,
  };
};