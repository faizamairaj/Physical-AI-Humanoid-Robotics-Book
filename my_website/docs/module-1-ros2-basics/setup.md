---
sidebar_label: 'ROS 2 Humble Setup'
---

# Step-by-Step Setup Instructions for ROS 2 Humble Hawksbill

## Overview

This guide provides step-by-step instructions for setting up ROS 2 Humble Hawksbill, which is the LTS (Long Term Support) version recommended for this course. These instructions are tested for Ubuntu 22.04 LTS, but ROS 2 Humble can also run on Windows and macOS.

## Prerequisites

Before installing ROS 2, ensure your system meets the following requirements:

- **Operating System**: Ubuntu 22.04 (Jammy Jellyfish) or equivalent
- **Architecture**: 64-bit x86 or ARM
- **RAM**: Minimum 8GB recommended
- **Disk Space**: At least 5GB free space
- **Internet Connection**: Required for package downloads

## Installation Steps

### 1. Set Locale

Ensure your locale is set to support UTF-8:

```bash
locale
```

If you don't see `en_US.UTF-8` in the output, install it:

```bash
sudo apt update && sudo apt install locales
sudo locale-gen en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8
```

### 2. Setup Sources

Add the ROS 2 apt repository:

```bash
sudo apt update && sudo apt install curl gnupg lsb-release
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
```

Add the repository to your sources list:

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(source /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

### 3. Install ROS 2 Packages

Update your apt cache and install ROS 2 Humble Desktop:

```bash
sudo apt update
sudo apt install ros-humble-desktop
```

This will install the full ROS 2 desktop environment including RViz, Gazebo, and other tools.

### 4. Install Additional Dependencies

Install Python dependencies:

```bash
sudo apt install python3-rosdep python3-rosinstall python3-rosinstall-generator python3-wstool build-essential
```

Initialize rosdep:

```bash
sudo rosdep init
rosdep update
```

### 5. Environment Setup

Add ROS 2 environment setup to your bashrc:

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

## Verify Installation

Test your installation by running a simple publisher/subscriber example:

```bash
# Open a new terminal and source the environment
source /opt/ros/humble/setup.bash

# Run the talker node
ros2 run demo_nodes_cpp talker
```

In another terminal:

```bash
# Source the environment
source /opt/ros/humble/setup.bash

# Run the listener node
ros2 run demo_nodes_py listener
```

You should see messages being published by the talker and received by the listener.

## Python Development Setup

For Python development with ROS 2:

```bash
# Install additional Python packages
pip3 install --user -U argcomplete
pip3 install --user -U rosdep
pip3 install --user -U rosinstall
pip3 install --user -U rosinstall_generator
pip3 install --user -U wstool
pip3 install --user -U vcstool
```

## Create a Workspace

Create a workspace for your custom packages:

```bash
# Create workspace directory
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws

# Build the workspace
colcon build

# Source the workspace
source install/setup.bash
```

## Essential Tools

Install these additional tools for development:

```bash
# Install colcon for building packages
pip3 install -U colcon-common-extensions

# Install testing tools
sudo apt install python3-pytest-cov python3-pytest-repeat

# Install development tools
sudo apt install python3-dev python3-pip python3-rosdep python3-vcstool
```

## Troubleshooting

### Common Issues and Solutions

1. **"command not found" errors**
   - Make sure you've sourced the ROS 2 environment: `source /opt/ros/humble/setup.bash`
   - Check that the environment is in your `.bashrc` file

2. **Package installation fails**
   - Update your package lists: `sudo apt update`
   - Check your internet connection
   - Verify the repository configuration

3. **Permission errors**
   - Don't run ROS 2 commands with `sudo` unless specifically required
   - Check file permissions in your workspace

4. **Python import errors**
   - Ensure you're using Python 3.10 or 3.11 (Humble requirement)
   - Check that Python packages are installed for the correct Python version

## Development Environment Setup

For an optimal development experience, consider setting up:

1. **IDE**: VS Code with ROS extension
2. **Terminal**: Use a terminal that supports multiple panes (like Terminator or Guake)
3. **Version Control**: Git with appropriate .gitignore files for ROS projects

### VS Code Setup

Install the ROS extension for VS Code:

```bash
code --install-extension ms-iot.vscode-ros
```

## Testing Your Setup

Create a simple test to verify everything works:

```bash
# Create a new package
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python my_first_package --dependencies rclpy std_msgs

# Navigate to the package
cd ~/ros2_ws
colcon build --packages-select my_first_package
source install/setup.bash

# Run a simple command
ros2 pkg list | grep my_first_package
```

## Summary

Your ROS 2 Humble environment is now set up and ready for development. In the next modules, we'll explore more advanced concepts and create more complex robotic applications using this foundation.

Remember to always source your ROS 2 environment before starting work:

```bash
source /opt/ros/humble/setup.bash
# And if you have a workspace:
source ~/ros2_ws/install/setup.bash
```