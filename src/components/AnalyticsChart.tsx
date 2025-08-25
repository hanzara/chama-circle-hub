import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}

interface AnalyticsChartProps {
  title: string;
  subtitle: string;
  metrics: AnalyticsMetric[];
}

export const AnalyticsChart = ({ title, subtitle, metrics }: AnalyticsChartProps) => {
  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">{subtitle}</p>
      </div>

      {/* Simple chart visualization placeholder */}
      <div className="mb-6 h-32 bg-gradient-dashboard rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Interactive charts coming soon</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-2">
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{metric.label}</span>
              <div className="flex items-center space-x-1">
                {metric.changeType === "positive" && (
                  <TrendingUp className="h-3 w-3 text-accent" />
                )}
                {metric.changeType === "negative" && (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className={`text-xs ${
                  metric.changeType === "positive" ? "text-accent" : 
                  metric.changeType === "negative" ? "text-destructive" : 
                  "text-muted-foreground"
                }`}>
                  {metric.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};