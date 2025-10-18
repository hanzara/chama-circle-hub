import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useChamas } from "@/hooks/useChamas";
import { useChamaLoans } from "@/hooks/useChamaLoans";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  Calendar, 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Target, 
  Calculator,
  ArrowLeft,
  Banknote,
  Clock
} from "lucide-react";

const ApplyLoanPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: chamas } = useChamas();
  const [selectedChamaId, setSelectedChamaId] = useState<string>("");
  const [loanAmount, setLoanAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [repaymentPeriod, setRepaymentPeriod] = useState("");
  const [applicationStep, setApplicationStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);

  const { applyForLoan, isApplying } = useChamaLoans(selectedChamaId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChamaId) {
      toast({
        title: "Select a Chama",
        description: "Please select a chama to apply for a loan",
        variant: "destructive",
      });
      return;
    }

    if (!loanAmount || !purpose || !repaymentPeriod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await applyForLoan({
        amount: parseFloat(loanAmount),
        purpose,
        repaymentPeriodMonths: parseInt(repaymentPeriod)
      });

      // Reset form
      setLoanAmount("");
      setPurpose("");
      setRepaymentPeriod("");
      
      // Navigate to loan management page
      setTimeout(() => {
        navigate("/loan-management");
      }, 2000);
    } catch (error) {
      console.error("Error applying for loan:", error);
    }
  };

  const processingFee = loanAmount ? (parseFloat(loanAmount) * 0.02) : 0;
  const netAmount = loanAmount ? (parseFloat(loanAmount) - processingFee) : 0;
  const interestRate = 0.125; // 12.5% per year
  const monthlyInterestRate = interestRate / 12;
  const totalInterest = loanAmount && repaymentPeriod ? 
    (parseFloat(loanAmount) * interestRate * (parseInt(repaymentPeriod) / 12)) : 0;
  const totalRepayment = loanAmount ? parseFloat(loanAmount) + totalInterest : 0;
  const monthlyPayment = loanAmount && repaymentPeriod ? 
    totalRepayment / parseInt(repaymentPeriod || "1") : 0;

  const selectedChama = chamas?.find(chama => chama.id === selectedChamaId);
  
  // Progress calculation
  const getApplicationProgress = () => {
    let progress = 0;
    if (selectedChamaId) progress += 25;
    if (loanAmount) progress += 25;
    if (purpose) progress += 25;
    if (repaymentPeriod) progress += 25;
    return progress;
  };

  // Animate calculations
  useEffect(() => {
    if (loanAmount || repaymentPeriod) {
      setIsCalculating(true);
      const timer = setTimeout(() => setIsCalculating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [loanAmount, repaymentPeriod]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-green-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-6 space-y-8">
        {/* Header Section */}
        <div className="relative">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-primary/10 p-4 rounded-full inline-block">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Apply for Loan
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Access funds from your chama with competitive rates and flexible terms designed for your success.
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Application Progress</span>
                <span>{getApplicationProgress()}%</span>
              </div>
              <Progress value={getApplicationProgress()} className="h-2" />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Application Form */}
            <Card className="relative overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Loan Application</CardTitle>
                    <CardDescription>
                      Complete your loan application with accurate information for faster processing.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Step 1: Chama Selection */}
                  <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-blue-200/20">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Step 1
                      </Badge>
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">Choose Your Chama</span>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="chama" className="text-base font-medium flex items-center gap-2">
                        Select Chama *
                        {selectedChamaId && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Label>
                      <Select value={selectedChamaId} onValueChange={setSelectedChamaId}>
                        <SelectTrigger className="h-12 bg-white/70 dark:bg-slate-800/70 hover:bg-white transition-colors">
                          <SelectValue placeholder="Choose your chama..." />
                        </SelectTrigger>
                        <SelectContent>
                          {chamas?.map((chama) => (
                            <SelectItem key={chama.id} value={chama.id} className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="p-1 bg-primary/10 rounded">
                                  <DollarSign className="h-3 w-3 text-primary" />
                                </div>
                                <span className="font-medium">{chama.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedChama && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">Selected: {selectedChama.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Loan Amount */}
                  <div className="space-y-4 p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-green-200/20">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Step 2
                      </Badge>
                      <Calculator className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">Loan Amount</span>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="amount" className="text-base font-medium flex items-center gap-2">
                        Loan Amount (KES) *
                        {loanAmount && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Label>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          placeholder="Enter loan amount (min. KES 1,000)"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          min="1000"
                          step="100"
                          className="pl-10 h-12 bg-white/70 dark:bg-slate-800/70 text-lg font-medium"
                        />
                      </div>
                      
                      {/* Quick Amount Buttons */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[5000, 10000, 25000, 50000, 100000].map((amount) => (
                          <Button
                            key={amount}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLoanAmount(amount.toString())}
                            className="hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all"
                          >
                            KES {amount.toLocaleString()}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Loan Details */}
                  <div className="space-y-4 p-6 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-purple-200/20">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Step 3
                      </Badge>
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">Loan Details</span>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="purpose" className="text-base font-medium flex items-center gap-2">
                          Loan Purpose *
                          {purpose && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </Label>
                        <Textarea
                          id="purpose"
                          placeholder="Describe the purpose of this loan (e.g., business expansion, emergency, education)..."
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          rows={3}
                          className="bg-white/70 dark:bg-slate-800/70 resize-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="repayment" className="text-base font-medium flex items-center gap-2">
                          Repayment Period *
                          {repaymentPeriod && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </Label>
                        <Select value={repaymentPeriod} onValueChange={setRepaymentPeriod}>
                          <SelectTrigger className="h-12 bg-white/70 dark:bg-slate-800/70">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Month</SelectItem>
                            <SelectItem value="3">3 Months</SelectItem>
                            <SelectItem value="6">6 Months</SelectItem>
                            <SelectItem value="12">12 Months</SelectItem>
                            <SelectItem value="24">24 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                    </div>
                  </div>

                  <Separator className="my-6" />
                  
                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/loan-management")}
                      className="flex-1 h-12"
                    >
                      Save as Draft
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isApplying || !selectedChamaId || !loanAmount || !purpose || !repaymentPeriod}
                      className="flex-1 h-12 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        {isApplying ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Submitting Application...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            Submit Loan Application
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
              </form>
            </CardContent>
          </Card>
        </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Loan Calculator */}
            {loanAmount && (
              <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                <CardHeader className="relative">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-all duration-500 ${isCalculating ? 'animate-pulse bg-primary/20' : 'bg-primary/10'}`}>
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      Loan Calculator
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Loan Amount:</span>
                      <span className="font-bold text-lg text-blue-900 dark:text-blue-100">
                        KES {parseFloat(loanAmount).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-red-50/50 dark:bg-red-900/20 rounded-lg">
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">Processing Fee (2%):</span>
                      <span className="font-bold text-red-800 dark:text-red-200">
                        -KES {processingFee.toLocaleString()}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200/50">
                      <span className="font-semibold text-green-700 dark:text-green-300">Net Amount Received:</span>
                      <span className="font-bold text-xl text-green-800 dark:text-green-200">
                        KES {netAmount.toLocaleString()}
                      </span>
                    </div>
                    
                    {repaymentPeriod && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Interest:</span>
                            <span className="font-bold text-purple-800 dark:text-purple-200">
                              KES {totalInterest.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-orange-50/50 dark:bg-orange-900/20 rounded-lg">
                            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Repayment:</span>
                            <span className="font-bold text-orange-800 dark:text-orange-200">
                              KES {totalRepayment.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/50">
                            <span className="font-semibold text-blue-700 dark:text-blue-300">Monthly Payment:</span>
                            <span className="font-bold text-xl text-blue-800 dark:text-blue-200">
                              KES {monthlyPayment.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="text-center text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                            <p className="flex items-center justify-center gap-1">
                              <Clock className="h-3 w-3" />
                              {repaymentPeriod} months • 12.5% annual interest
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements Card */}
            <Card className="border-2 border-orange-200/50 hover:border-orange-300/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg text-orange-800 dark:text-orange-200">
                    Loan Requirements
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  {[
                    { icon: CheckCircle, text: "Must be an active member of the chama", color: "text-green-600" },
                    { icon: TrendingUp, text: "Regular contribution history required", color: "text-blue-600" },
                    { icon: DollarSign, text: "Loan amount subject to chama limits", color: "text-purple-600" },
                    { icon: Shield, text: "Approval required by chama administrators", color: "text-orange-600" },
                    { icon: CreditCard, text: "Processing fee applies to all loans", color: "text-red-600" }
                  ].map((req, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <req.icon className={`h-4 w-4 mt-0.5 ${req.color}`} />
                      <span className="text-sm text-muted-foreground">{req.text}</span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">Quick Approval Tips</span>
                  </div>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 ml-6">
                    <li>• Provide detailed loan purpose</li>
                    <li>• Maintain good contribution record</li>
                    <li>• Offer reasonable collateral</li>
                    <li>• Choose appropriate repayment period</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="fixed bottom-8 right-8 z-10">
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            size="icon"
            className="rounded-full shadow-lg bg-primary/90 hover:bg-primary animate-float"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplyLoanPage;