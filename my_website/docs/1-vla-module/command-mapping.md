# Command Mapping: Voice Commands to ROS2 Actions

## Overview

This document outlines the mapping between natural language voice commands and corresponding ROS2 actions that the robot can execute. The mapping is designed to be intuitive for users while providing precise robot control.

## Basic Movement Commands

### Forward Movement
- **Voice Commands:**
  - "Move forward"
  - "Go forward"
  - "Move ahead"
  - "Go ahead"
  - "Move forward [distance] meters" (e.g., "Move forward 2 meters")

- **ROS2 Action:**
  ```yaml
  action: "geometry_msgs/Twist"
  parameters:
    linear:
      x: [positive_value_based_on_distance]  # m/s
      y: 0.0
      z: 0.0
    angular:
      x: 0.0
      y: 0.0
      z: 0.0
  ```

### Backward Movement
- **Voice Commands:**
  - "Move backward"
  - "Go backward"
  - "Reverse"
  - "Move backward [distance] meters"

- **ROS2 Action:**
  ```yaml
  action: "geometry_msgs/Twist"
  parameters:
    linear:
      x: [negative_value_based_on_distance]  # m/s
      y: 0.0
      z: 0.0
    angular:
      x: 0.0
      y: 0.0
      z: 0.0
  ```

### Turning Commands
- **Voice Commands:**
  - "Turn left"
  - "Rotate left"
  - "Pivot left"
  - "Turn right"
  - "Rotate right"
  - "Pivot right"
  - "Turn left [angle] degrees"
  - "Turn right [angle] degrees"

- **ROS2 Action:**
  ```yaml
  action: "geometry_msgs/Twist"
  parameters:
    linear:
      x: 0.0
      y: 0.0
      z: 0.0
    angular:
      x: 0.0
      y: 0.0
      z: [angular_velocity_based_on_direction_and_angle]  # rad/s
  ```

### Stop Command
- **Voice Commands:**
  - "Stop"
  - "Halt"
  - "Freeze"
  - "Pause"

- **ROS2 Action:**
  ```yaml
  action: "geometry_msgs/Twist"
  parameters:
    linear:
      x: 0.0
      y: 0.0
      z: 0.0
    angular:
      x: 0.0
      y: 0.0
      z: 0.0
  ```

## Navigation Commands

### Go To Location
- **Voice Commands:**
  - "Go to the kitchen"
  - "Navigate to the living room"
  - "Move to the table"
  - "Go to [named_location]"

- **ROS2 Action:**
  ```yaml
  action: "nav2_msgs/action/NavigateToPose"
  parameters:
    pose:
      header:
        frame_id: "map"
      pose:
        position:
          x: [x_coordinate]
          y: [y_coordinate]
          z: [z_coordinate]
        orientation:
          x: 0.0
          y: 0.0
          z: [z_orientation]
          w: [w_orientation]
  ```

## Manipulation Commands

### Pick Up Object
- **Voice Commands:**
  - "Pick up the red cup"
  - "Grasp the blue ball"
  - "Take the book"
  - "Lift the [object_name]"

- **ROS2 Action:**
  ```yaml
  action: "manipulation_msgs/action/PickUp"
  parameters:
    object_name: "[object_name]"
    object_pose:
      position:
        x: [x_coordinate]
        y: [y_coordinate]
        z: [z_coordinate]
      orientation:
        x: [x_orientation]
        y: [y_orientation]
        z: [z_orientation]
        w: [w_orientation]
  ```

### Put Down Object
- **Voice Commands:**
  - "Put down the cup"
  - "Release the ball"
  - "Drop the [object_name]"
  - "Place the [object_name] on the table"

- **ROS2 Action:**
  ```yaml
  action: "manipulation_msgs/action/PutDown"
  parameters:
    object_name: "[object_name]"
    placement_pose:
      position:
        x: [x_coordinate]
        y: [y_coordinate]
        z: [z_coordinate]
      orientation:
        x: [x_orientation]
        y: [y_orientation]
        z: [z_orientation]
        w: [w_orientation]
  ```

## Interaction Commands

### Turn On Device
- **Voice Commands:**
  - "Turn on the light"
  - "Activate the lamp"
  - "Switch on the [device_name]"

- **ROS2 Action:**
  ```yaml
  action: "std_srvs/Trigger"
  service: "/[device_name]/turn_on"
  ```

### Turn Off Device
- **Voice Commands:**
  - "Turn off the light"
  - "Deactivate the lamp"
  - "Switch off the [device_name]"

- **ROS2 Action:**
  ```yaml
  action: "std_srvs/Trigger"
  service: "/[device_name]/turn_off"
  ```

## Query Commands

### Find Object
- **Voice Commands:**
  - "Find the red cup"
  - "Locate the keys"
  - "Where is the [object_name]?"

- **ROS2 Action:**
  ```yaml
  action: "object_detection_msgs/action/DetectObjects"
  parameters:
    target_object: "[object_name]"
    search_area: "current_room"  # or specific coordinates
  ```

## Parameter Extraction

### Distance Extraction
- Pattern: "[command] [distance] meters"
- Examples: "Move forward 2 meters", "Go backward 1.5 meters"
- Extraction: Use regex to find numeric values followed by "meters"

### Angle Extraction
- Pattern: "[turn_command] [angle] degrees"
- Examples: "Turn left 90 degrees", "Turn right 45 degrees"
- Extraction: Use regex to find numeric values followed by "degrees"

### Object Name Extraction
- Pattern: "[action] [the] [object_name]"
- Examples: "Pick up the red cup", "Find the keys"
- Extraction: Use NLP techniques to identify object names after action verbs

## Safety Validation

All command mappings include safety validation:

1. **Distance Limits**: Navigation distances are capped to prevent unsafe movements
2. **Obstacle Detection**: Navigation commands check for obstacles before execution
3. **Manipulation Feasibility**: Manipulation commands verify object accessibility
4. **Speed Limits**: Movement commands respect maximum safe velocities

## Error Handling

### Unknown Commands
- If a command doesn't match any pattern, return a clarification request
- Example: "I didn't understand that command. Did you mean [suggestion]?"

### Ambiguous Commands
- If a command has multiple possible interpretations, ask for clarification
- Example: "Do you want me to go to the kitchen on the left or the right?"

### Unavailable Actions
- If the robot cannot perform a requested action, explain why
- Example: "I cannot pick up that object because it's too heavy"

## Customization

The command mapping system is designed to be customizable:

1. **Adding New Commands**: Define new patterns and corresponding ROS2 actions
2. **Language Support**: Extend patterns for different languages
3. **Context Awareness**: Modify mappings based on robot state or environment
4. **User Preferences**: Adapt to individual user command styles over time

This command mapping system provides a flexible and intuitive interface between natural language voice commands and precise ROS2 robot actions.