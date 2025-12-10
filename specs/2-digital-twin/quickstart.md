# Quickstart: Digital Twin (Gazebo & Unity)

## Prerequisites

Before starting this module, ensure you have:
- ROS 2 (Humble Hawksbill or later) installed and configured
- Gazebo Garden or compatible version installed
- Unity Hub and Unity 2022.3 LTS or later installed
- Basic understanding of ROS 2 concepts (covered in Module 1)

## Environment Setup

### 1. Gazebo Environment Setup
```bash
# Verify Gazebo installation
gz version

# Create a workspace for simulation examples
mkdir -p ~/digital_twin_ws/src
cd ~/digital_twin_ws

# Build the workspace
colcon build
source install/setup.bash
```

### 2. Unity Environment Setup
```bash
# Install ROS# Unity package via Unity Package Manager
# Or import the ROS-TCP-Connector package
```

## Basic Digital Twin Example

### 1. Create a Simple Gazebo World
Create a basic world file `simple_world.sdf`:
```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="simple_world">
    <include>
      <uri>model://ground_plane</uri>
    </include>
    <include>
      <uri>model://sun</uri>
    </include>
    <!-- Add your robot model here -->
  </world>
</sdf>
```

### 2. Launch Gazebo Simulation
```bash
# Launch the simulation
gz sim -r simple_world.sdf
```

### 3. Connect Unity Visualization
1. Open Unity and create a new 3D project
2. Import the ROS# package
3. Configure the ROS bridge connection
4. Set up visualization mapping from Gazebo to Unity

## Running Your First Simulation

### 1. Physics Simulation with Gazebo
```bash
# Launch example with a robot model
ros2 launch your_package simple_simulation.launch.py
```

### 2. Sensor Data Integration
```bash
# Monitor sensor topics
ros2 topic echo /lidar_scan sensor_msgs/msg/LaserScan
ros2 topic echo /depth_camera/depth/image_raw sensor_msgs/msg/Image
ros2 topic echo /imu/data sensor_msgs/msg/Imu
```

### 3. Unity Visualization
1. Run the Unity scene that connects to ROS
2. Observe the synchronized robot movement between Gazebo and Unity
3. Verify sensor data visualization

## Validation Steps

1. **Physics Check**: Verify that gravity affects your robot model in Gazebo
2. **Collision Check**: Ensure your robot collides properly with environment objects
3. **Dynamics Check**: Confirm realistic movement and response to forces
4. **Unity Sync**: Verify that Unity visualization matches Gazebo physics
5. **Sensor Data**: Validate that sensor outputs are generated correctly

## Troubleshooting

### Common Issues:
- **Connection Problems**: Check ROS master URI and network configuration
- **Physics Issues**: Verify URDF/SDF model correctness and physics parameters
- **Visualization Sync**: Ensure both environments use the same coordinate systems
- **Performance**: Reduce simulation complexity if real-time performance is required

### Useful Commands:
```bash
# Check ROS connections
ros2 topic list
ros2 node list

# Debug simulation
gz topic -l  # List Gazebo topics
gz service -l  # List Gazebo services
```

## Next Steps

After completing this quickstart, proceed to:
1. Chapter 1: Gazebo Simulation Basics - Deep dive into physics properties
2. Chapter 2: Unity Integration - Advanced visualization techniques
3. Chapter 3: Sensor Simulation - Detailed sensor configuration and validation