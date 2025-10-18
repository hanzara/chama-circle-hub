import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Wifi, Plus, MapPin, Users, CheckCircle, Clock, Edit } from 'lucide-react';

interface Hotspot {
  id: string;
  name: string;
  description: string | null;
  location_lat: number | null;
  location_lng: number | null;
  address: string | null;
  max_concurrent_users: number;
  network_ssid: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

interface HotspotManagementProps {
  sellerId: string;
}

export function HotspotManagement({ sellerId }: HotspotManagementProps) {
  const { toast } = useToast();
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    network_ssid: '',
    address: '',
    max_concurrent_users: 50,
    location_lat: '',
    location_lng: '',
  });

  useEffect(() => {
    fetchHotspots();
  }, [sellerId]);

  const fetchHotspots = async () => {
    try {
      const { data, error } = await supabase
        .from('wifi_hotspots')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHotspots((data || []) as Hotspot[]);
    } catch (error: any) {
      console.error('Error fetching hotspots:', error);
      toast({
        title: "Error",
        description: "Failed to load hotspots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      network_ssid: '',
      address: '',
      max_concurrent_users: 50,
      location_lat: '',
      location_lng: '',
    });
    setEditingHotspot(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const hotspotData = {
        seller_id: sellerId,
        name: formData.name,
        description: formData.description || null,
        network_ssid: formData.network_ssid || null,
        address: formData.address || null,
        max_concurrent_users: formData.max_concurrent_users,
        location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
        location_lng: formData.location_lng ? parseFloat(formData.location_lng) : null,
        status: 'active' as const,
        rating: 0,
        total_ratings: 0,
        current_active_users: 0,
        coverage_radius: 100,
        setup_type: 'voucher',
        captive_portal_url: null,
      };

      let result;
      if (editingHotspot) {
        result = await supabase
          .from('wifi_hotspots')
          .update(hotspotData)
          .eq('id', editingHotspot.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('wifi_hotspots')
          .insert(hotspotData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Hotspot ${editingHotspot ? 'updated' : 'created'} successfully`,
      });

      setShowAddModal(false);
      resetForm();
      fetchHotspots();
    } catch (error: any) {
      console.error('Error saving hotspot:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save hotspot",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (hotspot: Hotspot) => {
    setEditingHotspot(hotspot);
    setFormData({
      name: hotspot.name,
      description: hotspot.description || '',
      network_ssid: hotspot.network_ssid || '',
      address: hotspot.address || '',
      max_concurrent_users: hotspot.max_concurrent_users,
      location_lat: hotspot.location_lat?.toString() || '',
      location_lng: hotspot.location_lng?.toString() || '',
    });
    setShowAddModal(true);
  };

  const getStatusBadge = (hotspot: Hotspot) => {
    switch (hotspot.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hotspot Management</h2>
          <p className="text-muted-foreground">Manage your Wi-Fi hotspots and locations</p>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Hotspot</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingHotspot ? 'Edit Hotspot' : 'Add New Hotspot'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hotspot Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Downtown Cafe WiFi"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the hotspot"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="network_ssid">WiFi Network Name (SSID)</Label>
                <Input
                  id="network_ssid"
                  value={formData.network_ssid}
                  onChange={(e) => setFormData(prev => ({ ...prev, network_ssid: e.target.value }))}
                  placeholder="e.g., CafeWiFi_Guest"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Physical location address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location_lat">Latitude</Label>
                  <Input
                    id="location_lat"
                    type="number"
                    step="any"
                    value={formData.location_lat}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_lat: e.target.value }))}
                    placeholder="-1.2921"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_lng">Longitude</Label>
                  <Input
                    id="location_lng"
                    type="number"
                    step="any"
                    value={formData.location_lng}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_lng: e.target.value }))}
                    placeholder="36.8219"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_concurrent_users">Max Concurrent Users</Label>
                <Input
                  id="max_concurrent_users"
                  type="number"
                  min="1"
                  max="500"
                  value={formData.max_concurrent_users}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_concurrent_users: parseInt(e.target.value) }))}
                />
              </div>

              <Button type="submit" className="w-full">
                {editingHotspot ? 'Update Hotspot' : 'Create Hotspot'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {hotspots.length === 0 ? (
        <Card className="p-8 text-center">
          <Wifi className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Hotspots Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first hotspot to start selling Wi-Fi packages
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Hotspot
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotspots.map((hotspot) => (
            <Card key={hotspot.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Wifi className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{hotspot.name}</h3>
                    {hotspot.network_ssid && (
                      <p className="text-sm text-muted-foreground">{hotspot.network_ssid}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(hotspot)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {getStatusBadge(hotspot)}
                
                {hotspot.address && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{hotspot.address}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Max {hotspot.max_concurrent_users} users</span>
                </div>

                {hotspot.location_lat && hotspot.location_lng && (
                  <div className="text-sm text-muted-foreground">
                    <span>Location: {hotspot.location_lat.toFixed(4)}, {hotspot.location_lng.toFixed(4)}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}