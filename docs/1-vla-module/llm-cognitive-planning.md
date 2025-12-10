# LLM Cognitive Planning Module

## Overview

The LLM Cognitive Planning module serves as the intelligent decision-making component of the VLA pipeline. It interprets natural language commands in the context of environmental information and generates appropriate sequences of ROS2 actions to accomplish the requested tasks.

## Architecture

```
[Natural Language Command] → [Context Integration] → [LLM Processing] → [Action Sequence] → [Validation] → [ROS2 Actions]
[Environmental Context] ──┘
```

## Implementation

### Cognitive Planning Core

```python
import openai
import json
import logging
import time
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class ActionType(Enum):
    NAVIGATION = "navigation"
    MANIPULATION = "manipulation"
    INTERACTION = "interaction"
    PERCEPTION = "perception"
    COMPOSITE = "composite"

@dataclass
class ActionStep:
    """Represents a single action in the plan"""
    id: str
    type: ActionType
    action: str
    parameters: Dict[str, Any]
    dependencies: List[str]  # IDs of actions that must complete first
    timeout: int = 60  # seconds

@dataclass
class PlanContext:
    """Environmental context for planning"""
    robot_position: List[float]  # [x, y, z]
    environment_map: str  # Semantic map identifier
    object_locations: Dict[str, List[float]]  # Object name to [x, y, z]
    robot_capabilities: List[str]  # Available robot capabilities
    constraints: Dict[str, Any]  # Safety and operational constraints

class CognitivePlanner:
    def __init__(self, api_key: str, model: str = "gpt-3.5-turbo"):
        """
        Initialize the cognitive planner with LLM access

        Args:
            api_key: OpenAI API key
            model: LLM model to use for planning
        """
        openai.api_key = api_key
        self.model = model
        self.logger = logging.getLogger(__name__)
        self.max_planning_time = 60  # seconds
        self.min_plan_confidence = 0.6

    def generate_plan(self,
                     command: str,
                     context: PlanContext) -> Dict[str, Any]:
        """
        Generate an action plan from a natural language command and context

        Args:
            command: Natural language command from user
            context: Environmental and robot context

        Returns:
            Dictionary containing the action plan and metadata
        """
        start_time = time.time()

        try:
            # Create a detailed prompt for the LLM
            prompt = self._create_planning_prompt(command, context)

            # Call the LLM to generate the plan
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Lower temperature for more consistent planning
                max_tokens=1000
            )

            # Extract and parse the response
            plan_text = response.choices[0].message.content.strip()
            action_sequence = self._parse_llm_response(plan_text)

            # Validate the generated plan
            is_valid, validation_message = self._validate_plan(action_sequence, context)
            if not is_valid:
                return {
                    "success": False,
                    "error": f"Invalid plan generated: {validation_message}",
                    "plan": None,
                    "confidence": 0.0
                }

            # Calculate elapsed time
            elapsed_time = time.time() - start_time

            # Estimate plan confidence based on various factors
            confidence = self._estimate_plan_confidence(
                action_sequence, command, context, response
            )

            result = {
                "success": True,
                "plan": {
                    "command": command,
                    "action_sequence": action_sequence,
                    "context_used": context,
                    "estimated_duration": self._estimate_duration(action_sequence)
                },
                "confidence": confidence,
                "processing_time": elapsed_time
            }

            self.logger.info(f"Plan generated successfully for command: {command[:50]}...")
            return result

        except openai.error.RateLimitError:
            self.logger.warning("OpenAI rate limit exceeded")
            return {
                "success": False,
                "error": "Rate limit exceeded, please try again later",
                "plan": None,
                "confidence": 0.0
            }
        except openai.error.AuthenticationError:
            self.logger.error("OpenAI authentication failed")
            return {
                "success": False,
                "error": "Authentication failed, check API key",
                "plan": None,
                "confidence": 0.0
            }
        except Exception as e:
            elapsed_time = time.time() - start_time
            self.logger.error(f"Error generating plan: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "plan": None,
                "confidence": 0.0,
                "processing_time": elapsed_time
            }

    def _create_planning_prompt(self, command: str, context: PlanContext) -> str:
        """Create a detailed prompt for the LLM planner"""
        return f"""
        Given the following natural language command and environmental context,
        generate a sequence of ROS2 actions to accomplish the task.

        Command: {command}

        Environmental Context:
        - Robot Position: {context.robot_position}
        - Environment Map: {context.environment_map}
        - Object Locations: {json.dumps(context.object_locations, indent=2)}
        - Robot Capabilities: {context.robot_capabilities}
        - Constraints: {json.dumps(context.constraints, indent=2)}

        Generate a JSON-formatted action sequence with the following structure:
        {{
            "actions": [
                {{
                    "id": "unique_action_id",
                    "type": "navigation|manipulation|interaction|perception|composite",
                    "action": "specific_action_name",
                    "parameters": {{"param1": "value1", ...}},
                    "dependencies": ["action_id_1", ...],
                    "timeout": seconds
                }}
            ]
        }}

        Ensure that:
        1. All actions are feasible given the robot's capabilities
        2. Navigation actions have valid destination coordinates
        3. Manipulation actions target objects that exist in the environment
        4. Actions are ordered logically to accomplish the goal
        5. Dependencies are properly specified for sequential actions
        6. Safety constraints are respected

        Only return the JSON action sequence, nothing else.
        """

    def _get_system_prompt(self) -> str:
        """Get the system prompt for consistent behavior"""
        return """
        You are an expert robotic planning system. Your role is to interpret natural language commands
        and generate appropriate sequences of ROS2 actions to accomplish tasks. Always return valid
        JSON with the specified structure. Focus on safety, feasibility, and logical action sequencing.
        """

    def _parse_llm_response(self, response_text: str) -> List[ActionStep]:
        """Parse the LLM response into a sequence of action steps"""
        try:
            # Try to find JSON in the response (in case LLM included other text)
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1

            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                parsed = json.loads(json_str)

                # Extract actions from the parsed JSON
                actions_data = parsed.get("actions", [])

                action_steps = []
                for action_data in actions_data:
                    action_step = ActionStep(
                        id=action_data.get("id", f"action_{len(action_steps)}"),
                        type=ActionType(action_data.get("type", "navigation")),
                        action=action_data.get("action", "unknown"),
                        parameters=action_data.get("parameters", {}),
                        dependencies=action_data.get("dependencies", []),
                        timeout=action_data.get("timeout", 60)
                    )
                    action_steps.append(action_step)

                return action_steps
            else:
                # If no JSON found, return empty list
                self.logger.warning(f"Could not parse JSON from LLM response: {response_text[:100]}...")
                return []

        except json.JSONDecodeError as e:
            self.logger.error(f"Error parsing LLM response as JSON: {str(e)}")
            return []
        except Exception as e:
            self.logger.error(f"Unexpected error parsing LLM response: {str(e)}")
            return []

    def _validate_plan(self, action_sequence: List[ActionStep], context: PlanContext) -> Tuple[bool, str]:
        """Validate that the generated plan is feasible and safe"""
        if not action_sequence:
            return False, "No actions in the plan"

        # Check if all referenced objects exist in the environment
        for action in action_sequence:
            if action.type == ActionType.MANIPULATION:
                # Check if object exists for manipulation
                obj_name = action.parameters.get("object")
                if obj_name and obj_name not in context.object_locations:
                    return False, f"Object '{obj_name}' not found in environment"

            elif action.type == ActionType.NAVIGATION:
                # Check if navigation destination is reasonable
                dest = action.parameters.get("destination")
                if dest and not self._is_valid_navigation_destination(dest, context):
                    return False, f"Invalid navigation destination: {dest}"

        # Check for circular dependencies
        if self._has_circular_dependencies(action_sequence):
            return False, "Plan has circular dependencies"

        return True, "Plan is valid"

    def _is_valid_navigation_destination(self, destination: Any, context: PlanContext) -> bool:
        """Check if a navigation destination is valid"""
        # In a real implementation, this would check against the environment map
        # For now, we'll just verify it's a valid coordinate
        if isinstance(destination, (list, tuple)) and len(destination) >= 2:
            x, y = destination[0], destination[1]
            # Basic bounds checking
            return -100 <= x <= 100 and -100 <= y <= 100
        return False

    def _has_circular_dependencies(self, action_sequence: List[ActionStep]) -> bool:
        """Check if the action sequence has circular dependencies"""
        # Build dependency graph
        graph = {action.id: set(action.dependencies) for action in action_sequence}

        # Check for cycles using DFS
        visited = set()
        rec_stack = set()

        def has_cycle_util(node):
            visited.add(node)
            rec_stack.add(node)

            for dep in graph.get(node, []):
                if dep not in visited:
                    if has_cycle_util(dep):
                        return True
                elif dep in rec_stack:
                    return True

            rec_stack.remove(node)
            return False

        for action in action_sequence:
            if action.id not in visited:
                if has_cycle_util(action.id):
                    return True

        return False

    def _estimate_plan_confidence(self,
                                 action_sequence: List[ActionStep],
                                 command: str,
                                 context: PlanContext,
                                 response: Any) -> float:
        """Estimate confidence in the generated plan"""
        # Base confidence on plan length and complexity
        base_confidence = 0.9 - (len(action_sequence) * 0.05)  # Decrease with more steps

        # Adjust based on command clarity
        if len(command.split()) < 3:
            base_confidence -= 0.1  # Unclear short commands

        # Adjust based on environmental context richness
        if len(context.object_locations) == 0:
            base_confidence -= 0.1  # No object context available

        # Ensure confidence is within bounds
        return max(0.1, min(0.9, base_confidence))

    def _estimate_duration(self, action_sequence: List[ActionStep]) -> int:
        """Estimate the total duration of the action sequence"""
        total_time = 0
        for action in action_sequence:
            total_time += action.timeout
        return total_time

    def handle_ambiguous_command(self, command: str, context: PlanContext) -> Dict[str, Any]:
        """
        Handle commands that are ambiguous and require clarification

        Args:
            command: The ambiguous command
            context: Environmental context

        Returns:
            Dictionary with clarification options
        """
        try:
            prompt = f"""
            The following command is ambiguous: "{command}"

            Environmental Context:
            - Robot Position: {context.robot_position}
            - Object Locations: {json.dumps(context.object_locations, indent=2)}
            - Robot Capabilities: {context.robot_capabilities}

            Identify what information is needed to clarify this command and provide specific options.
            Respond in the following JSON format:
            {{
                "clarification_needed": "description of what needs clarification",
                "options": ["option1", "option2", "option3"],
                "suggested_rephrasing": "suggested clearer command"
            }}
            """

            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that clarifies ambiguous commands."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500
            )

            clarification_data = json.loads(response.choices[0].message.content.strip())

            return {
                "is_ambiguous": True,
                "clarification_needed": clarification_data.get("clarification_needed", ""),
                "options": clarification_data.get("options", []),
                "suggested_rephrasing": clarification_data.get("suggested_rephrasing", "")
            }

        except Exception as e:
            self.logger.error(f"Error handling ambiguous command: {str(e)}")
            return {
                "is_ambiguous": True,
                "clarification_needed": "Command is unclear",
                "options": [],
                "suggested_rephrasing": "Please rephrase your command more specifically"
            }
```

