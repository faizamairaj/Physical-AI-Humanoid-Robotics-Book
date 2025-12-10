# Complete VLA Pipeline Integration Architecture

## Overview

This document describes the complete integration of the Vision-Language-Action (VLA) pipeline, bringing together voice recognition, cognitive planning, and robot action execution into a unified autonomous system. This architecture enables end-to-end operation from voice commands to physical robot actions.

## High-Level Architecture

```
[User Voice Command] → [Whisper] → [Transcription] → [LLM Planner] → [Action Sequence] → [ROS2 Execution] → [Robot Action]
         ↑                                                                                                       ↓
[Audio Input] ← [Status Updates] ← [Perception Data] ← [Environmental Context] ← [Simulation Feedback] ← [Robot Sensors]
```

## Integration Architecture Components

### 1. Voice Processing Pipeline

```python
import threading
import queue
from typing import Callable, Any, Optional
import logging

class VoiceProcessingPipeline:
    def __init__(self,
                 whisper_module,
                 command_extractor,
                 audio_processor):
        """
        Complete voice processing pipeline

        Args:
            whisper_module: Whisper integration module
            command_extractor: Command extraction module
            audio_processor: Audio processing module
        """
        self.whisper_module = whisper_module
        self.command_extractor = command_extractor
        self.audio_processor = audio_processor
        self.logger = logging.getLogger(__name__)

        # Queues for inter-component communication
        self.audio_queue = queue.Queue(maxsize=10)
        self.command_queue = queue.Queue(maxsize=10)

        # Threading for continuous processing
        self.processing_thread = None
        self.is_processing = False

    def start_continuous_listening(self):
        """Start continuous voice command listening"""
        self.is_processing = True
        self.processing_thread = threading.Thread(target=self._continuous_processing_loop)
        self.processing_thread.start()
        self.logger.info("Continuous voice processing started")

    def _continuous_processing_loop(self):
        """Main processing loop for continuous voice input"""
        while self.is_processing:
            try:
                # Record audio
                result = self.whisper_module.process_voice_command(duration=5.0)

                if result["success"]:
                    command = result["command"]
                    # Add command to queue for planning
                    self.command_queue.put(command)
                    self.logger.info(f"Command queued: {command['action']}")

                # Small delay to prevent overwhelming the system
                import time
                time.sleep(0.5)

            except Exception as e:
                self.logger.error(f"Error in voice processing loop: {str(e)}")
                import time
                time.sleep(1)  # Wait before retrying

    def get_next_command(self) -> Optional[dict]:
        """Get the next processed command"""
        try:
            return self.command_queue.get_nowait()
        except queue.Empty:
            return None

    def stop_processing(self):
        """Stop the voice processing pipeline"""
        self.is_processing = False
        if self.processing_thread:
            self.processing_thread.join()
        self.logger.info("Voice processing stopped")
```

### 2. Cognitive Planning Pipeline

```python
import asyncio
from typing import Dict, List, Any
import logging

class CognitivePlanningPipeline:
    def __init__(self, llm_planning_module, context_provider):
        """
        Cognitive planning pipeline with context integration

        Args:
            llm_planning_module: LLM planning module
            context_provider: Context provider module
        """
        self.planning_module = llm_planning_module
        self.context_provider = context_provider
        self.logger = logging.getLogger(__name__)

    async def plan_command_async(self,
                                command_text: str,
                                additional_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Asynchronously plan a command with context

        Args:
            command_text: Natural language command
            additional_context: Additional context to enrich the planning

        Returns:
            Planning result dictionary
        """
        try:
            # Get current environmental context
            current_context = await self.context_provider.get_current_context()

            # Merge with additional context if provided
            if additional_context:
                for key, value in additional_context.items():
                    current_context[key] = value

            # Plan the command
            plan_result = self.planning_module.plan_command(
                command_text,
                current_context
            )

            self.logger.info(f"Planning completed for command: {command_text[:50]}...")
            return plan_result

        except Exception as e:
            self.logger.error(f"Error in cognitive planning: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "plan": None,
                "confidence": 0.0
            }

    def handle_ambiguous_command(self, command_text: str) -> Dict[str, Any]:
        """Handle ambiguous commands requiring clarification"""
        current_context = self.context_provider.get_current_context()
        return self.planning_module.handle_ambiguous_command(command_text, current_context)
```

