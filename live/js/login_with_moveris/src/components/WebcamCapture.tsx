import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WebcamCaptureProps {
  onCapture: (frame: string) => void;
  isVerifying: boolean;
  isVerified: boolean;
  thumbnailOnly?: boolean;
}

export const WebcamCapture = ({ onCapture, isVerifying, isVerified, thumbnailOnly = false }: WebcamCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please grant camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const frame = canvas.toDataURL("image/jpeg");
        onCapture(frame);
      }
    }
  };

  useEffect(() => {
    if (isVerified && thumbnailOnly) {
      // Fade out and stop camera after 2 seconds
      setTimeout(() => {
        stopCamera();
      }, 2000);
    }
  }, [isVerified, thumbnailOnly]);

  if (thumbnailOnly) {
    if (!stream && isVerified) {
      return null; // Don't show anything after camera is stopped
    }
    
    return (
      <Card className={`p-2 w-48 transition-opacity duration-1000 ${isVerified && !stream ? 'opacity-0' : 'opacity-100'}`}>
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-32 object-cover rounded-md"
          />
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
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden border">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover"
        />
        {isVerified && (
          <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-2" />
              <p className="text-success font-semibold">Verification Successful</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
            <p className="text-destructive text-center px-4">{error}</p>
          </div>
        )}
      </div>
      
      {!isVerified && !error && (
        <Button
          onClick={captureFrame}
          disabled={isVerifying || !stream}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Start Verification
            </>
          )}
        </Button>
      )}
    </div>
  );
};
