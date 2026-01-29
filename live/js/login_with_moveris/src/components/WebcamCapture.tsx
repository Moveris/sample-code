/**
 * WebcamCapture Component - Using Moveris V2 SDK
 * 
 * This component provides a reusable webcam capture interface
 * powered by the @moveris/react SDK's LivenessCamera component.
 * 
 * Features:
 * - Real-time face detection with visual feedback
 * - Smart frame capture with quality checks
 * - Oval guide with color-coded feedback
 * - Built-in overlay for positioning guidance
 */

import { useRef, useCallback, useState } from "react";
import { CheckCircle2, Loader2, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  LivenessCamera,
  LivenessOverlay,
  useLiveness,
  type LivenessCameraRef,
  type LivenessResultType,
  type LivenessState,
} from "@moveris/react";

interface WebcamCaptureProps {
  /** Callback when verification is complete */
  onResult?: (result: LivenessResultType) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Whether to show only a small thumbnail view */
  thumbnailOnly?: boolean;
  /** Model to use: '10', '50', or '250' frames */
  model?: '10' | '50' | '250';
  /** Custom class name for the container */
  className?: string;
}

export const WebcamCapture = ({ 
  onResult, 
  onError, 
  thumbnailOnly = false,
  model = '10',
  className = "",
}: WebcamCaptureProps) => {
  const cameraRef = useRef<LivenessCameraRef>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Use the Moveris V2 SDK liveness hook
  const {
    state,
    result,
    error,
    progress,
    start,
    stop,
    reset,
    captureFrame,
  } = useLiveness({
    model,
    onResult: (res) => {
      onResult?.(res);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  // Handle camera start
  const handleCameraStart = useCallback(() => {
    if (cameraRef.current) {
      videoRef.current = cameraRef.current.getVideoElement();
      setCameraActive(true);
    }
  }, []);

  // Handle camera error
  const handleCameraError = useCallback((err: Error) => {
    console.error("Camera error:", err);
    onError?.(err);
  }, [onError]);

  // Start verification
  const handleStartVerification = useCallback(() => {
    start();
  }, [start]);

  // Get state text for display
  const getStateText = (livenessState: LivenessState): string => {
    switch (livenessState) {
      case 'idle':
        return 'Ready';
      case 'capturing':
        return `Capturing ${progress.current}/${progress.total}`;
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'complete':
        return result?.verdict === 'live' ? 'Verified!' : 'Failed';
      case 'error':
        return 'Error occurred';
      default:
        return '';
    }
  };

  const isVerified = result?.verdict === 'live';
  const isVerifying = state === 'capturing' || state === 'uploading' || state === 'processing';

  // Thumbnail only view - small camera preview
  if (thumbnailOnly) {
    if (!cameraActive && isVerified) {
      return null;
    }

    return (
      <Card className={`p-2 w-48 transition-opacity duration-1000 ${isVerified && !cameraActive ? 'opacity-0' : 'opacity-100'} ${className}`}>
        <div className="relative">
          <LivenessCamera
            ref={cameraRef}
            autoStart
            mirrored
            onCameraStart={handleCameraStart}
            onCameraError={handleCameraError}
            className="w-full h-32 object-cover rounded-md"
          >
            {isVerified && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-md backdrop-blur-sm">
                <CheckCircle2 className="h-12 w-12 text-green-500 drop-shadow-lg" />
              </div>
            )}
          </LivenessCamera>
          
          {error && (
            <div className="text-xs text-destructive mt-1">{error.message}</div>
          )}
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          {isVerified ? "Verified ✓" : getStateText(state)}
        </p>
      </Card>
    );
  }

  // Full verification view
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative rounded-lg overflow-hidden border">
        <LivenessCamera
          ref={cameraRef}
          autoStart
          mirrored
          onCameraStart={handleCameraStart}
          onCameraError={handleCameraError}
          className="w-full h-64 object-cover"
        >
          {/* Overlay with face guide */}
          <LivenessOverlay
            state={state}
            progress={Math.round((progress.current / progress.total) * 100)}
            feedback={getStateText(state)}
            ovalState={cameraActive ? 'good' : 'no_face'}
          />
        </LivenessCamera>

        {/* Success overlay */}
        {isVerified && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 font-semibold">Verification Successful</p>
              {result && (
                <p className="text-green-600 text-sm">
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
            <p className="text-destructive text-center px-4">{error.message}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      {!isVerified && !error && (
        <Button
          onClick={handleStartVerification}
          disabled={isVerifying || !cameraActive}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {getStateText(state)}
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Start Verification
            </>
          )}
        </Button>
      )}

      {/* Progress info */}
      {isVerifying && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Please keep your face visible and hold still</p>
          <p className="font-medium mt-1">
            {progress.current} / {progress.total} frames captured
          </p>
        </div>
      )}

      {/* Result display */}
      {result && !isVerified && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-amber-800 text-sm">
            <strong>Verification failed.</strong> Please ensure good lighting 
            and try again.
          </p>
          <Button 
            variant="outline" 
            onClick={reset} 
            className="mt-2 w-full"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
