---
sidebar_label: 'URDF Basics'
---

# URDF Basics for Humanoid Robots

## Overview

URDF (Unified Robot Description Format) is an XML-based format used in ROS to describe robot models. It defines the physical and visual properties of a robot, including its links, joints, and other components. URDF is essential for robot simulation, visualization, and control in ROS 2.

## URDF Structure

A URDF file consists of:

- **Links**: Rigid bodies that make up the robot
- **Joints**: Connections between links that define how they move relative to each other
- **Visual Elements**: How the robot appears in simulation and visualization tools
- **Collision Elements**: How the robot interacts with its environment in simulation
- **Inertial Properties**: Mass, center of mass, and moments of inertia for physics simulation

## Basic URDF Elements

### Links

A link represents a rigid body part of the robot. Each link can have:

- Visual properties (shape, color, material)
- Collision properties (shape for collision detection)
- Inertial properties (mass, center of mass, inertia tensor)

```xml
<link name="link_name">
  <visual>
    <geometry>
      <box size="1.0 2.0 3.0"/>
    </geometry>
    <material name="blue">
      <color rgba="0.0 0.0 1.0 1.0"/>
    </material>
  </visual>
  <collision>
    <geometry>
      <box size="1.0 2.0 3.0"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="1.0"/>
    <origin xyz="0 0 0"/>
    <inertia ixx="1.0" ixy="0.0" ixz="0.0" iyy="1.0" iyz="0.0" izz="1.0"/>
  </inertial>
</link>
```

### Joints

A joint connects two links and defines how they can move relative to each other. Joint types include:

- **Fixed**: No movement between links
- **Revolute**: Rotational movement around an axis
- **Continuous**: Continuous rotational movement (like a wheel)
- **Prismatic**: Linear sliding movement along an axis
- **Floating**: 6 degrees of freedom movement
- **Planar**: Movement in a plane

```xml
<joint name="joint_name" type="revolute">
  <parent link="parent_link"/>
  <child link="child_link"/>
  <origin xyz="1.0 0.0 0.0" rpy="0.0 0.0 0.0"/>
  <axis xyz="0 0 1"/>
  <limit lower="-1.57" upper="1.57" effort="100" velocity="1.0"/>
</joint>
```

## Simple Humanoid Robot Example

Here's a basic humanoid robot URDF with a torso, head, arms, and legs:

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
  <!-- Torso -->
  <link name="torso">
    <visual>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
      <material name="white">
        <color rgba="1.0 1.0 1.0 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Head -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
      <material name="skin">
        <color rgba="1.0 0.8 0.6 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.002" ixy="0.0" ixz="0.0" iyy="0.002" iyz="0.0" izz="0.002"/>
    </inertial>
  </link>

  <!-- Neck joint -->
  <joint name="neck_joint" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0.0 0.0 0.3"/>
    <axis xyz="0 1 0"/>
    <limit lower="-0.5" upper="0.5" effort="10.0" velocity="1.0"/>
  </joint>

  <!-- Left upper arm -->
  <link name="left_upper_arm">
    <visual>
      <geometry>
        <cylinder length="0.3" radius="0.05"/>
      </geometry>
      <material name="blue">
        <color rgba="0.0 0.0 1.0 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.3" radius="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.0001"/>
    </inertial>
  </link>

  <!-- Left shoulder joint -->
  <joint name="left_shoulder_joint" type="revolute">
    <parent link="torso"/>
    <child link="left_upper_arm"/>
    <origin xyz="0.2 0.1 0.1" rpy="0 0 0"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" effort="10.0" velocity="1.0"/>
  </joint>

  <!-- Right upper arm -->
  <link name="right_upper_arm">
    <visual>
      <geometry>
        <cylinder length="0.3" radius="0.05"/>
      </geometry>
      <material name="blue">
        <color rgba="0.0 0.0 1.0 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.3" radius="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <origin xyz="0 0 -0.15"/>
      <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.0001"/>
    </inertial>
  </link>

  <!-- Right shoulder joint -->
  <joint name="right_shoulder_joint" type="revolute">
    <parent link="torso"/>
    <child link="right_upper_arm"/>
    <origin xyz="-0.2 0.1 0.1" rpy="0 0 0"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" effort="10.0" velocity="1.0"/>
  </joint>

  <!-- Left thigh -->
  <link name="left_thigh">
    <visual>
      <geometry>
        <cylinder length="0.4" radius="0.06"/>
      </geometry>
      <material name="red">
        <color rgba="1.0 0.0 0.0 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.4" radius="0.06"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 -0.2"/>
      <inertia ixx="0.005" ixy="0.0" ixz="0.0" iyy="0.005" iyz="0.0" izz="0.0001"/>
    </inertial>
  </link>

  <!-- Left hip joint -->
  <joint name="left_hip_joint" type="revolute">
    <parent link="torso"/>
    <child link="left_thigh"/>
    <origin xyz="0.1 -0.1 -0.25"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" effort="20.0" velocity="1.0"/>
  </joint>

  <!-- Right thigh -->
  <link name="right_thigh">
    <visual>
      <geometry>
        <cylinder length="0.4" radius="0.06"/>
      </geometry>
      <material name="red">
        <color rgba="1.0 0.0 0.0 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.4" radius="0.06"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 -0.2"/>
      <inertia ixx="0.005" ixy="0.0" ixz="0.0" iyy="0.005" iyz="0.0" izz="0.0001"/>
    </inertial>
  </link>

  <!-- Right hip joint -->
  <joint name="right_hip_joint" type="revolute">
    <parent link="torso"/>
    <child link="right_thigh"/>
    <origin xyz="-0.1 -0.1 -0.25"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" effort="20.0" velocity="1.0"/>
  </joint>
</robot>
```

## URDF Best Practices

1. **Start Simple**: Begin with a basic model and add complexity gradually
2. **Use Meaningful Names**: Choose descriptive names for links and joints
3. **Consider Mass Properties**: Accurate inertial properties are important for simulation
4. **Validate Your URDF**: Use tools like `check_urdf` to validate your URDF files
5. **Use Xacro for Complex Models**: Xacro is a macro language that can simplify complex URDFs

## Visualizing URDF Models

To visualize your URDF model in ROS 2:

1. **Launch RViz2**: `ros2 run rviz2 rviz2`
2. **Add RobotModel Display**: In the Displays panel, add a RobotModel display
3. **Set Topic**: Set the Robot Description parameter to your URDF topic

## URDF in ROS 2

In ROS 2, URDF models are typically loaded using a robot state publisher node that publishes the transforms between links:

```bash
ros2 run robot_state_publisher robot_state_publisher --ros-args -p robot_description:='$(cat your_robot.urdf)'
```

## Common URDF Shapes

- **Box**: `<box size="x y z"/>`
- **Cylinder**: `<cylinder radius="r" length="l"/>`
- **Sphere**: `<sphere radius="r"/>`
- **Mesh**: `<mesh filename="path/to/mesh.stl"/>`

## Summary

URDF is fundamental to representing robots in ROS 2. Understanding how to create and structure URDF files is essential for humanoid robot development, simulation, and visualization. The example above provides a basic humanoid model that can be extended with additional joints and links for more complex robots.