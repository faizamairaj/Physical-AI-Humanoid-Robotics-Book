---
title: Isaac AI-Robot Quickstart Guide
sidebar_position: 16
---

# Isaac AI-Robot Quickstart Guide

## Overview

This quickstart guide provides a hands-on introduction to the Isaac AI-Robot Brain, combining Isaac Sim for simulation, Isaac ROS for perception, and Nav2 for navigation. Follow these steps to get your Isaac-based robot navigation system up and running quickly.

## Prerequisites

### System Requirements

Before starting, ensure your system meets these requirements:

#### Hardware
- **NVIDIA GPU**: RTX 3060 or better (8GB+ VRAM recommended)
- **CPU**: Multi-core processor (8+ cores recommended)
- **RAM**: 16GB+ system memory
- **Storage**: 50GB+ available space for Docker images and datasets

#### Software
- **Operating System**: Ubuntu 22.04 LTS
- **NVIDIA Driver**: Version 520+ with CUDA support
- **Docker**: Latest version with NVIDIA Container Toolkit
- **ROS 2**: Humble Hawksbill distribution

### Installation Verification

Verify your system is ready:

```bash
# Check NVIDIA GPU
nvidia-smi

# Check CUDA installation
nvcc --version

# Check Docker
docker --version
docker run --gpus all hello-world

# Check ROS 2
source /opt/ros/humble/setup.bash
ros2 --version
```

## Quick Setup Process

### Step 1: Install Isaac ROS Docker Containers

Pull the necessary Isaac ROS containers:

```bash
# Pull Isaac ROS common container
docker pull nvcr.io/nvidia/isaac-ros/isaac_ros_common:latest

# Pull Isaac ROS perception containers
docker pull nvcr.io/nvidia/isaac-ros/isaac_ros_vslam:latest
docker pull nvcr.io/nvidia/isaac-ros/isaac_ros_image_pipeline:latest

# Pull Isaac Sim (if available in your setup)
docker pull nvcr.io/nvidia/isaac-sim:latest
```

### Step 2: Install Nav2 Packages

Install the Navigation 2 stack:

```bash
# Update package list
sudo apt update

# Install Nav2 packages
sudo apt install ros-humble-navigation2 ros-humble-nav2-bringup

# Install Isaac ROS Nav2 integration
sudo apt install ros-humble-isaac-ros-nav2
```

### Step 3: Create Workspace

Set up your development workspace:

```bash
# Create workspace
mkdir -p ~/isaac_nav_ws/src
cd ~/isaac_nav_ws

# Source ROS 2
source /opt/ros/humble/setup.bash

# Build workspace (if you have Isaac ROS packages in src)
colcon build --symlink-install
source install/setup.bash
```

## Basic Navigation Demo

### Step 4: Launch Isaac ROS Perception

Start the Isaac ROS perception pipeline:

```bash
# Terminal 1: Launch Isaac ROS image processing
source /opt/ros/humble/setup.bash
ros2 launch isaac_ros_image_pipeline image_flip.launch.py
```

### Step 5: Launch Navigation System

In another terminal, launch the navigation system:

```bash
# Terminal 2: Launch Nav2 with Isaac ROS integration
source /opt/ros/humble/setup.bash
ros2 launch nav2_bringup navigation_launch.py \
  use_sim_time:=false \
  params_file:=/opt/ros/humble/share/nav2_bringup/params/nav2_params.yaml
```

### Step 6: Launch Visualization

Launch RViz for visualization:

```bash
# Terminal 3: Launch RViz
source /opt/ros/humble/setup.bash
ros2 run rviz2 rviz2 -d /opt/ros/humble/share/nav2_bringup/rviz/nav2_default_view.rviz
```

## Configuration Quick Reference

### Basic Parameters File

Create a minimal configuration file for testing:

```yaml
# ~/isaac_nav_ws/src/nav2_params_quickstart.yaml
amcl:
  ros__parameters:
    use_sim_time: False
    alpha1: 0.2
    alpha2: 0.2
    alpha3: 0.2
    alpha4: 0.2
    base_frame_id: "base_link"
    global_frame_id: "map"
    odom_frame_id: "odom"
    scan_topic: scan
    tf_broadcast: true

bt_navigator:
  ros__parameters:
    use_sim_time: False
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    default_bt_xml_filename: "navigate_w_replanning_and_recovery.xml"

controller_server:
  ros__parameters:
    use_sim_time: False
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.5
    min_theta_velocity_threshold: 0.001
    progress_checker_plugin: "progress_checker"
    goal_checker_plugin: "goal_checker"
    controller_plugins: ["FollowPath"]
    FollowPath:
      plugin: "nav2_regulated_pure_pursuit_controller::RegulatedPurePursuitController"
      desired_linear_vel: 0.5
      lookahead_dist: 0.6
      min_lookahead_dist: 0.3
      max_lookahead_dist: 0.9

global_costmap:
  ros__parameters:
    use_sim_time: False
    global_frame: map
    robot_base_frame: base_link
    update_frequency: 1.0
    publish_frequency: 1.0
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

local_costmap:
  ros__parameters:
    use_sim_time: False
    global_frame: odom
    robot_base_frame: base_link
    update_frequency: 5.0
    publish_frequency: 2.0
    width: 3
    height: 3
    resolution: 0.05
    robot_radius: 0.35
    plugins: ["obstacle_layer", "inflation_layer"]
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

planner_server:
  ros__parameters:
    expected_planner_frequency: 20.0
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_navfn_planner::NavfnPlanner"
      tolerance: 0.5
      use_astar: false
      allow_unknown: true
```

