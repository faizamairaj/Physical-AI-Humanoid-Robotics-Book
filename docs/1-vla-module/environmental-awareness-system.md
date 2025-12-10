# Environmental Awareness System

## Overview

The Environmental Awareness System (EAS) provides the VLA pipeline with real-time information about the robot's surroundings, including object locations, navigable areas, obstacles, and dynamic elements. This system integrates data from multiple sensors and perception modules to maintain an up-to-date understanding of the environment.

## System Architecture

```
[Sensor Data] → [Perception Processing] → [Environment Model] → [Context Provider] → [VLA Pipeline Components]
     ↑
[LIDAR] [Camera] [IMU] [Joint States] [GPS] etc.
     ↓
[Semantic Mapping] → [Object Tracking] → [Dynamic Updates]
```

## Core Components

### 1. Sensor Data Integration

```python
import threading
import time
from typing import Dict, Any, List, Callable
import logging
from dataclasses import dataclass
from enum import Enum

class SensorType(Enum):
    LIDAR = "lidar"
    CAMERA = "camera"
    RGBD_CAMERA = "rgbd_camera"
    IMU = "imu"
    JOINT_STATE = "joint_state"
    GPS = "gps"
    SONAR = "sonar"

@dataclass
class SensorData:
    """Data structure for sensor information"""
    sensor_id: str
    sensor_type: SensorType
    timestamp: float
    data: Any
    frame_id: str
    quality: float  # 0.0 to 1.0

class SensorManager:
    def __init__(self):
        self.sensors = {}
        self.sensor_data = {}
        self.data_lock = threading.Lock()
        self.logger = logging.getLogger(__name__)
        self.is_running = False
        self.update_thread = None

    def register_sensor(self,
                       sensor_id: str,
                       sensor_type: SensorType,
                       data_callback: Callable[[], Any],
                       update_interval: float = 0.1):
        """Register a new sensor with the system"""
        self.sensors[sensor_id] = {
            'type': sensor_type,
            'callback': data_callback,
            'interval': update_interval,
            'last_update': 0
        }
        self.logger.info(f"Registered sensor {sensor_id} of type {sensor_type.value}")

    def start_sensor_updates(self):
        """Start continuous sensor data collection"""
        self.is_running = True
        self.update_thread = threading.Thread(target=self._sensor_update_loop)
        self.update_thread.start()
        self.logger.info("Sensor updates started")

    def _sensor_update_loop(self):
        """Main loop for collecting sensor data"""
        while self.is_running:
            current_time = time.time()

            for sensor_id, sensor_info in self.sensors.items():
                # Check if it's time to update this sensor
                if current_time - sensor_info['last_update'] >= sensor_info['interval']:
                    try:
                        # Get sensor data
                        sensor_data = sensor_info['callback']()

                        # Create SensorData object
                        data_obj = SensorData(
                            sensor_id=sensor_id,
                            sensor_type=sensor_info['type'],
                            timestamp=current_time,
                            data=sensor_data,
                            frame_id="base_link",  # Default, would be specific to sensor
                            quality=0.9  # Default quality
                        )

                        # Store the data safely
                        with self.data_lock:
                            self.sensor_data[sensor_id] = data_obj

                        sensor_info['last_update'] = current_time

                    except Exception as e:
                        self.logger.error(f"Error getting data from sensor {sensor_id}: {str(e)}")

            time.sleep(0.01)  # Small delay to prevent busy waiting

    def get_sensor_data(self, sensor_id: str) -> Optional[SensorData]:
        """Get the latest data from a specific sensor"""
        with self.data_lock:
            return self.sensor_data.get(sensor_id)

    def get_all_sensor_data(self) -> Dict[str, SensorData]:
        """Get all current sensor data"""
        with self.data_lock:
            return self.sensor_data.copy()

    def stop_sensor_updates(self):
        """Stop sensor data collection"""
        self.is_running = False
        if self.update_thread:
            self.update_thread.join()
        self.logger.info("Sensor updates stopped")
```

### 2. Perception Processing Module

