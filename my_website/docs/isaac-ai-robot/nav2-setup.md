---
title: Nav2 Setup - Configuration & Deployment
sidebar_position: 14
---

# Nav2 Setup: Configuration & Deployment

## Overview

Setting up Nav2 (Navigation 2) for your robot requires careful configuration of parameters, maps, and system components to ensure reliable and efficient navigation. This guide provides comprehensive instructions for configuring Nav2 with Isaac ROS components to create a complete navigation system for humanoid robots.

## System Prerequisites

### Software Requirements

#### ROS 2 Environment
- **ROS 2 Distribution**: Humble Hawksbill (recommended) or newer
- **RMW Implementation**: Fast DDS or Cyclone DDS for communication
- **Python Version**: Python 3.8 or newer
- **System Dependencies**: All required ROS 2 packages and system libraries

#### Isaac ROS Integration
- **Isaac ROS Packages**: Installed and properly configured
- **GPU Drivers**: NVIDIA drivers supporting Isaac ROS packages
- **CUDA Toolkit**: Compatible with Isaac ROS GPU acceleration
- **TensorRT**: For optimized neural network inference

### Hardware Requirements

#### Navigation-Specific Hardware
- **Compute Platform**: NVIDIA Jetson or compatible GPU-enabled platform
- **Sensors**: LIDAR, cameras, IMU for perception and localization
- **Actuators**: Motor controllers and drive system
- **Communication**: Reliable communication between components

#### Performance Requirements
- **CPU**: Multi-core processor for handling navigation computations
- **Memory**: Sufficient RAM for map storage and processing
- **GPU**: NVIDIA GPU for Isaac ROS acceleration
- **Storage**: Fast storage for map data and logs

## Nav2 Installation

### Installation Methods

#### Binary Installation (Recommended)
```bash
# Install Nav2 packages via apt
sudo apt update
sudo apt install ros-humble-navigation2 ros-humble-nav2-bringup
sudo apt install ros-humble-isaac-ros-nav2 ros-humble-isaac-ros-gxf
```

#### Source Installation
```bash
# Create workspace
mkdir -p ~/nav2_isaac_ws/src
cd ~/nav2_isaac_ws

# Clone Nav2 repositories
git clone -b humble https://github.com/ros-planning/navigation2.git
git clone -b humble https://github.com/NVIDIA-ISAAC-ROS/isaac_ros_nav2.git

# Install dependencies
rosdep install --from-paths src --ignore-src -r -y

# Build workspace
colcon build --symlink-install
source install/setup.bash
```

### Isaac ROS Navigation Packages
```bash
# Install Isaac ROS navigation-specific packages
sudo apt install ros-humble-isaac-ros-occupancy-grid-localizer
sudo apt install ros-humble-isaac-ros-point-cloud-occupancy-grid
sudo apt install ros-humble-isaac-ros-gxf-components
```

## Core Configuration Files

### Main Launch File Structure

#### Navigation Stack Launch
Create `nav2_isaac_launch.py`:
```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.conditions import IfCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from nav2_common.launch import RewrittenYaml
import os
from ament_index_python.packages import get_package_share_directory

def generate_launch_description():
    # Package directories
    nav2_bringup_dir = get_package_share_directory('nav2_bringup')
    nav2_isaac_dir = get_package_share_directory('isaac_ros_nav2')

    # Launch configuration variables
    use_sim_time = LaunchConfiguration('use_sim_time')
    params_file = LaunchConfiguration('params_file')
    autostart = LaunchConfiguration('autostart')
    map_yaml_file = LaunchConfiguration('map')

    # Launch arguments
    declare_use_sim_time_argument = DeclareLaunchArgument(
        'use_sim_time',
        default_value='false',
        description='Use simulation/Gazebo clock')

    declare_params_file_cmd = DeclareLaunchArgument(
        'params_file',
        default_value=os.path.join(nav2_isaac_dir, 'params', 'nav2_isaac_params.yaml'),
        description='Full path to the ROS2 parameters file to use for all launched nodes')

    # Include the main Nav2 launch file
    nav2_bringup_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(nav2_bringup_dir, 'launch', 'bringup_launch.py')),
        launch_arguments={
            'map': map_yaml_file,
            'use_sim_time': use_sim_time,
            'params_file': params_file,
            'autostart': autostart}.items())

    # Isaac ROS specific components
    isaac_perception_bridge = Node(
        package='isaac_ros_gxf',
        executable='gxf_isaac_perceptor',
        parameters=[params_file],
        condition=IfCondition(LaunchConfiguration('use_isaac_perception'))
    )

    ld = LaunchDescription()
    ld.add_action(declare_use_sim_time_argument)
    ld.add_action(declare_params_file_cmd)
    ld.add_action(nav2_bringup_launch)
    ld.add_action(isaac_perception_bridge)

    return ld
```