### Launch with Custom Parameters

Use the custom parameters file:

```bash
# Launch with custom parameters
ros2 launch nav2_bringup navigation_launch.py \
  use_sim_time:=false \
  params_file:=~/isaac_nav_ws/src/nav2_params_quickstart.yaml
```

## Quick Navigation Test

### Send a Navigation Goal

Test navigation by sending a goal in RViz or via command line:

```bash
# Send a simple navigation goal
ros2 action send_goal /navigate_to_pose nav2_msgs/action/NavigateToPose "{
  pose: {
    header: {stamp: {sec: 0, nanosec: 0}, frame_id: 'map'},
    pose: {
      position: {x: 1.0, y: 1.0, z: 0.0},
      orientation: {x: 0.0, y: 0.0, z: 0.0, w: 1.0}
    }
  }
}"
```

### Monitor Navigation Status

Check the navigation status:

```bash
# Monitor navigation feedback
ros2 action list
ros2 action info /navigate_to_pose

# Check navigation logs
source /opt/ros/humble/setup.bash
ros2 launch nav2_bringup tools/launch_logging.launch.py
```

## Isaac Sim Quickstart (Optional)

### Launch Isaac Sim Environment

If you have Isaac Sim installed:

```bash
# Launch Isaac Sim with ROS bridge
docker run --gpus all -it --rm \
  --network host \
  --env "ACCEPT_EULA=Y" \
  --env "LOCAL_UID=$(id -u)" \
  --env "LOCAL_GID=$(id -g)" \
  nvcr.io/nvidia/isaac-sim:latest
```

### Connect Isaac Sim to Navigation

In Isaac Sim, enable the ROS bridge and connect to your navigation system:

1. Open Isaac Sim in the browser interface
2. Enable the ROS 2 bridge extension
3. Configure the bridge to connect to your ROS 2 network
4. Load a robot model with proper ROS 2 interfaces
5. Configure sensors (LiDAR, cameras) to publish to ROS topics

## Troubleshooting Quick Fixes

### Common Issues and Solutions

#### Navigation Not Starting
```bash
# Check if all required nodes are running
ros2 node list

# Check for error messages
source /opt/ros/humble/setup.bash
ros2 launch nav2_bringup tools/launch_logging.launch.py
```

#### Sensor Data Not Available
```bash
# Check available topics
ros2 topic list

# Check sensor data
ros2 topic echo /scan --field ranges[0]  # for LiDAR
ros2 topic echo /camera/image_raw  # for camera
```

#### TF Issues
```bash
# Check TF tree
ros2 run tf2_tools view_frames

# Check specific transforms
ros2 run tf2_ros tf2_echo map base_link
```

#### GPU Memory Issues
```bash
# Check GPU memory usage
nvidia-smi

# Reduce image resolution in Isaac ROS parameters
# Or close other GPU-intensive applications
```

### Quick System Checks

#### Verify Isaac ROS Status
```bash
# Check Isaac ROS components
ros2 component list

# Check Isaac ROS messages
ros2 topic list | grep isaac
```

#### Verify Nav2 Status
```bash
# Check Nav2 lifecycle nodes
ros2 lifecycle list bt_navigator
ros2 lifecycle list controller_server
ros2 lifecycle list planner_server
```

## Performance Optimization Quick Tips

### Basic Optimization

#### Reduce Processing Load
- Lower camera resolution in Isaac ROS parameters
- Reduce costmap resolution in navigation parameters
- Decrease update frequencies for non-critical components
- Use simpler perception models if available

#### Memory Management
- Monitor GPU memory usage with `nvidia-smi`
- Reduce batch sizes in perception pipelines
- Use efficient data structures and message types
- Implement proper resource cleanup

### Quick Parameter Adjustments

#### For Better Performance
```yaml
# In your parameters file, adjust these values:
controller_server:
  ros__parameters:
    controller_frequency: 10.0  # Reduce from 20 if needed
local_costmap:
  ros__parameters:
    resolution: 0.1  # Increase from 0.05 to reduce computation
    width: 2.0  # Reduce from 3.0 to reduce computation
    height: 2.0  # Reduce from 3.0 to reduce computation
```

## Next Steps

### Continue Learning

After completing this quickstart:

1. **Explore Advanced Features**: Try more complex navigation scenarios
2. **Customize Parameters**: Adjust parameters for your specific robot
3. **Add Perception**: Integrate Isaac ROS perception for dynamic obstacle avoidance
4. **Simulation Training**: Use Isaac Sim to generate synthetic training data

### Resources

- Review the detailed chapters on Isaac Sim, Isaac ROS, and Nav2
- Check the official NVIDIA Isaac documentation
- Join the Isaac ROS community forums
- Experiment with different robot models and environments

This quickstart provides a foundation for working with the Isaac AI-Robot Brain. Use this as a starting point to build more sophisticated robotic navigation systems.