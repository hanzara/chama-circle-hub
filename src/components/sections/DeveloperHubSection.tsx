import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Code, 
  Key, 
  Play, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2,
  Activity,
  Book,
  Terminal,
  Webhook,
  Database,
  Shield
} from "lucide-react";

const mockApiKeys = [
  {
    id: "key_1",
    name: "Production API Key",
    permissions: ["payments:read", "payments:write", "wallets:read"],
    lastUsed: "2 hours ago",
    usageCount: 1547,
    isActive: true,
    created: "2024-01-15"
  },
  {
    id: "key_2", 
    name: "Analytics Dashboard",
    permissions: ["analytics:read", "transactions:read"],
    lastUsed: "1 day ago",
    usageCount: 245,
    isActive: true,
    created: "2024-02-20"
  },
  {
    id: "key_3",
    name: "Test Environment",
    permissions: ["payments:read", "payments:write"],
    lastUsed: "Never",
    usageCount: 0,
    isActive: false,
    created: "2024-03-01"
  }
];

const mockLogs = [
  {
    id: "log_1",
    method: "POST",
    endpoint: "/api/payments",
    status: 200,
    responseTime: 142,
    timestamp: "2024-03-15T10:30:15Z",
    apiKey: "key_1"
  },
  {
    id: "log_2",
    method: "GET", 
    endpoint: "/api/wallets/USD",
    status: 200,
    responseTime: 89,
    timestamp: "2024-03-15T10:28:45Z",
    apiKey: "key_1"
  },
  {
    id: "log_3",
    method: "POST",
    endpoint: "/api/payments",
    status: 400,
    responseTime: 67,
    timestamp: "2024-03-15T10:25:12Z",
    apiKey: "key_2"
  }
];

const availablePermissions = [
  { id: "payments:read", name: "Read Payments", description: "View payment transactions" },
  { id: "payments:write", name: "Create Payments", description: "Initiate new payments" },
  { id: "wallets:read", name: "Read Wallets", description: "View wallet balances" },
  { id: "wallets:write", name: "Modify Wallets", description: "Update wallet settings" },
  { id: "analytics:read", name: "Read Analytics", description: "Access analytics data" },
  { id: "transactions:read", name: "Read Transactions", description: "View transaction history" },
  { id: "channels:read", name: "Read Channels", description: "View payment channels" },
  { id: "channels:write", name: "Manage Channels", description: "Configure payment channels" }
];

export const DeveloperHubSection = () => {
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 400 && status < 500) return "text-yellow-600";
    return "text-red-600";
  };

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission) 
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Developer Hub</h1>
        <p className="text-muted-foreground">
          Complete developer tools for integrating Universal Pay into your applications
        </p>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
          <TabsTrigger value="logs">API Logs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          {/* Create New API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New API Key
              </CardTitle>
              <CardDescription>
                Generate API keys with specific permissions for your applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Key Name</Label>
                  <Input 
                    placeholder="e.g., Production App, Test Environment"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expiry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                      <SelectItem value="1y">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2 p-2 border rounded">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="rounded border-gray-300"
                      />
                      <div>
                        <label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                          {permission.name}
                        </label>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button className="w-full" disabled={!newKeyName || selectedPermissions.length === 0}>
                <Key className="w-4 h-4 mr-2" />
                Generate API Key
              </Button>
            </CardContent>
          </Card>

          {/* Existing API Keys */}
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>
                Manage your existing API keys and monitor usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockApiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{apiKey.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created {apiKey.created} • Used {apiKey.usageCount} times
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                        {apiKey.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch checked={apiKey.isActive} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono text-sm bg-muted p-2 rounded">
                      {showApiKey === apiKey.id ? "up_live_1234567890abcdef..." : "up_live_••••••••••••••••"}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                    >
                      {showApiKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Last used: {apiKey.lastUsed}</span>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sandbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                API Sandbox Environment
              </CardTitle>
              <CardDescription>
                Test your integrations safely with our sandbox environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Quick Start</h4>
                  <div className="space-y-2">
                    <Button className="w-full justify-start">
                      <Database className="w-4 h-4 mr-2" />
                      Create Sandbox Environment
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Terminal className="w-4 h-4 mr-2" />
                      Generate Test Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Book className="w-4 h-4 mr-2" />
                      View API Documentation
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Sandbox Credentials</h4>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs">Base URL</Label>
                      <div className="font-mono text-sm bg-muted p-2 rounded">
                        https://api-sandbox.universalpay.com
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Test API Key</Label>
                      <div className="font-mono text-sm bg-muted p-2 rounded">
                        up_test_1234567890abcdef...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-yellow-600" />
                  <h5 className="font-medium text-yellow-800">Sandbox Environment</h5>
                </div>
                <p className="text-sm text-yellow-700">
                  This is a completely isolated environment. No real money will be processed, 
                  and all data will be reset periodically. Perfect for testing your integration.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live API Logs
              </CardTitle>
              <CardDescription>
                Real-time monitoring of API requests and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="2xx">Success (2xx)</SelectItem>
                      <SelectItem value="4xx">Client Error (4xx)</SelectItem>
                      <SelectItem value="5xx">Server Error (5xx)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    Clear Logs
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {mockLogs.map((log) => (
                    <div key={log.id} className="font-mono text-sm p-3 bg-muted rounded border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{log.method}</Badge>
                          <span>{log.endpoint}</span>
                          <span className={getStatusColor(log.status)}>{log.status}</span>
                          <span className="text-muted-foreground">{log.responseTime}ms</span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input 
                    placeholder="https://your-app.com/webhooks/universal-pay"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Events to Subscribe</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "payment.completed",
                      "payment.failed", 
                      "payment.pending",
                      "wallet.updated",
                      "channel.status_changed",
                      "transaction.disputed"
                    ].map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={event}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={event} className="text-sm font-mono">
                          {event}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <Input 
                    placeholder="Your webhook secret for signature verification"
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to verify webhook authenticity via HMAC signature
                  </p>
                </div>
                
                <Button className="w-full">
                  Save Webhook Configuration
                </Button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Webhook Testing</h4>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Test Connection
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Send Test Event
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                API Documentation
              </CardTitle>
              <CardDescription>
                Complete guide to integrating Universal Pay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Quick Start Guides</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Getting Started
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Making Your First Payment
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Handling Webhooks
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">API Reference</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Payments API
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Wallets API
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Channels API
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Analytics API
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">SDKs & Libraries</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Node.js SDK
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Python SDK
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      PHP SDK
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      React Components
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Examples & Tutorials</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      E-commerce Integration
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Marketplace Payments
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      International Transfers
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Crypto Payments
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
