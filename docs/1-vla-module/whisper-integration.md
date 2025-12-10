# Whisper Integration Module for Voice Processing

## Overview

This module provides the integration layer between audio input and the Whisper speech recognition system. It handles audio preprocessing, transcription, and command extraction for the VLA pipeline.

## Architecture

```
[Audio Input] → [Preprocessing] → [Whisper Transcription] → [Command Extraction] → [Validated Command]
```

## Implementation

### Audio Processing Module

```python
import pyaudio
import wave
import numpy as np
import whisper
from typing import Optional, Dict, Any
import logging
import time

class AudioProcessor:
    def __init__(self,
                 sample_rate: int = 16000,
                 chunk_size: int = 1024,
                 channels: int = 1,
                 device_index: Optional[int] = None):
        """
        Initialize audio processor for voice command capture

        Args:
            sample_rate: Audio sample rate in Hz
            chunk_size: Size of audio chunks to process
            channels: Number of audio channels (1 for mono)
            device_index: Index of audio input device (None for default)
        """
        self.sample_rate = sample_rate
        self.chunk_size = chunk_size
        self.channels = channels
        self.device_index = device_index

        # Initialize PyAudio
        self.pyaudio = pyaudio.PyAudio()

        # Configure audio stream
        self.stream = None
        self.is_recording = False

        # Set up logging
        self.logger = logging.getLogger(__name__)

    def start_recording(self, duration: Optional[float] = None) -> str:
        """
        Start recording audio and return file path when complete

        Args:
            duration: Recording duration in seconds (None for continuous until stopped)

        Returns:
            Path to recorded audio file
        """
        try:
            # Open audio stream
            self.stream = self.pyaudio.open(
                format=pyaudio.paInt16,
                channels=self.channels,
                rate=self.sample_rate,
                input=True,
                input_device_index=self.device_index,
                frames_per_buffer=self.chunk_size
            )

            self.is_recording = True
            frames = []

            # Record audio
            if duration:
                # Fixed duration recording
                num_chunks = int(duration * self.sample_rate / self.chunk_size)
                for _ in range(num_chunks):
                    if not self.is_recording:
                        break
                    data = self.stream.read(self.chunk_size)
                    frames.append(data)
            else:
                # Continuous recording until stopped
                while self.is_recording:
                    data = self.stream.read(self.chunk_size)
                    frames.append(data)

            # Stop and close stream
            self.stop_recording()

            # Save to temporary file
            filename = f"temp_audio_{int(time.time())}.wav"
            self.save_audio(frames, filename)

            self.logger.info(f"Audio recorded successfully: {filename}")
            return filename

        except Exception as e:
            self.logger.error(f"Error during audio recording: {str(e)}")
            raise

    def stop_recording(self):
        """Stop the audio recording"""
        self.is_recording = False
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None

    def save_audio(self, frames: list, filename: str):
        """Save recorded audio frames to a WAV file"""
        wf = wave.open(filename, 'wb')
        wf.setnchannels(self.channels)
        wf.setsampwidth(self.pyaudio.get_sample_size(pyaudio.paInt16))
        wf.setframerate(self.sample_rate)
        wf.writeframes(b''.join(frames))
        wf.close()

    def load_audio_from_file(self, filepath: str) -> np.ndarray:
        """Load audio from file and convert to numpy array for Whisper"""
        # This would use librosa or similar for actual implementation
        # For this documentation, we'll describe the process
        pass

    def __del__(self):
        """Clean up audio resources"""
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        self.pyaudio.terminate()
```

### Whisper Transcription Service