### 3. Action Execution Pipeline

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging
from typing import List, Dict, Any

class ActionExecutionPipeline:
    def __init__(self, ros2_executor, safety_monitor):
        """
        Action execution pipeline with safety monitoring

        Args:
            ros2_executor: ROS2 action executor
            safety_monitor: Safety monitoring module
        """
        self.executor = ros2_executor
        self.safety_monitor = safety_monitor
        self.logger = logging.getLogger(__name__)
        self.executor_pool = ThreadPoolExecutor(max_workers=3)

    def execute_plan_async(self,
                          action_sequence: List[Dict[str, Any]],
                          execution_options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute an action plan asynchronously

        Args:
            action_sequence: Sequence of actions to execute
            execution_options: Options for execution

        Returns:
            Execution result dictionary
        """
        if execution_options is None:
            execution_options = {
                'continue_on_error': True,
                'max_retries': 3,
                'safety_check': True
            }

        try:
            # Get current context for execution
            environment_context = self.safety_monitor.get_current_environment_context()
            robot_capabilities = self.safety_monitor.get_robot_capabilities()

            # Execute the action sequence
            result = self.executor.execute_action_sequence(
                action_sequence,
                robot_capabilities,
                environment_context,
                execution_options
            )

            self.logger.info(f"Action execution completed with {result['summary']['success_rate']:.2f} success rate")
            return result

        except Exception as e:
            self.logger.error(f"Error in action execution: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "summary": None,
                "results": []
            }

    def cancel_current_execution(self):
        """Cancel the current execution"""
        return self.executor.cancel_execution()

    def execute_single_action(self, action: Dict[str, Any]) -> Any:
        """Execute a single action directly"""
        return self.executor.execute_single_action(action)
```

### 4. Perception Integration System

```python
import threading
import time
from typing import Dict, Any, Callable, List
import logging

class PerceptionIntegrationSystem:
    def __init__(self, sensor_interfaces: List[Callable]):
        """
        System for integrating perception data from multiple sensors

        Args:
            sensor_interfaces: List of functions to interface with different sensors
        """
        self.sensor_interfaces = sensor_interfaces
        self.perception_data = {}
        self.logger = logging.getLogger(__name__)
        self.update_thread = None
        self.is_running = False

        # Data locks for thread safety
        self.data_lock = threading.Lock()

    def start_perception_updates(self, update_interval: float = 1.0):
        """Start continuous perception data updates"""
        self.is_running = True
        self.update_thread = threading.Thread(
            target=self._perception_update_loop,
            args=(update_interval,)
        )
        self.update_thread.start()
        self.logger.info("Perception updates started")

    def _perception_update_loop(self, update_interval: float):
        """Main loop for updating perception data"""
        while self.is_running:
            try:
                new_data = {}

                # Update from each sensor interface
                for sensor_interface in self.sensor_interfaces:
                    try:
                        sensor_data = sensor_interface()
                        new_data.update(sensor_data)
                    except Exception as e:
                        self.logger.warning(f"Error getting data from sensor: {str(e)}")

                # Update perception data safely
                with self.data_lock:
                    self.perception_data.update(new_data)

                time.sleep(update_interval)

            except Exception as e:
                self.logger.error(f"Error in perception update loop: {str(e)}")
                time.sleep(1)  # Wait before continuing

    def get_current_perception(self) -> Dict[str, Any]:
        """Get the current perception data"""
        with self.data_lock:
            return self.perception_data.copy()

    def get_object_locations(self) -> Dict[str, List[float]]:
        """Get current object locations from perception data"""
        with self.data_lock:
            return self.perception_data.get('object_locations', {}).copy()

    def get_robot_position(self) -> List[float]:
        """Get current robot position from perception data"""
        with self.data_lock:
            return self.perception_data.get('robot_position', [0.0, 0.0, 0.0])

    def stop_perception_updates(self):
        """Stop perception updates"""
        self.is_running = False
        if self.update_thread:
            self.update_thread.join()
        self.logger.info("Perception updates stopped")
```

### 5. Main VLA Integration Manager

```python
import asyncio
import threading
from typing import Dict, Any, Optional
import logging
import time

class VLAPipelineManager:
    def __init__(self,
                 voice_pipeline: VoiceProcessingPipeline,
                 planning_pipeline: CognitivePlanningPipeline,
                 execution_pipeline: ActionExecutionPipeline,
                 perception_system: PerceptionIntegrationSystem):
        """
        Main manager for the complete VLA pipeline

        Args:
            voice_pipeline: Voice processing pipeline
            planning_pipeline: Cognitive planning pipeline
            execution_pipeline: Action execution pipeline
            perception_system: Perception integration system
        """
        self.voice_pipeline = voice_pipeline
        self.planning_pipeline = planning_pipeline
        self.execution_pipeline = execution_pipeline
        self.perception_system = perception_system

        self.logger = logging.getLogger(__name__)
        self.active = False
        self.current_task = None
        self.command_queue = asyncio.Queue()

    def start_pipeline(self):
        """Start the complete VLA pipeline"""
        self.active = True

        # Start perception updates
        self.perception_system.start_perception_updates(update_interval=0.5)

        # Start voice processing
        self.voice_pipeline.start_continuous_listening()

        # Start the main processing loop
        self.main_loop_thread = threading.Thread(target=self._main_processing_loop)
        self.main_loop_thread.start()

        self.logger.info("VLA Pipeline started successfully")

    def _main_processing_loop(self):
        """Main processing loop that orchestrates the entire pipeline"""
        while self.active:
            try:
                # Check for new voice commands
                command = self.voice_pipeline.get_next_command()
                if command:
                    # Process the command through the pipeline
                    asyncio.run(self._process_command_async(command))

                # Small delay to prevent busy waiting
                time.sleep(0.1)

            except Exception as e:
                self.logger.error(f"Error in main processing loop: {str(e)}")
                time.sleep(1)  # Wait before continuing

    async def _process_command_async(self, command: Dict[str, Any]):
        """Process a command through the complete pipeline"""
        try:
            self.logger.info(f"Processing command: {command['action']} with params {command['parameters']}")

            # Step 1: Generate plan using cognitive planning
            command_text = command.get('original_text', command['action'])
            plan_result = await self.planning_pipeline.plan_command_async(command_text)

            if not plan_result["success"]:
                self.logger.error(f"Planning failed: {plan_result['error']}")

                # Handle ambiguous commands
                if "ambiguous" in plan_result.get('error', '').lower():
                    clarification = self.planning_pipeline.handle_ambiguous_command(command_text)
                    self.logger.info(f"Clarification needed: {clarification}")
                    # In a real system, this would prompt the user

                return

            # Step 2: Execute the generated plan
            execution_result = self.execution_pipeline.execute_plan_async(
                plan_result["plan"]["action_sequence"]
            )

            if execution_result["success"]:
                self.logger.info(f"Command {command['action']} executed successfully")
            else:
                self.logger.error(f"Execution failed: {execution_result.get('error', 'Unknown error')}")

        except Exception as e:
            self.logger.error(f"Error processing command: {str(e)}")

    def process_single_command(self, command_text: str) -> Dict[str, Any]:
        """
        Process a single command through the complete pipeline

        Args:
            command_text: Natural language command text

        Returns:
            Dictionary with processing results
        """
        try:
            # For single commands, we'll create a simple synchronous flow
            # Get current context
            perception_data = self.perception_system.get_current_perception()

            # Plan the command
            plan_result = asyncio.run(
                self.planning_pipeline.plan_command_async(command_text, perception_data)
            )

            if not plan_result["success"]:
                return {
                    "success": False,
                    "error": plan_result["error"],
                    "plan": None,
                    "execution": None
                }

            # Execute the plan
            execution_result = self.execution_pipeline.execute_plan_async(
                plan_result["plan"]["action_sequence"]
            )

            return {
                "success": execution_result["success"],
                "plan": plan_result["plan"],
                "execution": execution_result["summary"] if execution_result["success"] else None,
                "error": execution_result.get("error") if not execution_result["success"] else None
            }

        except Exception as e:
            self.logger.error(f"Error in single command processing: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "plan": None,
                "execution": None
            }

    def stop_pipeline(self):
        """Stop the complete VLA pipeline"""
        self.active = False

        # Stop voice processing
        self.voice_pipeline.stop_processing()

        # Stop perception updates
        self.perception_system.stop_perception_updates()

        # Cancel any current execution
        self.execution_pipeline.cancel_current_execution()

        # Wait for main loop to finish
        if hasattr(self, 'main_loop_thread'):
            self.main_loop_thread.join()

        self.logger.info("VLA Pipeline stopped")

    def get_system_status(self) -> Dict[str, Any]:
        """Get the current status of the VLA pipeline"""
        return {
            "active": self.active,
            "voice_processing": self.voice_pipeline.is_processing,
            "perception_running": self.perception_system.is_running,
            "current_task": self.current_task,
            "command_queue_size": self.command_queue.qsize() if hasattr(self, 'command_queue') else 0
        }
```

### 6. Error Handling and Recovery System

```python
from enum import Enum
import logging
from typing import Dict, Any, Callable

class ErrorType(Enum):
    VOICE_ERROR = "voice_error"
    PLANNING_ERROR = "planning_error"
    EXECUTION_ERROR = "execution_error"
    PERCEPTION_ERROR = "perception_error"
    SAFETY_ERROR = "safety_error"

class RecoveryStrategy(Enum):
    RETRY = "retry"
    FALLBACK = "fallback"
    CLARIFICATION = "clarification"
    ABORT = "abort"
    CONTINUE = "continue"

class VLAEErrorHandler:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.recovery_strategies = {
            ErrorType.VOICE_ERROR: self._handle_voice_error,
            ErrorType.PLANNING_ERROR: self._handle_planning_error,
            ErrorType.EXECUTION_ERROR: self._handle_execution_error,
            ErrorType.PERCEPTION_ERROR: self._handle_perception_error,
            ErrorType.SAFETY_ERROR: self._handle_safety_error
        }

    def handle_error(self, error_type: ErrorType, error_details: Dict[str, Any]) -> RecoveryStrategy:
        """Handle an error and return the appropriate recovery strategy"""
        self.logger.error(f"Error of type {error_type.value} occurred: {error_details}")

        if error_type in self.recovery_strategies:
            return self.recovery_strategies[error_type](error_details)
        else:
            return RecoveryStrategy.ABORT

    def _handle_voice_error(self, error_details: Dict[str, Any]) -> RecoveryStrategy:
        """Handle voice processing errors"""
        error_msg = error_details.get('error', '').lower()

        if 'quality' in error_msg or 'confidence' in error_msg:
            self.logger.info("Low audio quality - requesting repeat")
            return RecoveryStrategy.FALLBACK  # Request user to repeat
        elif 'timeout' in error_msg:
            self.logger.info("Audio timeout - switching to text input")
            return RecoveryStrategy.FALLBACK  # Fallback to text
        else:
            return RecoveryStrategy.RETRY

    def _handle_planning_error(self, error_details: Dict[str, Any]) -> RecoveryStrategy:
        """Handle planning errors"""
        error_msg = error_details.get('error', '').lower()

        if 'ambiguous' in error_msg:
            self.logger.info("Ambiguous command - requesting clarification")
            return RecoveryStrategy.CLARIFICATION
        elif 'capability' in error_msg:
            self.logger.info("Robot lacks required capability")
            return RecoveryStrategy.FALLBACK
        else:
            return RecoveryStrategy.RETRY

    def _handle_execution_error(self, error_details: Dict[str, Any]) -> RecoveryStrategy:
        """Handle execution errors"""
        error_msg = error_details.get('error', '').lower()

        if 'safety' in error_msg:
            self.logger.info("Safety constraint violated")
            return RecoveryStrategy.ABORT
        elif 'unreachable' in error_msg or 'obstacle' in error_msg:
            self.logger.info("Navigation error - finding alternative route")
            return RecoveryStrategy.FALLBACK
        else:
            return RecoveryStrategy.RETRY

    def _handle_perception_error(self, error_details: Dict[str, Any]) -> RecoveryStrategy:
        """Handle perception errors"""
        return RecoveryStrategy.RETRY

    def _handle_safety_error(self, error_details: Dict[str, Any]) -> RecoveryStrategy:
        """Handle safety errors"""
        self.logger.critical("Safety error occurred - stopping all operations")
        return RecoveryStrategy.ABORT

    def get_error_recovery_context(self, error_type: ErrorType, error_details: Dict[str, Any]) -> Dict[str, Any]:
        """Get context information for error recovery"""
        return {
            "error_type": error_type.value,
            "timestamp": time.time(),
            "details": error_details,
            "recovery_strategy": self.handle_error(error_type, error_details).value
        }
```

### 7. Complete Integration Example

```python
def create_complete_vla_system():
    """Create and configure the complete VLA system"""
    import rclpy

    # Initialize ROS2
    rclpy.init()
    node = rclpy.create_node('vla_pipeline_manager')

    # Initialize components (these would be imported from our earlier implementations)
    from whisper_integration import WhisperIntegrationModule
    from llm_cognitive_planning import LLMPlanningModule, PlanContext
    from ros2_action_sequence_generator import ROS2ActionExecutor
    from simulation_test_environment import SimulationSensorInterface

    # Create component instances
    whisper_module = WhisperIntegrationModule(whisper_model="base")
    command_extractor = CommandExtractor()  # From whisper integration
    audio_processor = AudioProcessor()      # From whisper integration

    # Initialize voice pipeline
    voice_pipeline = VoiceProcessingPipeline(
        whisper_module=whisper_module,
        command_extractor=command_extractor,
        audio_processor=audio_processor
    )

    # Initialize planning pipeline
    llm_planning = LLMPlanningModule(api_key="your-api-key")
    context_provider = ContextProvider()  # Would provide current environmental context
    planning_pipeline = CognitivePlanningPipeline(
        llm_planning_module=llm_planning,
        context_provider=context_provider
    )

    # Initialize execution pipeline
    ros2_executor = ROS2ActionExecutor(node)
    safety_monitor = SafetyMonitor()  # Would monitor safety constraints
    execution_pipeline = ActionExecutionPipeline(
        ros2_executor=ros2_executor,
        safety_monitor=safety_monitor
    )

    # Initialize perception system
    sensor_interfaces = [
        SimulationSensorInterface().get_sensor_data,  # Example sensor interface
        # Add more sensor interfaces as needed
    ]
    perception_system = PerceptionIntegrationSystem(sensor_interfaces)

    # Create the main VLA manager
    vla_manager = VLAPipelineManager(
        voice_pipeline=voice_pipeline,
        planning_pipeline=planning_pipeline,
        execution_pipeline=execution_pipeline,
        perception_system=perception_system
    )

    return vla_manager, node

# Example usage of the complete system
def main():
    """Example of using the complete VLA pipeline"""
    vla_manager, node = create_complete_vla_system()

    try:
        # Start the complete pipeline
        vla_manager.start_pipeline()

        # Example: Process a single command
        result = vla_manager.process_single_command("Go to the kitchen and pick up the red cup")

        print(f"Command result: {result['success']}")
        if result['success']:
            print(f"Plan: {result['plan']}")
            print(f"Execution: {result['execution']}")
        else:
            print(f"Error: {result['error']}")

        # Check system status
        status = vla_manager.get_system_status()
        print(f"System status: {status}")

        # Let the system run for a while with continuous voice input
        import time
        time.sleep(30)  # Run for 30 seconds

    except KeyboardInterrupt:
        print("Shutting down VLA pipeline...")
    finally:
        # Clean shutdown
        vla_manager.stop_pipeline()
        node.destroy_node()
        rclpy.shutdown()

if __name__ == "__main__":
    main()
```

## Integration Validation

### Performance Metrics

The complete VLA pipeline is validated using these metrics:

1. **End-to-End Latency**: Time from voice input to robot action completion
2. **Success Rate**: Percentage of commands successfully completed
3. **System Reliability**: Time the system operates without failure
4. **Resource Utilization**: CPU, memory, and network usage
5. **Safety Compliance**: Percentage of actions that pass safety checks

### Validation Scenarios

The complete integration is validated through these scenarios:

1. **Simple Command Flow**: Basic voice → plan → action
2. **Complex Multi-Step**: Multi-action sequences
3. **Error Recovery**: Handling of various error conditions
4. **Continuous Operation**: Extended runtime stability
5. **Safety Scenarios**: Response to safety-critical situations

This complete VLA pipeline integration architecture provides a robust, modular system that can handle end-to-end voice commands through to robot actions, with comprehensive error handling, safety monitoring, and performance optimization.