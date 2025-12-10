# Troubleshooting Guide: Digital Twin (Gazebo & Unity)

## Common Issues and Solutions

This guide addresses the most frequently encountered issues when working with digital twin systems combining Gazebo physics simulation and Unity visualization.

## Gazebo-Specific Issues

### 1. Simulation Instability

**Problem**: Robot or objects behave erratically or explode in simulation
**Solution**:
- Reduce `max_step_size` in physics configuration (try 0.001)
- Adjust solver parameters in ODE configuration
- Verify mass and inertia properties are realistic
- Check joint limits and constraints

**Example Physics Configuration**:
```xml
<physics name="1ms" type="ode">
  <max_step_size>0.001</max_step_size>
  <real_time_factor>1</real_time_factor>
  <real_time_update_rate>1000</real_time_update_rate>
  <ode>
    <solver>
      <type>quick</type>
      <iters>10</iters>
      <sor>1.3</sor>
    </solver>
    <constraints>
      <cfm>0.0</cfm>
      <erp>0.2</erp>
      <contact_max_correcting_vel>100.0</contact_max_correcting_vel>
      <contact_surface_layer>0.001</contact_surface_layer>
    </constraints>
  </ode>
</physics>
```

### 2. Objects Falling Through Ground

**Problem**: Models fall through the ground plane or other static objects
**Solution**:
- Verify static property is set to true for immovable objects
- Check collision geometry for proper size and position
- Ensure sufficient contact parameters in physics engine
- Validate that the object has proper mass and inertia

### 3. No Physics Simulation

**Problem**: Objects don't respond to gravity or collisions
**Solution**:
- Ensure simulation is running (not paused)
- Check that models have mass and inertia properties
- Verify physics engine is properly configured
- Confirm that collision elements exist in your model

### 4. High CPU Usage

**Problem**: Gazebo consumes excessive CPU resources
**Solution**:
- Increase `max_step_size` (trade accuracy for performance)
- Reduce `real_time_update_rate`
- Simplify collision geometry (use boxes instead of complex meshes)
- Reduce the number of active objects in simulation

## Unity-Specific Issues

### 1. ROS Connection Problems

**Problem**: Unity cannot connect to ROS network
**Solution**:
- Verify ROS master is running: `ros2 daemon status`
- Check network settings and firewall configurations
- Ensure correct IP addresses and ports are configured
- Verify ROS# package is properly installed

**Network Configuration Check**:
```bash
# Verify ROS network
printenv | grep ROS
# Check if ROS bridge is accessible
ros2 topic list
```

### 2. Robot Model Not Updating

**Problem**: Unity visualization doesn't reflect Gazebo simulation state
**Solution**:
- Check that topic names match between Gazebo and Unity
- Verify joint names in URDF/SDF match Unity joint controllers
- Confirm coordinate system alignment (Gazebo: right-handed, Unity: left-handed)
- Check that ROS messages are being published: `ros2 topic echo /joint_states`

### 3. Performance Issues in Unity

**Problem**: Unity scene runs slowly or has low frame rates
**Solution**:
- Reduce scene complexity and polygon count
- Use Level of Detail (LOD) groups for distant objects
- Optimize lighting and shadows
- Reduce Unity update frequency to match simulation rate

### 4. Coordinate System Mismatches

**Problem**: Robot appears in wrong position or orientation in Unity
**Solution**:
- Implement proper coordinate transformation between Gazebo and Unity
- Verify TF frame relationships
- Check that rotation conventions match (ROS uses quaternions)

## Sensor Simulation Issues

### 1. No Sensor Data

**Problem**: Sensor topics show no data or empty messages
**Solution**:
- Verify sensor is properly configured in SDF/URDF
- Check that sensor plugin is loaded in Gazebo
- Confirm topic names match between configuration and subscribers
- Verify simulation is running and sensor is positioned correctly

### 2. Unrealistic Sensor Values

**Problem**: Sensor outputs don't match expected ranges or behavior
**Solution**:
- Check sensor mounting position and orientation
- Verify range parameters (min/max distances)
- Validate noise models and parameters
- Ensure physics simulation is active and affecting sensor environment

### 3. LiDAR Point Cloud Issues

**Problem**: Point cloud is sparse, missing, or has artifacts
**Solution**:
- Check angular resolution and sample parameters
- Verify range limits and resolution
- Confirm sensor is not inside objects or too close to surfaces
- Validate update rate settings

### 4. Camera Image Problems

**Problem**: Camera images are black, distorted, or have incorrect dimensions
**Solution**:
- Check camera intrinsics and field of view
- Verify image width/height parameters
- Ensure proper lighting in the scene
- Check that camera is not inside objects

