import React, { useState, useCallback } from 'react';
import { Camera, CheckCircle, XCircle, Loader2, User, Shield, Eye, EyeOff, Video, Maximize2, Minimize2 } from 'lucide-react';

/**
 * Moveris Live Analysis Demo - V2 SDK
 *
 * This component demonstrates video analysis capabilities using the Moveris V2 SDK:
 * 1. User logs in with email and password
 * 2. System performs liveness detection via webcam using @moveris/react SDK
 * 3. Includes video playback demo for testing
 *
 * V2 SDK Features Demonstrated:
 * - Built-in face detection with oval guide
 * - Smart frame capture with quality checks
 * - Multiple model options (10, 50, 250 frames)
 * - Real-time feedback to users
 *
 * Configuration:
 * All settings are loaded from environment variables (.env file)
 */

// ============================================================================
// MOVERIS V2 SDK IMPORTS
// ============================================================================
import {
  MoverisProvider,
  LivenessView,
  LivenessModal,
} from '@moveris/react';

// ============================================================================
// CONFIGURATION - Loaded from environment variables
// ============================================================================
const CONFIG = {
  // Moveris API Configuration (V2 SDK)
  MOVERIS_API_KEY: import.meta.env.VITE_MOVERIS_API_KEY || "",
  MOVERIS_BASE_URL: import.meta.env.VITE_MOVERIS_BASE_URL || undefined,

  // Model configuration: '10', '50', or '250' frames
  MOVERIS_MODEL: import.meta.env.VITE_MOVERIS_MODEL || '10',

  // Enable debug mode for development
  MOVERIS_DEBUG: import.meta.env.VITE_MOVERIS_DEBUG === 'true',

  // Authentication Credentials (for demo only)
  ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL || "admin@example.com",
  ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD || "Admin@123",
};

const MoverisAnalysisApp = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [authStage, setAuthStage] = useState('login'); // login, liveliness, success, error
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [detectionResult, setDetectionResult] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState(CONFIG.MOVERIS_MODEL);

  // ============================================================================
  // EMAIL/PASSWORD LOGIN HANDLER
  // ============================================================================
  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (email === CONFIG.ADMIN_EMAIL && password === CONFIG.ADMIN_PASSWORD) {
      setUser({
        email: email,
        name: email.split('@')[0],
      });

      setAuthStage('liveliness');
      setError('');
    } else {
      setError('Invalid email or password');
    }
  };

  // ============================================================================
  // MOVERIS V2 SDK CALLBACKS
  // ============================================================================

  const handleLivenessResult = useCallback((result) => {
    console.log('Liveness result:', result);
    setDetectionResult(result);

    if (result.verdict === 'live') {
      setAuthStage('success');
    } else {
      setError('Liveness check failed. No live person detected.');
      setAuthStage('error');
    }
  }, []);

  const handleLivenessError = useCallback((err) => {
    console.error('Liveness error:', err);
    setError(err.message || 'Liveness detection error');
    setAuthStage('error');
  }, []);

  const resetAuth = () => {
    setAuthStage('login');
    setUser(null);
    setEmail('');
    setPassword('');
    setError('');
    setDetectionResult(null);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Live Analysis Demo
          </h1>
          <p className="text-gray-600" align="center">
            Powered by <img width="150px" src="https://developers.moveris.com/uploads/MoverisLiveLogo.png" alt="Moveris Live"/>
          </p>
          <p className="text-xs text-indigo-600 mt-2">V2 SDK Integration</p>
        </div>

        {/* Login Stage */}
        {authStage === 'login' && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-700">Sign in to continue</p>
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
                you'll complete a liveness check using our V2 SDK.
              </p>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Demo Credentials: admin@example.com / Admin@123
              </p>
            </div>
          </div>
        )}

        {/* Liveliness Check Stage - Using V2 SDK */}
        {authStage === 'liveliness' && (
          <MoverisProvider
            apiKey={CONFIG.MOVERIS_API_KEY}
            model={selectedModel}
            baseUrl={CONFIG.MOVERIS_BASE_URL}
            debug={CONFIG.MOVERIS_DEBUG}
          >
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Camera className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Liveness Verification
                  </h2>
                </div>

                {user && (
                  <div className="mb-4">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                )}
              </div>

              {/* Demo Video Playback */}
              <div className="relative w-full max-w-3xl mx-auto pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-lg">
                <video
                  className="absolute top-0 left-0 w-full h-full"
                  src="BigBuckBunny.mp4"
                  loop
                  autoPlay
                  muted
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  <Video className="w-3 h-3 inline mr-1" />
                  Demo Video
                </div>
              </div>

              {/* Model Selection */}
              <div className="flex justify-center space-x-2">
                <span className="text-sm text-gray-600 self-center">Model:</span>
                {['10', '50', '250'].map((model) => (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(model)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedModel === model
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {model} frames
                  </button>
                ))}
              </div>

              {/* Webcam Feed with V2 SDK - Expandable */}
              <div
                onClick={() => setExpanded((prev) => !prev)}
                className={`relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-all duration-500 ease-in-out mx-auto ${
                  expanded ? "w-full" : "w-48 h-32"
                }`}
              >
                <LivenessView
                  model={selectedModel}
                  onResult={handleLivenessResult}
                  onError={handleLivenessError}
                  showOverlay={true}
                  showControls={expanded}
                  showResult={false}
                  autoStartCamera={true}
                  className="w-full h-full"
                  statusMessages={{
                    idle: "Click to expand",
                    capturing: "Capturing...",
                    uploading: "Uploading...",
                    processing: "Analyzing...",
                    complete: "Done!",
                    error: "Error",
                  }}
                />

                {/* Expand/Collapse indicator */}
                <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded">
                  {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Click the webcam to expand.</strong> Keep your face
                  visible and well-lit. Using {selectedModel}-frame model.
                </p>
              </div>

              <button
                onClick={resetAuth}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Cancel and go back
              </button>
            </div>
          </MoverisProvider>
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
                <h3 className="font-semibold text-green-900 mb-2">Detection Results (V2 SDK):</h3>
                <div className="space-y-1 text-sm text-green-800">
                  <p><strong>Verdict:</strong> {detectionResult.verdict}</p>
                  <p><strong>Confidence:</strong> {(detectionResult.confidence * 100).toFixed(2)}%</p>
                  <p><strong>Score:</strong> {detectionResult.score?.toFixed(2) || 'N/A'}</p>
                  <p><strong>Model Used:</strong> {selectedModel} frames</p>
                  {detectionResult.sessionId && (
                    <p><strong>Session:</strong> {detectionResult.sessionId.slice(0, 8)}...</p>
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
                Liveness Check Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {error || 'Verification could not be completed.'}
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

export default MoverisAnalysisApp;
