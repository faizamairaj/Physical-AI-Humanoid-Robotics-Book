# Gazebo Quickstart Guide

## Prerequisites

Before starting with Gazebo simulation, ensure you have:

- **ROS 2**: Humble Hawksbill or later installed and sourced
- **Gazebo Garden**: Or compatible version installed
- **Basic ROS 2 Knowledge**: Understanding of topics, services, and launch files
- **System Requirements**:
  - 64-bit processor
  - 8GB+ RAM recommended
  - Compatible graphics card for visualization

## Installation Verification

First, verify your Gazebo installation:

```bash
# Check Gazebo version
gz --version

# Check available simulators
gz sim --list

# Test basic functionality
gz sim
```

## Creating Your First Simulation

### 1. Setting Up the Workspace

Create a workspace for your digital twin examples:

```bash
mkdir -p ~/digital_twin_ws/src
cd ~/digital_twin_ws
colcon build
source install/setup.bash
```

### 2. Basic World File

Create a simple world file `simple_world.sdf` in your workspace:

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="simple_world">
    <!-- Include standard models -->
    <include>
      <uri>model://ground_plane</uri>
    </include>
    <include>
      <uri>model://sun</uri>
    </include>

    <!-- Add a simple robot -->
    <model name="simple_robot">
      <pose>0 0 0.5 0 0 0</pose>
      <link name="chassis">
        <pose>0 0 0.15 0 0 0</pose>
        <collision name="collision">
          <geometry>
            <box>
              <size>0.5 0.3 0.3</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>0.5 0.3 0.3</size>
            </geometry>
          </visual>
        <inertial>
          <mass>1.0</mass>
          <inertia>
            <ixx>0.01</ixx>
            <ixy>0</ixy>
            <ixz>0</ixz>
            <iyy>0.01</iyy>
            <iyz>0</iyz>
            <izz>0.01</izz>
          </inertia>
        </inertial>
      </link>
    </model>
  </world>
</sdf>
```

### 3. Launching the Simulation

Launch your simulation:

```bash
# Method 1: Direct Gazebo launch
gz sim -r simple_world.sdf

# Method 2: Using ROS 2 launch system
ros2 launch your_package simple_world.launch.py
```

## Physics Properties Configuration

### Gravity Settings

By default, Gazebo uses Earth's gravity (9.81 m/s²). To customize:

```xml
<physics name="1ms" type="ode">
  <gravity>0 0 -9.8</gravity>
  <max_step_size>0.001</max_step_size>
  <real_time_factor>1</real_time_factor>
  <real_time_update_rate>1000</real_time_update_rate>
</physics>
```

### Collision Detection

Configure collision properties for your models:

```xml
<collision name="collision">
  <geometry>
    <box>
      <size>1 1 1</size>
    </box>
  </geometry>
  <surface>
    <friction>
      <ode>
        <mu>1.0</mu>
        <mu2>1.0</mu2>
      </ode>
    </friction>
    <bounce>
      <restitution_coefficient>0.1</restitution_coefficient>
      <threshold>100000</threshold>
    </bounce>
    <contact>
      <ode>
        <soft_cfm>0</soft_cfm>
        <soft_erp>0.2</soft_erp>
        <kp>1e+13</kp>
        <kd>1</kd>
        <max_vel>0.01</max_vel>
        <min_depth>0</min_depth>
      </ode>
    </contact>
  </surface>
</collision>
```

## Basic Robot Model

### URDF to SDF Conversion

Create a simple robot using URDF format and convert to SDF if needed:

```xml
<!-- simple_robot.urdf -->
<?xml version="1.0"?>
<robot name="simple_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.3 0.3"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <box size="0.5 0.3 0.3"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.01"/>
    </inertial>
  </link>
</robot>
```

## Launch Files

Create a ROS 2 launch file for your simulation:

```python
# launch/simple_simulation.launch.py
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    world_file = PathJoinSubstitution([
        FindPackageShare('your_package'),
        'worlds',
        'simple_world.sdf'
    ])

    gz_sim = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            FindPackageShare('gazebo_ros'),
            '/launch/gz_sim.launch.py'
        ]),
        launch_arguments={
            'world': world_file,
            'gz_args': '-r'  # Run simulation automatically
        }.items()
    )

    return LaunchDescription([
        gz_sim
    ])
```

## Testing Gravity Effects

To verify gravity is working correctly:

1. Create a world with a robot model
2. Launch the simulation without any controllers
3. Observe the robot falling due to gravity
4. Check that the robot rests on the ground plane

## Testing Collision Detection

To verify collision detection:

1. Create a world with multiple objects
2. Position objects to potentially collide
3. Launch simulation and observe collision behavior
4. Verify objects don't pass through each other

## Common Issues and Solutions

### Issue: Robot falls through ground
**Solution**: Check collision geometry and static properties
- Ensure ground plane has proper collision geometry
- Verify robot is not marked as static

### Issue: Simulation is unstable
**Solution**: Adjust physics parameters
- Reduce max_step_size for better stability
- Adjust solver parameters in physics configuration

### Issue: No visualization
**Solution**: Check graphics drivers and environment
- Ensure proper graphics drivers are installed
- Set proper display environment variables if using remote access

### Issue: High CPU usage
**Solution**: Optimize simulation settings
- Increase max_step_size (reduces accuracy)
- Reduce real_time_update_rate
- Simplify collision geometry

## Next Steps

After completing this quickstart guide, you should be able to:
- Create basic Gazebo world files
- Launch simulations with physics properties
- Verify gravity and collision behavior
- Configure basic robot models

Continue to the next section to learn about advanced physics properties and robot configurations.