```python
import numpy as np
from typing import Dict, List, Tuple, Optional
import cv2  # For image processing (would be optional in real implementation)
import logging

class PerceptionProcessor:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def process_lidar_data(self, lidar_data: Any) -> Dict[str, Any]:
        """Process LIDAR data to detect obstacles and free space"""
        # In a real implementation, this would process actual LIDAR data
        # For simulation, we'll create a mock implementation

        if hasattr(lidar_data, 'ranges'):
            # Process actual LIDAR ranges
            ranges = lidar_data.ranges
            angles = np.linspace(0, 2*np.pi, len(ranges))

            # Detect obstacles (ranges below a threshold)
            obstacle_threshold = 1.0  # meters
            obstacle_indices = np.where(np.array(ranges) < obstacle_threshold)[0]

            obstacles = []
            for idx in obstacle_indices:
                angle = angles[idx]
                distance = ranges[idx]
                x = distance * np.cos(angle)
                y = distance * np.sin(angle)
                obstacles.append({
                    'position': [x, y, 0.0],
                    'distance': distance,
                    'angle': angle
                })

            return {
                'obstacles': obstacles,
                'free_space': len(ranges) - len(obstacles),
                'min_range': min(ranges) if ranges else float('inf'),
                'max_range': max(ranges) if ranges else 0.0
            }
        else:
            # Mock data for simulation
            return {
                'obstacles': [
                    {'position': [1.5, 0.5, 0.0], 'distance': 1.2, 'angle': 0.5},
                    {'position': [-0.8, 1.2, 0.0], 'distance': 1.5, 'angle': 2.1}
                ],
                'free_space': 80,
                'min_range': 0.3,
                'max_range': 10.0
            }

    def process_camera_data(self, camera_data: Any) -> Dict[str, Any]:
        """Process camera data to detect objects and features"""
        # In a real implementation, this would process actual camera images
        # For simulation, we'll create a mock implementation

        if hasattr(camera_data, 'image'):
            # Process actual image data
            image = camera_data.image
            # Object detection would happen here
            pass
        else:
            # Mock data for simulation
            return {
                'objects': [
                    {'name': 'red_cup', 'position': [2.0, 1.0, 0.8], 'confidence': 0.95},
                    {'name': 'blue_ball', 'position': [3.2, -0.5, 0.8], 'confidence': 0.88}
                ],
                'features': [],
                'image_shape': (480, 640, 3)
            }

    def process_rgbd_data(self, rgbd_data: Any) -> Dict[str, Any]:
        """Process RGB-D camera data for 3D object detection"""
        # In a real implementation, this would process RGB-D data
        # For simulation, we'll create a mock implementation

        return {
            'objects': [
                {'name': 'book', 'position': [1.8, 0.8, 0.9], 'confidence': 0.92, 'dimensions': [0.2, 0.15, 0.03]},
                {'name': 'phone', 'position': [2.1, 0.9, 0.85], 'confidence': 0.89, 'dimensions': [0.15, 0.07, 0.01]}
            ],
            'depth_map': None,  # Would be actual depth data in real implementation
            'confidence_map': None
        }

    def process_imu_data(self, imu_data: Any) -> Dict[str, Any]:
        """Process IMU data for robot orientation and motion"""
        # In a real implementation, this would process actual IMU data
        # For simulation, we'll create a mock implementation

        return {
            'orientation': [0.0, 0.0, 0.0, 1.0],  # quaternion [x, y, z, w]
            'angular_velocity': [0.0, 0.0, 0.0],
            'linear_acceleration': [0.0, 0.0, 9.81],  # gravity
            'tilt_detected': False
        }

    def process_joint_states(self, joint_data: Any) -> Dict[str, Any]:
        """Process joint state data for robot configuration"""
        # In a real implementation, this would process actual joint data
        # For simulation, we'll create a mock implementation

        return {
            'joint_positions': {'joint1': 0.0, 'joint2': 0.0, 'joint3': 0.0},
            'joint_velocities': {'joint1': 0.0, 'joint2': 0.0, 'joint3': 0.0},
            'end_effector_pose': [0.5, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]  # [x,y,z,qx,qy,qz,qw]
        }

    def process_sensor_data(self, sensor_data: SensorData) -> Dict[str, Any]:
        """Process data from a specific sensor based on its type"""
        if sensor_data.sensor_type == SensorType.LIDAR:
            return self.process_lidar_data(sensor_data.data)
        elif sensor_data.sensor_type == SensorType.CAMERA:
            return self.process_camera_data(sensor_data.data)
        elif sensor_data.sensor_type == SensorType.RGBD_CAMERA:
            return self.process_rgbd_data(sensor_data.data)
        elif sensor_data.sensor_type == SensorType.IMU:
            return self.process_imu_data(sensor_data.data)
        elif sensor_data.sensor_type == SensorType.JOINT_STATE:
            return self.process_joint_states(sensor_data.data)
        else:
            self.logger.warning(f"Unknown sensor type: {sensor_data.sensor_type}")
            return {}
```

