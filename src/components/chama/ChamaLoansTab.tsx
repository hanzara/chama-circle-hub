import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoanMemberView } from './LoanMemberView';
import { LoanLeaderView } from './LoanLeaderView';

interface ChamaLoansTabProps {
  chamaId: string;
  userRole?: string;
  isAdmin?: boolean;
}

export const ChamaLoansTab: React.FC<ChamaLoansTabProps> = ({ 
  chamaId, 
  userRole = 'member',
  isAdmin = false 
}) => {
  const isLeader = ['admin', 'treasurer', 'chairman', 'secretary'].includes(userRole);
  
  const chamaData = { name: "Chama" };


  return (
    <div className="space-y-6">
      {isLeader ? (
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Loan Management</TabsTrigger>
            <TabsTrigger value="myloans">My Loans</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="mt-6">
            <LoanLeaderView chamaId={chamaId} userRole={userRole} />
          </TabsContent>

          <TabsContent value="myloans" className="mt-6">
            <LoanMemberView chamaId={chamaId} chamaData={chamaData} />
          </TabsContent>
        </Tabs>
      ) : (
        <LoanMemberView chamaId={chamaId} chamaData={chamaData} />
      )}
    </div>
  );
};