import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Send, Eye, ArrowUpDown, Settings, Users, 
  Wallet, TrendingUp, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { useSubAccounts, type SubAccount } from '@/hooks/useSubAccounts';

const SubAccountManager = () => {
  const { 
    subAccounts, 
    transactions, 
    loading, 
    createSubAccount, 
    transferFunds, 
    updatePermissions, 
    deactivateSubAccount,
    sendMoney,
    receiveMoney,
    convertMoney
  } = useSubAccounts();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SubAccount | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any>(null);

  const [newAccount, setNewAccount] = useState({
    name: '',
    description: '',
    currency: 'KES',
    permissions: {
      view: true,
      send: false,
      receive: true,
      convert: false,
    },
    is_active: true,
  });

  const [transferData, setTransferData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: '',
  });

  const [sendData, setSendData] = useState({
    recipient: '',
    amount: '',
    description: '',
  });

  const [convertData, setConvertData] = useState({
    fromAccount: '',
    toAccount: '',
    amount: '',
  });

  const handleCreateAccount = async () => {
    if (!newAccount.name) return;
    
    const result = await createSubAccount(newAccount);
    if (result.success) {
      setShowCreateModal(false);
      setNewAccount({
        name: '',
        description: '',
        currency: 'KES',
        permissions: {
          view: true,
          send: false,
          receive: true,
          convert: false,
        },
        is_active: true,
      });
    }
  };

  const handleTransfer = async () => {
    if (!transferData.fromAccount || !transferData.toAccount || !transferData.amount) return;
    
    const result = await transferFunds(
      transferData.fromAccount,
      transferData.toAccount,
      parseFloat(transferData.amount),
      transferData.description
    );
    
    if (result.success) {
      setShowTransferModal(false);
      setTransferData({ fromAccount: '', toAccount: '', amount: '', description: '' });
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedAccount) return;
    
    const result = await updatePermissions(selectedAccount.id, selectedAccount.permissions);
    if (result.success) {
      setShowPermissionsModal(false);
      setSelectedAccount(null);
    }
  };

  const handleSendMoney = async () => {
    if (!selectedAccount || !sendData.recipient || !sendData.amount) return;
    
    const result = await sendMoney(
      selectedAccount.id,
      sendData.recipient,
      parseFloat(sendData.amount),
      sendData.description || 'Payment'
    );
    
    if (result.success) {
      setShowSendModal(false);
      setSendData({ recipient: '', amount: '', description: '' });
      setSelectedAccount(null);
    }
  };

  const handleReceiveMoney = async (account: SubAccount) => {
    const result = await receiveMoney(account.id);
    if (result.success && result.paymentMethods) {
      setPaymentMethods(result.paymentMethods);
      setSelectedAccount(account);
      setShowReceiveModal(true);
    }
  };

  const handleConvertMoney = async () => {
    if (!convertData.fromAccount || !convertData.toAccount || !convertData.amount) return;

    const fromAccount = subAccounts.find(a => a.id === convertData.fromAccount);
    const toAccount = subAccounts.find(a => a.id === convertData.toAccount);
    
    if (!fromAccount || !toAccount) return;

    const result = await convertMoney(
      convertData.fromAccount,
      convertData.toAccount,
      parseFloat(convertData.amount),
      fromAccount.currency,
      toAccount.currency
    );
    
    if (result.success) {
      setShowConvertModal(false);
      setConvertData({ fromAccount: '', toAccount: '', amount: '' });
    }
  };

  const totalBalance = subAccounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">KES {totalBalance.toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Accounts</p>
                <p className="text-2xl font-bold">{subAccounts.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="accounts">Sub-Accounts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Sub-Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                      id="name"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Family Account"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newAccount.description}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Account purpose and details"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={newAccount.currency} onValueChange={(value) => 
                      setNewAccount(prev => ({ ...prev, currency: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Permissions</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Send Money</span>
                        <Switch
                          checked={newAccount.permissions.send}
                          onCheckedChange={(checked) => 
                            setNewAccount(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, send: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Receive Money</span>
                        <Switch
                          checked={newAccount.permissions.receive}
                          onCheckedChange={(checked) => 
                            setNewAccount(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, receive: checked }
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Convert Currency</span>
                        <Switch
                          checked={newAccount.permissions.convert}
                          onCheckedChange={(checked) => 
                            setNewAccount(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, convert: checked }
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleCreateAccount} className="w-full" disabled={loading}>
                    Create Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Transfer Funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Transfer Between Accounts</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>From Account</Label>
                    <Select value={transferData.fromAccount} onValueChange={(value) => 
                      setTransferData(prev => ({ ...prev, fromAccount: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                      <SelectContent>
                        {subAccounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} (KES {account.balance.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>To Account</Label>
                    <Select value={transferData.toAccount} onValueChange={(value) => 
                      setTransferData(prev => ({ ...prev, toAccount: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                      <SelectContent>
                        {subAccounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} (KES {account.balance.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount (KES)</Label>
                    <Input
                      type="number"
                      value={transferData.amount}
                      onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={transferData.description}
                      onChange={(e) => setTransferData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Transfer description"
                    />
                  </div>
                  <Button onClick={handleTransfer} className="w-full" disabled={loading}>
                    Transfer Funds
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="accounts">
          <div className="grid gap-4">
            {subAccounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Wallet className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{account.name}</h3>
                        <p className="text-muted-foreground text-sm">{account.description}</p>
                        <div className="flex gap-2 mt-2">
                          {account.permissions.send && <Badge variant="secondary">Send</Badge>}
                          {account.permissions.receive && <Badge variant="secondary">Receive</Badge>}
                          {account.permissions.convert && <Badge variant="secondary">Convert</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {account.currency} {account.balance.toLocaleString()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {account.permissions.send && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAccount(account);
                              setShowSendModal(true);
                            }}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </Button>
                        )}
                        {account.permissions.receive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReceiveMoney(account)}
                          >
                            Receive
                          </Button>
                        )}
                        {account.permissions.convert && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setConvertData(prev => ({ ...prev, fromAccount: account.id }));
                              setShowConvertModal(true);
                            }}
                          >
                            <ArrowUpDown className="h-4 w-4 mr-1" />
                            Convert
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowPermissionsModal(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => {
                  const account = subAccounts.find(a => a.id === transaction.sub_account_id);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.status === 'completed' ? 'bg-green-100' : 
                          transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                        }`}>
                          {transaction.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : transaction.status === 'pending' ? (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{transaction.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {account?.name} • {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}
                          {transaction.currency} {transaction.amount.toLocaleString()}
                        </p>
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Money Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Money from {selectedAccount?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Recipient Phone Number</Label>
              <Input
                type="tel"
                value={sendData.recipient}
                onChange={(e) => setSendData(prev => ({ ...prev, recipient: e.target.value }))}
                placeholder="0712345678"
              />
            </div>
            <div>
              <Label>Amount ({selectedAccount?.currency})</Label>
              <Input
                type="number"
                value={sendData.amount}
                onChange={(e) => setSendData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
              {sendData.amount && (
                <p className="text-sm text-muted-foreground mt-1">
                  Fee: {selectedAccount?.currency} {parseFloat(sendData.amount) < 1000 ? '5' : '10'}
                </p>
              )}
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Input
                value={sendData.description}
                onChange={(e) => setSendData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Payment for..."
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                Available Balance: {selectedAccount?.currency} {selectedAccount?.balance.toLocaleString()}
              </p>
            </div>
            <Button onClick={handleSendMoney} className="w-full" disabled={loading}>
              Send Money
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receive Money Modal */}
      <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Money to {selectedAccount?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">Paybill Number</Label>
                <p className="text-2xl font-bold">{paymentMethods?.paybillNumber}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Account Number</Label>
                <p className="text-lg font-semibold">{paymentMethods?.accountNumber}</p>
              </div>
            </div>
            
            <div className="text-center">
              <Label className="text-sm text-muted-foreground">QR Code</Label>
              <div className="mt-2 flex justify-center">
                <img src={paymentMethods?.qrCode} alt="Payment QR Code" className="w-48 h-48 border rounded" />
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                Share these payment details with the sender. Money will be credited to <strong>{paymentMethods?.accountName}</strong> instantly.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert Money Modal */}
      <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert / Transfer Money</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>From Account</Label>
              <Select value={convertData.fromAccount} onValueChange={(value) => 
                setConvertData(prev => ({ ...prev, fromAccount: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {subAccounts.filter(a => a.permissions.convert).map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency} {account.balance.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>To Account</Label>
              <Select value={convertData.toAccount} onValueChange={(value) => 
                setConvertData(prev => ({ ...prev, toAccount: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {subAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.currency} {account.balance.toLocaleString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={convertData.amount}
                onChange={(e) => setConvertData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
              {convertData.amount && convertData.fromAccount && convertData.toAccount && (() => {
                const fromAcc = subAccounts.find(a => a.id === convertData.fromAccount);
                const toAcc = subAccounts.find(a => a.id === convertData.toAccount);
                if (fromAcc && toAcc && fromAcc.currency !== toAcc.currency) {
                  const rates: any = {
                    KES: { USD: 0.0077, EUR: 0.0070 },
                    USD: { KES: 130, EUR: 0.91 },
                    EUR: { KES: 143, USD: 1.10 },
                  };
                  const rate = rates[fromAcc.currency]?.[toAcc.currency] || 1;
                  const converted = parseFloat(convertData.amount) * rate;
                  return (
                    <p className="text-sm text-muted-foreground mt-1">
                      You will receive: {toAcc.currency} {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} (Rate: {rate.toFixed(4)})
                    </p>
                  );
                }
              })()}
            </div>
            <Button onClick={handleConvertMoney} className="w-full" disabled={loading}>
              {(() => {
                const fromAcc = subAccounts.find(a => a.id === convertData.fromAccount);
                const toAcc = subAccounts.find(a => a.id === convertData.toAccount);
                return fromAcc && toAcc && fromAcc.currency !== toAcc.currency 
                  ? 'Convert Money' 
                  : 'Transfer Money';
              })()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permissions Modal */}
      <Dialog open={showPermissionsModal} onOpenChange={setShowPermissionsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Permissions - {selectedAccount?.name}</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">View Balance</span>
                  <Switch
                    checked={selectedAccount.permissions.view}
                    onCheckedChange={(checked) => 
                      setSelectedAccount(prev => prev ? ({
                        ...prev,
                        permissions: { ...prev.permissions, view: checked }
                      }) : null)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Send Money</span>
                  <Switch
                    checked={selectedAccount.permissions.send}
                    onCheckedChange={(checked) => 
                      setSelectedAccount(prev => prev ? ({
                        ...prev,
                        permissions: { ...prev.permissions, send: checked }
                      }) : null)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Receive Money</span>
                  <Switch
                    checked={selectedAccount.permissions.receive}
                    onCheckedChange={(checked) => 
                      setSelectedAccount(prev => prev ? ({
                        ...prev,
                        permissions: { ...prev.permissions, receive: checked }
                      }) : null)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Convert Currency</span>
                  <Switch
                    checked={selectedAccount.permissions.convert}
                    onCheckedChange={(checked) => 
                      setSelectedAccount(prev => prev ? ({
                        ...prev,
                        permissions: { ...prev.permissions, convert: checked }
                      }) : null)
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdatePermissions} className="flex-1" disabled={loading}>
                  Update Permissions
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deactivateSubAccount(selectedAccount.id)}
                  disabled={loading}
                >
                  Deactivate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubAccountManager;