import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, PiggyBank, RotateCcw, TrendingUp } from 'lucide-react';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { supabase } from '@/integrations/supabase/client';

interface WalletEntity {
  entity: string;
  name: string;
  value: number;
  id: string;
}

export const CentralWalletOverview = () => {
  const [entities, setEntities] = useState<WalletEntity[]>([]);
  const [totalNetWorth, setTotalNetWorth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWalletOverview();
  }, []);

  const fetchWalletOverview = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('central-wallet-overview');
      
      if (error) throw error;
      if (data?.success) {
        setEntities(data.data.entities);
        setTotalNetWorth(data.data.totalNetWorth);
      }
    } catch (error) {
      console.error('Error fetching wallet overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chamaEntities = entities.filter(e => e.entity === 'Chama Savings');
  const personalEntities = entities.filter(e => e.entity === 'Personal Savings');
  const mgrEntities = entities.filter(e => e.entity === 'Merry-go-round');

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'Chama Savings':
        return <Wallet className="h-4 w-4 text-blue-500" />;
      case 'Personal Savings':
        return <PiggyBank className="h-4 w-4 text-green-500" />;
      case 'Merry-go-round':
        return <RotateCcw className="h-4 w-4 text-amber-500" />;
      case 'Central Wallet':
        return <Wallet className="h-4 w-4 text-purple-500" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Central Wallet Overview
            </CardTitle>
            <CardDescription>Your complete financial overview</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Net Worth</p>
            <CurrencyDisplay 
              amount={totalNetWorth} 
              className="text-3xl font-bold text-green-600"
              showToggle={false}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Loading wallet overview...
                </TableCell>
              </TableRow>
            ) : entities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No wallet entities found. Start by joining a chama or adding personal savings.
                </TableCell>
              </TableRow>
            ) : (
              entities.map((entity, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEntityIcon(entity.entity)}
                      <span className="font-medium">{entity.entity}</span>
                    </div>
                  </TableCell>
                  <TableCell>{entity.name}</TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay 
                      amount={entity.value} 
                      className="font-semibold"
                      showToggle={false}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {entities.length > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Net Worth</p>
                <p className="text-xs text-muted-foreground">Across all entities</p>
              </div>
              <CurrencyDisplay 
                amount={totalNetWorth} 
                className="text-2xl font-bold text-green-600"
                showToggle={false}
              />
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-blue-500" />
              <p className="text-xs font-medium">Chama Savings</p>
            </div>
            <CurrencyDisplay 
              amount={chamaEntities.reduce((sum, e) => sum + e.value, 0)} 
              className="text-lg font-bold text-blue-600"
              showToggle={false}
            />
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className="h-4 w-4 text-green-500" />
              <p className="text-xs font-medium">Personal Savings</p>
            </div>
            <CurrencyDisplay 
              amount={personalEntities.reduce((sum, e) => sum + e.value, 0)} 
              className="text-lg font-bold text-green-600"
              showToggle={false}
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-medium">Merry-Go-Round</p>
            </div>
            <CurrencyDisplay 
              amount={mgrEntities.reduce((sum, e) => sum + e.value, 0)} 
              className="text-lg font-bold text-amber-600"
              showToggle={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
