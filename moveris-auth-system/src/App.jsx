import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, Loader2, User, Shield, Eye, EyeOff } from 'lucide-react';

/**
 * Moveris Liveliness Authentication System
 * 
 * This component demonstrates a secure authentication flow:
 * 1. User logs in with email and password
 * 2. System performs liveliness detection via webcam using Moveris Live API
 * 3. User gains access after successful verification (500 frames processed)
 * 
 * Configuration:
 * All settings are loaded from environment variables (.env file)
 * See .env.example for all available options
 * 
 * Quick Setup:
 * 1. Copy .env.example to .env
 * 2. Update VITE_MOVERIS_SECRET_KEY with your actual key
 * 3. Optionally adjust VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD
 * 4. Run: npm run dev
 * 
 * See ENVIRONMENT_SETUP.md for detailed configuration guide
 */

// ============================================================================
// CONFIGURATION - Loaded from environment variables
// ============================================================================
const CONFIG = {
  // Moveris API Configuration
  MOVERIS_WS_URI: import.meta.env.VITE_MOVERIS_WS_URI || "wss://dev.api.moveris.com/ws/live/v1/",
  MOVERIS_SECRET_KEY: import.meta.env.VITE_MOVERIS_SECRET_KEY || "",
  
  // Frame Capture Settings
  FRAME_RATE: parseInt(import.meta.env.VITE_FRAME_RATE) || 10,
  IMAGE_QUALITY: parseFloat(import.meta.env.VITE_IMAGE_QUALITY) || 0.7,
  REQUIRED_FRAMES: parseInt(import.meta.env.VITE_REQUIRED_FRAMES) || 500,
  
  // Authentication Credentials (for demo only - use backend auth in production)
  ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL || "admin@example.com",
  ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD || "Admin@123",
};

const MoverisAuthApp = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [authStage, setAuthStage] = useState('login'); // login, liveliness, success, error
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [livelinessStatus, setLivelinessStatus] = useState('');
  const [error, setError] = useState('');
  const [frameCount, setFrameCount] = useState(0);
  const [framesAcked, setFramesAcked] = useState(0);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Idle');
  const [connectionTime, setConnectionTime] = useState('00:00');
  const [livelinessResults, setLivelinessResults] = useState(null);
  
  // ============================================================================
  // REFS
  // ============================================================================
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const connectionStartTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const frameCountRef = useRef(0);
  const frameCountAckRef = useRef(0);

  const authStageRef = useRef(authStage);

  // ============================================================================
  // EMAIL/PASSWORD LOGIN HANDLERS
  // ============================================================================
  
  /**
   * Handles email/password login
   * Validates credentials against hardcoded values
   */

  useEffect(() => {
    authStageRef.current = authStage;
  }, [authStage]);


  const handleLogin = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    // Simple validation (replace with backend authentication in production)
    if (email === CONFIG.ADMIN_EMAIL && password === CONFIG.ADMIN_PASSWORD) {
      setUser({
        email: email,
        name: email.split('@')[0],
      });
      
      setAuthStage('liveliness');
      setLivelinessStatus('Initializing webcam...');
      setError('');
    } else {
      setError('Invalid email or password');
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
          frameRate: { ideal: CONFIG.FRAME_RATE }
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
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64 JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', CONFIG.IMAGE_QUALITY);
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
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // ============================================================================
  // MOVERIS WEBSOCKET INTEGRATION (Based on provided HTML logic)
  // ============================================================================
  
  /**
   * Initializes WebSocket connection to Moveris API
   * Handles authentication and frame streaming
   */
  const initializeWebSocket = () => {
    const ws = new WebSocket(CONFIG.MOVERIS_WS_URI);
    wsRef.current = ws;
    connectionStartTimeRef.current = Date.now();

    ws.onopen = () => {
      console.log('WebSocket connected');
      setLivelinessStatus('Connected, authenticating...');
      
      // Start connection timer
      timerIntervalRef.current = setInterval(updateConnectionTimer, 1000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
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
      console.log('WebSocket closed:', event.code, event.reason, authStage);
      if (authStageRef.current === 'liveliness') {
        setError('Connection closed unexpectedly.');
        setAuthStage('error');
      }
      cleanupWebcam();
    };
  };

  /**
   * Handles WebSocket messages from Moveris API
   * Implements the message protocol from the provided HTML
   */
  const handleWebSocketMessage = (data) => {
    switch(data.type) {
      case 'auth_required':
        console.log('Authentication required');
        authenticateWithMoveris();
        break;
      
      case 'auth_success':
        console.log('Authenticated successfully');
        setIsAuthenticated(true);
        setLivelinessStatus('Authenticated - Starting camera stream...');
        // Start frame capture after authentication
        setTimeout(() => startFrameCapture(), 500);
        break;
      
      case 'frame_received':
        setFramesAcked(prev => prev + 1);
        frameCountAckRef.current += 1;
        // console.log(`Frame ${data.frame_number} received. Total: ${data.total_frames}`);
        break;
      
      case 'processing_started':
        console.log('Processing started');
        setProcessingStatus('Processing');
        setLivelinessStatus('Processing frames...');
        break;
      
      case 'processing_complete':
        console.log('Processing complete:', data.result, data.result.prediction);
        setDetectionResult(data.result);
        setProcessingStatus('Complete');
        frameCountAckRef.current = 0;
        // frameCountRef.current = 0; // Reset frame count ref
        // Check if live person detected
        if (data.result && data.result.prediction === 'Real') {
          console.log('Liveliness check passed');
          setLivelinessResults(data.result);
          setAuthStage('success');
          setTimeout(() => {
            cleanupWebcam();
            if (wsRef.current) {
              wsRef.current.close();
            }
          }, 1500);
        } else {
          console.log('Liveliness check failed');
          setError('Liveliness check failed. No live person detected.');
          setAuthStage('error');
          cleanupWebcam();
          if (wsRef.current) {
            wsRef.current.close();
          }
        }
        break;
      
      case 'error':
        console.error('Server error:', data.message);
        setError(data.message || 'Liveliness detection error');
        setAuthStage('error');
        cleanupWebcam();
        if (wsRef.current) {
          wsRef.current.close();
        }
        break;

      default:
        console.log('Unknown message type:', data);
        break;
    }
  };

  /**
   * Sends authentication to Moveris API
   */
  const authenticateWithMoveris = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'auth',
        token: CONFIG.MOVERIS_SECRET_KEY
      }));
      setLivelinessStatus('Authenticating with Moveris...');
    }
  };

  /**
   * Starts periodic frame capture and transmission
   * Sends frames to Moveris API at configured frame rate
   */
  const startFrameCapture = () => {
    // console.log("=========== start capture");
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const frameRate = CONFIG.FRAME_RATE;
    intervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, 1000 / frameRate);

    setLivelinessStatus(`Streaming at ${frameRate} FPS - ${CONFIG.REQUIRED_FRAMES} frames needed`);
  };

  /**
   * Captures and sends a single frame to Moveris
   */
  const captureAndSendFrame = () => {

    try {
      const frameData = captureFrame();
      // console.log("====== Capturing frames");
      if (frameData && wsRef.current.readyState === WebSocket.OPEN) {
        // console.log("====== Capturing frames started");
        // const currentFrame = frameCount + 1;
        frameCountRef.current += 1;
        const currentFrame = frameCountRef.current;
        
        wsRef.current.send(JSON.stringify({
          type: 'frame',
          frame_number: currentFrame,
          frame_data: frameData,
          timestamp: Date.now() / 1000
        }));
        
        setFrameCount( prev => prev + 1);
        
        // Update status based on progress
        const progress = Math.round((frameCountAckRef.current / CONFIG.REQUIRED_FRAMES) * 100);
        setLivelinessStatus(
          `Analyzing... Frame ${frameCountAckRef.current}/${CONFIG.REQUIRED_FRAMES} (${progress}%)`
        );
      }
    } catch (error) {
      console.error('Error capturing frame:', error);
    }
  };

  /**
   * Updates connection timer display
   */
  const updateConnectionTimer = () => {
    if (connectionStartTimeRef.current) {
      const elapsed = Math.floor((Date.now() - connectionStartTimeRef.current) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setConnectionTime(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }
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
    setUser(null);
    setEmail('');
    setPassword('');
    setError('');
    setFrameCount(0);
    setFramesAcked(0);
    setDetectionResult(null);
    setLivelinessStatus('');
    setIsAuthenticated(false);
    setProcessingStatus('Idle');
    setConnectionTime('00:00');
    cleanupWebcam();
    setLivelinessResults(null);
    frameCountRef.current = 0;
    frameCountAckRef.current = 0;
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
          <p className="text-gray-600" align="center">
            Powered by<img width="150px"  src="https://developers.moveris.com/uploads/MoverisLiveLogo.png" alt="Moveris Liveliness Detection"/>
          </p>
        </div>

        {/* Login Stage */}
        {authStage === 'login' && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-700">
                Sign in to continue
              </p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Two-Factor Authentication:</strong> After login, 
                you'll complete a liveliness check using your webcam.
              </p>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Demo Credentials: admin@example.com / Admin@123
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
              
              {user && (
                <div className="mb-4">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
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
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{livelinessStatus}</span>
                  </div>
                </div>
              </div>
            </div>

            {livelinessResults && (
              <div className="mt-2 p-2 bg-gray-50 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Liveliness Analysis</h3>
                <p className="text-gray-700">
                  <span className="font-medium text-gray-900">Result:</span>{livelinessResults.result} {' - '}
                  {livelinessResults.prediction === 'Real'
                    ? <span className="text-green-600 font-semibold">Real</span>
                    : <span className="text-red-600 font-semibold">Not Real</span>}
                </p>
                <p className="text-gray-700 mt-1">
                  <span className="font-medium text-gray-900">AI Confidence:</span>{livelinessResults.result} {' - '}
                  <span className="text-blue-600 font-semibold">
                    {(livelinessResults.ai_probability * 100).toFixed(2)}%
                  </span>
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Frames Sent</p>
                <p className="text-lg font-bold text-indigo-600">{frameCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Frames Ack'd</p>
                <p className="text-lg font-bold text-indigo-600">{framesAcked}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Time</p>
                <p className="text-lg font-bold text-indigo-600">{connectionTime}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-600 mb-1">Status</p>
                <p className="text-lg font-bold text-indigo-600">{processingStatus}</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Please look at the camera.</strong> Keep your face 
                visible and well-lit. Processing requires {CONFIG.REQUIRED_FRAMES} frames.
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

            {user && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            )}

            {detectionResult && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-left">
                <h3 className="font-semibold text-green-900 mb-2">Detection Results:</h3>
                <div className="space-y-1 text-sm text-green-800">
                  <p><strong>Prediction:</strong> {detectionResult.prediction}</p>
                  <p><strong>Confidence:</strong> {(detectionResult.confidence * 100).toFixed(2)}%</p>
                  {detectionResult.ai_probability && (
                    <p><strong>AI Probability:</strong> {(detectionResult.ai_probability * 100).toFixed(2)}%</p>
                  )}
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
                Liveliness Check Failed
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