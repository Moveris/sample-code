import { useState, useEffect, useRef } from "react";
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
// CONFIGURATION - Loaded from environment variables
// ============================================================================
const CONFIG = {
  // Moveris API Configuration
  MOVERIS_WS_URI: import.meta.env.VITE_MOVERIS_WS_URI || "wss://api.moveris.com/live/v1/",
  MOVERIS_SECRET_KEY: import.meta.env.VITE_MOVERIS_SECRET_KEY || "",

  // Frame Capture Settings
  FRAME_RATE: parseInt(import.meta.env.VITE_FRAME_RATE) || 10,
  IMAGE_QUALITY: parseFloat(import.meta.env.VITE_IMAGE_QUALITY) || 0.7,
  MAX_REQUIRED_FRAMES: parseInt(import.meta.env.VITE_REQUIRED_FRAMES) || 500,

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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [camAllowPopup, setCamAllowPopup] = useState<boolean>(true);
  const [isCamAllowed, setIsCamAllowed] = useState<boolean>(false);
  const [camCancelPopup, setCamCancelPopup] = useState<boolean>(false);
  const [camBlockedUserStatusMessage, setCamBlockedUserStatusMessage] = useState<string>("")

  // ============================================================================
  // REFS
  // ============================================================================
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameCountRef = useRef<number>(0);

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

  // ============================================================================
  // Web Cam initialization 
  // =============================================================================
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      setStream(mediaStream);
      setIsCamAllowed(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      if (!(err instanceof Error)) {
        err = new Error(err);
      }
      if ("NotAllowedError" === err.name) {
        const status = await navigator.permissions.query({ name: "camera" });

        if ("prompt" === status.state) {
          setCamBlockedUserStatusMessage("This app needs access to your camera. Please refresh your Browser or  allow camera accessto continue.Go to Settings>Privacy & Security> Permissions or Site settings to enable camera access.");
        }
        if ("denied" === status.state) {
          setCamBlockedUserStatusMessage("Camera access has been denied. Please enable camera permissions manually in your browser or device settings to continue. Go to Settings>Privacy & Security> Permissions or Site settings to enable camera access.");
        }
      }
      setIsCamAllowed(false);
      setCamCancelPopup(true);

      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please grant camera permissions.");

    }
  };

  const stopCamera = () => {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop()
      }
      setStream(null);
    }
  };

  // ============================================================================
  // MOVERIS WEBSOCKET INTEGRATION (Based on provided HTML logic)
  // ============================================================================
  /**
 * Captures a frame from the video stream
 * Converts to base64 JPEG format for transmission
 */
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Convert to base64 JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', CONFIG.IMAGE_QUALITY);
    const base64Data = dataUrl.split(',')[1];

    return base64Data;
  };

  const handleVerification = async () => {
    // Simulate WebSocket connection to external verification service
    // In production, replace this with actual WebSocket connection

    try {
      /**  
       * Initializes WebSocket connection to Moveris API
       * Handles authentication and frame streaming    
      **/
      const websocket = new WebSocket(CONFIG.MOVERIS_WS_URI);
      websocket.onopen = () => {
        console.log('WebSocket connected');
      };
      let intervalId;

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if ("auth_required" === data.type) {
            console.log('Authentication required');
            if (websocket.readyState === WebSocket.OPEN) {
              websocket.send(JSON.stringify({
                type: 'auth',
                token: CONFIG.MOVERIS_SECRET_KEY
              }));

            }
          }
          if ("auth_success" === data.type) {
            intervalId = setInterval(() => {
              const frameData = captureFrame();

              if (websocket.readyState === WebSocket.OPEN) {

                frameCountRef.current += 1;
                const currentFrame = frameCountRef.current;

                websocket.send(JSON.stringify({
                  type: 'frame',
                  frame_number: currentFrame,
                  frame_data: frameData,
                  timestamp: Date.now() / 1000
                }));
              }
            }, 1000 / CONFIG.FRAME_RATE);
          }
          if ("processing_complete" === data.type) {
            setIsVerified(true);
            toast({
              title: "Verification Successful",
              description: "Your identity has been verified",
            });
            clearInterval(intervalId);
            stopCamera()
            setIsVerifying(false);
            setTimeout(() => navigate("/payment"), 2500)

          }
          if ("error" === data.type) {
            clearInterval(intervalId);
            stopCamera()
            toast({
              title: "Verification Failed",
              description: "Please try again or contact support",
              variant: "destructive",
            });
            navigate("/error");
          }

        } catch (error) {
          // throw new Error("WebSocket error occurred (onmessage):" + JSON.stringify(error));
          toast({
            title: "Verification Failed",
            description: "Please try again or contact support",
            variant: "destructive",
          });
          console.error("WebSocket error occurred (onmessage):", error)
          setIsVerifying(false);
        }
      }
      websocket.onerror = (err) => {
        // throw new Error("WebSocket error occurred:" + JSON.stringify(err));
        toast({
          title: "Verification Failed",
          description: "Please try again or contact support",
          variant: "destructive",
        });
        console.error("WebSocket error occurred (onerror):", err)
        setIsVerifying(false);
      };
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("WebSocket error occurred (initailization):", error);
      setIsVerifying(false);

    }
  };

  const startVeriFicationClick = () => {
    setIsVerifying(true);
    setTimeout(() => handleVerification()
      , 2000)
  }

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
            <Button onClick={startVeriFicationClick} disabled={isVerifying} className="w-full">
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Start Verification"
              )}
            </Button>
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
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${index <= currentStep
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

                    {/* Arrow */}
                    <div
                      className={`w-3 h-3 border-t-8 border-b-8 ml-[1px]  border-white
                      ${index < currentStep ? "border-l-8 border-l-primary" : "border-l-8 border-l-muted"}`}
                    />
                  </div>
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
                <Button onClick={handleNext} disabled={(!isStepValid() || !isCamAllowed)}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
        {showWebcam && (
          <div className="fixed bottom-4 left-4">

            <Card className={`p-2 w-48 transition-opacity duration-5000 ${isVerified && !stream ? 'opacity-0' : 'opacity-100'}`}>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-32 object-cover rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
                {isVerified && (
                  <div className="absolute inset-0 bg-success/20 flex items-center justify-center rounded-md backdrop-blur-sm">
                    <CheckCircle2 className="h-12 w-12 text-success drop-shadow-lg" />
                  </div>
                )}
                {error && (
                  <div className="text-xs text-destructive mt-1">{error}</div>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                {isVerified ? "Verified ✓" : "Live Camera Feed"}
              </p>
            </Card>
          </div>
        )}
        {/* Popups  */}
        {/* camera required popup  */}
        <AlertDialog open={camAllowPopup} onOpenChange={setCamAllowPopup}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Camera Access Required</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Hey! Traiders needs to turn on your webcam just for a quick human check.
              It’ll only take a moment, and your camera feed stays private.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCamCancelPopup(true)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={startCamera}>Allow Camera</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* camera blocked popup  */}
        <AlertDialog open={camCancelPopup} onOpenChange={setCamCancelPopup}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Camera Access Required*</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              {camBlockedUserStatusMessage !== "" ? camBlockedUserStatusMessage : "This Identity verification service available only with Camera access"}
            </AlertDialogDescription>
            <AlertDialogFooter>
              {camBlockedUserStatusMessage === "" &&
                <AlertDialogAction onClick={startCamera}>Allow Camera</AlertDialogAction>}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Onboarding;