### Parameter Configuration

#### Main Parameters File
Create `nav2_isaac_params.yaml`:
```yaml
amcl:
  ros__parameters:
    use_sim_time: False
    alpha1: 0.2
    alpha2: 0.2
    alpha3: 0.2
    alpha4: 0.2
    alpha5: 0.2
    base_frame_id: "base_footprint"
    beam_skip_distance: 0.5
    beam_skip_error_threshold: 0.9
    beam_skip_threshold: 0.3
    do_beamskip: false
    global_frame_id: "map"
    lambda_short: 0.1
    likelihood_max_dist: 2.0
    max_beams: 60
    max_particles: 2000
    min_particles: 500
    odom_frame_id: "odom"
    pf_err: 0.05
    pf_z: 0.99
    recovery_alpha_fast: 0.0
    recovery_alpha_slow: 0.0
    resample_interval: 1
    robot_model_type: "differential"
    save_pose_rate: 0.5
    scan_topic: scan
    sigma_hit: 0.2
    tf_broadcast: true
    transform_tolerance: 1.0
    update_min_a: 0.2
    update_min_d: 0.25
    z_hit: 0.5
    z_max: 0.05
    z_rand: 0.5
    z_short: 0.05
    initial_pose:
      x: 0.0
      y: 0.0
      z: 0.0
      yaw: 0.0

bt_navigator:
  ros__parameters:
    use_sim_time: False
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    default_bt_xml_filename: "navigate_w_replanning_and_recovery.xml"
    plugin_lib_names:
    - nav2_compute_path_to_pose_action_bt_node
    - nav2_follow_path_action_bt_node
    - nav2_back_up_action_bt_node
    - nav2_spin_action_bt_node
    - nav2_wait_action_bt_node
    - nav2_clear_costmap_service_bt_node
    - nav2_is_stuck_condition_bt_node
    - nav2_goal_reached_condition_bt_node
    - nav2_goal_updated_condition_bt_node
    - nav2_initial_pose_received_condition_bt_node
    - nav2_reinitialize_global_localization_service_bt_node
    - nav2_rate_controller_bt_node
    - nav2_distance_controller_bt_node
    - nav2_speed_controller_bt_node
    - nav2_truncate_path_action_bt_node
    - nav2_goal_updater_node_bt_node
    - nav2_recovery_node_bt_node
    - nav2_pipeline_sequence_bt_node
    - nav2_round_robin_node_bt_node
    - nav2_transform_available_condition_bt_node
    - nav2_time_expired_condition_bt_node
    - nav2_path_expiring_timer_condition
    - nav2_distance_traveled_condition_bt_node
    - nav2_single_trigger_bt_node
    - nav2_is_battery_low_condition_bt_node
    - nav2_navigate_through_poses_action_bt_node
    - nav2_navigate_to_pose_action_bt_node
    - nav2_remove_passed_goals_action_bt_node
    - nav2_planner_selector_bt_node
    - nav2_controller_selector_bt_node
    - nav2_goal_checker_selector_bt_node

controller_server:
  ros__parameters:
    use_sim_time: False
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.5
    min_theta_velocity_threshold: 0.001
    failure_tolerance: 0.3
    progress_checker_plugin: "progress_checker"
    goal_checker_plugin: "goal_checker"
    controller_plugins: ["FollowPath"]

    # Isaac ROS specific controller
    FollowPath:
      plugin: "nav2_mppi_controller::Controller"
      time_steps: 50
      control_horizon: 25
      dt: 0.05
      vx_std: 0.2
      vy_std: 0.25
      wz_std: 0.3
      vx_max: 0.5
      vx_min: -0.15
      vy_max: 0.5
      wz_max: 1.0
      acceleration_lim: 2.5
      deceleration_lim: 2.5
      xy_goal_tolerance: 0.25
      yaw_goal_tolerance: 0.25
      stateful: true
      model_dt: 0.05
      discretize_by: "time"
      collision_check:
        collision_cost: 1000.0
        collision_gap: 0.1
        cost_scaling_factor: 10.0
        enable_expensive: false
        finite_differences_step: 0.001
        model_type: "omnidirectional"
        collision_threshold: 0.01
        trajectory_collision_check: false
        collision_check_depth: 2.0
        collision_check_min_distance: 0.1
      critic_align:
        name: "CriticAlign"
        scale: 1.0
        power: 1
        target_yaw: 0.0
        threshold_to_angle: 1.0
      critic_goal:
        name: "CriticGoal"
        scale: 2.0
        power: 1
        threshold_to_angle: 1.0
        threshold_to_final_goal: 0.0
      critic_path:
        name: "CriticPath"
        scale: 3.2
        power: 1
        threshold_to_path: 1.0
        look_ahead_distance: 0.2
      critic_prefer_forward:
        name: "CriticPreferForward"
        scale: 0.1
        power: 3

global_costmap:
  ros__parameters:
    use_sim_time: False
    global_frame: map
    robot_base_frame: base_link
    update_frequency: 1.0
    publish_frequency: 1.0
    track_unknown_space: true
    unknown_cost_value: 50
    lethal_cost_threshold: 99
    always_send_full_costmap: true
    footprint: "[[-0.325, -0.325], [-0.325, 0.325], [0.45, 0.325], [0.45, -0.325]]"
    footprint_padding: 0.01
    resolution: 0.05
    robot_radius: 0.35
    plugins: ["static_layer", "obstacle_layer", "inflation_layer"]
    obstacle_layer:
      plugin: "nav2_costmap_2d::ObstacleLayer"
      enabled: True
      observation_sources: scan
      scan:
        topic: /scan
        max_obstacle_height: 2.0
        clearing: True
        marking: True
        data_type: "LaserScan"
        raytrace_max_range: 3.0
        raytrace_min_range: 0.0
        obstacle_max_range: 2.5
        obstacle_min_range: 0.0
    static_layer:
      plugin: "nav2_costmap_2d::StaticLayer"
      map_subscribe_transient_local: True
    inflation_layer:
      plugin: "nav2_costmap_2d::InflationLayer"
      cost_scaling_factor: 3.0
      inflation_radius: 0.55

local_costmap:
  ros__parameters:
    use_sim_time: False
    global_frame: odom
    robot_base_frame: base_link
    update_frequency: 5.0
    publish_frequency: 2.0
    rolling_window: true
    width: 3
    height: 3
    resolution: 0.05
    footprint: "[[-0.325, -0.325], [-0.325, 0.325], [0.45, 0.325], [0.45, -0.325]]"
    footprint_padding: 0.01
    robot_radius: 0.35
    plugins: ["obstacle_layer", "voxel_layer", "inflation_layer"]
    obstacle_layer:
      plugin: "nav2_costmap_2d::ObstacleLayer"
      enabled: True
      observation_sources: scan
      scan:
        topic: /scan
        max_obstacle_height: 2.0
        clearing: True
        marking: True
        data_type: "LaserScan"
        raytrace_max_range: 3.0
        raytrace_min_range: 0.0
        obstacle_max_range: 2.5
        obstacle_min_range: 0.0
    voxel_layer:
      plugin: "nav2_costmap_2d::VoxelLayer"
      enabled: True
      publish_voxel_map: False
      origin_z: 0.0
      z_resolution: 0.2
      z_voxels: 10
      max_obstacle_height: 2.0
      mark_threshold: 0
      observation_sources: pointcloud
      pointcloud:
        topic: /pointcloud
        max_obstacle_height: 2.0
        clearing: True
        marking: True
        data_type: "PointCloud2"
        min_obstacle_height: 0.0
    inflation_layer:
      plugin: "nav2_costmap_2d::InflationLayer"
      cost_scaling_factor: 3.0
      inflation_radius: 0.55

planner_server:
  ros__parameters:
    expected_planner_frequency: 20.0
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_navfn_planner::NavfnPlanner"
      tolerance: 0.5
      use_astar: false
      allow_unknown: true

smoother_server:
  ros__parameters:
    smoother_plugins: ["simple_smoother"]
    simple_smoother:
      plugin: "nav2_smoother::SimpleSmoother"
      tolerance: 1.0e-10
      max_its: 1000
      do_refinement: True

behavior_server:
  ros__parameters:
    costmap_topic: local_costmap/costmap_raw
    footprint_topic: local_costmap/published_footprint
    cycle_frequency: 10.0
    behavior_plugins: ["spin", "backup", "wait"]
    spin:
      plugin: "nav2_behaviors::Spin"
      spin_dist: 1.57
    backup:
      plugin: "nav2_behaviors::BackUp"
      backup_dist: 0.15
      backup_speed: 0.025
    wait:
      plugin: "nav2_behaviors::Wait"
      wait_duration: 1.0
```

