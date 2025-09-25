
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, TrendingUp, Calendar, Bell, Shield, FileText, MessageSquare, User, LayoutDashboard } from 'lucide-react';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import ChamaOverview from '@/components/chama/ChamaOverview';
import MemberManagement from '@/components/chama/MemberManagement';
import SavingsContributions from '@/components/chama/SavingsContributions';
import LoanManagement from '@/components/chama/LoanManagement';
import InvestmentTracking from '@/components/chama/InvestmentTracking';
import MeetingsVoting from '@/components/chama/MeetingsVoting';
import ExpenseManagement from '@/components/chama/ExpenseManagement';
import ReportsStatements from '@/components/chama/ReportsStatements';
import SecurityPermissions from '@/components/chama/SecurityPermissions';
import CommunityEducation from '@/components/chama/CommunityEducation';
import SmartNotifications from '@/components/chama/SmartNotifications';
import AdminTools from '@/components/chama/AdminTools';
import GroupChat from '@/components/chama/GroupChat';
import AdminDashboard from '@/components/chama/AdminDashboard';

const AdvancedChamaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Listen for navigation events from quick actions
  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('navigate-to-tab', handleNavigateToTab as EventListener);
    
    return () => {
      window.removeEventListener('navigate-to-tab', handleNavigateToTab as EventListener);
    };
  }, []);

  // Mock data for the selected chama
  const chamaData = {
    id: '1',
    name: 'Student Finance',
    description: 'Educational funding and financial support for students',
    logo: '/placeholder.svg',
    totalSavings: 1850000,
    loansIssued: 650000,
    totalContributions: 1420000,
    totalExpenses: 85000,
    memberCount: 18,
    activeLoans: 6,
    role: 'admin'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={chamaData.logo} 
              alt={chamaData.name} 
              className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                {chamaData.name}
              </h1>
              <p className="text-muted-foreground">{chamaData.description}</p>
              <Badge variant="secondary" className="mt-1">
                {chamaData.role === 'admin' ? 'Administrator' : 'Member'}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-15 bg-white/50 backdrop-blur-sm mb-6">
            <TabsTrigger value="admin-dashboard" className="flex items-center gap-1">
              <LayoutDashboard className="h-3 w-3" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span className="hidden sm:inline">Members</span>
            </TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">Savings</span>
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Loans</span>
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">Invest</span>
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="hidden sm:inline">Meetings</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
            <TabsTrigger value="generate-reports" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span className="hidden sm:inline">Generate Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin-dashboard">
            <AdminDashboard chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="overview">
            <ChamaOverview chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="members">
            <MemberManagement chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="savings">
            <SavingsContributions chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="loans">
            <LoanManagement chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="investments">
            <InvestmentTracking chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="meetings">
            <MeetingsVoting chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseManagement chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsStatements chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="security">
            <SecurityPermissions chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="community">
            <CommunityEducation chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="chat">
            <GroupChat chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="notifications">
            <SmartNotifications chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="admin">
            <AdminTools chamaData={chamaData} />
          </TabsContent>

          <TabsContent value="generate-reports">
            <ReportsStatements chamaData={chamaData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedChamaPage;
