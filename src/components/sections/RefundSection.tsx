import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  MessageSquare,
  FileText,
  Upload,
  Users,
  Calendar,
  Shield,
  Zap,
  Target,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  Plus,
  Download,
  Eye,
  History,
  Bell,
  UserCheck
} from "lucide-react";

const refundRequests = [
  {
    id: "REF-001",
    transactionId: "TXN-12345",
    amount: "$250.00",
    currency: "USD",
    reason: "Product not received",
    status: "processing",
    merchant: "Online Store Ltd",
    requestDate: "2024-01-15",
    expectedCompletion: "2024-01-18",
    type: "full"
  },
  {
    id: "REF-002",
    transactionId: "TXN-12346",
    amount: "€89.99",
    currency: "EUR",
    reason: "Duplicate charge",
    status: "approved",
    merchant: "Tech Services Inc",
    requestDate: "2024-01-14",
    expectedCompletion: "2024-01-16",
    type: "full"
  },
  {
    id: "REF-003",
    transactionId: "TXN-12347",
    amount: "$45.50",
    currency: "USD",
    reason: "Service not provided",
    status: "disputed",
    merchant: "Food Delivery Co",
    requestDate: "2024-01-13",
    expectedCompletion: "2024-01-20",
    type: "partial"
  },
  {
    id: "REF-004",
    transactionId: "TXN-12348",
    amount: "£120.00",
    currency: "GBP",
    reason: "Order cancelled",
    status: "completed",
    merchant: "Travel Agency",
    requestDate: "2024-01-10",
    expectedCompletion: "2024-01-12",
    type: "full"
  }
];

// Mock dispute cases data
const disputeCases = [
  {
    id: "DSP-001",
    caseNumber: "CASE-2024-0001",
    type: "chargeback",
    priority: "high",
    status: "investigation",
    amount: "$1,250.00",
    currency: "USD",
    merchant: "E-commerce Solutions Ltd",
    customer: "John Smith",
    customerEmail: "john.smith@email.com",
    transactionId: "TXN-98765",
    disputeReason: "Fraudulent transaction",
    cardholderClaim: "Card was not present, unauthorized use",
    dateOpened: "2024-01-20",
    dueDate: "2024-01-27",
    assignedAgent: "Sarah Connor",
    evidenceCount: 3,
    messagesCount: 7,
    lastActivity: "2 hours ago",
    timeline: [
      { date: "2024-01-20 09:00", action: "Case opened", user: "System", type: "system" },
      { date: "2024-01-20 09:15", action: "Assigned to Sarah Connor", user: "System", type: "assignment" },
      { date: "2024-01-20 10:30", action: "Initial evidence submitted", user: "Merchant", type: "evidence" },
      { date: "2024-01-21 14:20", action: "Customer response received", user: "Customer", type: "communication" },
      { date: "2024-01-22 11:45", action: "Additional evidence requested", user: "Sarah Connor", type: "request" }
    ]
  },
  {
    id: "DSP-002",
    caseNumber: "CASE-2024-0002",
    type: "merchant_dispute",
    priority: "medium",
    status: "pending_response",
    amount: "$89.99",
    currency: "USD",
    merchant: "Digital Services Pro",
    customer: "Emma Watson",
    customerEmail: "emma.watson@email.com",
    transactionId: "TXN-87654",
    disputeReason: "Service not as described",
    cardholderClaim: "Software license was not activated",
    dateOpened: "2024-01-18",
    dueDate: "2024-01-25",
    assignedAgent: "Mike Johnson",
    evidenceCount: 2,
    messagesCount: 4,
    lastActivity: "1 day ago",
    timeline: [
      { date: "2024-01-18 14:30", action: "Case opened", user: "System", type: "system" },
      { date: "2024-01-18 14:45", action: "Assigned to Mike Johnson", user: "System", type: "assignment" },
      { date: "2024-01-19 09:20", action: "Merchant evidence submitted", user: "Merchant", type: "evidence" },
      { date: "2024-01-20 16:10", action: "Awaiting customer response", user: "Mike Johnson", type: "request" }
    ]
  },
  {
    id: "DSP-003",
    caseNumber: "CASE-2024-0003",
    type: "refund_dispute",
    priority: "low",
    status: "resolved",
    amount: "$45.50",
    currency: "USD",
    merchant: "Food Delivery Express",
    customer: "David Brown",
    customerEmail: "david.brown@email.com",
    transactionId: "TXN-76543",
    disputeReason: "Order not delivered",
    cardholderClaim: "Food never arrived, no response from merchant",
    dateOpened: "2024-01-15",
    dueDate: "2024-01-22",
    assignedAgent: "Lisa Anderson",
    evidenceCount: 5,
    messagesCount: 12,
    lastActivity: "3 days ago",
    resolution: "Resolved in favor of customer - full refund issued",
    timeline: [
      { date: "2024-01-15 12:00", action: "Case opened", user: "System", type: "system" },
      { date: "2024-01-15 12:15", action: "Assigned to Lisa Anderson", user: "System", type: "assignment" },
      { date: "2024-01-16 08:30", action: "Evidence collection started", user: "Lisa Anderson", type: "evidence" },
      { date: "2024-01-17 15:45", action: "Merchant response received", user: "Merchant", type: "communication" },
      { date: "2024-01-19 10:30", action: "Case resolved - Customer favor", user: "Lisa Anderson", type: "resolution" }
    ]
  }
];

