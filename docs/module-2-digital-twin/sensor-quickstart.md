# Sensor Simulation Quickstart Guide

## Prerequisites

Before starting with sensor simulation, ensure you have:

- **ROS 2**: Humble Hawksbill or later installed and sourced
- **Gazebo Garden**: Or compatible version with sensor plugins
- **Basic ROS 2 Knowledge**: Understanding of sensor message types
- **Gazebo Simulation**: Working physics simulation environment
- **System Requirements**: Adequate processing power for sensor simulation

## Overview of Sensor Types

This guide covers three primary sensor types commonly used in robotics:

1. **LiDAR Sensors**: Generate 3D point clouds for mapping and obstacle detection
2. **Depth Cameras**: Provide 2.5D information combining color and depth data
3. **IMU Sensors**: Measure orientation and acceleration for navigation

## LiDAR Sensor Setup

### 1. Basic LiDAR Configuration

Create a simple LiDAR sensor configuration in your robot's SDF file:

```xml
<sensor name="lidar_sensor" type="lidar">
  <pose>0.5 0 0.3 0 0 0</pose>
  <topic>lidar_scan</topic>
  <update_rate>10</update_rate>
  <ray>
    <scan>
      <horizontal>
        <samples>360</samples>
        <resolution>1</resolution>
        <min_angle>-3.14159</min_angle>
        <max_angle>3.14159</max_angle>
      </horizontal>
    </scan>
    <range>
      <min>0.1</min>
      <max>30.0</max>
      <resolution>0.01</resolution>
    </range>
    <noise>
      <type>gaussian</type>
      <mean>0.0</mean>
      <stddev>0.01</stddev>
    </noise>
  </ray>
</sensor>
```

### 2. Launching LiDAR Simulation

To launch a simulation with LiDAR:

```bash
# Launch your simulation with LiDAR sensor
gz sim -r your_world_with_lidar.sdf

# Monitor LiDAR data in another terminal
source /opt/ros/humble/setup.bash
ros2 topic echo /lidar_scan sensor_msgs/msg/LaserScan
```

### 3. LiDAR Data Analysis

LiDAR data is published as `sensor_msgs/LaserScan` messages containing:
- `ranges`: Array of distance measurements
- `intensities`: Optional intensity values
- `angle_min`, `angle_max`: Angular range of the scan
- `angle_increment`: Angular resolution
- `time_increment`: Time between measurements
- `scan_time`: Time between scans
- `range_min`, `range_max`: Valid range of measurements

## Depth Camera Setup

### 1. Basic Depth Camera Configuration

Add a depth camera to your robot:

```xml
<sensor name="depth_camera" type="depth_camera">
  <pose>0.1 0 0.2 0 0 0</pose>
  <topic>depth_camera/depth/image_raw</topic>
  <camera>
    <horizontal_fov>1.047</horizontal_fov>
    <image>
      <width>640</width>
      <height>480</height>
    </image>
    <clip>
      <near>0.1</near>
      <far>10</far>
    </clip>
  </camera>
  <noise>
    <type>gaussian</type>
    <mean>0.0</mean>
    <stddev>0.01</stddev>
  </noise>
</sensor>
```

### 2. Launching Depth Camera Simulation

```bash
# Launch simulation with depth camera
gz sim -r your_world_with_camera.sdf

# Monitor depth camera data
source /opt/ros/humble/setup.bash
ros2 topic echo /depth_camera/depth/image_raw sensor_msgs/msg/Image
ros2 topic echo /depth_camera/color/image_raw sensor_msgs/msg/Image
```

### 3. Depth Camera Data Analysis

Depth camera provides multiple data streams:
- `depth/image_raw`: Depth information (16-bit float)
- `color/image_raw`: Color image data (8-bit RGB)
- `camera_info`: Camera calibration parameters

## IMU Sensor Setup

### 1. Basic IMU Configuration

Add an IMU sensor to your robot:

```xml
<sensor name="imu_sensor" type="imu">
  <pose>0 0 0.1 0 0 0</pose>
  <topic>imu/data</topic>
  <update_rate>100</update_rate>
  <imu>
    <angular_velocity>
      <x>
        <noise>
          <type>gaussian</type>
          <mean>0.0</mean>
          <stddev>0.001</stddev>
        </noise>
      </x>
      <y>
        <noise>
          <type>gaussian</type>
          <mean>0.0</mean>
          <stddev>0.001</stddev>
        </noise>
      </y>
      <z>
        <noise>
          <type>gaussian</type>
          <mean>0.0</mean>
          <stddev>0.001</stddev>
        </noise>
      </z>
    </angular_velocity>
    <linear_acceleration>
      <x>
        <noise>
          <type>gaussian</type>
          <mean>0.0</mean>
          <stddev>0.017</stddev>
        </noise>
      </x>
      <y>
        <noise>
          <type>gaussian</type>
          <mean>0.0</mean>
          <stddev>0.017</stddev>
        </noise>
      </y>
      <z>
        <noise>
          <type>gaussian</type>
          <mean>0.0</mean>
          <stddev>0.017</stddev>
        </noise>
      </z>
    </linear_acceleration>
  </imu>
</sensor>
```

### 2. Launching IMU Simulation

