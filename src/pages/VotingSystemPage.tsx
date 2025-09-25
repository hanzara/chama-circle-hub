
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import VotingSystem from '@/components/VotingSystem';

const VotingSystemPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <VotingSystem />
    </div>
  );
};

export default VotingSystemPage;
