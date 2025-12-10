# Data Structures for VLA Module

## Voice Command Entity

```typescript
interface VoiceCommand {
  id: string;              // Unique identifier for the command
  audioData: string;       // Audio file path or base64 encoded data
  transcription: string;   // Transcribed text from Whisper
  confidence: number;      // Confidence score from speech recognition (0-1)
  timestamp: Date;         // When the command was received
  source: string;          // Source of the audio (microphone, file, etc.)
  language: string;        // Detected language of the command
  status: CommandStatus;   // Processing status (pending, processed, failed)
}

enum CommandStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  PROCESSED = "processed",
  FAILED = "failed"
}
```

## Cognitive Plan Entity

```typescript
interface CognitivePlan {
  id: string;              // Unique identifier for the plan
  voiceCommandId: string;  // Reference to the original voice command
  naturalLanguage: string; // Original natural language command
  actionSequence: ActionStep[]; // Sequence of actions to execute
  context: PlanContext;    // Environmental context used for planning
  generatedAt: Date;       // When the plan was generated
  status: PlanStatus;      // Current status of the plan
  confidence: number;      // Confidence in the plan's correctness (0-1)
}

interface ActionStep {
  id: string;              // Unique identifier for this step
  type: ActionType;        // Type of action (navigation, manipulation, etc.)
  action: string;          // Specific action to perform
  parameters: Record<string, any>; // Parameters for the action
  dependencies: string[];  // IDs of actions that must complete first
  timeout: number;         // Timeout for this action in seconds
}

enum ActionType {
  NAVIGATION = "navigation",
  MANIPULATION = "manipulation",
  INTERACTION = "interaction",
  PERCEPTION = "perception",
  COMPOSITE = "composite"
}

interface PlanContext {
  robotPosition: [number, number, number]; // 3D position of the robot
  environmentMap: string;  // Semantic map of the environment
  objectLocations: Record<string, [number, number, number]>; // Known object positions
  robotCapabilities: RobotCapability[]; // Actions the robot can perform
  constraints: PlanConstraints; // Safety and operational constraints
}

interface PlanConstraints {
  safeZones: [number, number, number, number][]; // Bounding boxes of safe zones
  forbiddenAreas: [number, number, number, number][]; // Bounding boxes of forbidden areas
  maximumExecutionTime: number; // Maximum time allowed for plan execution
  safetyMargins: number; // Minimum distance to maintain from obstacles
}

enum PlanStatus {
  PENDING = "pending",
  GENERATING = "generating",
  GENERATED = "generated",
  EXECUTING = "executing",
  COMPLETED = "completed",
  FAILED = "failed",
  ABORTED = "aborted"
}

enum RobotCapability {
  NAVIGATION = "navigation",
  MANIPULATION = "manipulation",
  PERCEPTION = "perception",
  INTERACTION = "interaction"
}
```

## ROS2 Action Entity

```typescript
interface ROS2Action {
  id: string;              // Unique identifier for the action
  type: string;            // ROS2 action type (e.g., "nav2_msgs/action/NavigateToPose")
  goal: any;               // Goal message for the action
  result: any;             // Result message from the action (when completed)
  feedback: any;           // Feedback message during execution
  status: ActionExecutionStatus; // Current execution status
  startedAt: Date;         // When the action started executing
  completedAt: Date;       // When the action completed (if completed)
  timeout: number;         // Timeout for the action in seconds
  retryCount: number;      // Number of times the action has been retried
}

enum ActionExecutionStatus {
  PENDING = "pending",
  ACTIVE = "active",
  SUCCEEDED = "succeeded",
  CANCELLED = "cancelled",
  ABORTED = "aborted",
  REJECTED = "rejected",
  LOST = "lost"
}
```

## Perception Data Entity