## Isaac ROS Integration Configuration

### Perception Pipeline Configuration

#### Isaac ROS Perception Parameters
Create `isaac_perception_params.yaml`:
```yaml
camera:
  ros__parameters:
    width: 1920
    height: 1080
    fps: 30
    exposure_auto: true
    gain_auto: true
    device_id: 0

isaac_ros_image_pipeline:
  ros__parameters:
    image_width: 1920
    image_height: 1080
    input_qos_depth: 5
    output_qos_depth: 5
    rectified_images: true

isaac_ros_vslam:
  ros__parameters:
    input_width: 1920
    input_height: 1080
    enable_rectification: true
    enable_mapping: true
    enable_localization: true
    enable_fisheye: false
    enable_distortion_correction: true
    enable_occupancy_grid_generation: true
    occupancy_grid_resolution: 0.05
    occupancy_grid_width: 100
    occupancy_grid_height: 100
    occupancy_grid_update_rate: 1.0
    enable_pose_fallback: true
    enable_pose_interpolation: true
    enable_visualization: true
    enable_debug_mode: false
```

### Sensor Configuration

#### LiDAR Configuration
```yaml
lidar:
  ros__parameters:
    frame_id: "lidar_link"
    angle_min: -3.14159
    angle_max: 3.14159
    range_min: 0.1
    range_max: 30.0
    points_per_second: 30000
    topic: "/scan"
    qos: 10
```

