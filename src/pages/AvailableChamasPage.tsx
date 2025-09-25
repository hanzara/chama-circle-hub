import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, DollarSign, Star, MapPin, Calendar, Shield, CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import Navigation from '@/components/Navigation';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMpesaIntegration } from '@/hooks/useMpesaIntegration';
import { useNavigate } from 'react-router-dom';

interface ChamaListing {
  id: string;
  name: string;
  description: string;
  maxMembers: number;
  currentMembers: number;
  registrationFee: number;
  contributionAmount: number;
  frequency: string;
  category: string;
  location: string;
  rating: number;
  established: string;
  logo: string;
  features: string[];
  memberBenefits: string[];
  requirements: string[];
}

const availableChamas: ChamaListing[] = [
  {
    id: '1',
    name: 'Elite Business Circle',
    description: 'Exclusive chama for established entrepreneurs and business owners focused on scaling ventures',
    maxMembers: 50,
    currentMembers: 32,
    registrationFee: 1000,
    contributionAmount: 20,
    frequency: 'monthly',
    category: 'Business',
    location: 'Nairobi CBD',
    rating: 4.8,
    established: '2022',
    logo: '💼',
    features: ['Investment planning', 'Business networking', 'Loan facilities', 'Financial advisory'],
    memberBenefits: ['Priority loan access', 'Business mentorship', 'Networking events', 'Investment opportunities'],
    requirements: ['Business registration', 'Min 2 years experience', 'Credit check']
  },
  {
    id: '2',
    name: 'Youth Entrepreneurs Hub',
    description: 'Dynamic chama for young entrepreneurs aged 18-35 starting their business journey',
    maxMembers: 25,
    currentMembers: 18,
    registrationFee: 500,
    contributionAmount: 20,
    frequency: 'monthly',
    category: 'Youth',
    location: 'Westlands',
    rating: 4.6,
    established: '2023',
    logo: '🚀',
    features: ['Startup funding', 'Skill development', 'Mentorship program', 'Digital marketing'],
    memberBenefits: ['Low-interest loans', 'Training workshops', 'Pitch events', 'Investor connections'],
    requirements: ['Age 18-35', 'Business idea/plan', 'Valid ID']
  },
  {
    id: '3',
    name: 'Professional Women Network',
    description: 'Empowering professional women through collective savings and investment',
    maxMembers: 30,
    currentMembers: 22,
    registrationFee: 750,
    contributionAmount: 20,
    frequency: 'monthly',
    category: 'Women',
    location: 'Karen',
    rating: 4.9,
    established: '2021',
    logo: '👩‍💼',
    features: ['Investment portfolio', 'Insurance coverage', 'Educational loans', 'Emergency fund'],
    memberBenefits: ['Leadership training', 'Career advancement', 'Healthcare support', 'Childcare assistance'],
    requirements: ['Professional qualification', 'Stable income', 'Reference letter']
  },
  {
    id: '4',
    name: 'Tech Innovators Collective',
    description: 'Forward-thinking chama for tech professionals and innovators in the digital space',
    maxMembers: 20,
    currentMembers: 14,
    registrationFee: 600,
    contributionAmount: 20,
    frequency: 'monthly',
    category: 'Technology',
    location: 'Kilimani',
    rating: 4.7,
    established: '2023',
    logo: '💻',
    features: ['Tech equipment financing', 'Startup incubation', 'Crypto investments', 'Innovation grants'],
    memberBenefits: ['Equipment loans', 'Code bootcamps', 'Patent support', 'Tech conferences'],
    requirements: ['Tech background', 'Portfolio/GitHub', 'Technical interview']
  },
  {
    id: '5',
    name: 'Community Builders Alliance',
    description: 'Grassroots chama focused on community development and social impact projects',
    maxMembers: 40,
    currentMembers: 28,
    registrationFee: 400,
    contributionAmount: 20,
    frequency: 'monthly',
    category: 'Community',
    location: 'Kibera',
    rating: 4.5,
    established: '2020',
    logo: '🏘️',
    features: ['Community projects', 'Education support', 'Healthcare fund', 'Infrastructure'],
    memberBenefits: ['Project funding', 'Skills training', 'Health insurance', 'School fees loans'],
    requirements: ['Community residence', 'Character reference', 'Commitment letter']
  },
  {
    id: '6',
    name: 'Agricultural Producers Co-op',
    description: 'Farmers and agribusiness professionals working together for agricultural growth',
    maxMembers: 35,
    currentMembers: 26,
    registrationFee: 450,
    contributionAmount: 20,
    frequency: 'monthly',
    category: 'Agriculture',
    location: 'Kiambu',
    rating: 4.4,
    established: '2019',
    logo: '🌾',
    features: ['Farm equipment loans', 'Seasonal funding', 'Market linkage', 'Insurance coverage'],
    memberBenefits: ['Equipment sharing', 'Bulk purchasing', 'Market access', 'Weather insurance'],
    requirements: ['Farm ownership/lease', 'Agricultural activity', 'Land documentation']
  },
  {
    id: '7',
    name: 'Creative Arts Collective',
    description: 'Artists, designers, and creative professionals pooling resources for artistic ventures',
    maxMembers: 15,
    currentMembers: 11,
    registrationFee: 350,
    contributionAmount: 20,
    frequency: 'monthly',
    category: 'Arts',
    location: 'Ngong Road',
    rating: 4.3,
    established: '2022',
    logo: '🎨',
    features: ['Studio funding', 'Equipment purchase', 'Exhibition support', 'Artist grants'],
    memberBenefits: ['Shared studio space', 'Art supplies', 'Exhibition opportunities', 'Skills exchange'],
    requirements: ['Artistic portfolio', 'Creative profession', 'Peer recommendation']
  },
  {
    id: '8',
    name: 'Healthcare Workers Union',
    description: 'Medical professionals and healthcare workers securing their financial future',
    maxMembers: 25,
    currentMembers: 19,
    registrationFee: 650,
    contributionAmount: 20,
    frequency: 'monthly',
    category: 'Healthcare',
    location: 'Hospital Area',
    rating: 4.7,
    established: '2021',
    logo: '⚕️',
    features: ['Medical equipment loans', 'Practice setup', 'Continuing education', 'Insurance'],
    memberBenefits: ['Equipment financing', 'CME funding', 'Practice loans', 'Health coverage'],
    requirements: ['Medical qualification', 'License verification', 'Professional standing']
  },
  {
    id: '9',
    name: 'Transport Operators Network',
    description: 'Matatu owners, taxi drivers, and transport business operators',
    maxMembers: 45,
    currentMembers: 34,
    registrationFee: 550,
    contributionAmount: 20,
    frequency: 'monthly',
    category: 'Transport',
    location: 'Eastlands',
    rating: 4.2,
    established: '2020',
    logo: '🚗',
    features: ['Vehicle financing', 'Route licensing', 'Insurance cover', 'Maintenance fund'],
    memberBenefits: ['Vehicle loans', 'Insurance discounts', 'Spare parts', 'Route allocation'],
    requirements: ['PSV license', 'Clean driving record', 'Vehicle inspection']
  },
  {
    id: '10',
    name: 'Retail Merchants Circle',
    description: 'Shop owners and retail business operators growing together',
    maxMembers: 30,
    currentMembers: 23,
    registrationFee: 400,
    contributionAmount: 20,
    frequency: 'monthly',
    category: 'Retail',
    location: 'Town Center',
    rating: 4.1,
    established: '2022',
    logo: '🏪',
    features: ['Stock financing', 'Shop expansion', 'Bulk purchasing', 'POS systems'],
    memberBenefits: ['Inventory loans', 'Supplier discounts', 'Shop upgrades', 'Digital payment'],
    requirements: ['Business permit', 'Shop location', 'Sales records']
  }
];

const AvailableChamasPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { stkPushMutation, isProcessingPayment } = useMpesaIntegration();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedChama, setSelectedChama] = useState<ChamaListing | null>(null);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    occupation: '',
    reason: ''
  });

  const categories = ['All', 'Business', 'Youth', 'Women', 'Technology', 'Community', 'Agriculture', 'Arts', 'Healthcare', 'Transport', 'Retail'];

  const filteredChamas = selectedCategory === 'All' 
    ? availableChamas 
    : availableChamas.filter(chama => chama.category === selectedCategory);

  const handleJoinChama = (chama: ChamaListing) => {
    setSelectedChama(chama);
    setShowJoinForm(true);
  };

  const handleSubmitApplication = () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Move to payment step
    setShowJoinForm(false);
    setShowPaymentDialog(true);
  };

  const handlePayment = async () => {
    if (!selectedChama || !formData.phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Phone number is required for payment",
        variant: "destructive",
      });
      return;
    }

    try {
      await stkPushMutation.mutateAsync({
        phoneNumber: formData.phoneNumber,
        amount: selectedChama.registrationFee,
        description: `Registration fee for ${selectedChama.name}`,
        purpose: 'registration',
        chamaId: selectedChama.id
      });

      setShowPaymentDialog(false);
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        occupation: '',
        reason: ''
      });
      
      toast({
        title: "Registration Successful! 🎉",
        description: `Welcome to ${selectedChama.name}! You can now access all chama features.`,
      });

      // Navigate to chama dashboard after successful payment
      setTimeout(() => {
        navigate('/advanced-chama');
      }, 2000);

    } catch (error) {
      console.error('Registration payment failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Available Chamas
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover and join chamas that match your financial goals and interests
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="mb-2"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Chamas Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredChamas.map((chama) => (
            <Card key={chama.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">{chama.logo}</div>
                  <Badge variant="secondary">{chama.category}</Badge>
                </div>
                <CardTitle className="text-xl">{chama.name}</CardTitle>
                <CardDescription className="text-sm">{chama.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {chama.currentMembers}/{chama.maxMembers} members
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{chama.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{chama.rating}/5.0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Since {chama.established}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Registration Fee:</span>
                    <CurrencyDisplay amount={chama.registrationFee} showToggle={false} className="font-bold text-green-600" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Per Member Cost:</span>
                    <CurrencyDisplay amount={chama.contributionAmount} showToggle={false} className="text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {chama.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <span className="text-3xl">{chama.logo}</span>
                        {chama.name}
                      </DialogTitle>
                      <DialogDescription>{chama.description}</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Member Benefits
                          </h4>
                          <ul className="text-sm space-y-1">
                            {chama.memberBenefits.map((benefit, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <Shield className="h-4 w-4 text-orange-500" />
                            Requirements
                          </h4>
                          <ul className="text-sm space-y-1">
                            {chama.requirements.map((requirement, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                                {requirement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Financial Overview</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Registration Fee:</span>
                            <div className="font-bold text-green-600">
                              <CurrencyDisplay amount={chama.registrationFee} showToggle={false} />
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Monthly Contribution:</span>
                            <div className="font-bold">
                              <CurrencyDisplay amount={chama.contributionAmount * chama.maxMembers} showToggle={false} />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleJoinChama(chama)} 
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                      >
                        Apply to Join This Chama
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Join Application Dialog */}
        <Dialog open={showJoinForm} onOpenChange={setShowJoinForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join {selectedChama?.name}</DialogTitle>
              <DialogDescription>
                Please fill out this application to join the chama. Registration fee: {' '}
                <CurrencyDisplay amount={selectedChama?.registrationFee || 0} showToggle={false} className="font-bold text-green-600" />
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="07XX XXX XXX"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  placeholder="Your current occupation"
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Why do you want to join this chama?</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Brief reason for joining"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleSubmitApplication} className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </Button>
                <Button variant="outline" onClick={() => setShowJoinForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Registration</DialogTitle>
              <DialogDescription>
                Pay registration fee to join {selectedChama?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Registration Fee</h3>
                <p className="text-3xl font-bold text-primary mt-2">
                  KSh {selectedChama?.registrationFee}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  One-time payment to join this chama
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  M-Pesa Payment Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone Number:</span>
                    <span className="font-medium">{formData.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">KSh {selectedChama?.registrationFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purpose:</span>
                    <span className="font-medium">Chama Registration</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowPaymentDialog(false)}
                  disabled={isProcessingPayment}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-center text-muted-foreground">
                You will receive an STK push on your phone to complete the payment
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AvailableChamasPage;