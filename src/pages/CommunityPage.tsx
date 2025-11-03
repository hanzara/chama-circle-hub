import React from 'react';
import { DynamicTabs, MainTab } from "@/components/ui/dynamic-tabs";
import { 
  Users, 
  Network, 
  Vote, 
  Compass,
  MessageSquare,
  BookOpen,
  Heart,
  Shield
} from 'lucide-react';
import Navigation from '@/components/Navigation';

// Import existing page content components
import CommunityHubPage from './CommunityHubPage';
import CommunityNetworkingPage from './CommunityNetworkingPage';
import VotingSystemPage from './VotingSystemPage';
import FinancialNavigatorPage from './FinancialNavigatorPage';

const CommunityPage = () => {
  const getMainTabs = (): MainTab[] => [
    {
      id: 'hub',
      label: 'Community Hub',
      icon: <Users className="h-4 w-4" />,
      content: (
        <div className="pt-4">
          <CommunityHubPage />
        </div>
      )
    },
    {
      id: 'networking',
      label: 'Networking',
      icon: <Network className="h-4 w-4" />,
      content: (
        <div className="pt-4">
          <CommunityNetworkingPage />
        </div>
      )
    },
    {
      id: 'voting',
      label: 'Voting System',
      icon: <Vote className="h-4 w-4" />,
      content: (
        <div className="pt-4">
          <VotingSystemPage />
        </div>
      )
    },
    {
      id: 'navigator',
      label: 'Financial Navigator',
      icon: <Compass className="h-4 w-4" />,
      content: (
        <div className="pt-4">
          <FinancialNavigatorPage />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-lg">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Community Platform
                </h1>
                <p className="text-muted-foreground text-lg">
                  Connect, learn, and grow together in our financial community
                </p>
              </div>
            </div>
          </div>

          <DynamicTabs
            mainTabs={getMainTabs()}
            defaultTab="hub"
            className="w-full"
          />
        </div>
      </main>
    </div>
  );
};

export default CommunityPage;