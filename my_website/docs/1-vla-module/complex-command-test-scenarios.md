# Complex Command Test Scenarios

## Overview

This document outlines comprehensive test scenarios for complex natural language commands that require the full cognitive planning and execution capabilities of the VLA pipeline. These scenarios test the system's ability to handle multi-step tasks, ambiguous commands, and complex environmental interactions.

## Test Scenario Categories

### Category 1: Multi-Step Navigation Tasks

#### Scenario 1.1: "Go to the kitchen and pick up the red cup"
- **Command**: "Go to the kitchen and pick up the red cup"
- **Expected Actions**:
  1. Navigate to kitchen area
  2. Locate red cup using perception
  3. Approach and grasp the red cup
- **Environmental Context**:
  - Kitchen at coordinates [5, 0, 0]
  - Red cup at coordinates [5.5, 0.5, 0.8]
- **Success Criteria**: Robot navigates to kitchen and successfully grasps the red cup
- **Validation**: Check robot's end-effector position and object attachment

#### Scenario 1.2: "Move to the living room, find the blue ball, and bring it to me"
- **Command**: "Move to the living room, find the blue ball, and bring it to me"
- **Expected Actions**:
  1. Navigate to living room
  2. Detect blue ball using perception system
  3. Approach and grasp the blue ball
  4. Navigate back to user position
  5. Release the ball at delivery point
- **Environmental Context**:
  - Living room at coordinates [2, 3, 0]
  - Blue ball at coordinates [2.5, 3.5, 0.8]
  - User position at coordinates [0, 0, 0]
- **Success Criteria**: Robot delivers the blue ball to the user
- **Validation**: Verify object is at user's location

#### Scenario 1.3: "Go to the office, turn on the lamp, and wait for 30 seconds"
- **Command**: "Go to the office, turn on the lamp, and wait for 30 seconds"
- **Expected Actions**:
  1. Navigate to office
  2. Locate and activate lamp using interaction system
  3. Wait for specified duration
- **Environmental Context**:
  - Office at coordinates [-2, 1, 0]
  - Lamp device available at coordinates [-1.5, 1.5, 1.0]
- **Success Criteria**: Lamp is turned on and robot waits for 30 seconds
- **Validation**: Check lamp status and timing

### Category 2: Conditional and Context-Aware Tasks

#### Scenario 2.1: "If you see the red book, pick it up; otherwise, go to the kitchen"
- **Command**: "If you see the red book, pick it up; otherwise, go to the kitchen"
- **Expected Actions**:
  1. Perform perception to detect red book
  2. If book detected: approach and grasp it
  3. If book not detected: navigate to kitchen
- **Environmental Context**:
  - Red book at coordinates [1, 1, 0.8] (for positive case)
  - Kitchen at coordinates [5, 0, 0]
- **Success Criteria**: Robot performs correct action based on book detection
- **Validation**: Check if robot picked up book OR is in kitchen

#### Scenario 2.2: "Navigate to the kitchen only if it's not occupied"
- **Command**: "Navigate to the kitchen only if it's not occupied"
- **Expected Actions**:
  1. Check kitchen occupancy using perception
  2. If not occupied: navigate to kitchen
  3. If occupied: report inability to proceed
- **Environmental Context**:
  - Kitchen at coordinates [5, 0, 0]
  - Occupancy status available through perception system
- **Success Criteria**: Robot only enters kitchen if unoccupied
- **Validation**: Verify robot's position and occupancy check

### Category 3: Time-Sensitive Tasks

#### Scenario 3.1: "Go to the charging station before 6 PM"
- **Command**: "Go to the charging station before 6 PM"
- **Expected Actions**:
  1. Check current time
  2. If before 6 PM: navigate to charging station
  3. If after 6 PM: report deadline missed
- **Environmental Context**:
  - Charging station at coordinates [8, 0, 0]
  - Current time check capability available
- **Success Criteria**: Robot reaches charging station before deadline OR reports appropriately
- **Validation**: Check arrival time and robot status

#### Scenario 3.2: "Monitor the living room for 5 minutes and report any movement"
- **Command**: "Monitor the living room for 5 minutes and report any movement"
- **Expected Actions**:
  1. Navigate to vantage point in living room
  2. Activate monitoring system
  3. Detect and log any movement during 5-minute window
  4. Report findings after timeout
- **Environmental Context**:
  - Living room at coordinates [2, 3, 0]
  - Perception system with motion detection capability
- **Success Criteria**: System monitors for full duration and reports findings
- **Validation**: Check monitoring logs and duration

### Category 4: Complex Manipulation Tasks

#### Scenario 4.1: "Stack the red block on the blue block"
- **Command**: "Stack the red block on the blue block"
- **Expected Actions**:
  1. Locate red and blue blocks using perception
  2. Approach and grasp red block
  3. Navigate to blue block location
  4. Precisely place red block on top of blue block
- **Environmental Context**:
  - Red block at coordinates [1, 1, 0.5]
  - Blue block at coordinates [2, 1, 0.5]
  - Manipulation system with precision placement capability
- **Success Criteria**: Red block is successfully stacked on blue block
- **Validation**: Verify final positions and stability

#### Scenario 4.2: "Pour water from the bottle into the glass"
- **Command**: "Pour water from the bottle into the glass"
- **Expected Actions**:
  1. Locate bottle and glass using perception
  2. Grasp bottle with proper orientation
  3. Navigate to position above glass
  4. Execute pouring motion with appropriate control
