# Unity Quickstart Guide

## Prerequisites

Before starting with Unity for digital twin visualization, ensure you have:

- **Unity Hub**: Latest version installed
- **Unity Editor**: Unity 2022.3 LTS or later
- **ROS 2**: Humble Hawksbill or later installed and sourced
- **ROS# Package**: For ROS 2 communication with Unity
- **System Requirements**:
  - 8GB+ RAM recommended
  - Dedicated graphics card with shader model 3.5+
  - 4GB+ available disk space

## Installing ROS# for Unity

### 1. Download ROS#

ROS# (ROS Sharp) is the Unity package that enables ROS 2 communication:

1. Open Unity Hub and create a new 3D project
2. In Unity, go to Window → Package Manager
3. Click the "+" button → "Add package from git URL..."
4. Enter the ROS# repository URL: `https://github.com/Unity-Technologies/ROS-TCP-Connector.git`
5. Install the package

### 2. Alternative: Import ROS# Package

You can also import ROS# by downloading the `.unitypackage` file:

1. Download ROS-TCP-Connector from the official repository
2. In Unity, go to Assets → Import Package → Custom Package
3. Select the downloaded `.unitypackage` file
4. Import all contents

## Setting Up Your First Unity Scene

### 1. Basic Scene Structure

Create a basic scene with the essential components:

1. **Main Camera**: Default Unity camera for visualization
2. **Directional Light**: For basic lighting
3. **ROS Connection Manager**: For ROS communication
4. **Robot Model**: Your digital twin robot

### 2. ROS Connection Setup

Add ROS connection to your scene:

```csharp
// Create a new C# script: ROSConnectionManager.cs
using ROS2;
using UnityEngine;

public class ROSConnectionManager : MonoBehaviour
{
    [Header("ROS Connection Settings")]
    public string rosMasterURL = "http://localhost:11311";
    public string hostname = "localhost";

    private ROS2UnityComponent ros2Unity;

    void Start()
    {
        // Initialize ROS connection
        ros2Unity = GetComponent<ROS2UnityComponent>();
        ros2Unity.Initialize();

        Debug.Log("ROS Connection Manager initialized");
    }

    void OnApplicationQuit()
    {
        if (ros2Unity != null)
        {
            ros2Unity.Shutdown();
        }
    }
}
```

### 3. Creating the Scene

1. Create a new 3D scene in Unity
2. Add the ROSConnectionManager script to an empty GameObject
3. Add a Directional Light for basic illumination
4. Import or create your robot model

## Robot Model Setup

### 1. Importing Robot Models

You can import robot models in several ways:

#### Option A: From URDF (Recommended)
- Use a URDF importer plugin if available
- Manually recreate the robot structure based on URDF

#### Option B: 3D Model Import
- Import FBX, OBJ, or other 3D formats
- Set up proper joint hierarchy in Unity

### 2. Robot Hierarchy Example

Create a robot with proper joint structure:

```
Robot (Root)
├── BaseLink
├── Joint1
│   └── Link1
├── Joint2
│   └── Link2
└── Sensors
    ├── LiDAR
    ├── Camera
    └── IMU
```

### 3. Joint Configuration

Configure joints to match your physical robot:

```csharp
// JointController.cs
using UnityEngine;

public class JointController : MonoBehaviour
{
    [Header("Joint Configuration")]
    public string jointName;
    public float minAngle = -180f;
    public float maxAngle = 180f;
    public float currentAngle = 0f;

    public void SetJointPosition(float angle)
    {
        currentAngle = Mathf.Clamp(angle, minAngle, maxAngle);
        transform.localRotation = Quaternion.Euler(0, currentAngle, 0);
    }

    public float GetJointPosition()
    {
        return currentAngle;
    }
}
```

## Basic Visualization

### 1. Camera Setup

Configure multiple cameras for different views:

```csharp
// MultiCameraController.cs
using UnityEngine;

public class MultiCameraController : MonoBehaviour
{
    public Camera mainCamera;
    public Camera topDownCamera;
    public Camera followCamera;

    [Header("Camera Settings")]
    public Transform robotTarget;
    public float followDistance = 5f;
    public float followHeight = 3f;

    void Update()
    {
        // Update follow camera position
        if (followCamera != null && robotTarget != null)
        {
            Vector3 targetPosition = robotTarget.position -
                (Vector3.forward * followDistance) +
                (Vector3.up * followHeight);
            followCamera.transform.position = targetPosition;
            followCamera.transform.LookAt(robotTarget);
        }
    }
}
```

### 2. Material and Lighting

Apply appropriate materials for realistic visualization:

1. Create materials with realistic textures
2. Configure lighting for the environment
3. Set up reflection probes for realistic reflections

## ROS Communication

### 1. Subscribing to Robot States