```typescript
interface PerceptionData {
  id: string;              // Unique identifier for this perception data
  timestamp: Date;         // When the data was captured
  sensorType: SensorType;  // Type of sensor that captured the data
  sensorId: string;        // Identifier of the specific sensor
  data: any;               // Raw sensor data (image, point cloud, etc.)
  processedObjects: PerceivedObject[]; // Objects detected and processed
  environmentMap: SemanticMap; // Semantic map derived from perception
  confidence: number;      // Overall confidence in the perception data (0-1)
  frameId: string;         // Coordinate frame of the data
}

interface PerceivedObject {
  id: string;              // Unique identifier for the object
  type: ObjectType;        // Type of object (person, furniture, tool, etc.)
  name: string;            // Recognized name of the object
  position: [number, number, number]; // 3D position in space
  orientation: [number, number, number, number]; // Orientation as quaternion
  dimensions: [number, number, number]; // Width, height, depth
  confidence: number;      // Confidence in object recognition (0-1)
  attributes: Record<string, any>; // Additional attributes of the object
}

enum SensorType {
  CAMERA = "camera",
  LIDAR = "lidar",
  RGBD_CAMERA = "rgbd_camera",
  IMU = "imu",
  JOINT_STATE = "joint_state",
  LASER_SCAN = "laser_scan"
}

enum ObjectType {
  PERSON = "person",
  FURNITURE = "furniture",
  TOOL = "tool",
  CONTAINER = "container",
  OBSTACLE = "obstacle",
  LANDMARK = "landmark",
  UNKNOWN = "unknown"
}

interface SemanticMap {
  id: string;              // Unique identifier for the map
  version: string;         // Version of the map
  timestamp: Date;         // When the map was generated
  occupancyGrid: number[][]; // Grid representation of obstacles/free space
  semanticLabels: SemanticLabel[]; // Semantic labels for different areas
  objects: PerceivedObject[]; // Objects in the map
  navigationAreas: NavigationArea[]; // Navigable areas
}

interface SemanticLabel {
  areaId: string;          // ID of the labeled area
  label: string;           // Semantic label (kitchen, living_room, etc.)
  boundingBox: [number, number, number, number]; // Bounding box of the area
  confidence: number;      // Confidence in the label (0-1)
}

interface NavigationArea {
  areaId: string;          // ID of the navigation area
  type: NavigationAreaType; // Type of navigation area
  accessPermissions: string[]; // Who can access this area
  connectivity: string[];  // Connected navigation areas
}

enum NavigationAreaType {
  FREE_SPACE = "free_space",
  CORRIDOR = "corridor",
  ROOM = "room",
  DOORWAY = "doorway",
  ELEVATOR = "elevator"
}
```

## VLA Pipeline Entity

```typescript
interface VLAPipeline {
  id: string;              // Unique identifier for the pipeline instance
  status: PipelineStatus;  // Current status of the pipeline
  currentStage: PipelineStage; // Current processing stage
  voiceCommand: VoiceCommand; // Current voice command being processed
  cognitivePlan: CognitivePlan; // Current cognitive plan
  perceptionData: PerceptionData[]; // Perception data used in processing
  ros2Actions: ROS2Action[]; // Actions executed by the pipeline
  startTime: Date;         // When the pipeline started
  endTime: Date;           // When the pipeline completed (if completed)
  executionLog: ExecutionLogEntry[]; // Log of pipeline execution
  error: PipelineError | null; // Error information if pipeline failed
}

enum PipelineStatus {
  IDLE = "idle",
  RECEIVING_VOICE = "receiving_voice",
  TRANSCRIBING = "transcribing",
  PLANNING = "planning",
  EXECUTING = "executing",
  COMPLETED = "completed",
  FAILED = "failed",
  ABORTED = "aborted"
}

enum PipelineStage {
  VOICE_RECOGNITION = "voice_recognition",
  TRANSCRIPTION = "transcription",
  COGNITIVE_PLANNING = "cognitive_planning",
  ACTION_EXECUTION = "action_execution",
  MONITORING = "monitoring",
  COMPLETION = "completion"
}

interface ExecutionLogEntry {
  timestamp: Date;         // When the log entry was created
  stage: PipelineStage;    // Pipeline stage when logged
  message: string;         // Log message
  level: LogLevel;         // Log level (info, warning, error)
  details: Record<string, any>; // Additional details
}

enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error"
}

interface PipelineError {
  id: string;              // Unique identifier for the error
  type: PipelineErrorType; // Type of error that occurred
  message: string;         // Human-readable error message
  details: Record<string, any>; // Additional error details
  timestamp: Date;         // When the error occurred
  stage: PipelineStage;    // Stage where the error occurred
  severity: ErrorSeverity; // Severity of the error
}

enum PipelineErrorType {
  VOICE_RECOGNITION_FAILED = "voice_recognition_failed",
  TRANSCRIPTION_FAILED = "transcription_failed",
  PLANNING_FAILED = "planning_failed",
  ACTION_EXECUTION_FAILED = "action_execution_failed",
  PERCEPTION_FAILED = "perception_failed",
  TIMEOUT = "timeout",
  SAFETY_VIOLATION = "safety_violation"
}

enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}