- **Environmental Context**:
  - Bottle and glass at known coordinates
  - Manipulation system with pouring capability
- **Success Criteria**: Water is transferred from bottle to glass
- **Validation**: Verify relative positions and simulated liquid transfer

### Category 5: Human Interaction Tasks

#### Scenario 5.1: "Follow me to the garden"
- **Command**: "Follow me to the garden"
- **Expected Actions**:
  1. Activate person-following mode
  2. Detect and track human movement
  3. Maintain safe following distance
  4. Navigate to garden as human leads
- **Environmental Context**:
  - Human detection and tracking capabilities
  - Garden destination at coordinates [10, 5, 0]
- **Success Criteria**: Robot successfully follows human to garden
- **Validation**: Track robot-to-human distance and final position

#### Scenario 5.2: "Greet the person in the room and ask for their name"
- **Command**: "Greet the person in the room and ask for their name"
- **Expected Actions**:
  1. Detect person using perception system
  2. Navigate to appropriate interaction distance
  3. Execute greeting sequence (verbal and physical)
  4. Request name using speech system
- **Environmental Context**:
  - Person detection capability
  - Speech synthesis and recognition systems
- **Success Criteria**: Robot greets person and attempts to get their name
- **Validation**: Check greeting execution and interaction attempt

## Test Implementation Framework

### Test Case Structure

Each test scenario follows this structure:

```python
class VLATestCase:
    def __init__(self, name, command, environment_context, expected_actions):
        self.name = name
        self.command = command
        self.environment_context = environment_context
        self.expected_actions = expected_actions

    def setup_environment(self):
        """Set up the simulation environment for the test"""
        pass

    def execute_test(self):
        """Execute the test scenario"""
        pass

    def validate_results(self):
        """Validate that the results match expectations"""
        pass

    def cleanup(self):
        """Clean up after the test"""
        pass
```

### Test Execution Example

```python
def test_scenario_1_1():
    """Test Scenario 1.1: Go to kitchen and pick up red cup"""

    # Define the test case
    test_case = VLATestCase(
        name="Kitchen Navigation and Cup Pickup",
        command="Go to the kitchen and pick up the red cup",
        environment_context={
            "robot_position": [0, 0, 0],
            "object_locations": {
                "red_cup": [5.5, 0.5, 0.8],
                "kitchen": [5.0, 0.0, 0.0]
            },
            "robot_capabilities": ["navigation", "manipulation"],
            "map_bounds": [-10, -10, 10, 10]
        },
        expected_actions=[
            {"type": "navigation", "action": "navigate_to", "params": {"location": [5.0, 0.0, 0.0]}},
            {"type": "perception", "action": "detect_object", "params": {"object": "red_cup"}},
            {"type": "manipulation", "action": "pick_up", "params": {"object": "red_cup"}}
        ]
    )

    # Setup environment
    test_case.setup_environment()

    # Execute the VLA pipeline
    planner = LLMPlanningModule(api_key="test-key")
    plan_result = planner.plan_command(
        test_case.command,
        PlanContext(**test_case.environment_context)
    )

    if plan_result["success"]:
        executor = ROS2ActionExecutor(simulation_node)
        execution_result = executor.execute_action_sequence(
            plan_result["plan"]["action_sequence"],
            test_case.environment_context["robot_capabilities"],
            test_case.environment_context
        )

        # Validate results
        success = test_case.validate_results(execution_result)
        return success
    else:
        print(f"Planning failed: {plan_result['error']}")
        return False

# Run the test
result = test_scenario_1_1()
print(f"Test Scenario 1.1 Result: {'PASS' if result else 'FAIL'}")
```

### Success Metrics

Each test scenario is evaluated on:

1. **Task Completion Rate**: Percentage of tasks completed successfully
2. **Action Accuracy**: How closely the executed actions match expected actions
3. **Time Efficiency**: Whether tasks are completed within expected timeframes
4. **Safety Compliance**: Whether safety constraints are respected
5. **Error Recovery**: How well the system handles and recovers from errors

### Expected Success Rates

Based on the system requirements:
- **Simple Multi-Step Tasks**: 85% success rate
- **Conditional Tasks**: 80% success rate
- **Time-Sensitive Tasks**: 75% success rate
- **Complex Manipulation**: 70% success rate
- **Human Interaction**: 80% success rate

## Edge Case Scenarios

### Scenario EC-1: Ambiguous Object Reference
- **Command**: "Pick up the cup" (when multiple cups are present)
- **Expected Behavior**: System asks for clarification or identifies the closest cup

### Scenario EC-2: Impossible Task
- **Command**: "Go through the wall to get the object"
- **Expected Behavior**: System explains why the task is impossible and suggests alternatives

### Scenario EC-3: Resource Conflict
- **Command**: "Use the arm to do something while it's already busy"
- **Expected Behavior**: System manages resource conflicts and queues tasks appropriately

### Scenario EC-4: Perception Failure
- **Command**: "Find the blue object" (when no blue object exists)
- **Expected Behavior**: System reports inability to find the requested object

## Validation Framework

The test scenarios are validated using:

1. **Automated Checks**: Scripted validation of robot positions, object states, and action outcomes
2. **Performance Metrics**: Tracking of success rates, response times, and resource usage
3. **Manual Verification**: Human validation of complex interaction scenarios
4. **Repeatability Tests**: Ensuring consistent results across multiple executions

These comprehensive test scenarios ensure the VLA pipeline can handle complex, real-world commands that require sophisticated cognitive planning and multi-step execution.