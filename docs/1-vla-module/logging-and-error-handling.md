# Logging and Error Handling for VLA Pipeline

## Logging Infrastructure

### Log Levels and Categories

The VLA pipeline implements comprehensive logging across different levels and categories:

#### Log Levels
- **DEBUG**: Detailed diagnostic information for development and troubleshooting
- **INFO**: General operational information and successful events
- **WARNING**: Indications of potential issues that don't prevent operation
- **ERROR**: Errors that prevent specific operations but don't crash the system
- **CRITICAL**: Severe errors that may cause system failure

#### Log Categories
- **VOICE**: Audio processing and transcription events
- **PLANNING**: Cognitive planning and LLM interaction events
- **EXECUTION**: ROS2 action execution events
- **PERCEPTION**: Sensor data and environment perception events
- **SYSTEM**: General system operation and infrastructure events

### Log Format

All logs follow a structured JSON format:

```json
{
  "timestamp": "2023-01-01T10:00:00.000Z",
  "level": "INFO",
  "category": "VOICE",
  "message": "Audio transcription completed successfully",
  "context": {
    "requestId": "unique-request-id",
    "sessionId": "session-identifier",
    "pipelineId": "vla-pipeline-id",
    "duration": 1234,
    "details": {
      "audioLength": 5.2,
      "confidence": 0.95,
      "transcription": "Move forward 2 meters"
    }
  }
}
```

### Logging Configuration

#### Voice Processing Logs
```yaml
voice:
  level: INFO
  max_file_size: "10MB"
  backup_count: 5
  format: "%(asctime)s - VOICE - %(levelname)s - %(message)s"
```

#### Planning Logs
```yaml
planning:
  level: INFO
  max_file_size: "10MB"
  backup_count: 5
  format: "%(asctime)s - PLANNING - %(levelname)s - %(message)s"
```

#### Execution Logs
```yaml
execution:
  level: INFO
  max_file_size: "20MB"
  backup_count: 10
  format: "%(asctime)s - EXECUTION - %(levelname)s - %(message)s"
```

## Error Handling Framework

### Error Classification

Errors in the VLA pipeline are classified into several categories:

#### Voice Recognition Errors
- **AudioQualityError**: Poor audio quality prevents accurate transcription
- **TimeoutError**: Audio processing exceeds allowed time limit
- **ServiceError**: Whisper API or audio processing service unavailable

#### Planning Errors
- **AmbiguousCommandError**: Command is unclear and requires clarification
- **ContextError**: Insufficient environmental context for planning
- **CapabilityError**: Requested action exceeds robot capabilities

#### Execution Errors
- **ActionValidationError**: Action parameters are invalid
- **SafetyViolationError**: Action would violate safety constraints
- **ExecutionFailureError**: Action failed during execution

#### System Errors
- **ResourceError**: Insufficient system resources
- **CommunicationError**: Communication failure between components
- **ConfigurationError**: Incorrect system configuration

### Error Response Format

All errors follow a consistent response format:

```json
{
  "error": {
    "type": "ErrorType",
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "timestamp": "2023-01-01T10:00:00.000Z",
      "requestId": "request-identifier",
      "pipelineId": "vla-pipeline-id",
      "severity": "HIGH",
      "suggestedAction": "Recommended next step"
    }
  }
}
```

### Error Recovery Strategies

#### Voice Recognition Recovery
```python
def handle_voice_error(error):
    if isinstance(error, AudioQualityError):
        return {
            "status": "request_repeat",
            "message": "Audio quality too low, please repeat command"
        }
    elif isinstance(error, TimeoutError):
        return {
            "status": "fallback_to_text",
            "message": "Audio processing timed out, use text input"
        }
    else:
        return {
            "status": "service_unavailable",
            "message": "Voice service temporarily unavailable"
        }
```

#### Planning Recovery
```python
def handle_planning_error(error):
    if isinstance(error, AmbiguousCommandError):
        return {
            "status": "request_clarification",
            "options": ["option1", "option2"],
            "message": "Please clarify your command"
        }
    elif isinstance(error, ContextError):
        return {
            "status": "request_updated_context",
            "message": "Need updated environmental information"
        }
    else:
        return {
            "status": "fallback_to_simple_action",
            "message": "Falling back to simpler action"
        }
```

#### Execution Recovery
```python
def handle_execution_error(error):
    if isinstance(error, SafetyViolationError):
        return {
            "status": "safety_override_required",
            "message": "Action violates safety constraints"
        }
    elif isinstance(error, ActionValidationError):
        return {
            "status": "retry_with_modified_parameters",
            "message": "Action parameters need adjustment"
        }
    else:
        return {
            "status": "abort_and_report",
            "message": "Action execution failed"
        }
```

## Specific Error Handling Implementations

### Voice-to-Action Error Handling

