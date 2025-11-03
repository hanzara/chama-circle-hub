import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useCreateChama } from '@/hooks/useChamas';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

const CreateChamaPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createChama = useCreateChama();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contribution_amount: '',
    contribution_frequency: 'monthly',
    max_members: '20'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    console.log('User authenticated:', !!user);
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a chama.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.name || !formData.contribution_amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting to create chama...');
      
      const chamaData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        contribution_amount: parseFloat(formData.contribution_amount),
        contribution_frequency: formData.contribution_frequency,
        max_members: parseInt(formData.max_members)
      };

      console.log('Processed chama data:', chamaData);
      
      await createChama.mutateAsync(chamaData);
      
      console.log('Chama created successfully, navigating...');
      
      setTimeout(() => {
        navigate('/chamas');
      }, 1000);
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = createChama.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t('chama.create', 'Create New Chama')}</h1>
              <p className="text-muted-foreground">Set up your savings group</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Chama Details
              </CardTitle>
              <CardDescription>
                Provide the basic information for your new Chama
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('chama.name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter chama name"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('chama.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the purpose and goals of your chama"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contribution">{t('chama.contribution.amount')} *</Label>
                    <Input
                      id="contribution"
                      type="number"
                      value={formData.contribution_amount}
                      onChange={(e) => handleInputChange('contribution_amount', e.target.value)}
                      placeholder="5000"
                      required
                      disabled={isLoading}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">{t('chama.frequency')}</Label>
                    <Select 
                      value={formData.contribution_frequency} 
                      onValueChange={(value) => handleInputChange('contribution_frequency', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMembers">{t('chama.max.members')}</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    value={formData.max_members}
                    onChange={(e) => handleInputChange('max_members', e.target.value)}
                    placeholder="20"
                    disabled={isLoading}
                    min="2"
                    max="100"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {t('chama.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isLoading || !formData.name || !formData.contribution_amount}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      t('chama.create')
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateChamaPage;
