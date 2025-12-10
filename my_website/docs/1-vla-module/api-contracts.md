# API Contracts for VLA Module

## Voice-to-Action Interface

### Interface Overview
The Voice-to-Action interface handles the conversion of audio input to transcribed text commands. This interface connects audio input sources to the Whisper transcription service.

### API Endpoints

#### POST /api/vla/transcribe
Transcribes audio data using Whisper and returns the transcribed text.

**Request:**
```
POST /api/vla/transcribe
Content-Type: multipart/form-data or application/json

{
  "audioData": "base64 encoded audio data or file reference",
  "language": "optional language code (e.g., 'en', 'es')",
  "model": "optional whisper model (default: 'base')",
  "timeout": "optional timeout in seconds (default: 30)"
}
```

**Response:**
```
Status: 200 OK
Content-Type: application/json

{
  "id": "unique identifier for the transcription request",
  "transcription": "the transcribed text",
  "confidence": "confidence score between 0 and 1",
  "language": "detected language",
  "processingTime": "time taken in milliseconds",
  "status": "success or error"
}
```

**Error Response:**
```
Status: 400 Bad Request or 500 Internal Server Error
Content-Type: application/json

{
  "error": "error message",
  "code": "error code",
  "details": "additional error details"
}
```

#### POST /api/vla/realtime-transcribe
Processes audio stream in real-time for continuous transcription.

**Request:**
```
POST /api/vla/realtime-transcribe
Content-Type: application/octet-stream
Transfer-Encoding: chunked

[binary audio stream data]
```

**Response (Server-Sent Events):**
```
data: {"transcription": "partial text", "isFinal": false, "timestamp": "2023-01-01T10:00:00Z"}

data: {"transcription": "complete sentence", "isFinal": true, "timestamp": "2023-01-01T10:00:05Z"}
```

### Error Handling
- Return error message if audio quality is poor
- Implement timeout of 30 seconds for processing
- Provide confidence scores for transcriptions

## LLM Cognitive Planning Interface

### Interface Overview
The LLM Cognitive Planning interface takes natural language commands and environmental context, then generates sequences of ROS2 actions to accomplish the requested task.

### API Endpoints

#### POST /api/vla/plan
Generates an action plan from a natural language command and environmental context.

**Request:**
```
POST /api/vla/plan
Content-Type: application/json

{
  "command": "natural language command",
  "context": {
    "robotPosition": [x, y, z],
    "environmentMap": "semantic map identifier or data",
    "objectLocations": {
      "object_name": [x, y, z]
    },
    "robotCapabilities": ["navigation", "manipulation", ...],
    "constraints": {
      "safeZones": [[min_x, min_y, max_x, max_y], ...],
      "forbiddenAreas": [[min_x, min_y, max_x, max_y], ...]
    }
  },
  "timeout": "optional timeout in seconds (default: 60)"
}
```

**Response:**
```
Status: 200 OK
Content-Type: application/json

{
  "id": "unique identifier for the plan",
  "command": "original command",
  "actionSequence": [
    {
      "id": "unique identifier for this action",
      "type": "action type (navigation, manipulation, etc.)",
      "action": "specific action name",
      "parameters": {"param1": "value1", ...},
      "dependencies": ["action_id_1", ...],
      "timeout": "timeout in seconds"
    }
  ],
  "contextUsed": {...},
  "confidence": "confidence score between 0 and 1",
  "processingTime": "time taken in milliseconds",
  "status": "success or requires_clarification"
}
```

#### POST /api/vla/plan/clarify
Requests clarification for ambiguous commands.

**Request:**
```
POST /api/vla/plan/clarify
Content-Type: application/json

{
  "command": "original ambiguous command",
  "context": {...}
}
```

**Response:**
```
Status: 200 OK
Content-Type: application/json

{
  "clarificationNeeded": "description of what needs clarification",
  "options": ["option1", "option2", ...],
  "suggestedRephrasing": "suggested clearer command"
}
```

### Error Handling
- Return clarification request for ambiguous commands
- Implement timeout of 60 seconds for planning
- Provide confidence scores for generated plans

## ROS2 Action Execution Interface

### Interface Overview
The ROS2 Action Execution interface takes action sequences and executes them on the robot through ROS2. It handles the communication between the planning system and the robot's action servers.

### API Endpoints

#### POST /api/vla/execute
Executes a sequence of ROS2 actions on the robot.

**Request:**
```
POST /api/vla/execute
Content-Type: application/json

{
  "actionSequence": [
    {
      "id": "action_id",
      "type": "action type",
      "action": "action name",
      "parameters": {"param1": "value1", ...},
      "timeout": "timeout in seconds"
    }
  ],
  "executionOptions": {
    "continueOnError": false,
    "maxRetries": 3,
    "safetyCheck": true
  }
}
```

**Response:**
```
Status: 200 OK
Content-Type: application/json

{
  "executionId": "unique identifier for this execution",
  "status": "executing",
  "estimatedCompletionTime": "estimated time in seconds",
  "actionResults": [
    {
      "actionId": "id of the action",
      "status": "pending, active, succeeded, failed, etc.",
      "result": "result data if completed",
      "executionTime": "time taken in milliseconds"
    }
  ]
}
```

#### GET /api/vla/execute/{executionId}
Gets the status of an ongoing execution.

**Response:**
```
Status: 200 OK
Content-Type: application/json

{
  "executionId": "id of the execution",
  "overallStatus": "pending, executing, completed, failed",
  "currentActionIndex": "index of currently executing action",
  "actionResults": [...],
  "progress": "progress percentage (0-100)",
  "estimatedRemainingTime": "estimated remaining time in seconds"
}
```

#### POST /api/vla/execute/{executionId}/cancel
Cancels an ongoing execution.

**Response:**
```
Status: 200 OK
Content-Type: application/json

{
  "executionId": "id of the execution",
  "status": "cancelled",
  "actionResults": [...]
}
```

### Error Handling
- Return failure status for invalid commands
- Implement variable timeouts based on action complexity
- Provide detailed error information for debugging

## Common Error Responses

### 400 Bad Request
```
{
  "error": "Invalid request format or parameters",
  "code": "INVALID_REQUEST",
  "details": "Specific details about what was invalid"
}
```

### 408 Request Timeout
```
{
  "error": "Request timed out",
  "code": "REQUEST_TIMEOUT",
  "details": "Operation did not complete within the specified timeout"
}
```

### 500 Internal Server Error
```
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "details": "Additional details about the error"
}
```

### 503 Service Unavailable
```
{
  "error": "Service temporarily unavailable",
  "code": "SERVICE_UNAVAILABLE",
  "details": "Service is temporarily down for maintenance or overload"
}
```

## Authentication and Authorization

All API endpoints require authentication using API keys passed in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

## Rate Limiting

API endpoints are subject to rate limiting:
- Transcription endpoints: 10 requests per minute
- Planning endpoints: 5 requests per minute
- Execution endpoints: 2 requests per minute

Rate limit responses include the following headers:
- `X-RateLimit-Limit`: The maximum number of requests allowed
- `X-RateLimit-Remaining`: The remaining requests in the current window
- `X-RateLimit-Reset`: The time when the rate limit resets