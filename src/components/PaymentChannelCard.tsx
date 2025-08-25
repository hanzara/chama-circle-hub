import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, TrendingUp, TrendingDown } from "lucide-react";

interface PaymentChannelCardProps {
  provider: string;
  type: "inbound" | "outbound";
  status: "active" | "inactive" | "error";
  balance?: string;
  volume24h?: string;
  fees?: string;
  apiStatus: "connected" | "disconnected" | "error";
  color: string;
}

export const PaymentChannelCard = ({
  provider,
  type,
  status,
  balance,
  volume24h,
  fees,
  apiStatus,
  color,
}: PaymentChannelCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent";
      case "inactive":
        return "bg-muted";
      case "error":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const getApiStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-accent text-accent-foreground";
      case "disconnected":
        return "bg-muted text-muted-foreground";
      case "error":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card hover:shadow-glow transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg`}
            style={{ backgroundColor: color }}
          >
            {provider.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{provider}</h3>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(status)} variant="secondary">
                {status}
              </Badge>
              <Badge className={getApiStatusColor(apiStatus)} variant="outline">
                API {apiStatus}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {balance && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Balance</span>
            <span className="font-semibold">{balance}</span>
          </div>
        )}
        
        {volume24h && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">24h Volume</span>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3 text-accent" />
              <span className="font-semibold">{volume24h}</span>
            </div>
          </div>
        )}
        
        {fees && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Avg Fees</span>
            <span className="text-warning font-semibold">{fees}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <Badge variant="outline" className="text-xs">
          {type === "inbound" ? "Receiving" : "Sending"} Channel
        </Badge>
      </div>
    </Card>
  );
};