### 3. Environment Model

```python
from typing import Dict, List, Tuple, Optional
import math
import logging

class EnvironmentModel:
    def __init__(self):
        self.objects = {}  # name -> object_info
        self.obstacles = []  # list of obstacle positions
        self.navigable_areas = []  # list of navigable area definitions
        self.robot_pose = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0]  # [x,y,z,qx,qy,qz,qw]
        self.map_origin = [0.0, 0.0, 0.0]  # [x, y, z] map origin
        self.map_resolution = 0.05  # meters per cell
        self.occupancy_grid = None  # 2D grid of occupancy values
        self.last_update_time = 0.0
        self.logger = logging.getLogger(__name__)

    def update_from_sensor_data(self, processed_data: Dict[str, Any], sensor_type: SensorType):
        """Update the environment model with processed sensor data"""
        if sensor_type == SensorType.LIDAR:
            self._update_from_lidar(processed_data)
        elif sensor_type == SensorType.CAMERA:
            self._update_from_camera(processed_data)
        elif sensor_type == SensorType.RGBD_CAMERA:
            self._update_from_rgbd(processed_data)
        elif sensor_type == SensorType.IMU:
            self._update_from_imu(processed_data)
        elif sensor_type == SensorType.JOINT_STATE:
            self._update_from_joint_states(processed_data)

        self.last_update_time = time.time()

    def _update_from_lidar(self, lidar_data: Dict[str, Any]):
        """Update environment model with LIDAR data"""
        # Update obstacles
        for obstacle in lidar_data.get('obstacles', []):
            pos = obstacle['position']
            # Add or update obstacle in the list
            # In a real implementation, this would update an occupancy grid
            self.obstacles.append(pos)

        # Remove duplicates and keep recent ones
        self.obstacles = list(set(tuple(obs) for obs in self.obstacles))

    def _update_from_camera(self, camera_data: Dict[str, Any]):
        """Update environment model with camera data"""
        for obj in camera_data.get('objects', []):
            name = obj['name']
            position = obj['position']
            confidence = obj['confidence']

            # Update or add object
            self.objects[name] = {
                'position': position,
                'confidence': confidence,
                'last_seen': time.time(),
                'type': self._infer_object_type(name)
            }

    def _update_from_rgbd(self, rgbd_data: Dict[str, Any]):
        """Update environment model with RGB-D data"""
        for obj in rgbd_data.get('objects', []):
            name = obj['name']
            position = obj['position']
            dimensions = obj.get('dimensions', [0.1, 0.1, 0.1])
            confidence = obj['confidence']

            # Update or add object with 3D information
            self.objects[name] = {
                'position': position,
                'dimensions': dimensions,
                'confidence': confidence,
                'last_seen': time.time(),
                'type': self._infer_object_type(name)
            }

    def _update_from_imu(self, imu_data: Dict[str, Any]):
        """Update environment model with IMU data"""
        # Update robot orientation in the model
        orientation = imu_data.get('orientation', [0, 0, 0, 1])
        current_pos = self.robot_pose[:3]
        self.robot_pose = current_pos + orientation

    def _update_from_joint_states(self, joint_data: Dict[str, Any]):
        """Update environment model with joint state data"""
        # Update end effector position if available
        ee_pose = joint_data.get('end_effector_pose')
        if ee_pose:
            self.robot_pose = ee_pose

    def _infer_object_type(self, name: str) -> str:
        """Infer object type from its name"""
        object_types = {
            'cup': 'container',
            'mug': 'container',
            'ball': 'object',
            'book': 'object',
            'phone': 'device',
            'keys': 'object',
            'bottle': 'container'
        }

        for keyword, obj_type in object_types.items():
            if keyword in name.lower():
                return obj_type
        return 'unknown'

    def get_object_location(self, object_name: str) -> Optional[List[float]]:
        """Get the location of a specific object"""
        obj_info = self.objects.get(object_name)
        if obj_info:
            return obj_info['position']
        return None

    def get_reachable_objects(self, max_distance: float = 2.0) -> List[str]:
        """Get list of objects within reach of the robot"""
        reachable = []
        robot_pos = self.robot_pose[:3]

        for name, info in self.objects.items():
            obj_pos = info['position']
            distance = self._calculate_distance(robot_pos, obj_pos)
            if distance <= max_distance:
                reachable.append(name)

        return reachable

    def is_navigable(self, position: List[float]) -> bool:
        """Check if a position is navigable"""
        # Check against obstacles
        for obstacle in self.obstacles:
            distance = self._calculate_distance(position, obstacle[:2])  # Only x,y
            if distance < 0.5:  # 0.5m clearance
                return False

        return True

    def get_navigation_map(self) -> Dict[str, Any]:
        """Get the current navigation map"""
        return {
            'obstacles': self.obstacles,
            'navigable_areas': self.navigable_areas,
            'robot_pose': self.robot_pose
        }

    def _calculate_distance(self, pos1: List[float], pos2: List[float]) -> float:
        """Calculate Euclidean distance between two 3D positions"""
        dx = pos1[0] - pos2[0]
        dy = pos1[1] - pos2[1]
        dz = pos1[2] - pos2[2] if len(pos1) > 2 and len(pos2) > 2 else 0
        return math.sqrt(dx*dx + dy*dy + dz*dz)
```

