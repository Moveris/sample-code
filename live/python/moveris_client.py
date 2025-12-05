#!/usr/bin/env python3

import asyncio
import json
import base64
import time
import cv2
import websockets
from typing import Optional
from logging_config import get_logger
from dotenv import load_dotenv
import os

load_dotenv()
logger = get_logger(level=None, name="moveris_client", log_to_file=False)


class MoverisClient:
    """WebSocket client for streaming video frames to Moveris API"""

    def __init__(
        self, ws_url: str, secret_key: str, frame_rate: int = 10, quality: int = 70
    ):
        """
        Initialize Moveris client

        Args:
            ws_url: WebSocket URL (e.g., wss://developers.moveris.com/ws/live/v1/)
            secret_key: API secret key
            frame_rate: Frames per second to capture (default: 10)
            quality: JPEG quality 1-100 (default: 70)
        """
        self.ws_url = ws_url
        self.secret_key = secret_key
        self.frame_rate = frame_rate
        self.quality = quality

        # State
        self.websocket: Optional[websockets.WebSocketClientProtocol] = None
        self.is_authenticated = False
        self.is_streaming = False

        # Stats
        self.frame_count = 0
        self.server_buffer = 0
        self.connection_start = None

        # Performance tracking
        self.send_times = {}
        self.ack_times = []
        self.frame_times = []

        # Camera
        self.camera: Optional[cv2.VideoCapture] = None

    async def connect(self) -> bool:
        """Connect to WebSocket server"""
        try:
            logger.info(f"Connecting to {self.ws_url}...")
            self.websocket = await websockets.connect(
                self.ws_url, ping_interval=20, ping_timeout=10
            )
            self.connection_start = time.time()
            logger.info("Connected successfully")
            return True

        except Exception as e:
            logger.error(f"Connection failed: {e}")
            return False

    async def authenticate(self) -> bool:
        """Authenticate with the server"""
        try:
            if not self.websocket:
                return False

            logger.info("Authenticating...")
            await self.websocket.send(
                json.dumps({"type": "auth", "token": self.secret_key})
            )

            # Wait for auth response
            timeout = 10
            start_time = time.time()

            while time.time() - start_time < timeout:
                try:
                    message = await asyncio.wait_for(self.websocket.recv(), timeout=1.0)
                    data = json.loads(message)

                    if data["type"] == "auth_success":
                        self.is_authenticated = True
                        logger.info("Authentication successful")
                        return True
                    elif data["type"] == "error":
                        logger.error(f"Auth failed: {data['message']}")
                        return False

                except asyncio.TimeoutError:
                    continue

            logger.error("Authentication timeout")
            return False

        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return False

    def open_camera(self) -> bool:
        """Open webcam"""
        try:
            logger.info("Opening camera...")
            self.camera = cv2.VideoCapture(0)

            if not self.camera.isOpened():
                logger.error("Failed to open camera")
                return False

            # Set camera properties
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.camera.set(cv2.CAP_PROP_FPS, self.frame_rate)

            logger.info("Camera opened successfully")
            return True

        except Exception as e:
            logger.error(f"Camera error: {e}")
            return False

    def capture_frame(self) -> Optional[str]:
        """Capture and encode frame from camera"""
        try:
            if not self.camera:
                return None

            ret, frame = self.camera.read()
            if not ret:
                logger.warning("Failed to capture frame")
                return None

            # Encode as JPEG
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), self.quality]
            _, buffer = cv2.imencode(".jpg", frame, encode_param)

            # Convert to base64
            base64_frame = base64.b64encode(buffer).decode("utf-8")
            return base64_frame

        except Exception as e:
            logger.error(f"Frame capture error: {e}")
            return None

    async def send_frame(self, frame_data: str) -> bool:
        """Send frame to server"""
        try:
            if not self.websocket or not self.is_authenticated:
                return False

            self.frame_count += 1
            send_time = time.time()

            # Track send time for latency calculation
            self.send_times[self.frame_count] = send_time

            # Clean up old send times (keep last 1000)
            if len(self.send_times) > 1000:
                old_keys = sorted(self.send_times.keys())[:-1000]
                for key in old_keys:
                    del self.send_times[key]

            await self.websocket.send(
                json.dumps(
                    {
                        "type": "frame",
                        "frame_number": self.frame_count,
                        "frame_data": frame_data,
                        "timestamp": send_time,
                    }
                )
            )

            return True

        except Exception as e:
            logger.error(f"Send error: {e}")
            return False

    async def handle_messages(self):
        """Handle incoming WebSocket messages"""
        try:
            while self.is_streaming and self.websocket:
                try:
                    message = await asyncio.wait_for(self.websocket.recv(), timeout=1.0)
                    data = json.loads(message)
                    receive_time = time.time()

                    msg_type = data.get("type")

                    if msg_type == "frame_received":
                        frame_num = data.get("frame_number")

                        # Calculate ACK latency
                        if frame_num in self.send_times:
                            ack_latency = (
                                receive_time - self.send_times[frame_num]
                            ) * 1000
                            self.ack_times.append(ack_latency)

                            # Keep only last 50
                            if len(self.ack_times) > 50:
                                self.ack_times.pop(0)

                            del self.send_times[frame_num]

                        self.server_buffer = data.get("total_frames", 0)

                        # Log every 50 frames
                        if frame_num % 50 == 0:
                            avg_ack = (
                                sum(self.ack_times) / len(self.ack_times)
                                if self.ack_times
                                else 0
                            )
                            logger.info(
                                f"Frame {frame_num} ACK | "
                                f"Buffer: {self.server_buffer} | "
                                f"Avg ACK: {avg_ack:.0f}ms"
                            )

                    elif msg_type == "processing_started":
                        logger.info(
                            f"Processing: {data.get('message', 'Processing started')}"
                        )

                    elif msg_type == "processing_complete":
                        result = data.get("result", {})
                        frames_processed = data.get("frames_processed", 0)

                        logger.info(
                            f"Processing complete: {frames_processed} frames\n"
                            f"   Prediction: {result.get('prediction', 'N/A')}\n"
                            f"   AI Probability: {result.get('ai_probability', 0) * 100:.2f}%\n"
                            f"   Confidence: {result.get('confidence', 0):.4f}\n"
                            f"   Processing Time: {result.get('processing_time_seconds', 0):.2f}s"
                        )

                    elif msg_type == "error":
                        logger.error(
                            f"Server error: {data.get('message', 'Unknown error')}"
                        )

                    elif msg_type == "disconnect":
                        logger.warning(
                            f"Server disconnecting: {data.get('reason', 'Unknown')}"
                        )
                        self.is_streaming = False
                        break

                except asyncio.TimeoutError:
                    continue
                except json.JSONDecodeError as e:
                    logger.error(f"JSON decode error: {e}")
                    continue

        except Exception as e:
            logger.error(f"Message handler error: {e}")

    async def stream_frames(self):
        """Main streaming loop"""
        frame_interval = 1.0 / self.frame_rate
        last_frame_time = time.time()

        while self.is_streaming:
            try:
                # Capture frame
                frame_data = self.capture_frame()
                if frame_data:
                    # Send frame
                    await self.send_frame(frame_data)

                # Calculate sleep time for target frame rate
                now = time.time()
                elapsed = now - last_frame_time
                sleep_time = max(0, frame_interval - elapsed)

                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)

                last_frame_time = time.time()

            except Exception as e:
                logger.error(f"Streaming error: {e}")
                await asyncio.sleep(0.1)

    async def start_streaming(self):
        """Start streaming video frames"""
        try:
            # Connect
            if not await self.connect():
                return False

            # Authenticate
            if not await self.authenticate():
                await self.disconnect()
                return False

            # Open camera
            if not self.open_camera():
                await self.disconnect()
                return False

            # Start streaming
            self.is_streaming = True
            logger.info("Starting video stream...")

            # Run both tasks concurrently
            await asyncio.gather(self.stream_frames(), self.handle_messages())

            return True

        except Exception as e:
            logger.error(f"Streaming failed: {e}")
            return False
        finally:
            await self.disconnect()

    async def disconnect(self):
        """Disconnect and cleanup"""
        logger.info("Stopping stream...")

        self.is_streaming = False

        # Close camera
        if self.camera:
            self.camera.release()
            self.camera = None
            logger.info("Camera released")

        # Close WebSocket
        if self.websocket:
            await self.websocket.close()
            self.websocket = None
            logger.info("WebSocket closed")

        # Print final stats
        if self.connection_start:
            duration = time.time() - self.connection_start
            logger.info(
                f"Session stats:\n"
                f"   Duration: {duration:.1f}s\n"
                f"   Frames sent: {self.frame_count}\n"
                f"   Avg FPS: {self.frame_count / duration:.1f}"
            )


async def main():
    """Main entry point"""
    # Configuration
    WS_URL = "wss://developers.moveris.com/ws/live/v1/"
    SECRET_KEY = os.getenv("SECRET_KEY", "")

    if not SECRET_KEY:
        logger.error("Secret key is required")
        return

    FRAME_RATE = int(input("Enter frame rate (default 10): ") or "10")
    QUALITY = int(input("Enter JPEG quality 1-100 (default 70): ") or "70")

    # Create client
    client = MoverisClient(
        ws_url=WS_URL, secret_key=SECRET_KEY, frame_rate=FRAME_RATE, quality=QUALITY
    )

    try:
        # Start streaming
        await client.start_streaming()

    except KeyboardInterrupt:
        logger.info("\nInterrupted by user")
    except Exception as e:
        logger.error(f"Error: {e}")
    finally:
        await client.disconnect()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nGoodbye!")
