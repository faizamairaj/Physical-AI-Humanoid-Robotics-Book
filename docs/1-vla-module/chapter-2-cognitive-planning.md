# Chapter 2: Cognitive Planning with LLMs (Natural Language → ROS2 Actions)

## 2.1 Introduction to Cognitive Planning

Cognitive planning in robotics involves the high-level reasoning that translates user intentions into sequences of executable actions. Large Language Models (LLMs) excel at this task by understanding natural language and generating appropriate action plans.

### Role of LLMs in Robot Decision Making

LLMs serve as the cognitive layer that:
- Interprets natural language commands in context
- Generates action sequences based on environmental information
- Handles ambiguous or complex requests
- Adapts plans based on changing conditions

### Natural Language Understanding for Robotics

For robotics applications, LLMs must:
- Parse complex commands with multiple steps
- Understand spatial relationships and navigation instructions
- Interpret object recognition results
- Generate appropriate action sequences for ROS2 execution

### Planning vs. Reactive Behavior

Cognitive planning differs from reactive behavior:
- Planning: Generates sequences of actions to achieve goals
- Reactive: Responds to immediate environmental stimuli
- Both approaches are necessary for complete robot autonomy

## 2.2 LLM Integration for Action Planning

### Connecting LLMs to Robotic Systems

To integrate LLMs with robotic systems:

1. Set up API access to your chosen LLM (e.g., OpenAI GPT)
2. Define the context and constraints for robot actions
3. Create prompt templates that guide the LLM toward appropriate actions
4. Implement safety checks on generated action sequences

### Context-Aware Planning

Effective cognitive planning requires environmental context:
- Current robot state and position
- Object locations and properties
- Navigation map information
- Task-specific constraints and goals

### Handling Ambiguous Commands

LLMs can handle ambiguous commands by:
- Requesting clarification from the user
- Making reasonable assumptions based on context
- Providing multiple interpretation options
- Fallback to simpler actions when uncertain

## 2.3 Natural Language to ROS2 Action Mapping

### Parsing Natural Language Commands

The mapping process involves:
1. Identifying the main action requested
2. Extracting parameters (locations, objects, quantities)
3. Validating the command against available robot capabilities
4. Generating a sequence of ROS2 actions

### Generating ROS2 Action Sequences

Common mapping patterns:
- "Go to the kitchen" → Navigation goal action
- "Pick up the red cup" → Object recognition + manipulation sequence
- "Turn on the light" → Service call or action for device control

### Error Handling and Clarification

Robust systems implement:
- Validation of generated action sequences
- Safety checks before execution
- Error recovery procedures
- User feedback mechanisms

## 2.4 Mini-Workflow: Command Planning Pipeline

### Implementing the Planning Pipeline

Here's an implementation of the cognitive planning pipeline:

```python
import openai
import json

class CognitivePlanner:
    def __init__(self, api_key):
        openai.api_key = api_key
        self.action_schema = {
            "navigation": ["move_to", "go_to", "navigate_to"],
            "manipulation": ["pick_up", "grasp", "take", "move_object"],
            "interaction": ["turn_on", "turn_off", "activate", "deactivate"]
        }

    def plan_command(self, natural_language_command, environment_context):
        """Generate ROS2 action sequence from natural language"""
        prompt = f"""
        Convert the following natural language command to a sequence of ROS2 actions:

        Command: {natural_language_command}
        Environment Context: {environment_context}

        Return the action sequence in JSON format with the following structure:
        {{
            "actions": [
                {{
                    "type": "navigation|manipulation|interaction",
                    "action": "specific_action_name",
                    "parameters": {{"param1": "value1", ...}}
                }}
            ]
        }}

        Only return valid ROS2 actions that are feasible in the given environment.
        """

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )

        try:
            action_sequence = json.loads(response.choices[0].message.content)
            return self.validate_action_sequence(action_sequence)
        except:
            return {"actions": []}

    def validate_action_sequence(self, action_sequence):
        """Validate that action sequence is safe and executable"""
        # Implementation of validation logic
        validated_actions = []
        for action in action_sequence.get("actions", []):
            if self.is_action_valid(action):
                validated_actions.append(action)
        return {"actions": validated_actions}

    def is_action_valid(self, action):
        """Check if individual action is valid"""
        # Implementation of action validation
        return True

# Example usage
planner = CognitivePlanner(api_key="your-api-key")

command = "Navigate to the kitchen and pick up the red cup"
context = {
    "robot_position": [0, 0, 0],
    "object_locations": {"red cup": [2, 3, 0], "kitchen": [5, 5, 0]},
    "available_actions": ["navigation", "manipulation"]
}

action_sequence = planner.plan_command(command, context)
print(json.dumps(action_sequence, indent=2))
```

### Testing with Complex Commands

Test with complex natural language commands:
- "Navigate to the kitchen and pick up the red cup"
- "Go to the living room and turn on the lamp"
- "Find the blue ball and bring it to me"

### Validating Action Sequences

Before executing, validate:
- All actions are supported by the robot
- Navigation goals are reachable
- Object manipulations are feasible
- Safety constraints are respected

## Summary

This chapter covered cognitive planning with LLMs, showing how natural language commands can be interpreted and translated into ROS2 action sequences. The next chapter combines these components into a complete autonomous humanoid system.