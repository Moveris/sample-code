// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════

const CONFIG = {
    WS_URL: 'wss://developers.moveris.com/ws/live/v1/',
    AUTH_TOKEN: 'Bearer <TOKEN>', // Replace with your actual token
    FRAME_RATE: 200, // Send a frame every 200ms (5 frames per second)
    MIN_FRAMES_FOR_PROCESSING: 500 // Minimum frames before expecting results
};

// ═══════════════════════════════════════════════════════════
// DOM ELEMENTS
// ═══════════════════════════════════════════════════════════

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');
const resultsContent = document.getElementById('resultsContent');

// ═══════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════

let websocket = null;
let stream = null;
let frameInterval = null;
let frameCounter = 0;
let isAuthenticated = false;

// ═══════════════════════════════════════════════════════════
// CAMERA FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Requests access to the user's camera and displays the video stream
 * Why: We need live video to capture frames for AI analysis
 */
async function startCamera() {
    try {
        updateStatus('Requesting camera access...', 'info');
        
        // Request camera with specific constraints for optimal quality
        // Why: Higher resolution provides better AI detection accuracy
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user' // Use front camera on mobile devices
            },
            audio: false // We only need video, not audio
        });
        
        // Attach the stream to the video element
        // Why: This displays the live camera feed to the user
        video.srcObject = stream;
        
        updateStatus('Camera started successfully!', 'success');
        
        // Wait for video metadata to load before connecting to WebSocket
        // Why: We need video dimensions to properly size the canvas
        video.onloadedmetadata = () => {
            // Set canvas dimensions to match video
            // Why: Canvas must match video size for accurate frame capture
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Now connect to the Moveris API
            connectWebSocket();
        };
        
        // Update button states
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
    } catch (error) {
        console.error('Camera error:', error);
        updateStatus(`Camera access denied: ${error.message}`, 'error');
    }
}

/**
 * Stops the camera stream and cleans up resources
 * Why: Proper cleanup prevents memory leaks and releases camera hardware
 */
function stopCamera() {
    // Stop frame capture
    if (frameInterval) {
        clearInterval(frameInterval);
        frameInterval = null;
    }
    
    // Close WebSocket connection
    if (websocket) {
        websocket.close();
        websocket = null;
    }
    
    // Stop all video tracks
    // Why: This releases the camera hardware back to the system
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    // Clear video display
    video.srcObject = null;
    
    // Reset state
    frameCounter = 0;
    isAuthenticated = false;
    
    updateStatus('Camera stopped', 'info');
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resultsContent.textContent = 'Waiting for results...';
}

// ═══════════════════════════════════════════════════════════
// WEBSOCKET CONNECTION
// ═══════════════════════════════════════════════════════════

/**
 * Establishes WebSocket connection to Moveris API
 * Why: WebSocket allows bidirectional real-time communication for streaming frames
 */
function connectWebSocket() {
    updateStatus('Connecting to Moveris API...', 'info');
    
    websocket = new WebSocket(CONFIG.WS_URL);
    
    // Connection opened
    websocket.onopen = () => {
        console.log('WebSocket connected');
        updateStatus('Connected to Moveris API', 'success');
    };
    
    // Handle incoming messages from server
    websocket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            handleServerMessage(message);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };
    
    // Handle connection errors
    websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateStatus('Connection error occurred', 'error');
    };
    
    // Handle connection close
    websocket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        
        if (event.code === 4001) {
            updateStatus('Authentication failed - please check your token', 'error');
        } else {
            updateStatus('Connection closed', 'info');
        }
        
        // Stop frame capture when connection closes
        if (frameInterval) {
            clearInterval(frameInterval);
            frameInterval = null;
        }
        
        isAuthenticated = false;
    };
}

/**
 * Handles different message types from the Moveris server
 * Why: The API uses typed messages for different stages of the processing workflow
 */
function handleServerMessage(message) {
    console.log('Received:', message.type, message);
    
    switch (message.type) {
        case 'auth_required':
            // Server is requesting authentication
            // Why: Security - the API needs to verify your identity before processing
            updateStatus('Authenticating...', 'info');
            authenticate();
            break;
            
        case 'auth_success':
            // Authentication successful - we can now send frames
            // Why: Only after auth can we start streaming video data
            isAuthenticated = true;
            updateStatus('Authenticated! Starting frame capture...', 'success');
            startFrameCapture();
            break;
            
        case 'frame_received':
            // Server acknowledged receiving a frame
            // Why: Confirms our data is being received and queued for processing
            console.log(`Frame ${message.frame_number} acknowledged (Total: ${message.total_frames})`);
            break;
            
        case 'processing_started':
            // AI processing has begun
            // Why: Server has collected enough frames (minimum 500ms of video)
            updateStatus(message.message, 'info');
            resultsContent.textContent = 'Processing frames with AI...';
            break;
            
        case 'processing_complete':
            // AI analysis complete - display results
            // Why: This contains the human detection analysis we requested
            displayResults(message.result);
            break;
            
        case 'error':
            // Something went wrong
            // Why: Helps debug authentication, data format, or server issues
            updateStatus(`Error: ${message.message}`, 'error');
            break;
            
        default:
            console.log('Unknown message type:', message.type);
    }
}