### 4. Semantic Mapping System

```python
from typing import Dict, List, Tuple
import logging

class SemanticMap:
    def __init__(self):
        self.rooms = {}  # room_name -> room_info
        self.furniture = {}  # furniture_name -> furniture_info
        self.landmarks = {}  # landmark_name -> landmark_info
        self.object_priors = {}  # object_type -> likely_locations
        self.logger = logging.getLogger(__name__)

    def add_room(self, name: str, bounds: List[float], features: List[str] = None):
        """Add a room to the semantic map"""
        self.rooms[name] = {
            'bounds': bounds,  # [min_x, min_y, max_x, max_y]
            'features': features or [],
            'connected_rooms': [],
            'furniture': []
        }

    def add_furniture(self, name: str, position: List[float], room: str, furniture_type: str = "unknown"):
        """Add furniture to the semantic map"""
        self.furniture[name] = {
            'position': position,
            'room': room,
            'type': furniture_type,
            'size': [1.0, 1.0, 1.0]  # default size
        }

        # Add to room's furniture list
        if room in self.rooms:
            self.rooms[room]['furniture'].append(name)

    def add_landmark(self, name: str, position: List[float], description: str = ""):
        """Add a landmark to the semantic map"""
        self.landmarks[name] = {
            'position': position,
            'description': description
        }

    def get_room_for_position(self, position: List[float]) -> Optional[str]:
        """Get the room name for a given position"""
        x, y = position[0], position[1]

        for room_name, room_info in self.rooms.items():
            bounds = room_info['bounds']
            if (bounds[0] <= x <= bounds[2] and bounds[1] <= y <= bounds[3]):
                return room_name

        return None

    def get_objects_in_room(self, room_name: str) -> List[str]:
        """Get all objects typically found in a room"""
        # Use object priors to suggest likely objects in a room
        priors = {
            'kitchen': ['cup', 'plate', 'fork', 'spoon', 'bottle'],
            'living_room': ['book', 'remote', 'pillow', 'coffee_table'],
            'bedroom': ['pillow', 'bed', 'nightstand', 'clothes'],
            'office': ['computer', 'keyboard', 'mouse', 'book', 'pen']
        }

        return priors.get(room_name, [])

    def get_navigation_goals_in_room(self, room_name: str) -> List[Dict[str, Any]]:
        """Get common navigation goals in a room"""
        if room_name not in self.rooms:
            return []

        goals = []

        # Add furniture as potential goals
        for furniture_name in self.rooms[room_name]['furniture']:
            furniture_info = self.furniture[furniture_name]
            goals.append({
                'name': furniture_name,
                'position': furniture_info['position'],
                'type': 'furniture'
            })

        # Add landmarks as potential goals
        for landmark_name, landmark_info in self.landmarks.items():
            if self.get_room_for_position(landmark_info['position']) == room_name:
                goals.append({
                    'name': landmark_name,
                    'position': landmark_info['position'],
                    'type': 'landmark'
                })

        return goals

class SemanticMappingSystem:
    def __init__(self):
        self.semantic_map = SemanticMap()
        self.logger = logging.getLogger(__name__)

    def build_initial_map(self, known_rooms: List[Dict[str, Any]]):
        """Build an initial semantic map from known information"""
        for room_info in known_rooms:
            self.semantic_map.add_room(
                name=room_info['name'],
                bounds=room_info['bounds'],
                features=room_info.get('features', [])
            )

        self.logger.info(f"Initial semantic map built with {len(self.semantic_map.rooms)} rooms")

    def update_with_perception(self, objects: List[Dict[str, Any]]):
        """Update the semantic map with perceived objects"""
        for obj in objects:
            obj_name = obj.get('name', 'unknown')
            obj_position = obj.get('position', [0, 0, 0])

            # Determine which room the object is in
            room = self.semantic_map.get_room_for_position(obj_position)

            if room:
                # Add to object priors for this room type
                if room not in self.semantic_map.object_priors:
                    self.semantic_map.object_priors[room] = []

                if obj_name not in self.semantic_map.object_priors[room]:
                    self.semantic_map.object_priors[room].append(obj_name)

    def get_context_for_command(self, command: str, robot_position: List[float]) -> Dict[str, Any]:
        """Get relevant environmental context for a command"""
        context = {
            'robot_position': robot_position,
            'current_room': self.semantic_map.get_room_for_position(robot_position),
            'nearby_objects': [],
            'navigation_goals': [],
            'constraints': {}
        }

        # Add objects in the current room
        current_room = context['current_room']
        if current_room:
            # Get objects in range
            # This would be implemented based on actual environment model
            pass

        # Add navigation goals relevant to command
        if current_room:
            context['navigation_goals'] = self.semantic_map.get_navigation_goals_in_room(current_room)

        return context
```