```bash
# Launch simulation with IMU
gz sim -r your_world_with_imu.sdf

# Monitor IMU data
source /opt/ros/humble/setup.bash
ros2 topic echo /imu/data sensor_msgs/msg/Imu
```

### 3. IMU Data Analysis

IMU data is published as `sensor_msgs/Imu` messages containing:
- `orientation`: Quaternion representing orientation
- `angular_velocity`: Angular velocity in x, y, z
- `linear_acceleration`: Linear acceleration in x, y, z
- Covariance matrices for uncertainty information

## Sensor Integration in Simulation

### 1. Complete Robot with Multiple Sensors

Here's an example of a robot with all three sensor types:

```xml
<model name="robot_with_sensors">
  <link name="base_link">
    <!-- Robot chassis -->
    <collision name="collision">
      <geometry>
        <box><size>0.5 0.3 0.3</size></box>
      </geometry>
    </collision>
    <visual name="visual">
      <geometry>
        <box><size>0.5 0.3 0.3</size></box>
      </geometry>
    </visual>
    <inertial>
      <mass>1.0</mass>
      <inertia><ixx>0.01</ixx><ixy>0</ixy><ixz>0</ixz><iyy>0.01</iyy><iyz>0</iyz><izz>0.01</izz></inertia>
    </inertial>
  </link>

  <!-- LiDAR sensor -->
  <sensor name="lidar" type="lidar">
    <pose>0.2 0 0.4 0 0 0</pose>
    <topic>lidar_scan</topic>
    <update_rate>10</update_rate>
    <ray>
      <scan><horizontal><samples>360</samples><resolution>1</resolution><min_angle>-3.14</min_angle><max_angle>3.14</max_angle></horizontal></scan>
      <range><min>0.1</min><max>10.0</max><resolution>0.01</resolution></range>
    </ray>
  </sensor>

  <!-- Depth camera -->
  <sensor name="camera" type="depth_camera">
    <pose>0.1 0 0.3 0 0 0</pose>
    <topic>depth_camera</topic>
    <camera><horizontal_fov>1.047</horizontal_fov><image><width>640</width><height>480</height></image><clip><near>0.1</near><far>10</far></clip></camera>
  </sensor>

  <!-- IMU sensor -->
  <sensor name="imu" type="imu">
    <pose>0 0 0.2 0 0 0</pose>
    <topic>imu/data</topic>
    <update_rate>100</update_rate>
  </sensor>
</model>
```

### 2. Monitoring All Sensors

Monitor all sensor data simultaneously:

```bash
# Terminal 1: Launch simulation
gz sim -r robot_with_sensors.sdf

# Terminal 2: Monitor LiDAR
source /opt/ros/humble/setup.bash
ros2 topic echo /lidar_scan sensor_msgs/msg/LaserScan

# Terminal 3: Monitor camera
ros2 topic echo /depth_camera/depth/image_raw sensor_msgs/msg/Image

# Terminal 4: Monitor IMU
ros2 topic echo /imu/data sensor_msgs/msg/Imu
```

## Validation and Testing

### 1. Basic Validation Tests

Verify each sensor is working properly:

#### LiDAR Validation
```bash
# Check if topic exists and has data
ros2 topic list | grep lidar
ros2 topic info /lidar_scan

# Check data rate
ros2 topic hz /lidar_scan
```

#### Camera Validation
```bash
# Check image dimensions and format
ros2 topic echo /depth_camera/color/image_raw --field width
ros2 topic echo /depth_camera/color/image_raw --field height
```

#### IMU Validation
```bash
# Check if values are reasonable (around 9.8 for gravity in z-axis)
ros2 topic echo /imu/data --field linear_acceleration.z
```

### 2. Visualization Tools

Use RViz2 to visualize sensor data:

```bash
# Launch RViz2
source /opt/ros/humble/setup.bash
rviz2

# Add displays for:
# - LaserScan for LiDAR data
# - Image for camera data
# - Imu for IMU data
# - RobotModel to see robot state
```

## Common Issues and Solutions

### Issue: No sensor data being published
**Solution**:
- Check sensor configuration in SDF/URDF
- Verify Gazebo simulation is running
- Check topic names match between configuration and monitoring

### Issue: Unrealistic sensor values
**Solution**:
- Verify sensor mounting position and orientation
- Check noise parameters and range limits
- Ensure physics simulation is active

### Issue: High CPU usage with sensors
**Solution**:
- Reduce update rates for less critical sensors
- Lower resolution parameters
- Simplify environment geometry

### Issue: Sensor data lag or delay
**Solution**:
- Check real-time factor in physics configuration
- Optimize simulation step size
- Verify network performance if using distributed simulation

## Best Practices

1. **Realistic Parameters**: Use sensor parameters that match real hardware specifications
2. **Appropriate Update Rates**: Balance between data quality and performance
3. **Noise Modeling**: Include realistic noise models for authentic behavior
4. **Coordinate Frames**: Ensure consistent coordinate systems across sensors
5. **Validation**: Regularly validate sensor outputs against expected ranges

## Next Steps

After completing this quickstart guide, you should be able to:
- Configure LiDAR, depth camera, and IMU sensors in Gazebo
- Launch simulations with multiple sensor types
- Monitor and validate sensor data streams
- Integrate sensors into a complete robot model

Continue to the next section to learn about advanced sensor fusion techniques and data processing.