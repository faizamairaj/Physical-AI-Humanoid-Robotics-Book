# Data Model: Digital Twin (Gazebo & Unity)

## Entity: Gazebo Simulation Environment
**Description**: Represents the physics-based simulation world with gravity, collisions, and dynamics properties
**Attributes**:
- environment_name: String (name of the simulation world)
- gravity_settings: Vector3 (x, y, z components of gravity)
- physics_engine: String (type of physics engine used, e.g., "bullet", "ode", "dart")
- collision_properties: Object (friction, restitution coefficients)
- dynamics_parameters: Object (damping, stiffness parameters)
- robot_models: Array of RobotModel (models present in the environment)
- environment_objects: Array of EnvironmentObject (static objects in the world)

## Entity: Unity Visualization Scene
**Description**: Represents the high-fidelity visual environment for human-robot interaction and rendering
**Attributes**:
- scene_name: String (name of the Unity scene)
- lighting_settings: Object (ambient light, directional light configuration)
- rendering_quality: String (quality level for rendering)
- camera_configurations: Array of CameraConfig (camera positions and settings)
- visual_objects: Array of VisualObject (3D models and textures)
- interaction_elements: Array of InteractionElement (UI elements for human-robot interaction)

## Entity: Sensor Simulation Component
**Description**: Represents simulated sensors (LiDAR, Depth Cameras, IMUs) that generate realistic sensor data
**Attributes**:
- sensor_type: String (type of sensor: "lidar", "depth_camera", "imu")
- sensor_name: String (unique identifier for the sensor)
- mounting_position: Vector3 (position on the robot where sensor is mounted)
- sensor_parameters: Object (specific parameters for each sensor type)
- output_format: String (format of sensor data output)
- update_rate: Number (frequency of sensor data updates)

### Sensor Type Variations
**LiDAR Sensor Parameters**:
- range_min: Number (minimum detection range)
- range_max: Number (maximum detection range)
- resolution: Number (angular resolution)
- scan_angles: Vector2 (horizontal and vertical scan angles)

**Depth Camera Parameters**:
- image_width: Number (width of output image)
- image_height: Number (height of output image)
- fov: Number (field of view)
- depth_range: Vector2 (minimum and maximum depth range)

**IMU Parameters**:
- noise_density: Number (noise level for measurements)
- bias_random_walk: Number (bias drift characteristics)
- measurement_range: Vector3 (range of measurable values)

## Entity: Digital Twin Connection
**Description**: Represents the integration between Gazebo physics simulation and Unity visualization
**Attributes**:
- connection_protocol: String (e.g., "ROS2", "ROS#")
- data_sync_frequency: Number (frequency of data synchronization)
- transformation_data: Object (coordinate system transformations)
- simulation_state: Object (current state of both simulation environments)
- synchronization_status: String (status of the connection)

## Entity: Robot Model
**Description**: Represents a robot model used in both simulation environments
**Attributes**:
- model_name: String (name of the robot model)
- urdf_file: String (path to URDF file)
- sdf_file: String (path to SDF file for Gazebo)
- unity_prefab: String (Unity prefab asset)
- joint_configurations: Array of JointConfig (joint limits and properties)
- link_properties: Array of LinkProperty (mass, geometry, inertial properties)

## Entity: Simulation Workflow
**Description**: Represents the complete workflow for digital twin simulation
**Attributes**:
- workflow_name: String (name of the workflow)
- gazebo_steps: Array of SimulationStep (steps in Gazebo environment)
- unity_steps: Array of VisualizationStep (steps in Unity environment)
- sensor_integration_steps: Array of SensorStep (sensor setup and validation steps)
- validation_criteria: Array of ValidationCriterion (criteria for successful completion)