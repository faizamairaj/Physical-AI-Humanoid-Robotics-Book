# Gazebo Physics & Worlds

## Introduction

Gazebo is a powerful 3D simulation environment that provides accurate physics simulation, realistic rendering, and convenient programmatic interfaces. In the context of digital twins, Gazebo serves as the physics engine that simulates real-world forces, collisions, and dynamics for robotic systems.

## Key Physics Concepts

### Gravity
Gravity is a fundamental force in physics simulation that affects all objects with mass. In Gazebo, the default gravity setting simulates Earth's gravitational acceleration of 9.81 m/s², acting in the negative Z direction (downward).

### Collisions
Collision detection and response determine how objects interact when they come into contact with each other. Gazebo uses physics engines like Bullet, ODE, or DART to calculate these interactions.

### Dynamics
Dynamics refer to the simulation of motion under the influence of forces. This includes:
- Friction between surfaces
- Damping effects
- Inertia properties of objects
- Joint constraints and limits

## Setting Up Your First Gazebo World

### Creating a Basic World File

A Gazebo world file is an SDF (Simulation Description Format) file that defines the environment for your simulation. Here's a minimal example:

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

    <!-- Add a simple box -->
    <model name="box">
      <pose>0 0 0.5 0 0 0</pose>
      <static>false</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <box>
              <size>1 1 1</size>
            </box>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <box>
              <size>1 1 1</size>
          </geometry>
        </visual>
        <inertial>
          <mass>1.0</mass>
          <inertia>
            <ixx>0.166667</ixx>
            <ixy>0</ixy>
            <ixz>0</ixz>
            <iyy>0.166667</iyy>
            <iyz>0</iyz>
            <izz>0.166667</izz>
          </inertia>
        </inertial>
      </link>
    </model>
  </world>
</sdf>
```

### Physics Properties Configuration

Gazebo allows you to configure physics properties to match your simulation requirements:

- **Gravity**: Default is (0, 0, -9.8) for Earth-like gravity
- **ODE Physics Engine**: Default engine with parameters like max_step_size, real_time_factor
- **Collision Detection**: Can be configured for performance vs accuracy trade-offs

## Launching Your Simulation

To launch a Gazebo simulation:

```bash
gz sim -r simple_world.sdf
```

Or using ROS 2 launch files:

```python
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from ament_index_python.packages import get_package_share_directory
import os

def generate_launch_description():
    world_file = os.path.join(
        get_package_share_directory('your_package'),
        'worlds',
        'simple_world.sdf'
    )

    return LaunchDescription([
        # Launch Gazebo with custom world
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource([
                get_package_share_directory('gazebo_ros'),
                '/launch/gz_sim.launch.py'
            ]),
            launch_arguments={
                'world': world_file
            }.items()
        )
    ])
```

## Dynamics Parameters

Understanding dynamics is crucial for realistic simulation:

- **Friction**: Controls how objects slide against each other
- **Restitution**: Controls bounciness (0 = no bounce, 1 = perfectly elastic)
- **Damping**: Simulates energy loss in motion
- **Inertia**: Resistance to changes in rotational motion

## Best Practices

1. Start with simple models and gradually increase complexity
2. Validate physics behavior against real-world expectations
3. Use appropriate time steps for stability and performance
4. Consider the trade-off between accuracy and simulation speed
5. Test collision properties thoroughly

## Troubleshooting Common Issues

- **Objects falling through surfaces**: Check collision geometry and static properties
- **Unrealistic bouncing**: Adjust restitution and damping parameters
- **Simulation instability**: Reduce time step or adjust solver parameters
- **Performance issues**: Simplify collision geometry or reduce model complexity

## Next Steps

After mastering basic Gazebo physics, you'll be ready to explore Unity integration and sensor simulation in the following chapters.