import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Edit2, Save, X, Upload, Shield, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ChamaSettingsProps {
  chamaData: any;
  userRole: string;
  isAdmin: boolean;
  isTreasurer: boolean;
  isSecretary: boolean;
}

const ChamaSettings: React.FC<ChamaSettingsProps> = ({ 
  chamaData, 
  userRole,
  isAdmin,
  isTreasurer,
  isSecretary
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: chamaData?.name || '',
    description: chamaData?.description || '',
    rules: chamaData?.rules || '',
    logo_url: chamaData?.logo_url || ''
  });

  // Update chama details mutation
  const updateChamaMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('chamas')
        .update({
          name: data.name,
          description: data.description,
          rules: data.rules,
          logo_url: data.logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', chamaData.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama', chamaData.id] });
      toast({
        title: "Success",
        description: "Chama details updated successfully"
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update chama details",
        variant: "destructive"
      });
    }
  });

  // Toggle fund lock mutation
  const toggleFundLockMutation = useMutation({
    mutationFn: async (lockStatus: boolean) => {
      const { error } = await supabase
        .from('chamas')
        .update({ 
          funds_locked: lockStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', chamaData.id);

      if (error) throw error;
      return lockStatus;
    },
    onSuccess: (lockStatus) => {
      queryClient.invalidateQueries({ queryKey: ['chama', chamaData.id] });
      toast({
        title: lockStatus ? "Funds Locked" : "Funds Unlocked",
        description: lockStatus 
          ? "All member withdrawals are now disabled" 
          : "Members can now make withdrawals"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update fund lock status",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateChamaMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: chamaData?.name || '',
      description: chamaData?.description || '',
      rules: chamaData?.rules || '',
      logo_url: chamaData?.logo_url || ''
    });
    setIsEditing(false);
  };

  const handleToggleFundLock = () => {
    const newStatus = !chamaData?.funds_locked;
    toggleFundLockMutation.mutate(newStatus);
  };

  // Determine what to show based on role
  const canEdit = isAdmin;
  const canToggleFunds = isAdmin;
  const canViewFundStatus = isAdmin || isTreasurer;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chama Settings</h2>
          <p className="text-muted-foreground">
            {isAdmin && "Manage chama details and fund controls"}
            {isTreasurer && !isAdmin && "View chama information and fund status"}
            {isSecretary && !isAdmin && !isTreasurer && "View chama information"}
            {!isAdmin && !isTreasurer && !isSecretary && "Chama information"}
          </p>
        </div>
        <Badge variant={isAdmin ? "default" : "secondary"}>
          <Shield className="h-3 w-3 mr-1" />
          {userRole}
        </Badge>
      </div>

      {/* Chama Details Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Chama Details</CardTitle>
            <CardDescription>
              {canEdit ? "Edit chama information" : "View chama information"}
            </CardDescription>
          </div>
          {canEdit && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canEdit && isEditing && (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                size="sm"
                disabled={updateChamaMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Chama Logo</Label>
            {isEditing ? (
              <div className="flex items-center gap-4">
                {formData.logo_url && (
                  <img 
                    src={formData.logo_url} 
                    alt="Chama logo" 
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="Enter logo URL"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter image URL or upload to storage
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {chamaData?.logo_url ? (
                  <img 
                    src={chamaData.logo_url} 
                    alt="Chama logo" 
                    className="h-20 w-20 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Chama Name</Label>
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter chama name"
              />
            ) : (
              <p className="text-sm font-medium">{chamaData?.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter chama description"
                rows={4}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {chamaData?.description || "No description provided"}
              </p>
            )}
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <Label>Chama Rules</Label>
            {isEditing ? (
              <Textarea
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                placeholder="Enter chama rules and guidelines"
                rows={6}
              />
            ) : (
              <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                {chamaData?.rules || "No rules specified"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fund Control Card - Only for Admin */}
      {canToggleFunds && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Fund Controls</CardTitle>
            <CardDescription>
              Manage withdrawal permissions for all members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {chamaData?.funds_locked ? (
                  <Lock className="h-5 w-5 text-destructive" />
                ) : (
                  <Unlock className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <p className="font-medium">
                    Funds are currently {chamaData?.funds_locked ? "LOCKED" : "UNLOCKED"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {chamaData?.funds_locked 
                      ? "Members cannot withdraw from their savings or MGR wallets" 
                      : "Members can freely withdraw from their wallets"}
                  </p>
                </div>
              </div>
              <Badge variant={chamaData?.funds_locked ? "destructive" : "default"}>
                {chamaData?.funds_locked ? "Locked" : "Unlocked"}
              </Badge>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleToggleFundLock}
                disabled={toggleFundLockMutation.isPending}
                variant={chamaData?.funds_locked ? "default" : "outline"}
                className="flex-1"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Funds for All Members
              </Button>
              <Button
                onClick={handleToggleFundLock}
                disabled={toggleFundLockMutation.isPending}
                variant={chamaData?.funds_locked ? "outline" : "destructive"}
                className="flex-1"
              >
                <Lock className="h-4 w-4 mr-2" />
                Lock Funds for All Members
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fund Status Card - For Treasurer/Secretary/Members */}
      {!canToggleFunds && canViewFundStatus && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Fund Status</CardTitle>
            <CardDescription>Current withdrawal status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              {chamaData?.funds_locked ? (
                <Lock className="h-5 w-5 text-destructive" />
              ) : (
                <Unlock className="h-5 w-5 text-green-600" />
              )}
              <div className="flex-1">
                <p className="font-medium">
                  Funds are currently {chamaData?.funds_locked ? "LOCKED" : "UNLOCKED"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {chamaData?.funds_locked 
                    ? "Withdrawals are disabled by admin" 
                    : "Withdrawals are allowed"}
                </p>
              </div>
              <Badge variant={chamaData?.funds_locked ? "destructive" : "default"}>
                {chamaData?.funds_locked ? "Locked" : "Unlocked"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card for Regular Members */}
      {!canViewFundStatus && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>
              <Eye className="h-5 w-5 inline mr-2" />
              Current Status
            </CardTitle>
            <CardDescription>Withdrawal permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                {chamaData?.funds_locked 
                  ? "⚠️ Withdrawals are currently disabled. Contact your chama admin for more information." 
                  : "✅ You can make withdrawals from your savings and MGR wallets."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChamaSettings;
