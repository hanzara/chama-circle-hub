
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, TrendingUp, Users, Download, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import CurrencyDisplay from '@/components/CurrencyDisplay';

interface ContributionTrackerProps {
  chamaData: any;
}

const ContributionTracker: React.FC<ContributionTrackerProps> = ({ chamaData }) => {
  const { toast } = useToast();
  const [contributions, setContributions] = useState([]);
  const [memberSummary, setMemberSummary] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchContributions();
    fetchMemberSummary();
  }, [selectedMonth, selectedYear]);

  const fetchContributions = async () => {
    try {
      const response = await fetch(`/api/contributions/chama/${chamaData.id}?month=${selectedMonth}&year=${selectedYear}`);
      const data = await response.json();
      setContributions(data.contributions || []);
    } catch (error) {
      console.error('Error fetching contributions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contributions",
        variant: "destructive",
      });
    }
  };

  const fetchMemberSummary = async () => {
    try {
      const response = await fetch(`/api/contributions/chama/${chamaData.id}/summary`);
      const data = await response.json();
      setMemberSummary(data || []);
    } catch (error) {
      console.error('Error fetching member summary:', error);
    }
  };

  const generateReport = async (reportType: string, format: string = 'pdf') => {
    setIsGeneratingReport(true);
    try {
      let endpoint = '';
      if (reportType === 'monthly') {
        endpoint = `/api/reports/chama/${chamaData.id}/monthly?year=${selectedYear}&month=${selectedMonth}&format=${format}`;
      } else if (reportType === 'financial') {
        const startDate = new Date(selectedYear, 0, 1).toISOString();
        const endDate = new Date(selectedYear, 11, 31).toISOString();
        endpoint = `/api/reports/chama/${chamaData.id}/financial?startDate=${startDate}&endDate=${endDate}&format=${format}`;
      }

      const response = await fetch(endpoint);
      const data = await response.json();

      if (format === 'pdf') {
        // Create download link
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Report Generated! 📄",
          description: "Your PDF report has been downloaded.",
        });
      } else {
        // Handle JSON response
        console.log('Report data:', data);
        toast({
          title: "Report Generated! 📊",
          description: "Report data has been loaded.",
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getContributionStatus = (member: any) => {
    const expected = chamaData.contributionAmount || 0;
    const contributed = member.monthlyContribution || 0;
    
    if (contributed >= expected) return 'complete';
    if (contributed > 0) return 'partial';
    return 'pending';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateSummaryStats = () => {
    const totalExpected = memberSummary.length * (chamaData.contributionAmount || 0);
    const totalCollected = memberSummary.reduce((sum, member) => sum + (member.monthlyContribution || 0), 0);
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
    
    const completeMembers = memberSummary.filter(member => 
      getContributionStatus(member) === 'complete'
    ).length;
    
    return {
      totalExpected,
      totalCollected,
      collectionRate,
      completeMembers,
      totalMembers: memberSummary.length
    };
  };

  const stats = calculateSummaryStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Contribution Tracker</h2>
          <p className="text-muted-foreground">Monitor and track member contributions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => generateReport('monthly', 'pdf')}
            disabled={isGeneratingReport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGeneratingReport ? 'Generating...' : 'Monthly Report'}
          </Button>
          <Button 
            variant="outline"
            onClick={() => generateReport('financial', 'pdf')}
            disabled={isGeneratingReport}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Financial Statement
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
              <p className="text-2xl font-bold">
                <CurrencyDisplay amount={stats.totalCollected} />
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Collection Rate</p>
              <p className="text-2xl font-bold">{stats.collectionRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Complete Members</p>
              <p className="text-2xl font-bold">{stats.completeMembers}/{stats.totalMembers}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Period</p>
              <p className="text-lg font-bold">{months[selectedMonth - 1]} {selectedYear}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Period</CardTitle>
          <CardDescription>Choose month and year to view contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="month">Month</Label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md bg-background"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Member Summary</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Contribution Summary</CardTitle>
              <CardDescription>
                Overview of all member contributions for {months[selectedMonth - 1]} {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Contributed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberSummary.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{member.member?.fullName || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{member.member?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <CurrencyDisplay amount={chamaData.contributionAmount || 0} />
                      </TableCell>
                      <TableCell>
                        <CurrencyDisplay amount={member.monthlyContribution || 0} />
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(getContributionStatus(member))}
                      </TableCell>
                      <TableCell>
                        {member.lastContributionDate 
                          ? new Date(member.lastContributionDate).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                All contribution transactions for {months[selectedMonth - 1]} {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((contribution: any, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(contribution.contributionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {contribution.memberId?.userId?.fullName || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <CurrencyDisplay amount={contribution.amount} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{contribution.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>{contribution.paymentReference || '-'}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {contribution.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContributionTracker;
