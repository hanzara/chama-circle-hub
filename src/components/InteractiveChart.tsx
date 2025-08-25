import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

interface MetricData {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  trend?: number[];
}

interface InteractiveChartProps {
  title: string;
  subtitle: string;
  metrics: MetricData[];
  chartData?: any[];
  chartType?: 'line' | 'pie' | 'bar';
}

const generateMockTrendData = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    time: `${i + 1}d`,
    value: Math.floor(Math.random() * 100) + 50
  }));
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))'];

export const InteractiveChart = ({ 
  title, 
  subtitle, 
  metrics, 
  chartData,
  chartType = 'line' 
}: InteractiveChartProps) => {
  const trendData = chartData || generateMockTrendData();

  const renderChart = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={trendData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {trendData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </div>
          <Activity className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart Visualization */}
        <div className="mb-6">
          {renderChart()}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                {metric.changeType === 'positive' ? (
                  <TrendingUp className="h-3 w-3 text-accent" />
                ) : metric.changeType === 'negative' ? (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                ) : null}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{metric.value}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    metric.changeType === 'positive' 
                      ? 'text-accent' 
                      : metric.changeType === 'negative' 
                      ? 'text-destructive' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {metric.change}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};