### Natural Language Command Parser

```python
import re
from typing import Dict, List, Optional
import logging

class NaturalLanguageParser:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

        # Define command pattern mappings
        self.command_patterns = {
            # Navigation patterns
            "navigate_to": [
                r"go\s+to\s+(.+)",
                r"move\s+to\s+(.+)",
                r"navigate\s+to\s+(.+)",
                r"head\s+to\s+(.+)",
                r"travel\s+to\s+(.+)"
            ],

            # Manipulation patterns
            "pick_up": [
                r"pick\s+up\s+(.+)",
                r"grab\s+(.+)",
                r"take\s+(.+)",
                r"lift\s+(.+)",
                r"get\s+(.+)"
            ],

            "put_down": [
                r"put\s+down\s+(.+)",
                r"place\s+(.+) (?:down|on .+)",
                r"set\s+(.+) (?:down|on .+)",
                r"release\s+(.+)"
            ],

            "move_object": [
                r"move\s+(.+)\s+to\s+(.+)",
                r"take\s+(.+)\s+to\s+(.+)",
                r"bring\s+(.+)\s+to\s+(.+)"
            ],

            # Interaction patterns
            "turn_on": [
                r"turn\s+on\s+(.+)",
                r"switch\s+on\s+(.+)",
                r"activate\s+(.+)"
            ],

            "turn_off": [
                r"turn\s+off\s+(.+)",
                r"switch\s+off\s+(.+)",
                r"deactivate\s+(.+)"
            ],

            # Perception patterns
            "find_object": [
                r"find\s+(.+)",
                r"locate\s+(.+)",
                r"where\s+is\s+(.+)",
                r"search\s+for\s+(.+)"
            ],

            # Complex patterns
            "sequence": [
                r"(.+)\s+and\s+(.+)",  # "go to kitchen and pick up cup"
                r"(.+)\s+then\s+(.+)",  # "go to kitchen then pick up cup"
            ]
        }

    def parse_command(self, command: str) -> Dict[str, Any]:
        """
        Parse a natural language command and identify its intent and parameters

        Args:
            command: Natural language command string

        Returns:
            Dictionary with parsed command information
        """
        command_lower = command.lower().strip()

        # Try each pattern type
        for intent, patterns in self.command_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, command_lower)
                if match:
                    groups = match.groups()

                    if intent == "sequence":
                        # Handle complex commands with multiple parts
                        return self._parse_sequence_command(command_lower, groups)
                    else:
                        # Handle simple commands
                        return self._parse_simple_command(intent, groups)

        # If no pattern matches, return unknown
        return {
            "intent": "unknown",
            "action_type": None,
            "parameters": [command],
            "raw_command": command
        }

    def _parse_simple_command(self, intent: str, groups: tuple) -> Dict[str, Any]:
        """Parse a simple command with parameters"""
        # Determine action type based on intent
        if intent in ["navigate_to"]:
            action_type = "navigation"
        elif intent in ["pick_up", "put_down", "move_object"]:
            action_type = "manipulation"
        elif intent in ["turn_on", "turn_off"]:
            action_type = "interaction"
        elif intent in ["find_object"]:
            action_type = "perception"
        else:
            action_type = "general"

        # Extract parameters based on intent
        if intent == "navigate_to":
            location = groups[0].strip()
            parameters = {"location": location}
        elif intent in ["pick_up", "put_down"]:
            obj = groups[0].strip()
            parameters = {"object": obj}
        elif intent == "move_object":
            obj = groups[0].strip()
            destination = groups[1].strip()
            parameters = {"object": obj, "destination": destination}
        elif intent in ["turn_on", "turn_off"]:
            device = groups[0].strip()
            parameters = {"device": device}
        elif intent == "find_object":
            obj = groups[0].strip()
            parameters = {"object": obj}
        else:
            parameters = list(groups)

        return {
            "intent": intent,
            "action_type": action_type,
            "parameters": parameters,
            "raw_command": " ".join(groups) if groups else ""
        }

    def _parse_sequence_command(self, command: str, groups: tuple) -> Dict[str, Any]:
        """Parse a command with multiple sequential actions"""
        # Split complex command into parts
        part1 = groups[0].strip()
        part2 = groups[1].strip()

        # Parse each part separately
        parsed_part1 = self.parse_command(part1)
        parsed_part2 = self.parse_command(part2)

        return {
            "intent": "sequence",
            "action_type": "composite",
            "parameters": [parsed_part1, parsed_part2],
            "raw_command": command,
            "sub_commands": [parsed_part1, parsed_part2]
        }

    def extract_entities(self, command: str) -> Dict[str, List[str]]:
        """
        Extract named entities from the command (locations, objects, etc.)

        Args:
            command: Natural language command

        Returns:
            Dictionary of entity types and their values
        """
        entities = {
            "locations": [],
            "objects": [],
            "devices": [],
            "quantities": []
        }

        # Extract potential locations (common room names)
        location_patterns = [
            r"kitchen", r"living room", r"bedroom", r"bathroom", r"office",
            r"hallway", r"dining room", r"garage", r"garage", r"porch",
            r"table", r"chair", r"couch", r"sofa", r"bed"
        ]

        for pattern in location_patterns:
            matches = re.findall(rf"\b{pattern}\b", command.lower())
            entities["locations"].extend(matches)

        # Extract potential objects (common object names)
        object_patterns = [
            r"cup", r"mug", r"book", r"pen", r"phone", r"keys", r"ball",
            r"bottle", r"glass", r"plate", r"fork", r"spoon", r"knife"
        ]

        for pattern in object_patterns:
            matches = re.findall(rf"\b{pattern}\b", command.lower())
            entities["objects"].extend(matches)

        # Extract potential devices
        device_patterns = [
            r"light", r"lamp", r"fan", r"tv", r"television", r"computer",
            r"monitor", r"speaker", r"radio", r"heater", r"ac", r"air conditioning"
        ]

        for pattern in device_patterns:
            matches = re.findall(rf"\b{pattern}\b", command.lower())
            entities["devices"].extend(matches)

        # Extract quantities/numbers
        quantity_matches = re.findall(r"\b\d+(?:\.\d+)?\b", command)
        entities["quantities"] = [float(q) for q in quantity_matches]

        # Remove duplicates while preserving order
        for key in entities:
            seen = set()
            unique_list = []
            for item in entities[key]:
                if item not in seen:
                    seen.add(item)
                    unique_list.append(item)
            entities[key] = unique_list

        return entities
```

