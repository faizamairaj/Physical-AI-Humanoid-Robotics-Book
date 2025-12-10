# Simulation Test Environment for Voice Commands

## Overview

This document describes the simulation environment for testing voice command processing and robot action execution. The simulation provides a safe and controlled environment for students to test the VLA pipeline without requiring physical hardware.

## Simulation Architecture

### Gazebo Environment Setup

The simulation environment uses Gazebo as the primary physics simulator with the following components:

1. **Robot Model**: Humanoid robot model with appropriate sensors and actuators
2. **Environment**: Indoor environment with rooms, furniture, and objects
3. **Sensors**: Camera, LIDAR, and audio simulation capabilities
4. **Control Interface**: ROS2 bridge for command execution

### Required Components

#### Robot Model Configuration
```xml
<!-- Example robot configuration for Gazebo -->
<sdf version="1.6">
  <model name="humanoid_robot">
    <link name="base_link">
      <!-- Robot base with collision and visual properties -->
    </link>

    <joint name="camera_joint" type="fixed">
      <parent>base_link</parent>
      <child>camera_link</child>
    </joint>

    <link name="camera_link">
      <sensor name="camera" type="camera">
        <!-- Camera sensor configuration -->
      </sensor>
    </link>

    <joint name="lidar_joint" type="fixed">
      <parent>base_link</parent>
      <child>lidar_link</child>
    </joint>

    <link name="lidar_link">
      <sensor name="lidar" type="ray">
        <!-- LIDAR sensor configuration -->
      </sensor>
    </link>
  </model>
</sdf>
```

#### World Configuration
```xml
<!-- Example world configuration -->
<sdf version="1.6">
  <world name="vla_test_world">
    <!-- Physics engine configuration -->
    <physics type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
    </physics>

    <!-- Environment with rooms and objects -->
    <include>
      <uri>model://kitchen</uri>
      <pose>0 0 0 0 0 0</pose>
    </include>

    <include>
      <uri>model://living_room</uri>
      <pose>5 0 0 0 0 0</pose>
    </include>

    <model name="red_cup">
      <pose>2 1 0.8 0 0 0</pose>
      <link name="cup_link">
        <visual name="visual">
          <geometry>
            <cylinder>
              <radius>0.05</radius>
              <length>0.1</length>
            </cylinder>
          </geometry>
        </visual>
      </link>
    </model>
  </world>
</sdf>
```

## Setting Up the Simulation Environment

### Prerequisites

1. **ROS2 Installation**: Ensure ROS2 (Humble Hawksbill or later) is installed
2. **Gazebo Garden**: Install Gazebo Garden for simulation
3. **Navigation2**: Install Navigation2 stack for path planning
4. **Robot Models**: Download or create appropriate robot models

### Installation Steps

1. **Install ROS2 and Gazebo**:
   ```bash
   # Follow official ROS2 installation guide for your platform
   # Install Gazebo Garden
   sudo apt install ros-humble-gazebo-ros-pkgs
   ```

2. **Install Navigation2**:
   ```bash
   sudo apt install ros-humble-navigation2 ros-humble-nav2-bringup
   ```

3. **Set up workspace**:
   ```bash
   mkdir -p ~/vla_ws/src
   cd ~/vla_ws
   colcon build
   source install/setup.bash
   ```

4. **Launch the simulation environment**:
   ```bash
   # Launch Gazebo with the test world
   ros2 launch vla_simulation bringup.launch.py

   # In another terminal, start the voice command processing
   ros2 run vla_pipeline voice_processor
   ```

## Testing Basic Commands

### Simple Movement Commands

#### Test Case 1: Move Forward
1. **Command**: "Move forward 1 meter"
2. **Expected Behavior**: Robot moves forward approximately 1 meter
3. **Validation**: Check robot position before and after command

```python
# Example test script for move forward
import rclpy
from geometry_msgs.msg import Twist
from std_msgs.msg import String
import time

def test_move_forward():
    rclpy.init()
    node = rclpy.create_node('test_move_forward')

    # Publisher for robot movement
    cmd_vel_pub = node.create_publisher(Twist, '/cmd_vel', 10)

    # Send forward movement command
    msg = Twist()
    msg.linear.x = 0.5  # 0.5 m/s forward
    msg.angular.z = 0.0

    # Move for 2 seconds (should move ~1 meter at 0.5 m/s)
    start_time = time.time()
    while time.time() - start_time < 2.0:
        cmd_vel_pub.publish(msg)
        time.sleep(0.1)

    # Stop the robot
    msg.linear.x = 0.0
    cmd_vel_pub.publish(msg)

    node.destroy_node()
    rclpy.shutdown()
```

#### Test Case 2: Turn Left
1. **Command**: "Turn left 90 degrees"
2. **Expected Behavior**: Robot rotates left by approximately 90 degrees
3. **Validation**: Check robot orientation before and after command

### Navigation Commands

#### Test Case 3: Go to Location
1. **Command**: "Go to the kitchen"
2. **Expected Behavior**: Robot navigates to the kitchen area
3. **Validation**: Check if robot reaches the target location

```python
# Example test script for navigation
import rclpy
from nav2_msgs.action import NavigateToPose
from rclpy.action import ActionClient
from geometry_msgs.msg import PoseStamped
import time

def test_navigation():
    rclpy.init()
    node = rclpy.create_node('test_navigation')

    # Create action client for navigation
    action_client = ActionClient(node, NavigateToPose, 'navigate_to_pose')

    # Wait for action server
    action_client.wait_for_server()

    # Create goal for navigation to kitchen
    goal_msg = NavigateToPose.Goal()
    goal_msg.pose.header.frame_id = 'map'
    goal_msg.pose.pose.position.x = 2.0  # Kitchen x-coordinate
    goal_msg.pose.pose.position.y = 1.0  # Kitchen y-coordinate
    goal_msg.pose.pose.position.z = 0.0
    goal_msg.pose.pose.orientation.w = 1.0

    # Send goal
    future = action_client.send_goal_async(goal_msg)

    # Wait for result
    rclpy.spin_until_future_complete(node, future)

    node.destroy_node()
    rclpy.shutdown()
```

## Testing Complex Commands

### Multi-step Commands

#### Test Case 4: Navigate and Manipulate
1. **Command**: "Go to the kitchen and pick up the red cup"
2. **Expected Behavior**:
   - Robot navigates to kitchen
   - Detects red cup
   - Approaches and grasps the cup
3. **Validation**: Check if both navigation and manipulation succeed

```python
# Example test script for multi-step command
import rclpy
from vla_pipeline.command_executor import CommandExecutor
import time

def test_multistep_command():
    rclpy.init()
    node = rclpy.create_node('test_multistep')

    # Initialize command executor
    executor = CommandExecutor(node)

    # Define complex command sequence
    command_sequence = [
        {
            "type": "navigation",
            "action": "navigate_to",
            "parameters": {"location": "kitchen"}
        },
        {
            "type": "perception",
            "action": "detect_object",
            "parameters": {"object": "red_cup"}
        },
        {
            "type": "manipulation",
            "action": "pick_up",
            "parameters": {"object": "red_cup"}
        }
    ]

    # Execute sequence
    results = executor.execute_sequence(command_sequence)

    # Validate results
    success = all(result["status"] == "success" for result in results)
    print(f"Multi-step command success: {success}")

    node.destroy_node()
    rclpy.shutdown()
```

## Audio Simulation and Testing

### Simulating Audio Input

Since we're in a simulation environment, we need to simulate audio input for testing:

```python
# Audio simulation for testing
import wave
import numpy as np
import struct

class AudioSimulator:
    def __init__(self):
        self.sample_rate = 16000
        self.channels = 1
        self.sample_width = 2  # 16-bit

    def generate_test_audio(self, text_command: str, filename: str):
        """
        Generate simulated audio file for a text command
        In a real implementation, this would use text-to-speech
        """
        # For simulation purposes, we'll create a simple placeholder
        # In practice, you would use a TTS system to generate actual audio

        # Create a simple tone pattern to simulate speech
        duration = len(text_command) * 0.1  # Approximate duration
        frames = int(duration * self.sample_rate)

        # Generate simple waveform (in practice, use TTS)
        wave_data = []
        for i in range(frames):
            # Create simple oscillating pattern
            value = int(10000 * np.sin(2 * np.pi * 440 * i / self.sample_rate))
            wave_data.append(struct.pack('<h', value))

        # Write to WAV file
        with wave.open(filename, 'w') as wav_file:
            wav_file.setnchannels(self.channels)
            wav_file.setsampwidth(self.sample_width)
            wav_file.setframerate(self.sample_rate)
            wav_file.writeframes(b''.join(wave_data))

        print(f"Generated test audio for: '{text_command}' -> {filename}")
        return filename

# Example usage
simulator = AudioSimulator()
audio_file = simulator.generate_test_audio("Move forward 2 meters", "test_command.wav")
```

## Performance Testing

### Success Rate Testing