```python
class VoiceToActionHandler:
    def __init__(self):
        self.max_audio_duration = 30  # seconds
        self.min_confidence = 0.7

    def process_audio(self, audio_data):
        try:
            # Validate audio input
            if self.get_audio_duration(audio_data) > self.max_audio_duration:
                raise TimeoutError("Audio exceeds maximum duration")

            # Process with Whisper
            transcription = self.transcribe_with_whisper(audio_data)

            # Validate confidence
            if transcription.confidence < self.min_confidence:
                raise AudioQualityError("Low transcription confidence")

            return {
                "success": True,
                "transcription": transcription.text,
                "confidence": transcription.confidence
            }

        except TimeoutError as e:
            logger.warning(f"Voice processing timeout: {str(e)}")
            return {
                "success": False,
                "error": "timeout",
                "message": "Audio processing timed out"
            }
        except AudioQualityError as e:
            logger.warning(f"Audio quality issue: {str(e)}")
            return {
                "success": False,
                "error": "low_quality",
                "message": "Audio quality too low, please repeat"
            }
        except Exception as e:
            logger.error(f"Unexpected error in voice processing: {str(e)}")
            return {
                "success": False,
                "error": "service_error",
                "message": "Voice service temporarily unavailable"
            }
```

### LLM Planning Error Handling

```python
class LLMPlanningHandler:
    def __init__(self):
        self.max_planning_time = 60  # seconds
        self.min_plan_confidence = 0.6

    def generate_plan(self, command, context):
        try:
            # Set timeout for planning
            start_time = time.time()

            # Generate plan with LLM
            plan = self.call_llm_planner(command, context)

            # Check elapsed time
            elapsed = time.time() - start_time
            if elapsed > self.max_planning_time:
                raise TimeoutError("Planning exceeded maximum time")

            # Validate plan confidence
            if plan.confidence < self.min_plan_confidence:
                raise LowConfidenceError("Plan confidence below threshold")

            # Validate plan feasibility
            if not self.validate_plan_feasibility(plan, context):
                raise PlanValidationError("Generated plan is not feasible")

            return {
                "success": True,
                "plan": plan,
                "confidence": plan.confidence
            }

        except TimeoutError:
            logger.warning("LLM planning timeout")
            return {
                "success": False,
                "error": "timeout",
                "message": "Planning timed out"
            }
        except AmbiguousCommandError as e:
            logger.info(f"Ambiguous command: {str(e)}")
            return {
                "success": False,
                "error": "ambiguous_command",
                "message": "Command is ambiguous",
                "options": e.suggested_options
            }
        except PlanValidationError as e:
            logger.warning(f"Plan validation failed: {str(e)}")
            return {
                "success": False,
                "error": "plan_validation",
                "message": "Generated plan is not feasible"
            }
        except Exception as e:
            logger.error(f"Unexpected error in planning: {str(e)}")
            return {
                "success": False,
                "error": "planning_error",
                "message": "Planning service error"
            }
```

### ROS2 Execution Error Handling

```python
class ROS2ExecutionHandler:
    def __init__(self):
        self.max_action_time = 300  # seconds (5 minutes)
        self.max_retries = 3

    def execute_action_sequence(self, actions):
        results = []

        for i, action in enumerate(actions):
            retry_count = 0
            success = False

            while retry_count < self.max_retries and not success:
                try:
                    # Execute the action with timeout
                    result = self.execute_single_action(action)

                    if result.status == "succeeded":
                        success = True
                        results.append({
                            "actionId": action.id,
                            "status": "succeeded",
                            "result": result.data
                        })
                    else:
                        retry_count += 1
                        if retry_count >= self.max_retries:
                            results.append({
                                "actionId": action.id,
                                "status": "failed",
                                "error": result.error,
                                "message": f"Action failed after {self.max_retries} retries"
                            })
                        else:
                            logger.info(f"Retrying action {action.id}, attempt {retry_count + 1}")

                except SafetyViolationError as e:
                    logger.critical(f"Safety violation in action {action.id}: {str(e)}")
                    results.append({
                        "actionId": action.id,
                        "status": "failed",
                        "error": "safety_violation",
                        "message": "Action violates safety constraints"
                    })
                    # Stop execution on safety violations
                    break
                except Exception as e:
                    logger.error(f"Error executing action {action.id}: {str(e)}")
                    retry_count += 1
                    if retry_count >= self.max_retries:
                        results.append({
                            "actionId": action.id,
                            "status": "failed",
                            "error": "execution_error",
                            "message": "Action execution failed"
                        })

        return {
            "success": all(r["status"] == "succeeded" for r in results),
            "results": results
        }
```

## Monitoring and Observability

### Key Metrics

The system tracks the following metrics for observability:

#### Performance Metrics
- Voice transcription latency
- Planning time
- Action execution time
- Overall pipeline throughput

#### Success Metrics
- Voice transcription success rate
- Planning success rate
- Action execution success rate
- End-to-end pipeline success rate

#### Error Metrics
- Error rates by type and category
- Error recovery success rate
- Unhandled error count

### Health Checks

The system implements health checks for each component:

```python
def health_check():
    checks = {
        "voice_service": check_voice_service(),
        "llm_service": check_llm_service(),
        "ros2_connection": check_ros2_connection(),
        "perception_service": check_perception_service(),
        "overall_system": check_overall_system()
    }

    overall_status = all(check["status"] == "healthy" for check in checks.values())

    return {
        "status": "healthy" if overall_status else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": checks
    }
```

This comprehensive logging and error handling framework ensures the VLA pipeline operates reliably and provides detailed information for debugging and monitoring purposes.