#### IMU Configuration
```yaml
imu:
  ros__parameters:
    frame_id: "imu_link"
    topic: "/imu/data"
    orientation_covariance: [0.01, 0.0, 0.0, 0.0, 0.01, 0.0, 0.0, 0.0, 0.01]
    angular_velocity_covariance: [0.01, 0.0, 0.0, 0.0, 0.01, 0.0, 0.0, 0.0, 0.01]
    linear_acceleration_covariance: [0.01, 0.0, 0.0, 0.0, 0.01, 0.0, 0.0, 0.0, 0.01]
```

## Map Configuration

### Static Map Setup

#### Map File Format
Create your map files in the standard ROS format:
```
# Map file: my_map.yaml
image: my_map.pgm
resolution: 0.05  # meters per pixel
origin: [-10.0, -10.0, 0.0]  # x, y, yaw in meters and radians
negate: 0
occupied_thresh: 0.65
free_thresh: 0.196
```

#### Map Server Configuration
```yaml
map_server:
  ros__parameters:
    yaml_filename: "my_map.yaml"
    topic_name: "map"
    frame_id: "map"
    output:
      format: "nav_msgs/MapMetaData"
```

### Semantic Map Integration

#### Isaac ROS Semantic Mapping
```yaml
isaac_ros_semantic_mapper:
  ros__parameters:
    map_resolution: 0.05
    map_width: 200  # in meters
    map_height: 200  # in meters
    update_frequency: 2.0
    max_obstacle_height: 2.0
    min_obstacle_height: 0.0
    enable_3d_mapping: true
    semantic_classes: ["wall", "furniture", "person", "obstacle"]
    object_detection_topic: "/isaac_ros/object_detection"
    semantic_map_topic: "/semantic_map"
```

## Robot Configuration

### Robot Description

#### URDF Configuration
Ensure your robot's URDF includes proper frames for navigation:
```xml
<link name="base_link">
  <visual>
    <geometry>
      <cylinder radius="0.35" length="0.5"/>
    </geometry>
  </visual>
</link>

<link name="base_footprint">
  <visual>
    <geometry>
      <cylinder radius="0.35" length="0.01"/>
    </geometry>
  </visual>
</link>

<link name="lidar_link">
  <visual>
    <geometry>
      <cylinder radius="0.05" length="0.1"/>
    </geometry>
  </visual>
</link>

<joint name="base_to_footprint" type="fixed">
  <parent link="base_link"/>
  <child link="base_footprint"/>
  <origin xyz="0 0 -0.25"/>
</joint>

<joint name="base_to_lidar" type="fixed">
  <parent link="base_link"/>
  <child link="lidar_link"/>
  <origin xyz="0.2 0 0.3"/>
</joint>
```