### Context-Aware Planning

```python
import math
from typing import Dict, List, Any
import logging

class ContextAwarePlanner:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def enhance_context_with_object_info(self,
                                       context: PlanContext,
                                       command_entities: Dict[str, List[str]]) -> PlanContext:
        """
        Enhance the planning context with relevant object information based on the command

        Args:
            context: Original planning context
            command_entities: Entities extracted from the command

        Returns:
            Enhanced context with additional relevant information
        """
        enhanced_context = context

        # Add information about objects mentioned in the command
        for obj_name in command_entities.get("objects", []):
            if obj_name in context.object_locations:
                # Add detailed object information
                obj_location = context.object_locations[obj_name]

                # Calculate relative position to robot
                robot_pos = context.robot_position
                distance = self._calculate_distance(robot_pos, obj_location)

                # Add to enhanced context
                if not hasattr(enhanced_context, 'object_details'):
                    enhanced_context.object_details = {}

                enhanced_context.object_details[obj_name] = {
                    "location": obj_location,
                    "distance": distance,
                    "reachable": distance < 5.0  # Assuming 5m reachability
                }

        # Add spatial relationships if locations are mentioned
        for location in command_entities.get("locations", []):
            # In a real implementation, this would look up location coordinates
            # For now, we'll just log that the location was mentioned
            self.logger.info(f"Location mentioned in command: {location}")

        return enhanced_context

    def _calculate_distance(self, pos1: List[float], pos2: List[float]) -> float:
        """Calculate Euclidean distance between two 3D positions"""
        if len(pos1) >= 3 and len(pos2) >= 3:
            dx = pos1[0] - pos2[0]
            dy = pos1[1] - pos2[1]
            dz = pos1[2] - pos2[2]
            return math.sqrt(dx*dx + dy*dy + dz*dz)
        elif len(pos1) >= 2 and len(pos2) >= 2:
            # 2D calculation if z-coordinate not available
            dx = pos1[0] - pos2[0]
            dy = pos1[1] - pos2[1]
            return math.sqrt(dx*dx + dy*dy)
        else:
            return float('inf')  # Invalid positions

    def apply_safety_constraints(self,
                               action_sequence: List[ActionStep],
                               context: PlanContext) -> List[ActionStep]:
        """
        Apply safety constraints to the action sequence

        Args:
            action_sequence: Original action sequence
            context: Planning context with constraints

        Returns:
            Action sequence with safety constraints applied
        """
        constrained_sequence = []

        for action in action_sequence:
            # Check if action violates any constraints
            if self._action_violates_constraints(action, context):
                # Modify or skip the action based on constraints
                modified_action = self._modify_for_safety(action, context)
                if modified_action:
                    constrained_sequence.append(modified_action)
            else:
                constrained_sequence.append(action)

        return constrained_sequence

    def _action_violates_constraints(self, action: ActionStep, context: PlanContext) -> bool:
        """Check if an action violates safety constraints"""
        constraints = context.constraints

        if action.type == ActionType.NAVIGATION:
            # Check if navigation destination is in forbidden area
            dest = action.parameters.get("destination")
            if dest and self._is_in_forbidden_area(dest, constraints):
                return True

        elif action.type == ActionType.MANIPULATION:
            # Check if manipulation is too close to obstacles
            obj_location = action.parameters.get("object_location")
            if obj_location and self._is_near_obstacle(obj_location, constraints):
                return True

        return False

    def _is_in_forbidden_area(self, position: List[float], constraints: Dict[str, Any]) -> bool:
        """Check if a position is in a forbidden area"""
        forbidden_areas = constraints.get("forbidden_areas", [])

        for area in forbidden_areas:
            # Area format: [min_x, min_y, max_x, max_y]
            if (len(area) == 4 and
                area[0] <= position[0] <= area[2] and
                area[1] <= position[1] <= area[3]):
                return True

        return False

    def _is_near_obstacle(self, position: List[float], constraints: Dict[str, Any]) -> bool:
        """Check if a position is near an obstacle"""
        safety_margin = constraints.get("safety_margins", 0.5)
        obstacles = constraints.get("obstacles", [])

        for obstacle in obstacles:
            if len(obstacle) >= 2:
                distance = self._calculate_distance(position, obstacle[:2])
                if distance < safety_margin:
                    return True

        return False

    def _modify_for_safety(self, action: ActionStep, context: PlanContext) -> Optional[ActionStep]:
        """Modify an action to comply with safety constraints"""
        # For navigation actions, try to find a safe alternative
        if action.type == ActionType.NAVIGATION:
            # In a real implementation, this would find an alternative route
            # For now, we'll just return None to skip the action
            self.logger.warning(f"Skipping navigation action due to safety constraints: {action.action}")
            return None

        # For other action types, we might be able to adjust parameters
        # rather than completely removing the action
        return action
```

