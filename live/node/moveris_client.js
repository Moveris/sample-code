#!/usr/bin/env node
/**
 * Moveris Live - Node.js WebSocket Client
 * Streams video frames from webcam to Moveris AI detection API
 */

const WebSocket = require('ws');
const readline = require('readline');
const { spawn } = require('child_process');

// ANSI color codes for pretty logging
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

class MoverisClient {
    constructor(wsUrl, secretKey, options = {}) {
        this.wsUrl = wsUrl;
        this.secretKey = secretKey;
        this.frameRate = options.frameRate || 10;
        this.quality = options.quality || 70;
        this.width = options.width || 640;
        this.height = options.height || 480;
        
        // State
        this.ws = null;
        this.isAuthenticated = false;
        this.isStreaming = false;
        
        // Stats
        this.frameCount = 0;
        this.serverBuffer = 0;
        this.connectionStart = null;
        
        // Performance tracking
        this.sendTimes = new Map();
        this.ackTimes = [];
        this.frameTimes = [];
        
        // Camera process
        this.cameraProcess = null;
        this.frameBuffer = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const typeColors = {
            info: colors.cyan,
            success: colors.green,
            error: colors.red,
            warning: colors.yellow,
            data: colors.blue
        };
        const color = typeColors[type] || colors.reset;
        console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.log(`Connecting to ${this.wsUrl}...`);
            
            this.ws = new WebSocket(this.wsUrl, {
                handshakeTimeout: 10000
            });

            this.ws.on('open', () => {
                this.connectionStart = Date.now();
                this.log('✅ Connected successfully', 'success');
                resolve();
            });

            this.ws.on('message', (data) => {
                this.handleMessage(data);
            });

            this.ws.on('close', (code, reason) => {
                this.log(`🔌 Connection closed: ${code} - ${reason || 'No reason'}`, 'warning');
                this.cleanup();
            });

            this.ws.on('error', (error) => {
                this.log(`❌ WebSocket error: ${error.message}`, 'error');
                reject(error);
            });
        });
    }

    authenticate() {
        return new Promise((resolve, reject) => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                reject(new Error('WebSocket not connected'));
                return;
            }

            this.log('🔑 Authenticating...', 'info');

            const authTimeout = setTimeout(() => {
                reject(new Error('Authentication timeout'));
            }, 10000);

            const authHandler = (data) => {
                try {
                    const message = JSON.parse(data);
                    
                    if (message.type === 'auth_success') {
                        clearTimeout(authTimeout);
                        this.isAuthenticated = true;
                        this.log('✅ Authentication successful', 'success');
                        this.ws.removeListener('message', authHandler);
                        resolve();
                    } else if (message.type === 'error') {
                        clearTimeout(authTimeout);
                        this.ws.removeListener('message', authHandler);
                        reject(new Error(message.message));
                    }
                } catch (error) {
                    // Ignore parsing errors during auth
                }
            };

            this.ws.on('message', authHandler);

            this.ws.send(JSON.stringify({
                type: 'auth',
                token: this.secretKey
            }));
        });
    }

    startCamera() {
        return new Promise((resolve, reject) => {
            this.log('📷 Starting camera...', 'info');

            // Use ffmpeg to capture frames from webcam
            // Adjust input device based on OS:
            // - Linux: /dev/video0
            // - macOS: 0:0 (avfoundation)
            // - Windows: video="Device Name" (dshow)
            
            const platform = process.platform;
            let ffmpegArgs;

            if (platform === 'darwin') {
                // macOS
                ffmpegArgs = [
                    '-f', 'avfoundation',
                    '-framerate', this.frameRate.toString(),
                    '-video_size', `${this.width}x${this.height}`,
                    '-i', '0:0',
                    '-f', 'image2pipe',
                    '-vcodec', 'mjpeg',
                    '-q:v', this.quality.toString(),
                    'pipe:1'
                ];
            } else if (platform === 'linux') {
                // Linux
                ffmpegArgs = [
                    '-f', 'v4l2',
                    '-framerate', this.frameRate.toString(),
                    '-video_size', `${this.width}x${this.height}`,
                    '-i', '/dev/video0',
                    '-f', 'image2pipe',
                    '-vcodec', 'mjpeg',
                    '-q:v', this.quality.toString(),
                    'pipe:1'
                ];
            } else if (platform === 'win32') {
                // Windows (requires DirectShow device name)
                ffmpegArgs = [
                    '-f', 'dshow',
                    '-framerate', this.frameRate.toString(),
                    '-video_size', `${this.width}x${this.height}`,
                    '-i', 'video=Integrated Camera',
                    '-f', 'image2pipe',
                    '-vcodec', 'mjpeg',
                    '-q:v', this.quality.toString(),
                    'pipe:1'
                ];
            } else {
                reject(new Error('Unsupported platform'));
                return;
            }

            this.cameraProcess = spawn('ffmpeg', ffmpegArgs);

            let frameData = Buffer.alloc(0);
            const jpegStartMarker = Buffer.from([0xFF, 0xD8]);
            const jpegEndMarker = Buffer.from([0xFF, 0xD9]);

            this.cameraProcess.stdout.on('data', (chunk) => {
                frameData = Buffer.concat([frameData, chunk]);

                // Look for complete JPEG frames
                let startIdx = frameData.indexOf(jpegStartMarker);
                let endIdx = frameData.indexOf(jpegEndMarker, startIdx + 2);

                while (startIdx !== -1 && endIdx !== -1) {
                    const frame = frameData.slice(startIdx, endIdx + 2);
                    this.frameBuffer.push(frame);
                    
                    // Remove processed frame from buffer
                    frameData = frameData.slice(endIdx + 2);
                    
                    // Look for next frame
                    startIdx = frameData.indexOf(jpegStartMarker);
                    endIdx = frameData.indexOf(jpegEndMarker, startIdx + 2);
                }

                // Keep frameData for next chunk if incomplete frame
            });

            this.cameraProcess.stderr.on('data', (data) => {
                const message = data.toString();
                // Only log non-routine ffmpeg messages
                if (message.includes('error') || message.includes('Error')) {
                    this.log(`FFmpeg: ${message}`, 'error');
                }
            });

            this.cameraProcess.on('error', (error) => {
                this.log(`❌ Camera error: ${error.message}`, 'error');
                reject(error);
            });

            // Wait a bit for camera to start
            setTimeout(() => {
                if (this.frameBuffer.length > 0) {
                    this.log('✅ Camera started', 'success');
                    resolve();
                } else {
                    this.log('⚠️ Camera started but no frames yet', 'warning');
                    resolve(); // Still resolve, frames might come later
                }
            }, 2000);
        });
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            const receiveTime = Date.now();

            switch (message.type) {
                case 'frame_received':
                    this.handleFrameAck(message, receiveTime);
                    break;

                case 'processing_started':
                    this.log(`🔄 ${message.message || 'Processing started'}`, 'info');
                    break;

                case 'processing_complete':
                    this.handleProcessingComplete(message);
                    break;

                case 'error':
                    this.log(`❌ Server error: ${message.message}`, 'error');
                    break;

                case 'disconnect':
                    this.log(`⚠️ Server disconnect: ${message.reason}`, 'warning');
                    this.stop();
                    break;
            }
        } catch (error) {
            // Ignore JSON parse errors
        }
    }

    handleFrameAck(message, receiveTime) {
        const frameNum = message.frame_number;

        // Calculate ACK latency
        if (this.sendTimes.has(frameNum)) {
            const sendTime = this.sendTimes.get(frameNum);
            const ackLatency = receiveTime - sendTime;
            this.ackTimes.push(ackLatency);

            // Keep only last 50
            if (this.ackTimes.length > 50) {
                this.ackTimes.shift();
            }

            this.sendTimes.delete(frameNum);
        }

        this.serverBuffer = message.total_frames || 0;

        // Log every 50 frames
        if (frameNum % 50 === 0) {
            const avgAck = this.ackTimes.length > 0
                ? this.ackTimes.reduce((a, b) => a + b, 0) / this.ackTimes.length
                : 0;
            
            this.log(
                `📊 Frame ${frameNum} ACK | Buffer: ${this.serverBuffer} | Avg ACK: ${avgAck.toFixed(0)}ms`,
                'data'
            );
        }
    }

    handleProcessingComplete(message) {
        const result = message.result || {};
        const framesProcessed = message.frames_processed || 0;

        this.log(
            `✅ Processing complete: ${framesProcessed} frames\n` +
            `   Prediction: ${result.prediction || 'N/A'}\n` +
            `   AI Probability: ${((result.ai_probability || 0) * 100).toFixed(2)}%\n` +
            `   Confidence: ${(result.confidence || 0).toFixed(4)}\n` +
            `   Processing Time: ${(result.processing_time_seconds || 0).toFixed(2)}s`,
            'success'
        );
    }

    sendFrame(frameData) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isAuthenticated) {
            return false;
        }

        this.frameCount++;
        const sendTime = Date.now();

        // Track send time
        this.sendTimes.set(this.frameCount, sendTime);

        // Clean up old send times (keep last 1000)
        if (this.sendTimes.size > 1000) {
            const keysToDelete = Array.from(this.sendTimes.keys()).slice(0, -1000);
            keysToDelete.forEach(key => this.sendTimes.delete(key));
        }

        // Convert buffer to base64
        const base64Frame = frameData.toString('base64');

        this.ws.send(JSON.stringify({
            type: 'frame',
            frame_number: this.frameCount,
            frame_data: base64Frame,
            timestamp: sendTime / 1000
        }));

        return true;
    }

    async startStreaming() {
        try {
            // Connect
            await this.connect();

            // Authenticate
            await this.authenticate();

            // Start camera
            await this.startCamera();

            // Start streaming loop
            this.isStreaming = true;
            this.log('🎥 Starting video stream...', 'info');

            const frameInterval = 1000 / this.frameRate;
            let lastFrameTime = Date.now();

            const streamLoop = setInterval(() => {
                if (!this.isStreaming) {
                    clearInterval(streamLoop);
                    return;
                }

                // Get frame from buffer
                if (this.frameBuffer.length > 0) {
                    const frame = this.frameBuffer.shift();
                    this.sendFrame(frame);
                }

                // Track timing
                const now = Date.now();
                const elapsed = now - lastFrameTime;
                lastFrameTime = now;

            }, frameInterval);

            // Handle Ctrl+C
            process.on('SIGINT', () => {
                this.log('\n⚠️ Interrupted by user', 'warning');
                clearInterval(streamLoop);
                this.stop();
                process.exit(0);
            });

        } catch (error) {
            this.log(`❌ Streaming failed: ${error.message}`, 'error');
            await this.stop();
        }
    }

    async stop() {
        this.log('⏹️ Stopping stream...', 'info');
        
        this.isStreaming = false;

        // Stop camera
        if (this.cameraProcess) {
            this.cameraProcess.kill();
            this.cameraProcess = null;
            this.log('📷 Camera stopped', 'info');
        }

        // Close WebSocket
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.log('🔌 WebSocket closed', 'info');
        }

        // Print final stats
        if (this.connectionStart) {
            const duration = (Date.now() - this.connectionStart) / 1000;
            this.log(
                `📊 Session stats:\n` +
                `   Duration: ${duration.toFixed(1)}s\n` +
                `   Frames sent: ${this.frameCount}\n` +
                `   Avg FPS: ${(this.frameCount / duration).toFixed(1)}`,
                'data'
            );
        }
    }

    cleanup() {
        this.isStreaming = false;
        this.frameBuffer = [];
        this.sendTimes.clear();
    }
}

// Main function
async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    try {
        console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.cyan}║     Moveris Live - Node.js Client     ║${colors.reset}`);
        console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}\n`);

        const WS_URL = 'wss://developers.moveris.com/ws/live/v1/';
        const SECRET_KEY = await question('Enter your secret key: ');
        
        if (!SECRET_KEY.trim()) {
            console.log(`${colors.red}❌ Secret key is required${colors.reset}`);
            rl.close();
            return;
        }

        const frameRateInput = await question('Enter frame rate (default 10): ');
        const FRAME_RATE = parseInt(frameRateInput) || 10;

        const qualityInput = await question('Enter JPEG quality 1-100 (default 70): ');
        const QUALITY = parseInt(qualityInput) || 70;

        rl.close();

        // Create and start client
        const client = new MoverisClient(WS_URL, SECRET_KEY.trim(), {
            frameRate: FRAME_RATE,
            quality: QUALITY
        });

        await client.startStreaming();

    } catch (error) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        rl.close();
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}

module.exports = MoverisClient;