### TF Configuration

#### Static Transform Publisher
```yaml
static_transform_publisher:
  ros__parameters:
    odom_frame: "odom"
    base_frame: "base_footprint"
    publish_rate: 50.0
```

## Launch and Testing

### Basic Launch Command

#### Complete Navigation System
```bash
# Source your workspace
source ~/nav2_isaac_ws/install/setup.bash

# Launch the complete navigation system
ros2 launch isaac_ros_nav2 nav2_isaac_launch.py \
  params_file:=~/nav2_isaac_ws/src/isaac_ros_nav2/params/nav2_isaac_params.yaml \
  map:=/path/to/your/map.yaml \
  use_sim_time:=false
```

### Testing Procedures

#### Basic Functionality Test
```bash
# Test navigation goal
ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose "{
  pose: {
    header: {stamp: {sec: 0, nanosec: 0}, frame_id: 'map'},
    pose: {
      position: {x: 1.0, y: 1.0, z: 0.0},
      orientation: {x: 0.0, y: 0.0, z: 0.0, w: 1.0}
    }
  }
}"

# Test costmap visualization
ros2 run rviz2 rviz2 -d /opt/nav2/share/nav2_bringup/rviz/nav2_default_view.rviz
```

## Performance Tuning

### Parameter Optimization

#### Costmap Tuning
```yaml
# Adjust for your specific robot and environment
local_costmap:
  ros__parameters:
    width: 6.0   # Increase for larger safety buffer
    height: 6.0  # Increase for larger safety buffer
    resolution: 0.025  # Higher resolution for detailed planning

global_costmap:
  ros__parameters:
    resolution: 0.025  # Higher resolution for detailed planning
    inflation_radius: 0.8  # Adjust for safety margin
```

#### Controller Tuning
```yaml
controller_server:
  ros__parameters:
    controller_frequency: 50.0  # Increase for more responsive control
    min_x_velocity_threshold: 0.0005  # Lower for more precise control
    xy_goal_tolerance: 0.1  # Tighter tolerance for precision
    yaw_goal_tolerance: 0.087  # About 5 degrees in radians
```

## Troubleshooting

### Common Setup Issues

#### TF Tree Issues
- **Missing transforms**: Verify all required frames are published
- **Transform delays**: Check for timing issues in TF publishing
- **Frame naming**: Ensure consistent frame naming across all nodes

#### Sensor Integration Problems
- **Topic mismatches**: Verify topic names match between nodes
- **Message types**: Check that message types are compatible
- **Calibration**: Ensure sensors are properly calibrated

#### Performance Issues
- **CPU utilization**: Monitor CPU usage and optimize parameters
- **Memory usage**: Check for memory leaks in long-running systems
- **Real-time performance**: Ensure navigation loop timing is consistent

### Diagnostic Commands

#### System Health Check
```bash
# Check all running nodes
ros2 node list

# Check topic connections
ros2 topic list

# Monitor TF tree
ros2 run tf2_tools view_frames

# Check navigation status
ros2 lifecycle list bt_navigator
```

#### Performance Monitoring
```bash
# Monitor navigation performance
ros2 run nav2_util performance_tester

# Check CPU and memory usage
htop
nvidia-smi  # For GPU monitoring
```

## Deployment Considerations

### Production Deployment

#### System Optimization
- **Resource allocation**: Ensure adequate CPU, GPU, and memory resources
- **Real-time capabilities**: Consider real-time kernel for deterministic behavior
- **Power management**: Optimize for power consumption if battery operated
- **Thermal management**: Monitor and manage thermal conditions

#### Safety Configuration
- **Safety limits**: Configure appropriate safety limits for your robot
- **Emergency procedures**: Implement proper emergency stop procedures
- **Monitoring**: Set up continuous system monitoring
- **Logging**: Enable appropriate logging for debugging and analysis

This comprehensive setup guide provides all the necessary configuration for deploying Nav2 with Isaac ROS integration for humanoid robot navigation.