import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield,
  Lock,
  Eye,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Key,
  FileText,
  Globe,
  Activity,
  Settings,
  Clock
} from "lucide-react";

const securityEvents = [
  {
    id: "SEC-001",
    type: "login",
    description: "Successful login from new device",
    location: "New York, US",
    ip: "192.168.1.100",
    timestamp: "2 minutes ago",
    status: "success",
    risk: "low"
  },
  {
    id: "SEC-002",
    type: "transaction",
    description: "Large transaction flagged for review",
    location: "London, UK",
    ip: "10.0.0.1",
    timestamp: "1 hour ago",
    status: "flagged",
    risk: "medium"
  },
  {
    id: "SEC-003",
    type: "api_access",
    description: "Multiple API calls from unknown IP",
    location: "Tokyo, JP",
    ip: "203.0.113.0",
    timestamp: "3 hours ago",
    status: "blocked",
    risk: "high"
  },
  {
    id: "SEC-004",
    type: "password_change",
    description: "Password successfully updated",
    location: "New York, US",
    ip: "192.168.1.100",
    timestamp: "1 day ago",
    status: "success",
    risk: "low"
  }
];

const complianceStandards = [
  { name: "PCI DSS", status: "compliant", description: "Payment Card Industry Data Security Standard" },
  { name: "ISO 27001", status: "compliant", description: "Information Security Management" },
  { name: "SOC 2 Type II", status: "compliant", description: "Service Organization Control" },
  { name: "GDPR", status: "compliant", description: "General Data Protection Regulation" },
  { name: "AML/KYC", status: "compliant", description: "Anti-Money Laundering / Know Your Customer" },
  { name: "FIDO2", status: "compliant", description: "Fast Identity Online Authentication" },
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "low": return "text-green-600";
    case "medium": return "text-yellow-600";
    case "high": return "text-red-600";
    default: return "text-gray-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success": return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "flagged": return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    case "blocked": return <Shield className="w-4 h-4 text-red-600" />;
    default: return <Activity className="w-4 h-4 text-gray-600" />;
  }
};

export const SecuritySection = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [apiEncryption, setApiEncryption] = useState(true);
  const [fraudDetection, setFraudDetection] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Security & Compliance</h1>
        <p className="text-muted-foreground">
          Two-factor authentication, real-time fraud detection, and full data encryption
        </p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800">Security Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">98%</div>
            <div className="text-sm text-green-700">Excellent</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">Current devices</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityEvents.length}</div>
            <div className="text-sm text-muted-foreground">Last 24 hours</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceStandards.length}</div>
            <div className="text-sm text-muted-foreground">Standards met</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">2FA</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Features
                </CardTitle>
                <CardDescription>Active security measures protecting your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">SMS and app-based verification</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">End-to-End Encryption</p>
                      <p className="text-sm text-muted-foreground">AES-256 encryption for all data</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Real-time Fraud Detection</p>
                      <p className="text-sm text-muted-foreground">AI-powered anomaly detection</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Biometric Authentication</p>
                      <p className="text-sm text-muted-foreground">Fingerprint and face recognition</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Setup Required</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Security Events
                </CardTitle>
                <CardDescription>Latest security-related activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {securityEvents.slice(0, 4).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(event.status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.location} • {event.ip}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRiskColor(event.risk)}`}
                        >
                          {event.risk} risk
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Secure your account with multiple layers of authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5" />
                    <div>
                      <p className="font-medium">SMS Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Receive verification codes via SMS
                      </p>
                    </div>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-muted-foreground">
                        Use Google Authenticator or similar apps
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Biometric Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Fingerprint and facial recognition
                      </p>
                    </div>
                  </div>
                  <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Hardware Security Keys</p>
                      <p className="text-sm text-muted-foreground">
                        FIDO2/WebAuthn compatible security keys
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Setup</Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Security Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Enable at least two different authentication methods</li>
                  <li>• Use authenticator apps instead of SMS when possible</li>
                  <li>• Keep backup recovery codes in a secure location</li>
                  <li>• Regularly review and update your security settings</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-time Security Monitoring
              </CardTitle>
              <CardDescription>
                Monitor all account activities and potential security threats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(event.status)}
                      <div>
                        <p className="font-medium">{event.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.location} • IP: {event.ip}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={event.status === 'success' ? 'default' : 
                                event.status === 'flagged' ? 'secondary' : 'destructive'}
                        className="mb-1"
                      >
                        {event.status}
                      </Badge>
                      <p className={`text-xs font-medium ${getRiskColor(event.risk)}`}>
                        {event.risk.toUpperCase()} RISK
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Compliance Standards
              </CardTitle>
              <CardDescription>
                Industry standards and regulations we comply with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complianceStandards.map((standard) => (
                  <div key={standard.name} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">{standard.name}</p>
                        <p className="text-sm text-muted-foreground">{standard.description}</p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">Compliant</Badge>
                  </div>
                ))}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Data Protection</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All data is encrypted at rest and in transit</li>
                  <li>• Regular security audits and penetration testing</li>
                  <li>• Zero-knowledge architecture for sensitive data</li>
                  <li>• Compliance monitoring and reporting</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure your account security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">API Encryption</p>
                    <p className="text-sm text-muted-foreground">
                      Encrypt all API communications
                    </p>
                  </div>
                  <Switch checked={apiEncryption} onCheckedChange={setApiEncryption} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Real-time Fraud Detection</p>
                    <p className="text-sm text-muted-foreground">
                      Monitor transactions for suspicious activity
                    </p>
                  </div>
                  <Switch checked={fraudDetection} onCheckedChange={setFraudDetection} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Login Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new device logins
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Transaction Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts for large transactions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Session Timeout</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Password Requirements</Label>
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    <ul className="space-y-1">
                      <li>✓ Minimum 12 characters</li>
                      <li>✓ At least one uppercase letter</li>
                      <li>✓ At least one lowercase letter</li>
                      <li>✓ At least one number</li>
                      <li>✓ At least one special character</li>
                    </ul>
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