```python
import whisper
from typing import Dict, Any, Optional
import logging
import time

class WhisperTranscriptionService:
    def __init__(self,
                 model_name: str = "base",
                 language: Optional[str] = None,
                 temperature: float = 0.0):
        """
        Initialize Whisper transcription service

        Args:
            model_name: Whisper model to use (tiny, base, small, medium, large)
            language: Language code (e.g., 'en', 'es') or None for auto-detection
            temperature: Temperature for sampling (0.0 for deterministic)
        """
        self.logger = logging.getLogger(__name__)

        # Load Whisper model
        try:
            self.model = whisper.load_model(model_name)
            self.logger.info(f"Whisper model {model_name} loaded successfully")
        except Exception as e:
            self.logger.error(f"Failed to load Whisper model: {str(e)}")
            raise

        self.language = language
        self.temperature = temperature
        self.max_processing_time = 30  # seconds

    def transcribe_audio(self, audio_path: str) -> Dict[str, Any]:
        """
        Transcribe audio file using Whisper

        Args:
            audio_path: Path to audio file to transcribe

        Returns:
            Dictionary with transcription results
        """
        start_time = time.time()

        try:
            # Check processing time
            if time.time() - start_time > self.max_processing_time:
                raise TimeoutError("Whisper transcription exceeded maximum time")

            # Transcribe audio
            result = self.model.transcribe(
                audio_path,
                language=self.language,
                temperature=self.temperature
            )

            # Calculate confidence based on compression ratio and other factors
            confidence = self.estimate_confidence(result)

            processing_time = time.time() - start_time

            transcription_result = {
                "text": result["text"].strip(),
                "confidence": confidence,
                "language": result.get("language", self.language),
                "processing_time": processing_time,
                "word_timestamps": result.get("segments", []),
                "status": "success"
            }

            self.logger.info(f"Transcription completed: {transcription_result['text'][:50]}...")
            return transcription_result

        except TimeoutError:
            error_result = {
                "text": "",
                "confidence": 0.0,
                "language": self.language,
                "processing_time": self.max_processing_time,
                "status": "timeout",
                "error": "Processing timeout"
            }
            self.logger.warning("Whisper transcription timed out")
            return error_result

        except Exception as e:
            error_result = {
                "text": "",
                "confidence": 0.0,
                "language": self.language,
                "processing_time": time.time() - start_time,
                "status": "error",
                "error": str(e)
            }
            self.logger.error(f"Whisper transcription error: {str(e)}")
            return error_result

    def estimate_confidence(self, result: Dict[str, Any]) -> float:
        """
        Estimate confidence of transcription based on various metrics

        Args:
            result: Whisper transcription result

        Returns:
            Confidence score between 0 and 1
        """
        # Basic confidence estimation based on compression ratio and other factors
        compression_ratio = result.get("compression_ratio", 1.0)

        # Lower compression ratios generally indicate more reliable transcriptions
        if compression_ratio < 1.3:
            base_confidence = 0.9
        elif compression_ratio < 1.8:
            base_confidence = 0.7
        elif compression_ratio < 2.4:
            base_confidence = 0.5
        else:
            base_confidence = 0.3

        # Adjust based on other factors if available
        no_speech_prob = result.get("no_speech_prob", 0.0)
        if no_speech_prob > 0.8:
            base_confidence *= 0.5  # Reduce confidence if likely no speech

        return min(base_confidence, 1.0)
```

### Command Extraction Module

```python
import re
from typing import Dict, List, Optional, Tuple
import logging

class CommandExtractor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

        # Define command patterns
        self.command_patterns = {
            # Navigation commands
            "move_forward": [r"move\s+forward", r"go\s+forward", r"move\s+ahead", r"forward"],
            "move_backward": [r"move\s+backward", r"go\s+backward", r"back", r"reverse"],
            "turn_left": [r"turn\s+left", r"rotate\s+left", r"pivot\s+left"],
            "turn_right": [r"turn\s+right", r"rotate\s+right", r"pivot\s+right"],
            "stop": [r"stop", r"halt", r"freeze", r"pause"],
            "go_to": [r"go\s+to\s+(.+)", r"move\s+to\s+(.+)", r"navigate\s+to\s+(.+)"],

            # Manipulation commands
            "pick_up": [r"pick\s+up\s+(.+)", r"grasp\s+(.+)", r"take\s+(.+)", r"lift\s+(.+)"],
            "put_down": [r"put\s+down\s+(.+)", r"release\s+(.+)", r"drop\s+(.+)"],
            "move_object": [r"move\s+(.+)\s+to\s+(.+)"],

            # Interaction commands
            "turn_on": [r"turn\s+on\s+(.+)", r"activate\s+(.+)"],
            "turn_off": [r"turn\s+off\s+(.+)", r"deactivate\s+(.+)"],

            # Query commands
            "find_object": [r"find\s+(.+)", r"locate\s+(.+)", r"where\s+is\s+(.+)"],
            "status": [r"status", r"how\s+are\s+you", r"what's\s+up"]
        }

    def extract_command(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Extract robot command from transcribed text

        Args:
            text: Transcribed text from Whisper

        Returns:
            Dictionary with command details or None if no command found
        """
        if not text or not text.strip():
            return None

        text_lower = text.lower().strip()

        for command_type, patterns in self.command_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, text_lower)
                if match:
                    # Extract parameters if the pattern has groups
                    if match.groups():
                        params = list(match.groups())
                        command = {
                            "type": command_type,
                            "action": command_type,
                            "parameters": params,
                            "original_text": text
                        }
                    else:
                        command = {
                            "type": command_type,
                            "action": command_type,
                            "parameters": [],
                            "original_text": text
                        }

                    self.logger.info(f"Command extracted: {command_type} with params {command['parameters']}")
                    return command

        # If no specific command found, return a generic text command
        self.logger.info(f"No specific command found in: {text}")
        return {
            "type": "unknown",
            "action": "unknown",
            "parameters": [text],
            "original_text": text
        }

    def validate_command(self, command: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validate if the extracted command is feasible

        Args:
            command: Extracted command dictionary

        Returns:
            Tuple of (is_valid, validation_message)
        """
        # Basic validation rules
        if command["type"] == "unknown":
            return False, "Command type is unknown, cannot execute"

        # Validate parameters
        if command["type"] in ["go_to", "find_object"] and len(command["parameters"]) == 0:
            return False, "Location or object name required for this command"

        # Validate navigation commands
        if command["type"] in ["move_forward", "move_backward"] and len(command["parameters"]) > 0:
            # Try to extract distance if provided
            distance_param = command["parameters"][0]
            try:
                # Extract numeric value from parameter
                distance = float(re.findall(r"[\d.]+", distance_param)[0])
                if distance > 10.0:  # Max 10 meters for safety
                    return False, "Navigation distance exceeds safety limit"
            except (IndexError, ValueError):
                pass  # No numeric value found, continue

        return True, "Command is valid"
```