### Main LLM Planning Module

```python
class LLMPlanningModule:
    def __init__(self, api_key: str, model: str = "gpt-3.5-turbo"):
        """
        Main module for LLM-based cognitive planning

        Args:
            api_key: OpenAI API key
            model: LLM model to use for planning
        """
        self.planner = CognitivePlanner(api_key, model)
        self.parser = NaturalLanguageParser()
        self.context_aware_planner = ContextAwarePlanner()
        self.logger = logging.getLogger(__name__)

    def plan_command(self,
                    command: str,
                    context: PlanContext) -> Dict[str, Any]:
        """
        Plan a command using LLM-based cognitive planning

        Args:
            command: Natural language command
            context: Environmental and robot context

        Returns:
            Dictionary with planning results
        """
        try:
            # Step 1: Parse the natural language command
            self.logger.info(f"Parsing command: {command}")
            parsed_command = self.parser.parse_command(command)

            # Step 2: Extract entities for context enhancement
            entities = self.parser.extract_entities(command)

            # Step 3: Enhance context with command-specific information
            enhanced_context = self.context_aware_planner.enhance_context_with_object_info(
                context, entities
            )

            # Step 4: Generate the action plan
            self.logger.info("Generating action plan with LLM...")
            plan_result = self.planner.generate_plan(command, enhanced_context)

            if plan_result["success"]:
                # Step 5: Apply safety constraints
                constrained_actions = self.context_aware_planner.apply_safety_constraints(
                    plan_result["plan"]["action_sequence"],
                    enhanced_context
                )

                # Update the plan with constrained actions
                plan_result["plan"]["action_sequence"] = constrained_actions
                plan_result["plan"]["context_used"] = enhanced_context

                self.logger.info(f"Plan generated successfully with {len(constrained_actions)} actions")

            return plan_result

        except Exception as e:
            self.logger.error(f"Error in planning process: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "plan": None,
                "confidence": 0.0
            }

    def handle_ambiguous_command(self, command: str, context: PlanContext) -> Dict[str, Any]:
        """Handle commands that require clarification"""
        return self.planner.handle_ambiguous_command(command, context)

    def validate_plan_feasibility(self,
                                 action_sequence: List[ActionStep],
                                 context: PlanContext) -> Tuple[bool, str]:
        """Validate if a plan is feasible with current context"""
        return self.planner._validate_plan(action_sequence, context)
```

## Usage Example

```python
# Initialize the LLM planning module
planning_module = LLMPlanningModule(api_key="your-openai-api-key")

# Define the environmental context
context = PlanContext(
    robot_position=[0.0, 0.0, 0.0],
    environment_map="home_map_v1",
    object_locations={
        "red_cup": [2.0, 1.5, 0.8],
        "blue_ball": [3.2, -1.0, 0.8],
        "kitchen": [5.0, 0.0, 0.0]
    },
    robot_capabilities=["navigation", "manipulation", "perception"],
    constraints={
        "forbidden_areas": [[4.5, -0.5, 5.5, 0.5]],  # Area around kitchen entrance
        "safety_margins": 0.5
    }
)

# Plan a complex command
command = "Go to the kitchen and pick up the red cup"
result = planning_module.plan_command(command, context)

if result["success"]:
    plan = result["plan"]
    print(f"Generated plan with {len(plan['action_sequence'])} actions:")
    for i, action in enumerate(plan["action_sequence"]):
        print(f"  {i+1}. {action.type.value}: {action.action} with params {action.parameters}")
    print(f"Confidence: {result['confidence']:.2f}")
else:
    print(f"Planning failed: {result['error']}")

# Handle ambiguous commands
ambiguous_command = "Pick up the cup"
clarification = planning_module.handle_ambiguous_command(ambiguous_command, context)
if clarification["is_ambiguous"]:
    print("Need clarification:", clarification["clarification_needed"])
    print("Options:", clarification["options"])
```

## Error Handling and Clarification

The LLM cognitive planning module includes sophisticated error handling:

1. **API Error Handling**: Manages OpenAI API errors like rate limits and authentication failures
2. **Ambiguity Detection**: Identifies unclear commands and provides clarification options
3. **Feasibility Validation**: Ensures generated plans are possible with available resources
4. **Safety Constraint Enforcement**: Applies safety rules to prevent dangerous actions

This cognitive planning module provides the intelligence layer that transforms natural language into executable robot actions, considering environmental context and safety constraints.