import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Send, Search, User, Phone, Hash, Lock, CheckCircle, 
  AlertCircle, Users, Smartphone, CreditCard, DollarSign
} from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';
import { useTransactionNotification } from '@/hooks/useTransactionNotification';
import { useFeeCalculation } from '@/hooks/useFeeCalculation';

interface SendToMemberProps {
  user: any;
  chamaId: string;
  availableBalance: number;
}

const SendToMember: React.FC<SendToMemberProps> = ({ user, chamaId, availableBalance }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [sendAmount, setSendAmount] = useState('');
  const [pin, setPin] = useState('');
  const [notes, setNotes] = useState('');
  const [searchMethod, setSearchMethod] = useState<'phone' | 'id' | 'name'>('phone');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { showTransactionNotification } = useTransactionNotification();
  const { calculateFeeLocally } = useFeeCalculation();

  // Mock members data - would come from backend
  const chamaMembers = [
    {
      id: 'member-1',
      userId: 'user-1',
      name: 'John Doe',
      phone: '254712345678',
      uniqueId: 'JD001',
      balance: 45000,
      lastActive: '2024-01-15',
      status: 'active',
      avatar: null
    },
    {
      id: 'member-2', 
      userId: 'user-2',
      name: 'Jane Smith',
      phone: '254723456789',
      uniqueId: 'JS002',
      balance: 67000,
      lastActive: '2024-01-14',
      status: 'active',
      avatar: null
    },
    {
      id: 'member-3',
      userId: 'user-3', 
      name: 'Michael Brown',
      phone: '254734567890',
      uniqueId: 'MB003',
      balance: 23000,
      lastActive: '2024-01-10',
      status: 'active',
      avatar: null
    }
  ];

  const recentTransactions = [
    {
      id: 'txn-1',
      recipientName: 'Jane Smith',
      amount: 5000,
      date: '2024-01-14',
      status: 'completed'
    },
    {
      id: 'txn-2',
      recipientName: 'Michael Brown', 
      amount: 3500,
      date: '2024-01-12',
      status: 'completed'
    }
  ];

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    let foundMember = null;

    switch (searchMethod) {
      case 'phone':
        foundMember = chamaMembers.find(m => m.phone.includes(searchQuery));
        break;
      case 'id':
        foundMember = chamaMembers.find(m => m.uniqueId.toLowerCase() === query);
        break;
      case 'name':
        foundMember = chamaMembers.find(m => m.name.toLowerCase().includes(query));
        break;
    }

    if (foundMember) {
      setSelectedMember(foundMember);
      toast({
        title: "Member Found",
        description: `${foundMember.name} is ready to receive funds`,
      });
    } else {
      toast({
        title: "Member Not Found",
        description: "Please check the details and try again",
        variant: "destructive",
      });
    }
  };

  const handleSendMoney = async () => {
    if (!selectedMember || !sendAmount || !pin) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(sendAmount);
    if (amount <= 0 || amount > availableBalance) {
      toast({
        title: "Invalid Amount",
        description: `Amount must be between KES 1 and KES ${availableBalance.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate fee and new balance
      const fee = calculateFeeLocally('send_money', amount);
      const newBalance = availableBalance - amount - fee;

      // Show transaction notification
      showTransactionNotification({
        type: 'p2p_send',
        amount: amount,
        recipientName: selectedMember.name,
        recipientPhone: selectedMember.phone,
        newBalance: newBalance,
      });

      // Reset form
      setSelectedMember(null);
      setSendAmount('');
      setPin('');
      setNotes('');
      setSearchQuery('');
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const MemberCard = ({ member, onClick }: { member: any; onClick: () => void }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-medium">
            {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{member.name}</h4>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {member.phone}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {member.uniqueId}
              </span>
            </div>
          </div>
          <Badge variant="outline">{member.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Send to Member</h2>
        <p className="text-muted-foreground">Transfer funds to other chama members</p>
      </div>

      {/* Available Balance */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Available Balance</h3>
              <CurrencyDisplay 
                amount={availableBalance}
                className="text-3xl font-bold"
                showToggle={false}
              />
            </div>
            <CreditCard className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Send Money Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Money
            </CardTitle>
            <CardDescription>Enter member details and amount to transfer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Method Selection */}
            <div className="space-y-2">
              <Label>Search by</Label>
              <div className="flex gap-2">
                <Button
                  variant={searchMethod === 'phone' ? 'default' : 'outline'}
                  onClick={() => setSearchMethod('phone')}
                  size="sm"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Phone
                </Button>
                <Button
                  variant={searchMethod === 'id' ? 'default' : 'outline'}
                  onClick={() => setSearchMethod('id')}
                  size="sm"
                >
                  <Hash className="h-4 w-4 mr-2" />
                  ID
                </Button>
                <Button
                  variant={searchMethod === 'name' ? 'default' : 'outline'}
                  onClick={() => setSearchMethod('name')}
                  size="sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Name
                </Button>
              </div>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search">
                {searchMethod === 'phone' && 'Phone Number (254XXXXXXX)'}
                {searchMethod === 'id' && 'Member ID'}
                {searchMethod === 'name' && 'Member Name'}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchMethod === 'phone' ? '254712345678' :
                    searchMethod === 'id' ? 'MB003' : 'John Doe'
                  }
                />
                <Button onClick={handleSearch} disabled={!searchQuery}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Selected Member */}
            {selectedMember && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-800">{selectedMember.name}</h4>
                    <p className="text-sm text-green-600">{selectedMember.phone} • {selectedMember.uniqueId}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="Enter amount to send"
                max={availableBalance}
              />
              <p className="text-xs text-muted-foreground">
                Maximum: <CurrencyDisplay amount={availableBalance} showToggle={false} />
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment description"
              />
            </div>

            {/* PIN Input */}
            <div className="space-y-2">
              <Label htmlFor="pin">PIN *</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                maxLength={4}
              />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Your PIN is required to authorize the transfer
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full" 
                  disabled={!selectedMember || !sendAmount || !pin}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Money
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Transfer</DialogTitle>
                  <DialogDescription>
                    Please review the transfer details before confirming
                  </DialogDescription>
                </DialogHeader>
                {selectedMember && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Transfer Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>To:</span>
                          <span className="font-medium">{selectedMember.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span>{selectedMember.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-bold">
                            <CurrencyDisplay amount={parseFloat(sendAmount) || 0} showToggle={false} />
                          </span>
                        </div>
                        {notes && (
                          <div className="flex justify-between">
                            <span>Notes:</span>
                            <span className="text-right flex-1 ml-2">{notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      This transfer cannot be reversed once completed
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMoney} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Confirm Transfer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Quick Send & Recent Transactions */}
        <div className="space-y-6">
          {/* Quick Send to Recent Members */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Quick Send
              </CardTitle>
              <CardDescription>Send to recent recipients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {chamaMembers.slice(0, 3).map((member) => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  onClick={() => setSelectedMember(member)}
                />
              ))}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Transfers</CardTitle>
              <CardDescription>Your recent member-to-member transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Send className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{txn.recipientName}</p>
                        <p className="text-xs text-muted-foreground">{txn.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <CurrencyDisplay amount={txn.amount} showToggle={false} className="font-medium" />
                      <Badge variant="outline" className="text-xs">
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SendToMember;