/**
 * Sends authentication token to the server
 * Why: The API requires a Bearer token to verify you have permission to use the service
 */
function authenticate() {
    const authPayload = {
        type: 'auth',
        token: CONFIG.AUTH_TOKEN
    };
    
    websocket.send(JSON.stringify(authPayload));
    console.log('Sent authentication');
}

// ═══════════════════════════════════════════════════════════
// FRAME CAPTURE & SENDING
// ═══════════════════════════════════════════════════════════

/**
 * Starts periodic frame capture and sending to API
 * Why: AI needs multiple frames over time to accurately detect humans vs. AI-generated content
 */
function startFrameCapture() {
    // Clear any existing interval
    if (frameInterval) {
        clearInterval(frameInterval);
    }
    
    // Capture and send frames at configured rate
    // Why: Regular intervals ensure smooth analysis; too fast wastes bandwidth, too slow delays results
    frameInterval = setInterval(() => {
        if (isAuthenticated && websocket && websocket.readyState === WebSocket.OPEN) {
            captureAndSendFrame();
        }
    }, CONFIG.FRAME_RATE);
}

/**
 * Captures current video frame and sends it to the API
 * Why: Each frame is analyzed by AI to build confidence in human detection
 */
function captureAndSendFrame() {
    // Draw current video frame to canvas
    // Why: Canvas allows us to extract image data from the video stream
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64-encoded JPEG
    // Why: The API expects base64-encoded image data for transmission over WebSocket
    // JPEG is used for smaller file size while maintaining sufficient quality
    canvas.toBlob((blob) => {
        const reader = new FileReader();
        
        reader.onloadend = () => {
            // Extract base64 data (remove the "data:image/jpeg;base64," prefix)
            // Why: API expects raw base64 string, not the data URL format
            const base64data = reader.result.split(',')[1];
            
            frameCounter++;
            
            // Create frame payload according to API specification
            const framePayload = {
                type: 'frame',
                frame_data: base64data,
                frame_number: frameCounter,
                timestamp: Date.now() / 1000 // Unix timestamp in seconds
            };
            
            // Send to server
            websocket.send(JSON.stringify(framePayload));
            
            // Update status to show progress
            if (frameCounter < CONFIG.MIN_FRAMES_FOR_PROCESSING) {
                updateStatus(
                    `Capturing frames: ${frameCounter}/${CONFIG.MIN_FRAMES_FOR_PROCESSING}`,
                    'info'
                );
            }
        };
        
        // Read the blob as a data URL (base64)
        reader.readAsDataURL(blob);
        
    }, 'image/jpeg', 0.8); // JPEG format with 80% quality
}

// ═══════════════════════════════════════════════════════════
// RESULTS DISPLAY
// ═══════════════════════════════════════════════════════════

/**
 * Displays AI analysis results in a user-friendly format
 * Why: Presents the human detection confidence and other metrics clearly
 */
function displayResults(result) {
    const html = `
        <h4>${result.result}</h4>
        <p><strong>Prediction:</strong> ${result.prediction}</p>
        <p><strong>Human Likelihood:</strong> ${result.human_likelihood_level}%</p>
        <p><strong>AI Detection Level:</strong> ${result.ai_detection_level}%</p>
        <p><strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%</p>
        <p><strong>Processing Time:</strong> ${result.processing_time_seconds}s</p>
        <p><strong>Frames Analyzed:</strong> ${result.frames_processed || frameCounter}</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
            AI Attention Level: ${result.ai_attention_level} | 
            Emotion Level: ${result.ai_emotion_level}
        </p>
    `;
    
    resultsContent.innerHTML = html;
    updateStatus('Analysis complete!', 'success');
}

// ═══════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Updates the status display with appropriate styling
 * Why: Provides clear visual feedback about what's happening
 */
function updateStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
}

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════

startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);

// Cleanup on page unload
// Why: Ensures camera and WebSocket are properly released when user leaves
window.addEventListener('beforeunload', () => {
    stopCamera();
});
