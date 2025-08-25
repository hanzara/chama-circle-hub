import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Shield, 
  Users, 
  Building, 
  Bell,
  CreditCard,
  FileText,
  Key,
  Globe,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Clock
} from "lucide-react";

const mockSecurityEvents = [
  {
    id: "1",
    type: "login",
    description: "Successful login from new device",
    location: "London, UK",
    timestamp: "2 hours ago",
    risk: "low"
  },
  {
    id: "2",
    type: "api_key",
    description: "New API key generated",
    location: "Dashboard",
    timestamp: "1 day ago", 
    risk: "medium"
  },
  {
    id: "3",
    type: "payment_channel",
    description: "Payment channel connected: Stripe",
    location: "Dashboard",
    timestamp: "3 days ago",
    risk: "low"
  }
];

const mockTeamMembers = [
  {
    id: "1",
    name: "John Smith",
    email: "john@company.com",
    role: "Owner",
    status: "active",
    lastActive: "Currently active"
  },
  {
    id: "2",
    name: "Sarah Johnson", 
    email: "sarah@company.com",
    role: "Admin",
    status: "active",
    lastActive: "2 hours ago"
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike@company.com", 
    role: "Developer",
    status: "pending",
    lastActive: "Invitation sent"
  }
];

export const SettingsSection = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [webhookNotifications, setWebhookNotifications] = useState(false);

  const getSecurityScore = () => {
    let score = 0;
    if (twoFactorEnabled) score += 25;
    if (emailNotifications) score += 15;
    score += 35; // Base security features
    score += 25; // IP whitelisting and other features
    return score;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "low": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "medium": return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "high": return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, security, team, and platform preferences
        </p>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          {/* Security Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Scorecard
              </CardTitle>
              <CardDescription>
                Your current security posture and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-3xl font-bold text-green-600">{getSecurityScore()}/100</div>
                  <div className="text-sm text-muted-foreground">Security Score</div>
                </div>
                <div className="text-right">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Excellent Security
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Two-Factor Authentication</span>
                  </div>
                  <span className="text-green-600">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Strong Password Policy</span>
                  </div>
                  <span className="text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>IP Whitelisting</span>
                  </div>
                  <span className="text-green-600">Configured</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span>API Key Rotation</span>
                  </div>
                  <span className="text-yellow-600">Recommended</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">IP Whitelisting</h4>
                <p className="text-sm text-muted-foreground">
                  Restrict API access to specific IP addresses
                </p>
                <div className="space-y-2">
                  <Input placeholder="192.168.1.1" />
                  <Input placeholder="203.0.113.0/24" />
                  <Button variant="outline" size="sm">
                    Add IP Address
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Session Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Session Timeout</Label>
                    <Select defaultValue="30m">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15m">15 minutes</SelectItem>
                        <SelectItem value="30m">30 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="4h">4 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Login Attempts</Label>
                    <Select defaultValue="5">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 attempts</SelectItem>
                        <SelectItem value="5">5 attempts</SelectItem>
                        <SelectItem value="10">10 attempts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Monitor important security activities on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSecurityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getRiskIcon(event.risk)}
                      <div>
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.location} • {event.timestamp}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getRiskColor(event.risk)}>
                      {event.risk} risk
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Management
              </CardTitle>
              <CardDescription>
                Invite team members and manage their access permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Team Member */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <Input placeholder="Email address" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Invite Member</Button>
              </div>
              
              {/* Team Members List */}
              <div className="space-y-4">
                {mockTeamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">{member.lastActive}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Profile
              </CardTitle>
              <CardDescription>
                Update your business information and verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input defaultValue="Universal Pay Ltd" />
                </div>
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input defaultValue="12345678" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Business Address</Label>
                <Textarea defaultValue="123 Financial District
London, UK EC2V 8RF" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select defaultValue="fintech">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fintech">Financial Technology</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="saas">Software as a Service</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select defaultValue="50-200">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="50-200">50-200 employees</SelectItem>
                      <SelectItem value="200+">200+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Verification Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Business Registration</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bank Account</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Identity Verification</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </div>
              </div>
              
              <Button>Update Company Information</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you want to receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Transaction Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about payment status changes
                      </p>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Important security events and login attempts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-muted-foreground">
                        Summary of your payment activity
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Webhook Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Real-time Events</p>
                      <p className="text-sm text-muted-foreground">
                        Send events to your configured webhook endpoints
                      </p>
                    </div>
                    <Switch checked={webhookNotifications} onCheckedChange={setWebhookNotifications} />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Mobile Push Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Critical Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        High-priority notifications via mobile app
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">Enterprise Plan</h4>
                    <p className="text-sm text-muted-foreground">
                      Advanced features for growing businesses
                    </p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Monthly Cost</p>
                    <p className="font-semibold">$299/month</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Next Billing</p>
                    <p className="font-semibold">April 15, 2024</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Transaction Limit</p>
                    <p className="font-semibold">Unlimited</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Payment Method</h4>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Billing History</h4>
                <div className="space-y-2">
                  {[
                    { date: "Mar 15, 2024", amount: "$299.00", status: "Paid" },
                    { date: "Feb 15, 2024", amount: "$299.00", status: "Paid" },
                    { date: "Jan 15, 2024", amount: "$299.00", status: "Paid" }
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.date}</p>
                        <p className="text-sm text-muted-foreground">Enterprise Plan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{invoice.amount}</p>
                        <Badge variant="outline" className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};