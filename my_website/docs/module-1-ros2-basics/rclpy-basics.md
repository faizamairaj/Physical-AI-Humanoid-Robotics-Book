---
sidebar_label: 'rclpy Basics'
---

# Python Control with rclpy: Controlling Humanoid Robots

## Overview

`rclpy` is the Python client library for ROS 2. It provides a Python API that allows you to create ROS 2 nodes, publish and subscribe to topics, make service calls, and provide services. This chapter will guide you through the fundamentals of using `rclpy` to control humanoid robots.

## Installing rclpy

`rclpy` is included with ROS 2 installations. If you have ROS 2 installed, you already have access to `rclpy`. To use it in your Python scripts, simply import it:

```python
import rclpy
from rclpy.node import Node
```

## Creating a Node with rclpy

The foundation of any ROS 2 Python program is a node. Here's how to create a basic node:

```python
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        super().__init__('minimal_node')
        self.get_logger().info('Minimal node created')

def main(args=None):
    rclpy.init(args=args)
    node = MinimalNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Node Lifecycle

1. **Initialization**: `rclpy.init()` initializes the ROS 2 client library
2. **Node Creation**: Create an instance of your custom node class
3. **Spinning**: `rclpy.spin()` keeps the node alive and processes callbacks
4. **Cleanup**: Destroy the node and shutdown the ROS 2 client library

## Publishers with rclpy

Publishers allow nodes to send messages to topics. Here's how to create a publisher:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello World'
        self.publisher_.publish(msg)
        self.get_logger().info('Publishing: "%s"' % msg.data)

def main(args=None):
    rclpy.init(args=args)
    minimal_publisher = MinimalPublisher()
    rclpy.spin(minimal_publisher)
    minimal_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Publisher Parameters

- **Topic Name**: The name of the topic to publish to
- **Message Type**: The type of message to publish (e.g., `String`, `Int32`)
- **Queue Size**: The size of the message queue for the publisher

## Subscribers with rclpy

Subscribers allow nodes to receive messages from topics:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalSubscriber(Node):
    def __init__(self):
        super().__init__('minimal_subscriber')
        self.subscription = self.create_subscription(
            String,
            'topic',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info('I heard: "%s"' % msg.data)

def main(args=None):
    rclpy.init(args=args)
    minimal_subscriber = MinimalSubscriber()
    rclpy.spin(minimal_subscriber)
    minimal_subscriber.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Subscriber Parameters

- **Message Type**: The type of message to subscribe to
- **Topic Name**: The name of the topic to subscribe to
- **Callback Function**: The function to call when a message is received
- **Queue Size**: The size of the message queue for the subscriber

## Services with rclpy

Services provide synchronous request/response communication:

### Service Server

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class MinimalService(Node):
    def __init__(self):
        super().__init__('minimal_service')
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_two_ints_callback)

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info('Incoming request\na: %d b: %d' % (request.a, request.b))
        return response

def main(args=None):
    rclpy.init(args=args)
    minimal_service = MinimalService()
    rclpy.spin(minimal_service)
    minimal_service.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Service Client

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class MinimalClient(Node):
    def __init__(self):
        super().__init__('minimal_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('service not available, waiting again...')
        self.req = AddTwoInts.Request()

    def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        self.future = self.cli.call_async(self.req)
        rclpy.spin_until_future_complete(self, self.future)
        return self.future.result()

def main(args=None):
    rclpy.init(args=args)
    minimal_client = MinimalClient()
    response = minimal_client.send_request(1, 2)
    minimal_client.get_logger().info('Result of add_two_ints: %d' % response.sum)
    minimal_client.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Parameters with rclpy

ROS 2 allows nodes to have configurable parameters:

```python
import rclpy
from rclpy.node import Node

class ParamNode(Node):
    def __init__(self):
        super().__init__('param_node')

        # Declare parameters with default values
        self.declare_parameter('my_param', 'default_value')

        # Get parameter value
        my_param = self.get_parameter('my_param').value
        self.get_logger().info('Parameter value: %s' % my_param)

def main(args=None):
    rclpy.init(args=args)
    node = ParamNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Working with Time and Timers

ROS 2 provides utilities for time-based operations:

```python
import rclpy
from rclpy.node import Node
from rclpy.timer import Timer
from rclpy.time import Time
from rclpy.duration import Duration

class TimeNode(Node):
    def __init__(self):
        super().__init__('time_node')

        # Create a timer that calls a callback every 1 second
        self.timer = self.create_timer(1.0, self.timer_callback)

        # Get current ROS time
        current_time = self.get_clock().now()
        self.get_logger().info('Current time: %s' % str(current_time))

    def timer_callback(self):
        self.get_logger().info('Timer callback executed')

def main(args=None):
    rclpy.init(args=args)
    node = TimeNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Best Practices for rclpy

1. **Always call `rclpy.shutdown()`**: Clean up resources when your node exits
2. **Handle exceptions**: Wrap ROS operations in try-catch blocks when appropriate
3. **Use meaningful node names**: Choose descriptive names for your nodes
4. **Log appropriately**: Use the node's logger for debugging and monitoring
5. **Manage resources**: Properly destroy nodes and clean up publishers/subscribers

## Example: Controlling a Humanoid Robot Joint

Here's a practical example of using rclpy to control a humanoid robot joint:

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
from std_msgs.msg import Float64

class JointController(Node):
    def __init__(self):
        super().__init__('joint_controller')

        # Publisher for joint commands
        self.joint_pub = self.create_publisher(Float64, '/joint_position/command', 10)

        # Subscriber for joint states
        self.joint_sub = self.create_subscription(
            JointState,
            '/joint_states',
            self.joint_state_callback,
            10
        )

        # Timer for control loop
        self.control_timer = self.create_timer(0.1, self.control_loop)

        self.target_position = 0.0
        self.current_position = 0.0

    def joint_state_callback(self, msg):
        # Update current position from joint states
        if 'joint_name' in msg.name:
            idx = msg.name.index('joint_name')
            self.current_position = msg.position[idx]

    def control_loop(self):
        # Simple proportional control
        error = self.target_position - self.current_position
        command_msg = Float64()
        command_msg.data = self.current_position + 0.1 * error
        self.joint_pub.publish(command_msg)

def main(args=None):
    rclpy.init(args=args)
    controller = JointController()

    # Set a target position
    controller.target_position = 1.57  # 90 degrees in radians

    rclpy.spin(controller)
    controller.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Summary

`rclpy` provides a comprehensive Python API for ROS 2 that enables you to create sophisticated robot applications. Understanding publishers, subscribers, services, and parameters is crucial for developing humanoid robot control systems.

In the next section, we'll explore URDF (Unified Robot Description Format) which is essential for representing robot models in ROS 2.