### 5. Context Provider for VLA Pipeline

```python
import time
from typing import Dict, Any, Optional
import logging

class EnvironmentContextProvider:
    def __init__(self, environment_model: EnvironmentModel, semantic_system: SemanticMappingSystem):
        self.env_model = environment_model
        self.semantic_system = semantic_system
        self.logger = logging.getLogger(__name__)

    async def get_current_context(self) -> Dict[str, Any]:
        """Get the current environmental context for planning"""
        return {
            'timestamp': time.time(),
            'robot_position': self.env_model.robot_pose[:3],
            'robot_orientation': self.env_model.robot_pose[3:],
            'object_locations': {name: info['position'] for name, info in self.env_model.objects.items()},
            'object_types': {name: info['type'] for name, info in self.env_model.objects.items()},
            'obstacles': self.env_model.obstacles,
            'navigation_map': self.env_model.get_navigation_map(),
            'reachable_objects': self.env_model.get_reachable_objects(),
            'current_room': self.semantic_system.semantic_map.get_room_for_position(self.env_model.robot_pose[:3]),
            'room_objects': self._get_room_objects(),
            'robot_capabilities': ['navigation', 'manipulation', 'perception', 'interaction'],
            'constraints': {
                'forbidden_areas': [],
                'safety_margins': 0.5,
                'max_navigation_distance': 10.0
            }
        }

    def _get_room_objects(self) -> List[str]:
        """Get objects that are likely to be in the current room"""
        robot_pos = self.env_model.robot_pose[:3]
        current_room = self.semantic_system.semantic_map.get_room_for_position(robot_pos)

        if current_room:
            return self.semantic_system.semantic_map.get_objects_in_room(current_room)
        return []

    def get_object_details(self, object_name: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific object"""
        obj_info = self.env_model.objects.get(object_name)
        if obj_info:
            return {
                'position': obj_info['position'],
                'type': obj_info['type'],
                'confidence': obj_info['confidence'],
                'last_seen': obj_info['last_seen'],
                'reachable': self._is_object_reachable(obj_info['position'])
            }
        return None

    def _is_object_reachable(self, position: List[float]) -> bool:
        """Check if an object is reachable from the robot's current position"""
        robot_pos = self.env_model.robot_pose[:3]
        distance = self._calculate_3d_distance(robot_pos, position)
        return distance <= 2.0  # 2 meter reachability

    def _calculate_3d_distance(self, pos1: List[float], pos2: List[float]) -> float:
        """Calculate 3D Euclidean distance"""
        dx = pos1[0] - pos2[0]
        dy = pos1[1] - pos2[1]
        dz = pos1[2] - pos2[2]
        return (dx*dx + dy*dy + dz*dz) ** 0.5

    def get_navigation_context(self) -> Dict[str, Any]:
        """Get context specifically for navigation planning"""
        return {
            'obstacles': self.env_model.obstacles,
            'navigable_areas': self.env_model.navigable_areas,
            'robot_pose': self.env_model.robot_pose,
            'clearance': 0.5,  # minimum clearance in meters
            'path_resolution': 0.1  # path planning resolution
        }

    def get_manipulation_context(self) -> Dict[str, Any]:
        """Get context specifically for manipulation planning"""
        return {
            'reachable_objects': self.env_model.get_reachable_objects(),
            'end_effector_pose': self.env_model.robot_pose,  # Simplified
            'manipulation_workspace': self._get_manipulation_workspace(),
            'object_properties': self._get_object_properties()
        }

    def _get_manipulation_workspace(self) -> Dict[str, float]:
        """Get the robot's manipulation workspace bounds"""
        # Simplified workspace definition
        return {
            'min_x': -1.0, 'max_x': 1.0,
            'min_y': -1.0, 'max_y': 1.0,
            'min_z': 0.2, 'max_z': 1.5
        }

    def _get_object_properties(self) -> Dict[str, Dict[str, Any]]:
        """Get properties for all known objects"""
        properties = {}
        for name, info in self.env_model.objects.items():
            properties[name] = {
                'position': info['position'],
                'type': info['type'],
                'graspable': self._is_object_graspable(info['type']),
                'movable': self._is_object_movable(info['type'])
            }
        return properties

    def _is_object_graspable(self, obj_type: str) -> bool:
        """Check if an object type is graspable"""
        graspable_types = ['object', 'container', 'device']
        return obj_type in graspable_types

    def _is_object_movable(self, obj_type: str) -> bool:
        """Check if an object type is movable"""
        movable_types = ['object', 'container']
        immovable_types = ['furniture', 'structure']

        if obj_type in movable_types:
            return True
        elif obj_type in immovable_types:
            return False
        else:
            return True  # Default to movable for unknown types
```