const disputeAgents = [
  { id: "agent-1", name: "Sarah Connor", activeCase: 8, resolvedCases: 142, avatar: "SC" },
  { id: "agent-2", name: "Mike Johnson", activeCase: 6, resolvedCases: 98, avatar: "MJ" },
  { id: "agent-3", name: "Lisa Anderson", activeCase: 4, resolvedCases: 156, avatar: "LA" },
  { id: "agent-4", name: "Tom Wilson", activeCase: 7, resolvedCases: 89, avatar: "TW" }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "processing":
      return <Clock className="w-4 h-4 text-yellow-600" />;
    case "approved":
      return <CheckCircle className="w-4 h-4 text-blue-600" />;
    case "disputed":
      return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    case "rejected":
      return <XCircle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-600";
    case "processing":
      return "text-yellow-600";
    case "approved":
      return "text-blue-600";
    case "disputed":
      return "text-orange-600";
    case "rejected":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export const RefundSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newRefundAmount, setNewRefundAmount] = useState("");
  const [newRefundReason, setNewRefundReason] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState("");
  
  // Dispute center states
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [disputeFilter, setDisputeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignedAgent, setAssignedAgent] = useState("all");
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [activeDisputeTab, setActiveDisputeTab] = useState("overview");

  const filteredRefunds = refundRequests.filter(refund => {
    const matchesSearch = refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Refund Management</h1>
        <p className="text-muted-foreground">
          Handle full and partial refunds with automated processing via API
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refundRequests.length}</div>
            <div className="text-sm text-muted-foreground">This month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {refundRequests.filter(r => r.status === 'processing').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {refundRequests.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disputed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {refundRequests.filter(r => r.status === 'disputed').length}
            </div>
            <div className="text-sm text-muted-foreground">Under review</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">Refund Requests</TabsTrigger>
          <TabsTrigger value="create">Create Refund</TabsTrigger>
          <TabsTrigger value="dispute">Dispute Center</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by ID, transaction, or merchant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund List */}
          <div className="space-y-4">
            {filteredRefunds.map((refund) => (
              <Card key={refund.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(refund.status)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{refund.id}</h4>
                          <Badge variant="outline" className="text-xs">
                            {refund.type} refund
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Transaction: {refund.transactionId} • {refund.merchant}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Reason: {refund.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{refund.amount}</div>
                      <div className={`text-sm capitalize ${getStatusColor(refund.status)}`}>
                        {refund.status}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {refund.status === 'completed' ? 
                          `Completed` : 
                          `Est. completion: ${refund.expectedCompletion}`
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4 gap-2">
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    {refund.status === 'processing' && (
                      <Button variant="outline" size="sm">
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Create Refund Request
              </CardTitle>
              <CardDescription>
                Submit a refund request for a completed transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Transaction ID</Label>
                <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a transaction to refund" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TXN-12349">TXN-12349 - $299.99 - Online Store</SelectItem>
                    <SelectItem value="TXN-12350">TXN-12350 - €159.00 - Tech Services</SelectItem>
                    <SelectItem value="TXN-12351">TXN-12351 - £89.50 - Food Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Refund Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newRefundAmount}
                    onChange={(e) => setNewRefundAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Refund Type</Label>
                  <Select defaultValue="full">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Refund</SelectItem>
                      <SelectItem value="partial">Partial Refund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason for Refund</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select refund reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-received">Product/Service not received</SelectItem>
                    <SelectItem value="defective">Defective product</SelectItem>
                    <SelectItem value="unauthorized">Unauthorized transaction</SelectItem>
                    <SelectItem value="duplicate">Duplicate charge</SelectItem>
                    <SelectItem value="cancelled">Order cancelled</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Additional Details</Label>
                <Textarea
                  placeholder="Provide additional information about your refund request..."
                  value={newRefundReason}
                  onChange={(e) => setNewRefundReason(e.target.value)}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Processing Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Refunds are typically processed within 3-5 business days</li>
                  <li>• You will receive email notifications about status updates</li>
                  <li>• Some merchants may require additional verification</li>
                  <li>• Disputed refunds may take up to 14 days to resolve</li>
                </ul>
              </div>

              <Button 
                className="w-full"
                disabled={!selectedTransaction || !newRefundAmount}
              >
                Submit Refund Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dispute" className="space-y-4">
          {!showCaseDetails ? (
            <>
              {/* Dispute Center Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{disputeCases.filter(c => c.status !== 'resolved').length}</div>
                        <div className="text-sm text-muted-foreground">Active Cases</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{disputeCases.filter(c => c.priority === 'high').length}</div>
                        <div className="text-sm text-muted-foreground">High Priority</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{disputeCases.filter(c => c.status === 'resolved').length}</div>
                        <div className="text-sm text-muted-foreground">Resolved Today</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{disputeAgents.length}</div>
                        <div className="text-sm text-muted-foreground">Active Agents</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Cases List */}
                <div className="flex-1 space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Dispute Cases
                        </CardTitle>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          New Case
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Filters */}
                      <div className="flex flex-col md:flex-row gap-3 mb-4">
                        <div className="flex-1">
                          <Input
                            placeholder="Search cases, merchants, or case numbers..."
                            className="w-full"
                          />
                        </div>
                        <Select value={disputeFilter} onValueChange={setDisputeFilter}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="investigation">Investigation</SelectItem>
                            <SelectItem value="pending_response">Pending Response</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="escalated">Escalated</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Priority</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Cases List */}
                      <div className="space-y-3">
                        {disputeCases.map((case_) => (
                          <div 
                            key={case_.id} 
                            className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedCase(case_.id);
                              setShowCaseDetails(true);
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  case_.priority === 'high' ? 'bg-red-500' :
                                  case_.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`} />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{case_.caseNumber}</span>
                                    <Badge variant={
                                      case_.status === 'resolved' ? 'default' :
                                      case_.status === 'investigation' ? 'destructive' : 'secondary'
                                    }>
                                      {case_.status.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant="outline" className="capitalize">
                                      {case_.type.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {case_.merchant} • {case_.amount} • {case_.customer}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">Due: {case_.dueDate}</div>
                                <div className="text-xs text-muted-foreground">{case_.lastActivity}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <UserCheck className="w-4 h-4" />
                                  {case_.assignedAgent}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <FileText className="w-4 h-4" />
                                  {case_.evidenceCount} evidence
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <MessageSquare className="w-4 h-4" />
                                  {case_.messagesCount} messages
                                </span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Agents Panel */}
                <div className="w-full lg:w-80 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dispute Agents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {disputeAgents.map((agent) => (
                        <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {agent.avatar}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{agent.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {agent.activeCase} active • {agent.resolvedCases} resolved
                              </div>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            agent.activeCase < 5 ? 'bg-green-500' :
                            agent.activeCase < 8 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Upload className="w-4 h-4 mr-2" />
                        Bulk Evidence Upload
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Export Case Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Bell className="w-4 h-4 mr-2" />
                        Set Case Alerts
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Review
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          ) : (
            /* Case Details View */
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowCaseDetails(false)}
                    >
                      ← Back to Cases
                    </Button>
                    <div>
                      <CardTitle className="text-xl">
                        {disputeCases.find(c => c.id === selectedCase)?.caseNumber}
                      </CardTitle>
                      <CardDescription>
                        {disputeCases.find(c => c.id === selectedCase)?.disputeReason}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {disputeCases.find(c => c.id === selectedCase)?.status.replace('_', ' ')}
                    </Badge>
                    <Button size="sm">
                      <Zap className="w-4 h-4 mr-2" />
                      Escalate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeDisputeTab} onValueChange={setActiveDisputeTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                    <TabsTrigger value="communication">Messages</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-3">Case Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-medium">{disputeCases.find(c => c.id === selectedCase)?.amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Transaction:</span>
                              <span className="font-medium">{disputeCases.find(c => c.id === selectedCase)?.transactionId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date Opened:</span>
                              <span className="font-medium">{disputeCases.find(c => c.id === selectedCase)?.dateOpened}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Due Date:</span>
                              <span className="font-medium text-red-600">{disputeCases.find(c => c.id === selectedCase)?.dueDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Assigned to:</span>
                              <span className="font-medium">{disputeCases.find(c => c.id === selectedCase)?.assignedAgent}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-3">Customer Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Name:</span>
                              <span className="font-medium">{disputeCases.find(c => c.id === selectedCase)?.customer}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Email:</span>
                              <span className="font-medium">{disputeCases.find(c => c.id === selectedCase)?.customerEmail}</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline">
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                              </Button>
                              <Button size="sm" variant="outline">
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-3">Merchant Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Business:</span>
                              <span className="font-medium">{disputeCases.find(c => c.id === selectedCase)?.merchant}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Dispute Type:</span>
                              <Badge variant="outline" className="capitalize">
                                {disputeCases.find(c => c.id === selectedCase)?.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-3">Claim Details</h4>
                          <p className="text-sm text-muted-foreground">
                            {disputeCases.find(c => c.id === selectedCase)?.cardholderClaim}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="evidence" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Evidence Files</h4>
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Evidence
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">Transaction Receipt</span>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">PDF • 2.3 MB • Uploaded 2 days ago</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">Customer Communication</span>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">Email thread • Uploaded 1 day ago</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">Delivery Confirmation</span>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">Image • 1.8 MB • Uploaded 3 hours ago</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="communication" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Messages</h4>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Message
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">Sarah Connor</span>
                          <span className="text-xs text-muted-foreground">2 hours ago</span>
                        </div>
                        <p className="text-sm">Requested additional evidence from merchant regarding delivery confirmation.</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">Merchant</span>
                          <span className="text-xs text-muted-foreground">1 day ago</span>
                        </div>
                        <p className="text-sm">Package was delivered according to our shipping partner. Please see attached tracking information.</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">Customer</span>
                          <span className="text-xs text-muted-foreground">2 days ago</span>
                        </div>
                        <p className="text-sm">I never received this package. The tracking shows delivered but nothing was at my door.</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4">
                    <h4 className="font-semibold">Case Timeline</h4>
                    <div className="space-y-4">
                      {disputeCases.find(c => c.id === selectedCase)?.timeline.map((event, index) => (
                        <div key={index} className="flex gap-3">
                          <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                            event.type === 'system' ? 'bg-gray-400' :
                            event.type === 'resolution' ? 'bg-green-500' :
                            event.type === 'evidence' ? 'bg-blue-500' : 'bg-orange-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{event.action}</span>
                              <span className="text-xs text-muted-foreground">{event.date}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">by {event.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4">
                    <h4 className="font-semibold">Case Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="justify-start">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolve in Customer Favor
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <XCircle className="w-4 h-4 mr-2" />
                        Resolve in Merchant Favor
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Zap className="w-4 h-4 mr-2" />
                        Escalate to Supervisor
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Request Extension
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Reassign Case
                      </Button>
                      <Button variant="outline" className="justify-start">
                        <History className="w-4 h-4 mr-2" />
                        View Full History
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};