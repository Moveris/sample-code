import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Upload, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WebcamCapture } from "@/components/WebcamCapture";

type Step = {
  id: number;
  title: string;
  description: string;
};

const steps: Step[] = [
  { id: 1, title: "Crypto Knowledge", description: "What's your experience level?" },
  { id: 2, title: "Trading Style", description: "How do you prefer to trade?" },
  { id: 3, title: "Risk Profile", description: "What's your risk tolerance?" },
  { id: 4, title: "Primary Objective", description: "What's your main goal?" },
  { id: 5, title: "Trading Frequency", description: "How often will you trade?" },
  { id: 6, title: "Investment Amount", description: "How much will you invest?" },
  { id: 7, title: "Identity Verification", description: "Verify your identity" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    cryptoKnowledge: "",
    tradingStyle: "",
    riskProfile: "",
    primaryObjective: "",
    tradingFrequency: "",
    investmentAmount: "",
    document: null as File | null,
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);

  useEffect(() => {
    // Request webcam access after component mounts
    setShowWebcam(true);
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, document: e.target.files[0] });
    }
  };

  const handleVerification = async (frame: string) => {
    setIsVerifying(true);
    
    // Simulate WebSocket connection to external verification service
    // In production, replace this with actual WebSocket connection
    try {
      // Simulating verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random verification result (replace with actual WebSocket response)
      const isReal = Math.random() > 0.2; // 80% success rate for demo
      
      if (isReal) {
        setIsVerified(true);
        toast({
          title: "Verification Successful",
          description: "Your identity has been verified",
        });
        setTimeout(() => {
          navigate("/payment");
        }, 1500);
      } else {
        toast({
          title: "Verification Failed",
          description: "Please try again or contact support",
          variant: "destructive",
        });
        navigate("/error");
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid gap-3">
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.cryptoKnowledge === 'basic' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, cryptoKnowledge: 'basic' })}
            >
              <h3 className="font-semibold mb-1">Basic</h3>
              <p className="text-sm text-muted-foreground">Just getting started with cryptocurrency trading</p>
            </Card>
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.cryptoKnowledge === 'intermediate' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, cryptoKnowledge: 'intermediate' })}
            >
              <h3 className="font-semibold mb-1">Intermediate</h3>
              <p className="text-sm text-muted-foreground">Have some experience trading and understanding markets</p>
            </Card>
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.cryptoKnowledge === 'expert' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, cryptoKnowledge: 'expert' })}
            >
              <h3 className="font-semibold mb-1">Expert</h3>
              <p className="text-sm text-muted-foreground">Advanced knowledge of crypto markets and trading strategies</p>
            </Card>
          </div>
        );
      case 1:
        return (
          <div className="grid gap-3">
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.tradingStyle === 'day' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, tradingStyle: 'day' })}
            >
              <h3 className="font-semibold mb-1">Day Trading</h3>
              <p className="text-sm text-muted-foreground">Active trading with positions closed within the same day</p>
            </Card>
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.tradingStyle === 'swing' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, tradingStyle: 'swing' })}
            >
              <h3 className="font-semibold mb-1">Swing Trading</h3>
              <p className="text-sm text-muted-foreground">Hold positions for days or weeks to capture market swings</p>
            </Card>
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.tradingStyle === 'long-term' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, tradingStyle: 'long-term' })}
            >
              <h3 className="font-semibold mb-1">Long-term Investing</h3>
              <p className="text-sm text-muted-foreground">Buy and hold strategy for months or years</p>
            </Card>
          </div>
        );
      case 2:
        return (
          <div className="grid gap-3">
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.riskProfile === 'conservative' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, riskProfile: 'conservative' })}
            >
              <h3 className="font-semibold mb-1">Conservative</h3>
              <p className="text-sm text-muted-foreground">Minimize risk with stable, low-volatility investments</p>
            </Card>
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.riskProfile === 'moderate' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, riskProfile: 'moderate' })}
            >
              <h3 className="font-semibold mb-1">Moderate</h3>
              <p className="text-sm text-muted-foreground">Balanced approach between risk and reward</p>
            </Card>
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.riskProfile === 'aggressive' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, riskProfile: 'aggressive' })}
            >
              <h3 className="font-semibold mb-1">Aggressive</h3>
              <p className="text-sm text-muted-foreground">High-risk, high-reward strategy for maximum returns</p>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className="grid gap-3">
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.primaryObjective === 'income' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, primaryObjective: 'income' })}
            >
              <h3 className="font-semibold mb-1">Generate Income</h3>
              <p className="text-sm text-muted-foreground">Focus on regular returns through dividends and interest</p>
            </Card>
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.primaryObjective === 'growth' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, primaryObjective: 'growth' })}
            >
              <h3 className="font-semibold mb-1">Capital Growth</h3>
              <p className="text-sm text-muted-foreground">Maximize long-term portfolio value appreciation</p>
            </Card>
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.primaryObjective === 'preservation' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, primaryObjective: 'preservation' })}
            >
              <h3 className="font-semibold mb-1">Wealth Preservation</h3>
              <p className="text-sm text-muted-foreground">Protect existing capital with minimal volatility</p>
            </Card>
          </div>
        );
      case 4:
        return (
          <div className="grid gap-3">
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.tradingFrequency === 'daily' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, tradingFrequency: 'daily' })}
            >
              <h3 className="font-semibold mb-1">Daily</h3>
              <p className="text-sm text-muted-foreground">Execute trades every day during market hours</p>
            </Card>
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.tradingFrequency === 'weekly' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, tradingFrequency: 'weekly' })}
            >
              <h3 className="font-semibold mb-1">Weekly</h3>
              <p className="text-sm text-muted-foreground">Trade a few times per week as opportunities arise</p>
            </Card>
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.tradingFrequency === 'monthly' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, tradingFrequency: 'monthly' })}
            >
              <h3 className="font-semibold mb-1">Monthly</h3>
              <p className="text-sm text-muted-foreground">Make strategic trades once or twice a month</p>
            </Card>
            <Card 
              className={`p-4 cursor-pointer transition-all ${formData.tradingFrequency === 'occasionally' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => setFormData({ ...formData, tradingFrequency: 'occasionally' })}
            >
              <h3 className="font-semibold mb-1">Occasionally</h3>
              <p className="text-sm text-muted-foreground">Trade when specific opportunities or conditions align</p>
            </Card>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <Label htmlFor="amount">Initial Investment Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="10000"
              value={formData.investmentAmount}
              onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
              min="100"
            />
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="document">Upload Identity Document</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleDocumentUpload}
                  className="flex-1"
                />
                {formData.document && <CheckCircle2 className="h-5 w-5 text-success" />}
              </div>
              {formData.document && (
                <p className="text-sm text-muted-foreground">
                  File: {formData.document.name}
                </p>
              )}
            </div>
            
            {formData.document && !isVerified && (
              <Button onClick={() => handleVerification("")} disabled={isVerifying} className="w-full">
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Start Verification"
                )}
              </Button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.cryptoKnowledge !== "";
      case 1: return formData.tradingStyle !== "";
      case 2: return formData.riskProfile !== "";
      case 3: return formData.primaryObjective !== "";
      case 4: return formData.tradingFrequency !== "";
      case 5: return formData.investmentAmount !== "";
      case 6: return formData.document !== null;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10 p-4">
      <div className="container mx-auto max-w-3xl py-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">Traiders</span>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-8 mx-1 ${
                      index < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStepContent()}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={!isStepValid()}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {!isVerified && "Upload document and verify to continue"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {showWebcam && (
          <div className="fixed bottom-4 right-4">
            <WebcamCapture
              onCapture={handleVerification}
              isVerifying={isVerifying}
              isVerified={isVerified}
              thumbnailOnly
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