### 6. Environmental Awareness Manager

```python
class EnvironmentalAwarenessManager:
    def __init__(self):
        self.sensor_manager = SensorManager()
        self.perception_processor = PerceptionProcessor()
        self.environment_model = EnvironmentModel()
        self.semantic_system = SemanticMappingSystem()
        self.context_provider = EnvironmentContextProvider(
            self.environment_model,
            self.semantic_system
        )
        self.logger = logging.getLogger(__name__)
        self.is_active = False

    def initialize_system(self, known_rooms: List[Dict[str, Any]] = None):
        """Initialize the environmental awareness system"""
        # Build initial semantic map if rooms are known
        if known_rooms:
            self.semantic_system.build_initial_map(known_rooms)

        # Start sensor updates
        self.sensor_manager.start_sensor_updates()
        self.is_active = True

        self.logger.info("Environmental awareness system initialized")

    def update_environment(self):
        """Update the environment model with latest sensor data"""
        # Get all current sensor data
        all_sensor_data = self.sensor_manager.get_all_sensor_data()

        # Process each sensor's data
        for sensor_id, sensor_data in all_sensor_data.items():
            try:
                # Process the raw sensor data
                processed_data = self.perception_processor.process_sensor_data(sensor_data)

                # Update the environment model
                self.environment_model.update_from_sensor_data(
                    processed_data,
                    sensor_data.sensor_type
                )

                # Update the semantic map with new information
                if sensor_data.sensor_type in [SensorType.CAMERA, SensorType.RGBD_CAMERA]:
                    self.semantic_system.update_with_perception(processed_data.get('objects', []))

            except Exception as e:
                self.logger.error(f"Error processing sensor data from {sensor_id}: {str(e)}")

    def get_current_context(self) -> Dict[str, Any]:
        """Get the current environmental context"""
        return self.context_provider.get_current_context()

    def get_object_location(self, object_name: str) -> Optional[List[float]]:
        """Get the location of a specific object"""
        return self.environment_model.get_object_location(object_name)

    def is_navigable(self, position: List[float]) -> bool:
        """Check if a position is navigable"""
        return self.environment_model.is_navigable(position)

    def get_reachable_objects(self, max_distance: float = 2.0) -> List[str]:
        """Get objects within reach"""
        return self.environment_model.get_reachable_objects(max_distance)

    def shutdown(self):
        """Shutdown the environmental awareness system"""
        self.sensor_manager.stop_sensor_updates()
        self.is_active = False
        self.logger.info("Environmental awareness system shutdown")
```

## Integration with VLA Pipeline

The Environmental Awareness System integrates with the VLA pipeline through the Context Provider, which supplies real-time environmental information to both the cognitive planning and action execution components. This ensures that plans are based on current environmental conditions and that actions are executed safely with awareness of obstacles and object locations.

The system provides:
1. Real-time object detection and tracking
2. Obstacle detection and navigation planning
3. Semantic mapping of rooms and locations
4. Context-aware planning based on environmental conditions
5. Safety monitoring for action execution

This comprehensive environmental awareness system enables the VLA pipeline to operate effectively in dynamic environments by maintaining an up-to-date understanding of the robot's surroundings.