## Integration Issues

### 1. Synchronization Problems

**Problem**: Gazebo physics and Unity visualization desync over time
**Solution**:
- Verify consistent time synchronization
- Check that update rates are appropriate for both systems
- Implement interpolation between physics steps if needed
- Monitor network latency if systems run on different machines

### 2. TF Frame Issues

**Problem**: Coordinate transformations are incorrect or missing
**Solution**:
- Verify TF tree structure using: `ros2 run tf2_tools view_frames`
- Check that robot_state_publisher is running
- Confirm URDF joint and link names match ROS configuration
- Validate static_transform_publisher if used

### 3. Communication Latency

**Problem**: Delays between robot movement in Gazebo and Unity update
**Solution**:
- Optimize network configuration
- Increase QoS settings for sensor data
- Reduce message size by adjusting sensor parameters
- Use local loopback if possible

## Setup and Installation Issues

### 1. ROS 2 Installation Problems

**Problem**: ROS 2 commands not found or packages missing
**Solution**:
- Source ROS setup: `source /opt/ros/humble/setup.bash`
- Verify installation: `echo $ROS_DISTRO`
- Check package installation: `apt list --installed | grep ros-humble`

### 2. Gazebo Installation Issues

**Problem**: Gazebo fails to start or crashes immediately
**Solution**:
- Check graphics drivers: `lspci | grep -i vga`
- Verify graphics support: `glxinfo | grep -i opengl`
- Check for missing dependencies: `sudo apt install --fix-missing`

### 3. Unity Installation Problems

**Problem**: Unity Hub or Editor fails to install or run
**Solution**:
- Verify system requirements are met
- Check for conflicting graphics drivers
- Ensure sufficient disk space (4GB+ minimum)
- Try running Unity Hub as non-root user

## Debugging Strategies

### 1. Systematic Debugging Approach

1. **Isolate the Problem**: Test components individually
   - Gazebo alone: `gz sim`
   - ROS alone: `ros2 topic list`
   - Unity alone: Open Unity project without ROS connection

2. **Check Connections**: Verify each communication link
   - ROS network connectivity
   - Topic availability and data flow
   - TF tree integrity

3. **Validate Parameters**: Ensure all configurations match
   - Topic names across systems
   - Coordinate frame names
   - Update rates and frequencies

### 2. Useful Debugging Commands

**ROS 2 Debugging**:
```bash
# Check all topics
ros2 topic list

# Monitor topic data rate
ros2 topic hz /topic_name

# Echo topic data
ros2 topic echo /topic_name

# Check TF tree
ros2 run tf2_tools view_frames
```

**Gazebo Debugging**:
```bash
# Verbose simulation output
gz sim -v 4 your_world.sdf

# Check available models
gz model --list

# Check available worlds
gz world --list
```

### 3. Logging and Monitoring

Enable detailed logging to identify issues:

**ROS 2 Logging**:
```bash
# Set logging level
export RCUTILS_LOGGING_SEVERITY_THRESHOLD=DEBUG

# Monitor logs
ros2 param set /logger_settings.use_sim_time true
```

**Gazebo Logging**:
```bash
# Enable verbose output
export GZ_SIM_SYSTEM_PLUGIN_PATH=/path/to/plugins
export GZ_SIM_RESOURCE_PATH=/path/to/models
```

## Performance Optimization

### 1. Simulation Performance

- **Reduce physics update rate**: Balance accuracy vs. performance
- **Simplify collision geometry**: Use primitive shapes where possible
- **Limit active objects**: Deactivate objects outside the area of interest
- **Optimize sensor parameters**: Reduce update rates for non-critical sensors

### 2. Visualization Performance

- **Use occlusion culling**: Hide objects not in view
- **Implement LOD**: Use simpler models when far from camera
- **Optimize lighting**: Use baked lighting instead of real-time when possible
- **Reduce draw calls**: Batch similar objects together

## When to Seek Help

If you encounter issues not covered in this guide:

1. **Check Documentation**: Review official Gazebo, Unity, and ROS 2 documentation
2. **Search Communities**: Check ROS Answers, Gazebo Answers, Unity forums
3. **Create Minimal Example**: Reduce your problem to the smallest reproducible case
4. **Provide Details**: Include system specs, software versions, error messages, and steps to reproduce

## Resources

- [Gazebo Documentation](https://gazebosim.org/docs)
- [ROS 2 Documentation](https://docs.ros.org/en/humble/)
- [Unity Manual](https://docs.unity3d.com/Manual/index.html)
- [ROS Answers](https://answers.ros.org/questions/)
- [Gazebo Answers](https://answers.gazebosim.org/questions/)