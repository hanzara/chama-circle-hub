import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Transaction {
  id: string;
  type: "inbound" | "outbound";
  provider: string;
  amount: string;
  currency: string;
  status: "pending" | "completed" | "failed" | "processing";
  timestamp: string;
  txHash?: string;
  fees: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "processing":
        return <AlertCircle className="h-4 w-4 text-primary" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent text-accent-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "processing":
        return "bg-primary text-primary-foreground";
      case "failed":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <p className="text-muted-foreground text-sm">Monitor all payment activities</p>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Fees</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id} className="hover:bg-muted/50 transition-smooth">
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === "inbound" ? "bg-accent/20" : "bg-primary/20"
                    }`}>
                      {tx.type === "inbound" ? "↓" : "↑"}
                    </div>
                    <div>
                      <div className="font-medium">{tx.id}</div>
                      <div className="text-xs text-muted-foreground capitalize">{tx.type}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {tx.provider}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-semibold">
                    {tx.amount} {tx.currency}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(tx.status)}
                    <Badge className={getStatusColor(tx.status)} variant="secondary">
                      {tx.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {tx.timestamp}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {tx.fees}
                </TableCell>
                <TableCell className="text-right">
                  {tx.txHash && (
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};