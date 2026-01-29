import React, { useState, useCallback } from 'react';
import { CheckCircle, XCircle, User, Shield, Eye, EyeOff } from 'lucide-react';

/**
 * Moveris Liveliness Authentication System - V2 SDK
 *
 * This component demonstrates a secure authentication flow using the Moveris V2 SDK:
 * 1. User logs in with email and password
 * 2. System performs liveness detection via webcam using @moveris/react SDK
 * 3. User gains access after successful verification
 *
 * V2 SDK Benefits:
 * - Built-in face detection with oval guide
 * - Smart frame capture with quality checks
 * - Simplified API with built-in components
 * - Real-time feedback to users
 *
 * Configuration:
 * All settings are loaded from environment variables (.env file)
 * See .env.example for all available options
 *
 * Quick Setup:
 * 1. Copy .env.example to .env
 * 2. Update VITE_MOVERIS_API_KEY with your actual API key
 * 3. Run: npm run dev
 */

// ============================================================================
// MOVERIS V2 SDK IMPORTS
// ============================================================================
import {
  MoverisProvider,
  LivenessView,
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
  const [error, setError] = useState('');
  const [detectionResult, setDetectionResult] = useState(null);

  // ============================================================================
  // EMAIL/PASSWORD LOGIN HANDLER
  // ============================================================================
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
      setError('');
    } else {
      setError('Invalid email or password');
    }
  };

  // ============================================================================
  // MOVERIS V2 SDK CALLBACKS
  // ============================================================================

  /**
   * Handle successful liveness verification result
   */
  const handleLivenessResult = useCallback((result) => {
    console.log('Liveness result:', result);
    setDetectionResult(result);

    if (result.verdict === 'live') {
      console.log('Liveness check passed');
      setAuthStage('success');
    } else {
      console.log('Liveness check failed');
      setError('Liveness check failed. No live person detected.');
      setAuthStage('error');
    }
  }, []);

  /**
   * Handle liveness verification errors
   */
  const handleLivenessError = useCallback((err) => {
    console.error('Liveness error:', err);
    setError(err.message || 'Liveness detection error');
    setAuthStage('error');
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

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
                you'll complete a liveness check using your webcam with our V2 SDK.
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
            model={CONFIG.MOVERIS_MODEL}
            baseUrl={CONFIG.MOVERIS_BASE_URL}
            debug={CONFIG.MOVERIS_DEBUG}
          >
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Liveness Verification
                </h2>

                {user && (
                  <div className="mb-4">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                )}
              </div>

              {/* LivenessView from V2 SDK - handles everything automatically */}
              <LivenessView
                model={CONFIG.MOVERIS_MODEL}
                onResult={handleLivenessResult}
                onError={handleLivenessError}
                showOverlay={true}
                showControls={true}
                showResult={false}
                autoStartCamera={true}
                className="rounded-lg overflow-hidden border-4 border-indigo-500"
                statusMessages={{
                  idle: "Position your face in the oval",
                  capturing: "Hold still, capturing frames...",
                  uploading: "Uploading for analysis...",
                  processing: "Analyzing liveness...",
                  complete: "Analysis complete!",
                  error: "An error occurred",
                }}
              />

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Please look at the camera.</strong> Keep your face
                  visible and well-lit. The verification uses {CONFIG.MOVERIS_MODEL} frames.
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

export default MoverisAuthApp;
