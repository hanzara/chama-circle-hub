
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Zap, 
  Key, 
  Code, 
  Play, 
  Copy, 
  CheckCircle,
  FileText,
  Download,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BankAPIConsole: React.FC = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('vrd_pk_test_1234567890abcdef...');
  const [selectedEndpoint, setSelectedEndpoint] = useState('get-borrower-score');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState('');

  const apiEndpoints = [
    {
      id: 'get-borrower-score',
      name: 'Get Borrower Credit Score',
      method: 'GET',
      endpoint: '/api/v1/borrowers/{id}/score',
      description: 'Retrieve credit score and risk assessment for a specific borrower',
      exampleRequest: '{}',
      exampleResponse: JSON.stringify({
        borrower_id: 'B001',
        credit_score: 785,
        risk_level: 'low',
        last_updated: '2024-07-14T10:30:00Z',
        factors: {
          payment_history: 95,
          wallet_activity: 88,
          chama_participation: 92
        }
      }, null, 2)
    },
    {
      id: 'fund-loan',
      name: 'Fund Loan Application',
      method: 'POST',
      endpoint: '/api/v1/loans/{id}/fund',
      description: 'Provide funding for an approved loan application',
      exampleRequest: JSON.stringify({
        funding_amount: 50000,
        interest_rate: 12.5,
        terms: {
          duration_months: 12,
          collateral_required: false
        }
      }, null, 2),
      exampleResponse: JSON.stringify({
        loan_id: 'L001',
        status: 'funded',
        disbursement_date: '2024-07-14',
        monthly_payment: 4500,
        total_repayment: 54000
      }, null, 2)
    },
    {
      id: 'get-loan-applications',
      name: 'Get Available Loan Applications',
      method: 'GET',
      endpoint: '/api/v1/loans/available',
      description: 'Retrieve all loan applications available for funding',
      exampleRequest: JSON.stringify({
        filters: {
          min_amount: 10000,
          max_amount: 100000,
          risk_level: 'low'
        }
      }, null, 2),
      exampleResponse: JSON.stringify({
        loans: [
          {
            id: 'L001',
            borrower_id: 'B001',
            amount: 50000,
            purpose: 'Business expansion',
            credit_score: 785,
            risk_level: 'low'
          }
        ],
        total: 1,
        page: 1
      }, null, 2)
    },
    {
      id: 'webhook-setup',
      name: 'Setup Webhooks',
      method: 'POST',
      endpoint: '/api/v1/webhooks',
      description: 'Configure webhook notifications for loan status updates',
      exampleRequest: JSON.stringify({
        url: 'https://your-bank.com/webhooks/verdio',
        events: ['loan.funded', 'loan.repaid', 'loan.defaulted'],
        secret: 'your-webhook-secret'
      }, null, 2),
      exampleResponse: JSON.stringify({
        webhook_id: 'wh_123456789',
        status: 'active',
        created_at: '2024-07-14T10:30:00Z'
      }, null, 2)
    }
  ];

  const sdkExamples = {
    javascript: `// Install: npm install @verdio/api-client
import { VerdioClient } from '@verdio/api-client';

const client = new VerdioClient({
  apiKey: '${apiKey}',
  environment: 'production' // or 'sandbox'
});

// Get borrower credit score
const score = await client.borrowers.getScore('B001');
console.log(score);

// Fund a loan
const fundingResult = await client.loans.fund('L001', {
  amount: 50000,
  interestRate: 12.5
});`,
    python: `# Install: pip install verdio-python
from verdio import VerdioClient

client = VerdioClient(api_key='${apiKey}')

# Get borrower credit score
score = client.borrowers.get_score('B001')
print(score)

# Fund a loan
funding_result = client.loans.fund('L001', {
    'amount': 50000,
    'interest_rate': 12.5
})`,
    curl: `# Get borrower credit score
curl -X GET "https://api.verdio.com/v1/borrowers/B001/score" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json"

# Fund a loan
curl -X POST "https://api.verdio.com/v1/loans/L001/fund" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "funding_amount": 50000,
    "interest_rate": 12.5
  }'`
  };

  const handleTestEndpoint = () => {
    const endpoint = apiEndpoints.find(ep => ep.id === selectedEndpoint);
    if (endpoint) {
      setResponse(endpoint.exampleResponse);
      toast({
        title: "API Test Successful! ✅",
        description: `${endpoint.name} executed successfully.`,
      });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied! 📋",
      description: "Code example copied to clipboard.",
    });
  };

  const generateApiKey = () => {
    const newKey = `vrd_pk_prod_${Math.random().toString(36).substr(2, 24)}`;
    setApiKey(newKey);
    toast({
      title: "New API Key Generated! 🔑",
      description: "Your new API key has been generated. Please store it securely.",
    });
  };

  return (
    <div className="space-y-6">
      {/* API Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Partner API Console
          </CardTitle>
          <CardDescription>
            Integrate with Verdio's API to access credit scores, fund loans, and manage your partnership
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">API Access</span>
                </div>
                <p className="text-sm text-muted-foreground">Secure RESTful API with OAuth 2.0 authentication</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Real-time Data</span>
                </div>
                <p className="text-sm text-muted-foreground">Live credit scores, loan status, and risk assessments</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Webhooks</span>
                </div>
                <p className="text-sm text-muted-foreground">Event-driven notifications for loan lifecycle</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="testing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="testing">API Testing</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="sdk">SDK Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Request Panel */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">API Request</CardTitle>
                <CardDescription>Test API endpoints directly from the console</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="endpoint">Select Endpoint</Label>
                  <select
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background mt-1"
                  >
                    {apiEndpoints.map((endpoint) => (
                      <option key={endpoint.id} value={endpoint.id}>
                        {endpoint.method} - {endpoint.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEndpoint && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {apiEndpoints.find(ep => ep.id === selectedEndpoint)?.method}
                      </Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {apiEndpoints.find(ep => ep.id === selectedEndpoint)?.endpoint}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {apiEndpoints.find(ep => ep.id === selectedEndpoint)?.description}
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="request-body">Request Body (JSON)</Label>
                  <Textarea
                    id="request-body"
                    value={apiEndpoints.find(ep => ep.id === selectedEndpoint)?.exampleRequest || ''}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={6}
                    className="mt-1 font-mono text-sm"
                  />
                </div>

                <Button onClick={handleTestEndpoint} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Test Endpoint
                </Button>
              </CardContent>
            </Card>

            {/* Response Panel */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">API Response</CardTitle>
                <CardDescription>View the API response and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      200 OK
                    </Badge>
                    <span className="text-sm text-muted-foreground">Response Time: 245ms</span>
                  </div>

                  <div>
                    <Label>Response Body</Label>
                    <Textarea
                      value={response || 'Click "Test Endpoint" to see response...'}
                      readOnly
                      rows={12}
                      className="mt-1 font-mono text-sm bg-muted"
                    />
                  </div>

                  <Button variant="outline" onClick={() => handleCopyCode(response)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Response
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                Manage your API keys for secure access to Verdio's services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-key">Current API Key</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="current-key"
                    value={apiKey}
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={() => handleCopyCode(apiKey)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep your API key secure and never share it publicly
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateApiKey}>
                  <Key className="h-4 w-4 mr-2" />
                  Generate New Key
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Postman Collection
                </Button>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Security Best Practices</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Store API keys securely in environment variables</li>
                  <li>• Use HTTPS for all API requests</li>
                  <li>• Rotate API keys regularly</li>
                  <li>• Monitor API usage and implement rate limiting</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <div className="grid gap-4">
            {apiEndpoints.map((endpoint) => (
              <Card key={endpoint.id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{endpoint.method}</Badge>
                    <CardTitle className="text-lg">{endpoint.name}</CardTitle>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Endpoint</Label>
                      <code className="block bg-muted p-2 rounded text-sm mt-1">
                        {endpoint.method} {endpoint.endpoint}
                      </code>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Example Request</Label>
                        <Textarea
                          value={endpoint.exampleRequest}
                          readOnly
                          rows={6}
                          className="mt-1 font-mono text-sm bg-muted"
                        />
                      </div>
                      <div>
                        <Label>Example Response</Label>
                        <Textarea
                          value={endpoint.exampleResponse}
                          readOnly
                          rows={6}
                          className="mt-1 font-mono text-sm bg-muted"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sdk" className="space-y-4">
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>

            {Object.entries(sdkExamples).map(([language, code]) => (
              <TabsContent key={language} value={language}>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{language} SDK Example</CardTitle>
                      <Button variant="outline" onClick={() => handleCopyCode(code)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{code}</code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BankAPIConsole;
