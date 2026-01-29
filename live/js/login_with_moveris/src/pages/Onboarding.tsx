import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ============================================================================
// MOVERIS V2 SDK IMPORTS
// ============================================================================
import { 
  MoverisProvider, 
  LivenessView,
  type LivenessResultType 
} from "@moveris/react";

// ============================================================================
// CONFIGURATION - Loaded from environment variables
// ============================================================================
const CONFIG = {
  // Moveris API Configuration (V2 SDK)
  MOVERIS_API_KEY: import.meta.env.VITE_MOVERIS_API_KEY || "",
  MOVERIS_BASE_URL: import.meta.env.VITE_MOVERIS_BASE_URL || undefined,

  // Model configuration: '10', '50', or '250' frames
  MOVERIS_MODEL: (import.meta.env.VITE_MOVERIS_MODEL as '10' | '50' | '250') || '10',

  // Enable debug mode for development
  MOVERIS_DEBUG: import.meta.env.VITE_MOVERIS_DEBUG === 'true',
};

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
  { id: 7, title: "Identity Verification", description: "Complete liveness verification to proceed." },
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
  });
  const [isVerified, setIsVerified] = useState(false);
  const [loaderDelay, setLoaderDelay] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [verificationStarted, setVerificationStarted] = useState(false);

  const handleNext = () => {
    setLoaderDelay(true);
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        setLoaderDelay(false);

        // Show camera permission dialog when reaching verification step
        if (currentStep === 5) {
          setShowCameraDialog(true);
        }
      }
    }, 1500);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ============================================================================
  // MOVERIS V2 SDK CALLBACKS
  // ============================================================================

  /**
   * Handle successful liveness verification result
   */
  const handleLivenessResult = useCallback((result: LivenessResultType) => {
    console.log('Liveness result:', result);

    if (result.verdict === 'live') {
      setIsVerified(true);
      toast({
        title: "Verification Successful",
        description: `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
      });

      // Navigate to success page after brief delay
      setTimeout(() => {
        navigate("/payment");
      }, 1500);
    } else {
      toast({
        title: "Verification Failed",
        description: "Liveness check did not pass. Please try again.",
        variant: "destructive",
      });
      navigate("/error");
    }
  }, [navigate, toast]);

  /**
   * Handle liveness verification errors
   */
  const handleLivenessError = useCallback((error: Error) => {
    console.error('Liveness error:', error);
    toast({
      title: "Verification Error",
      description: error.message || "An error occurred during verification",
      variant: "destructive",
    });
    navigate("/error");
  }, [navigate, toast]);

  /**
   * Start the verification process
   */
  const startVerification = () => {
    setShowCameraDialog(false);
    setVerificationStarted(true);
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
        // Verification step with Moveris V2 SDK LivenessView
        return (
          <div className="space-y-6">
            {!verificationStarted ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Click the button below to start identity verification
                </p>
                <Button onClick={() => setShowCameraDialog(true)} className="w-full">
                  Start Verification
                </Button>
              </div>
            ) : (
              <MoverisProvider
                apiKey={CONFIG.MOVERIS_API_KEY}
                model={CONFIG.MOVERIS_MODEL}
                baseUrl={CONFIG.MOVERIS_BASE_URL}
                debug={CONFIG.MOVERIS_DEBUG}
              >
                <div className="relative">
                  <LivenessView
                    model={CONFIG.MOVERIS_MODEL}
                    onResult={handleLivenessResult}
                    onError={handleLivenessError}
                    showOverlay={true}
                    showControls={true}
                    showResult={true}
                    autoStartCamera={true}
                    className="rounded-lg overflow-hidden"
                    statusMessages={{
                      idle: "Position your face in the oval",
                      capturing: "Hold still, capturing...",
                      uploading: "Uploading frames...",
                      processing: "Analyzing...",
                      complete: "Verification complete!",
                      error: "An error occurred",
                    }}
                  />

                  {isVerified && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-lg backdrop-blur-sm">
                      <div className="text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-semibold">Verified Successfully!</p>
                      </div>
                    </div>
                  )}
                </div>
              </MoverisProvider>
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
      case 6: return isVerified;
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

        {/* Progress Steps */}
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
                  <div className="relative flex items-center mx-2">
                    <div
                      className={`h-1 w-16 ${index < currentStep ? "bg-primary" : "bg-muted"}`}
                    />
                    <div
                      className={`w-3 h-3 border-t-8 border-b-8 ml-[1px] border-white
                      ${index < currentStep ? "border-l-8 border-l-primary" : "border-l-8 border-l-muted"}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Card */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStepContent()}
          </CardContent>
          <CardContent className="space-y-6">
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
                  {loaderDelay && <Loader2 className="h-4 w-4 animate-spin text-white mx-auto" />}
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Camera Permission Dialog */}
        <AlertDialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Camera Access Required</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Traiders needs to access your webcam for identity verification.
              This helps ensure the security of your account. Your camera feed
              is processed securely and is not stored.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => navigate("/")}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={startVerification}>Allow Camera</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Onboarding;
