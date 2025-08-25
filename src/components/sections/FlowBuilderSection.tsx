import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Workflow, 
  Play, 
  Pause, 
  Edit, 
  Copy, 
  Trash2, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Settings,
  Zap,
  RefreshCw,
  GitBranch,
  Timer
} from "lucide-react";

const workflowTemplates = [
  {
    id: "retry-failed",
    name: "Smart Payment Retry",
    description: "Automatically retry failed payments through alternative APIs",
    category: "Payment Recovery",
    uses: 2847,
    steps: 4,
    icon: RefreshCw,
    complexity: "Simple"
  },
  {
    id: "split-payout",
    name: "Multi-Destination Payout",
    description: "Split payments across multiple recipients and currencies",
    category: "Treasury",
    uses: 1205,
    steps: 6,
    icon: GitBranch,
    complexity: "Medium"
  },
  {
    id: "crypto-fiat",
    name: "Crypto to Fiat Bridge",
    description: "Convert crypto payments to fiat and distribute to team",
    category: "Currency Exchange",
    uses: 892,
    steps: 8,
    complexity: "Advanced"
  },
  {
    id: "subscription-dunning",
    name: "Subscription Dunning",
    description: "Handle failed subscription payments with escalating retry logic",
    category: "Subscriptions",
    uses: 643,
    steps: 5,
    complexity: "Medium"
  }
];

const activeFlows = [
  {
    id: "flow-1",
    name: "Failed Payment Recovery",
    status: "active",
    lastRun: "2 mins ago",
    success: 94,
    executions: 127,
    team: ["JD", "SM", "AK"],
    trigger: "Payment Failed"
  },
  {
    id: "flow-2", 
    name: "Weekly Team Payout",
    status: "scheduled",
    lastRun: "6 hours ago",
    success: 100,
    executions: 24,
    team: ["JD", "LC"],
    trigger: "Every Friday 9:00 AM"
  },
  {
    id: "flow-3",
    name: "Crypto Conversion Alert",
    status: "paused",
    lastRun: "2 days ago", 
    success: 87,
    executions: 56,
    team: ["SM"],
    trigger: "BTC > $45,000"
  }
];

const flowBlocks = [
  { type: "trigger", name: "Payment Failed", icon: AlertCircle, color: "red" },
  { type: "condition", name: "Check Amount", icon: CheckCircle, color: "blue" },
  { type: "action", name: "Retry via PayPal", icon: RefreshCw, color: "green" },
  { type: "action", name: "Send Slack Alert", icon: Zap, color: "purple" },
  { type: "delay", name: "Wait 2 minutes", icon: Timer, color: "orange" }
];

export function FlowBuilderSection() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return 'bg-green-500/20 text-green-400';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Workflow className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent">
              FlowBuilder Studio
            </h1>
            <p className="text-muted-foreground">Workflow Automation</p>
          </div>
        </div>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create powerful payment workflows with drag-and-drop simplicity. 
          Automate complex financial processes without writing code.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
          <DialogTrigger asChild>
            <Button size="lg" className="flex-1 sm:flex-none">
              <Plus className="w-5 h-5 mr-2" />
              Create New Flow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Visual Flow Builder</DialogTitle>
              <DialogDescription>
                Drag and drop blocks to create your workflow
              </DialogDescription>
            </DialogHeader>
            
            {/* Simple Flow Builder Interface */}
            <div className="grid grid-cols-4 gap-4 h-96">
              {/* Blocks Palette */}
              <div className="col-span-1 bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium mb-3">Blocks</h3>
                <div className="space-y-2">
                  {flowBlocks.map((block) => (
                    <div 
                      key={block.name}
                      className="p-2 bg-card rounded cursor-pointer hover:bg-accent transition-colors"
                      draggable
                    >
                      <div className="flex items-center space-x-2">
                        <block.icon className={`w-4 h-4 text-${block.color}-400`} />
                        <span className="text-sm">{block.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Canvas */}
              <div className="col-span-3 bg-muted/10 rounded-lg p-4 border-2 border-dashed border-muted">
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Workflow className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Drag blocks here to build your workflow</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBuilder(false)}>
                Cancel
              </Button>
              <Button>Save Flow</Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" size="lg">
          <Copy className="w-5 h-5 mr-2" />
          Import Template
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Flows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Active Workflows */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeFlows.map((flow) => (
              <Card key={flow.id} className="bg-gradient-card shadow-card">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{flow.name}</CardTitle>
                      <CardDescription>Trigger: {flow.trigger}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getStatusColor(flow.status)}>
                      {flow.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Success Rate</div>
                      <div className="font-bold text-lg">{flow.success}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Executions</div>
                      <div className="font-bold text-lg">{flow.executions}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Run</div>
                      <div className="font-medium">{flow.lastRun}</div>
                    </div>
                  </div>

                  {/* Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Team</span>
                    </div>
                    <div className="flex -space-x-2">
                      {flow.team.map((member, index) => (
                        <Avatar key={index} className="w-8 h-8 border-2 border-background">
                          <AvatarFallback className="text-xs">{member}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      {flow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Template Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflowTemplates.map((template) => (
              <Card key={template.id} className="bg-gradient-card shadow-card hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <template.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={getComplexityColor(template.complexity)}>
                      {template.complexity}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Template Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Category</div>
                      <div className="font-medium">{template.category}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Steps</div>
                      <div className="font-medium">{template.steps}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Uses</div>
                      <div className="font-medium">{template.uses.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Plus className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-card shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Flows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+3 this week</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">96.8%</div>
                <p className="text-xs text-muted-foreground">+2.1% improvement</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Time Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">hours this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Recent Flow Activity</CardTitle>
              <CardDescription>Latest workflow executions and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { flow: "Failed Payment Recovery", status: "success", time: "2 mins ago", result: "Payment recovered via PayPal" },
                  { flow: "Weekly Team Payout", status: "success", time: "1 hour ago", result: "5 payments sent successfully" },
                  { flow: "Crypto Conversion Alert", status: "warning", time: "3 hours ago", result: "Conversion rate threshold not met" },
                  { flow: "Subscription Dunning", status: "success", time: "6 hours ago", result: "3 of 4 retry attempts successful" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                      <div>
                        <div className="font-medium">{activity.flow}</div>
                        <div className="text-sm text-muted-foreground">{activity.result}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}