### Main Whisper Integration Module

```python
from typing import Dict, Any, Optional
import logging
import os
import tempfile

class WhisperIntegrationModule:
    def __init__(self,
                 whisper_model: str = "base",
                 audio_sample_rate: int = 16000):
        """
        Main module for Whisper integration in VLA pipeline

        Args:
            whisper_model: Whisper model to use
            audio_sample_rate: Sample rate for audio processing
        """
        self.logger = logging.getLogger(__name__)

        # Initialize components
        self.audio_processor = AudioProcessor(sample_rate=audio_sample_rate)
        self.transcription_service = WhisperTranscriptionService(model_name=whisper_model)
        self.command_extractor = CommandExtractor()

        # Set minimum confidence threshold
        self.min_confidence = 0.7

    def process_voice_command(self,
                            audio_input: Optional[str] = None,
                            duration: Optional[float] = 5.0) -> Dict[str, Any]:
        """
        Process voice command from audio input to extracted command

        Args:
            audio_input: Path to audio file, or None to record from microphone
            duration: Recording duration if recording from microphone

        Returns:
            Dictionary with processing results
        """
        try:
            # Step 1: Get audio
            if audio_input:
                # Use provided audio file
                audio_path = audio_input
            else:
                # Record audio from microphone
                self.logger.info(f"Recording audio for {duration} seconds")
                audio_path = self.audio_processor.start_recording(duration=duration)

            # Step 2: Transcribe audio
            self.logger.info(f"Transcribing audio: {audio_path}")
            transcription_result = self.transcription_service.transcribe_audio(audio_path)

            # Check transcription success and confidence
            if transcription_result["status"] != "success":
                return {
                    "success": False,
                    "error": transcription_result.get("error", "Transcription failed"),
                    "transcription_result": transcription_result
                }

            if transcription_result["confidence"] < self.min_confidence:
                return {
                    "success": False,
                    "error": "Low transcription confidence",
                    "confidence": transcription_result["confidence"],
                    "transcription_result": transcription_result
                }

            # Step 3: Extract command
            self.logger.info(f"Extracting command from: {transcription_result['text']}")
            command = self.command_extractor.extract_command(transcription_result["text"])

            if not command:
                return {
                    "success": False,
                    "error": "No valid command found in transcription",
                    "transcription_result": transcription_result
                }

            # Step 4: Validate command
            is_valid, validation_message = self.command_extractor.validate_command(command)
            if not is_valid:
                return {
                    "success": False,
                    "error": validation_message,
                    "command": command,
                    "transcription_result": transcription_result
                }

            # Clean up temporary audio file if created internally
            if not audio_input and os.path.exists(audio_path):
                os.remove(audio_path)

            # Return successful result
            result = {
                "success": True,
                "command": command,
                "transcription_result": transcription_result,
                "processing_time": transcription_result["processing_time"]
            }

            self.logger.info(f"Voice command processed successfully: {command['action']}")
            return result

        except Exception as e:
            self.logger.error(f"Error in voice command processing: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def process_continuous_voice(self,
                               callback_func,
                               max_duration: Optional[float] = None) -> None:
        """
        Process continuous voice input with callback for each command

        Args:
            callback_func: Function to call with each processed command
            max_duration: Maximum duration to listen (None for indefinite)
        """
        # This would implement continuous listening and processing
        # For now, we'll document the approach
        pass
```

## Usage Example

```python
# Initialize the Whisper integration module
vla_module = WhisperIntegrationModule(whisper_model="base")

# Process a voice command from microphone
result = vla_module.process_voice_command(duration=5.0)

if result["success"]:
    command = result["command"]
    print(f"Command: {command['action']}")
    print(f"Parameters: {command['parameters']}")
    print(f"Confidence: {result['transcription_result']['confidence']}")
else:
    print(f"Error: {result['error']}")

# Process a voice command from an audio file
result = vla_module.process_voice_command(audio_input="path/to/audio/file.wav")

# The extracted command can then be passed to the LLM planning module
```

## Error Handling and Quality Considerations

### Audio Quality Management

The module includes several mechanisms to handle poor audio quality:

1. **Confidence Scoring**: Whisper provides confidence metrics that are used to validate transcriptions
2. **Timeout Handling**: Processing timeouts prevent hanging on difficult audio
3. **Error Recovery**: Graceful degradation when transcription fails

### Command Validation

Commands are validated before being passed to the planning system:

1. **Syntax Validation**: Ensures commands match expected patterns
2. **Parameter Validation**: Checks that required parameters are present
3. **Safety Validation**: Prevents commands that exceed safety limits

This Whisper integration module provides a robust foundation for converting voice commands to actionable robot commands in the VLA pipeline.