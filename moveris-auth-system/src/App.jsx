import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, Loader2, User, Shield } from 'lucide-react';

/**
 * Moveris Liveliness Authentication System
 * 
 * This component demonstrates a secure authentication flow:
 * 1. User logs in with Google OAuth
 * 2. System performs liveliness detection via webcam
 * 3. User gains access after successful verification
 * 
 * Configuration required:
 * - GOOGLE_CLIENT_ID: Your Google OAuth client ID
 * - MOVERIS_WS_URI: Moveris WebSocket endpoint
 * - MOVERIS_AUTH_TOKEN: Your Moveris API authentication token
 */

// ============================================================================
// CONFIGURATION - Update these with your actual credentials
// ============================================================================
const CONFIG = {
  GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com",
  MOVERIS_WS_URI: "wss://developers.moveris.com/ws/live/v1/",
  MOVERIS_AUTH_TOKEN: "Bearer YOUR_MOVERIS_TOKEN_HERE",
  FRAME_CAPTURE_INTERVAL: 500, // milliseconds between frame captures
  LIVELINESS_DURATION: 5000, // total duration for liveliness check
};

const MoverisAuthApp = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [authStage, setAuthStage] = useState('login'); // login, liveliness, success, error
  const [googleUser, setGoogleUser] = useState(null);
  const [livelinessStatus, setLivelinessStatus] = useState('');
  const [error, setError] = useState('');
  const [frameCount, setFrameCount] = useState(0);
  const [detectionResult, setDetectionResult] = useState(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  
  // ============================================================================
  // REFS
  // ============================================================================
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const googleButtonRef = useRef(null);

  // ============================================================================
  // GOOGLE OAUTH SETUP
  // ============================================================================
  
  /**
   * Loads Google Identity Services library
   * Initializes Google Sign-In button
   */
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  /**
   * Initializes Google Sign-In after library loads
   */
  const initializeGoogleSignIn = () => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: 'filled_blue',
          size: 'large',
          text: 'continue_with',
          width: 280,
        }
      );

      setGoogleLoaded(true);
    }
  };

  /**
   * Handles Google OAuth callback
   * Decodes JWT token and extracts user information
   */
  const handleGoogleCallback = (response) => {
    try {
      // Decode JWT token to get user info
      const token = response.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      setGoogleUser({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      });
      
      setAuthStage('liveliness');
      setLivelinessStatus('Initializing webcam...');
    } catch (err) {
      setError('Failed to process Google login');
      console.error('Google auth error:', err);
    }
  };

  // ============================================================================
  // WEBCAM MANAGEMENT
  // ============================================================================
  
  /**
   * Initializes webcam access
   * Requests video stream and attaches to video element
   */
  const initializeWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setLivelinessStatus('Connecting to liveliness detection...');
      initializeWebSocket();
    } catch (err) {
      setError('Failed to access webcam. Please grant camera permissions.');
      console.error('Webcam error:', err);
      setAuthStage('error');
    }
  };

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
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64 JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64Data = dataUrl.split(',')[1];
    
    return base64Data;
  };

  /**
   * Cleanup function for webcam resources
   */
  const cleanupWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // ============================================================================
  // MOVERIS WEBSOCKET INTEGRATION
  // ============================================================================
  
  /**
   * Initializes WebSocket connection to Moveris API
   * Handles authentication and frame streaming
   */
  const initializeWebSocket = () => {
    const ws = new WebSocket(CONFIG.MOVERIS_WS_URI);
    wsRef.current = ws;
    let authSuccess = false;
    let frameCounter = 0;

    ws.onopen = () => {
      console.log('Connected to Moveris WebSocket');
      setLivelinessStatus('Connected. Waiting for authentication...');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Moveris response:', message);

        // Handle initial connection message
        if (!authSuccess && message.type !== 'auth_success') {
          // Send authentication
          const authPayload = {
            type: 'auth',
            token: CONFIG.MOVERIS_AUTH_TOKEN,
          };
          ws.send(JSON.stringify(authPayload));
          console.log('Sent authentication payload');
          return;
        }

        // Handle authentication success
        if (message.type === 'auth_success' || message.status === 'ok') {
          authSuccess = true;
          setLivelinessStatus('Authenticated. Starting liveliness detection...');
          startFrameCapture(ws);
          return;
        }

        // Handle liveliness detection results
        if (message.type === 'detection_result' || message.live !== undefined) {
          setDetectionResult(message);
          
          if (message.live === true || message.status === 'live') {
            setLivelinessStatus('✓ Live person detected!');
            setTimeout(() => {
              setAuthStage('success');
              cleanupWebcam();
              ws.close();
            }, 1000);
          } else if (message.live === false) {
            setError('Liveliness check failed. Please try again.');
            setAuthStage('error');
            cleanupWebcam();
            ws.close();
          }
        }

        // Handle errors from server
        if (message.type === 'error' || message.error) {
          setError(message.message || 'Liveliness detection error');
          setAuthStage('error');
          cleanupWebcam();
          ws.close();
        }

      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('Connection error. Please check your network.');
      setAuthStage('error');
      cleanupWebcam();
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      if (authStage === 'liveliness' && authStage !== 'success') {
        setError('Connection closed unexpectedly.');
        setAuthStage('error');
      }
      cleanupWebcam();
    };
  };

  /**
   * Starts periodic frame capture and transmission
   * Sends frames to Moveris API for liveliness detection
   */
  const startFrameCapture = (ws) => {
    let frameNumber = 0;
    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      // Check if duration exceeded
      if (Date.now() - startTime > CONFIG.LIVELINESS_DURATION) {
        clearInterval(intervalRef.current);
        setLivelinessStatus('Processing results...');
        return;
      }

      // Capture and send frame
      const frameData = captureFrame();
      if (frameData && ws.readyState === WebSocket.OPEN) {
        frameNumber++;
        const framePayload = {
          type: 'frame',
          frame_data: frameData,
          frame_number: frameNumber,
        };
        
        ws.send(JSON.stringify(framePayload));
        setFrameCount(frameNumber);
        setLivelinessStatus(`Analyzing... (frame ${frameNumber})`);
      }
    }, CONFIG.FRAME_CAPTURE_INTERVAL);
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  /**
   * Initialize webcam when liveliness stage is reached
   */
  useEffect(() => {
    if (authStage === 'liveliness') {
      initializeWebcam();
    }
    
    return () => {
      cleanupWebcam();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [authStage]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const resetAuth = () => {
    setAuthStage('login');
    setGoogleUser(null);
    setError('');
    setFrameCount(0);
    setDetectionResult(null);
    setLivelinessStatus('');
    cleanupWebcam();
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Secure Login
          </h1>
          <p className="text-gray-600">
            Powered by Moveris Liveliness Detection
          </p>
        </div>

        {/* Login Stage */}
        {authStage === 'login' && (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-6">
                Sign in with your Google account to continue
              </p>
            </div>
            
            <div className="flex justify-center">
              {/* Google Sign-In Button Container */}
              <div ref={googleButtonRef} className="min-h-[44px]">
                {!googleLoaded && (
                  <div className="flex items-center justify-center space-x-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading Google Sign-In...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Two-Factor Authentication:</strong> After Google login, 
                you'll complete a quick liveliness check using your webcam.
              </p>
            </div>
          </div>
        )}

        {/* Liveliness Check Stage */}
        {authStage === 'liveliness' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Camera className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Liveliness Verification
                </h2>
              </div>
              
              {googleUser && (
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <img 
                    src={googleUser.picture} 
                    alt={googleUser.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{googleUser.name}</p>
                    <p className="text-sm text-gray-600">{googleUser.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Feed */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Overlay */}
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-lg pointer-events-none" />
              
              {/* Status Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{livelinessStatus}</span>
                  </div>
                  <span className="text-sm font-mono">
                    Frames: {frameCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Please look at the camera.</strong> Keep your face 
                visible and well-lit for accurate detection.
              </p>
            </div>
          </div>
        )}

        {/* Success Stage */}
        {authStage === 'success' && (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Successful!
              </h2>
              <p className="text-gray-600">
                You have been verified as a real person.
              </p>
            </div>

            {googleUser && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <img 
                    src={googleUser.picture} 
                    alt={googleUser.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{googleUser.name}</p>
                    <p className="text-sm text-gray-600">{googleUser.email}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={resetAuth}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Error Stage */}
        {authStage === 'error' && (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {error}
              </p>
            </div>

            <button
              onClick={resetAuth}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MoverisAuthApp;