Subscribe to joint states from ROS:

```csharp
// RobotStateSubscriber.cs
using ROS2;
using UnityEngine;

public class RobotStateSubscriber : MonoBehaviour
{
    private ISubscription<sensor_msgs.msg.JointState> jointStateSub;
    private ROS2UnityComponent ros2Unity;

    [Header("Robot Configuration")]
    public JointController[] jointControllers;
    public string[] jointNames;

    void Start()
    {
        ros2Unity = GetComponent<ROS2UnityComponent>();
        ros2Unity.Initialize();

        // Subscribe to joint states
        jointStateSub = ros2Unity.CreateSubscription<sensor_msgs.msg.JointState>("/joint_states");
        jointStateSub.Subscribe(OnJointStateReceived);
    }

    void OnJointStateReceived(sensor_msgs.msg.JointState jointState)
    {
        for (int i = 0; i < jointState.name.Count; i++)
        {
            string jointName = jointState.name[i];

            // Find corresponding joint controller
            for (int j = 0; j < jointNames.Length; j++)
            {
                if (jointNames[j] == jointName && i < jointState.position.Count)
                {
                    jointControllers[j].SetJointPosition((float)jointState.position[i] * Mathf.Rad2Deg);
                    break;
                }
            }
        }
    }
}
```

### 2. Publishing Sensor Data

Publish sensor data back to ROS (if needed):

```csharp
// SensorPublisher.cs
using ROS2;
using UnityEngine;

public class SensorPublisher : MonoBehaviour
{
    private IPublisher<std_msgs.msg.Float64MultiArray> sensorPub;
    private ROS2UnityComponent ros2Unity;

    void Start()
    {
        ros2Unity = GetComponent<ROS2UnityComponent>();
        ros2Unity.Initialize();

        sensorPub = ros2Unity.CreatePublisher<std_msgs.msg.Float64MultiArray>("/unity_sensor_data");
    }

    void PublishSensorData()
    {
        if (sensorPub != null)
        {
            var sensorMsg = new std_msgs.msg.Float64MultiArray();
            // Populate sensor data
            sensorPub.Publish(sensorMsg);
        }
    }
}
```

## Environment Setup

### 1. Creating a Basic Environment

Create a simple environment for your robot:

1. Add a ground plane
2. Create basic obstacles
3. Set up environmental lighting
4. Add texture materials

### 2. Lighting Configuration

Configure lighting for realistic rendering:

```json
{
  "ambientMode": "Trilight",
  "ambientSkyColor": [0.212, 0.227, 0.259],
  "ambientEquatorColor": [0.114, 0.125, 0.133],
  "ambientGroundColor": [0.047, 0.043, 0.035],
  "ambientIntensity": 1.0,
  "directionalLight": {
    "color": [1.0, 0.956, 0.839],
    "intensity": 1.0,
    "rotation": [-45, 45, 0]
  }
}
```

## Running the Unity Digital Twin

### 1. Starting the Complete System

To run the complete digital twin system:

1. Start ROS 2 system:
   ```bash
   source /opt/ros/humble/setup.bash
   ros2 launch your_package digital_twin.launch.py
   ```

2. Start Unity project:
   - Open Unity Editor
   - Press Play button
   - Verify connection between Unity and ROS

### 2. Troubleshooting Connection Issues

Common connection problems and solutions:

#### Issue: Unity cannot connect to ROS
**Solution**:
- Verify ROS master is running
- Check network settings and firewall
- Ensure correct IP addresses and ports

#### Issue: Robot model doesn't update
**Solution**:
- Check topic names match between ROS and Unity
- Verify joint names match exactly
- Confirm coordinate system alignment

## Best Practices

1. **Performance**: Keep scene complexity reasonable for real-time rendering
2. **Coordinate Systems**: Ensure consistent coordinate systems between Gazebo and Unity
3. **Update Rates**: Balance visualization quality with update frequency
4. **Error Handling**: Implement robust error handling for ROS connections
5. **Testing**: Regularly test the connection and synchronization

## Common Issues and Solutions

### Issue: High latency between ROS and Unity
**Solution**:
- Optimize network configuration
- Reduce data transmission frequency
- Use appropriate QoS settings

### Issue: Robot position/rotation mismatch
**Solution**:
- Check coordinate system conversions
- Verify TF frame alignment
- Confirm unit conversions (degrees vs radians)

### Issue: Unity crashes or performs poorly
**Solution**:
- Reduce scene complexity
- Optimize materials and lighting
- Check system resource usage

## Next Steps

After completing this quickstart guide, you should be able to:
- Set up Unity with ROS# communication
- Create basic robot visualization
- Subscribe to ROS topics in Unity
- Configure basic lighting and environment

Continue to the next section to learn about advanced visualization techniques and sensor data integration.