```python
def test_success_rate():
    """Test the success rate of voice command processing"""
    test_commands = [
        ("Move forward", 0.95),  # Expected high success rate
        ("Turn left", 0.95),
        ("Go to the kitchen", 0.90),  # Slightly lower due to complexity
        ("Pick up the red cup", 0.85),  # Lower due to manipulation complexity
        ("Navigate to the living room and turn on the lamp", 0.80)  # Multi-step complexity
    ]

    total_tests = len(test_commands)
    successful_tests = 0

    for command_text, expected_success_rate in test_commands:
        # Simulate processing the command multiple times
        successes = 0
        for _ in range(20):  # Test each command 20 times
            result = simulate_command_processing(command_text)
            if result["success"]:
                successes += 1

        actual_success_rate = successes / 20
        print(f"Command: '{command_text}'")
        print(f"  Expected: {expected_success_rate:.2f}, Actual: {actual_success_rate:.2f}")

        # Count as successful if within 0.1 of expected rate
        if abs(actual_success_rate - expected_success_rate) <= 0.1:
            successful_tests += 1

    overall_success_rate = successful_tests / total_tests
    print(f"\nOverall success rate: {overall_success_rate:.2f} ({successful_tests}/{total_tests})")

    # Validate against 90% requirement
    if overall_success_rate >= 0.90:
        print("✅ Success rate requirement (90%) met")
        return True
    else:
        print("❌ Success rate requirement (90%) not met")
        return False
```

### Latency Testing

```python
def test_processing_latency():
    """Test the latency of voice command processing"""
    import time

    test_commands = [
        "Move forward",
        "Turn left",
        "Go to the kitchen"
    ]

    latencies = []

    for command in test_commands:
        start_time = time.time()

        # Simulate full processing pipeline
        result = simulate_full_pipeline(command)

        end_time = time.time()
        latency = (end_time - start_time) * 1000  # Convert to milliseconds
        latencies.append(latency)

        print(f"Command: '{command}', Latency: {latency:.2f}ms")

    avg_latency = sum(latencies) / len(latencies)
    max_latency = max(latencies)

    print(f"\nAverage latency: {avg_latency:.2f}ms")
    print(f"Maximum latency: {max_latency:.2f}ms")

    # Validate against performance requirements
    # Requirement: < 2 seconds for voice-to-text, < 5 seconds for planning
    if avg_latency < 7000:  # 7 seconds (2+5 for both phases)
        print("✅ Latency requirements met")
        return True
    else:
        print("❌ Latency requirements not met")
        return False
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Audio Not Detected
- **Symptoms**: Voice commands not being processed
- **Solutions**:
  - Check audio input device configuration
  - Verify microphone permissions
  - Test with pre-recorded audio files

#### Issue 2: Low Transcription Accuracy
- **Symptoms**: Commands misinterpreted frequently
- **Solutions**:
  - Improve audio quality (reduce background noise)
  - Adjust Whisper model settings
  - Use higher quality Whisper model (medium/large instead of base)

#### Issue 3: Navigation Failures
- **Symptoms**: Robot fails to reach destinations
- **Solutions**:
  - Verify map accuracy
  - Check navigation parameters
  - Ensure proper localization

#### Issue 4: Manipulation Failures
- **Symptoms**: Robot fails to grasp objects
- **Solutions**:
  - Verify object detection accuracy
  - Check robot kinematics
  - Adjust manipulation parameters

### Debugging Commands

For debugging purposes, the simulation environment supports special commands:

- `debug show_map`: Display the current navigation map
- `debug show_objects`: List detected objects in the environment
- `debug reset_position`: Reset robot to starting position
- `debug log_level [level]`: Set logging level (debug, info, warn, error)

## Validation Criteria

### Success Metrics

The simulation test environment validates against these criteria:

1. **90% Success Rate**: Basic voice commands should succeed 90% of the time
2. **Sub-10 Second Response**: Voice-to-action should complete within 10 seconds
3. **Robust Error Handling**: Clear feedback for ambiguous or impossible commands
4. **Safety Compliance**: No unsafe robot behaviors during execution

### Test Scenarios

The environment includes predefined test scenarios:

1. **Basic Navigation Test**: Simple movement and navigation commands
2. **Object Manipulation Test**: Pick-and-place operations
3. **Multi-step Task Test**: Complex commands with multiple actions
4. **Error Recovery Test**: Handling of failed commands and recovery
5. **Stress Test**: Continuous command processing over extended periods

This simulation test environment provides a comprehensive framework for validating the VLA pipeline with voice commands in a safe, reproducible setting.