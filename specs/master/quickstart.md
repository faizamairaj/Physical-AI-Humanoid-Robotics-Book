# Quickstart Guide: Physical AI & Humanoid Robotics Book Development

## Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 22.04+), Windows 10+, or macOS 12+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 20GB available space
- **Node.js**: Version 18.x or higher
- **Python**: Version 3.11 or higher
- **Docker**: Version 20.x or higher (optional but recommended)

### ROS 2 Setup
For the robotics examples in this book, you'll need ROS 2 Humble Hawksbill:
```bash
# Ubuntu/Debian installation
sudo apt update
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update
sudo apt install ros-humble-desktop
sudo apt install python3-colcon-common-extensions
sudo apt install python3-rosdep
```

## Setting Up the Development Environment

### 1. Clone the Repository
```bash
git clone <repository-url>
cd physical_robotics_book
```

### 2. Install Docusaurus Dependencies
```bash
cd my_website
npm install
```

### 3. Set Up Backend Environment
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
# Edit .env with your specific configuration
```

## Running the Book Locally

### 1. Start the Docusaurus Development Server
```bash
cd my_website
npm start
```
The book will be available at `http://localhost:3000`

### 2. Start the Backend Server (for RAG features)
```bash
cd backend
python main.py
```
The backend API will be available at `http://localhost:8000`

## Book Structure Overview

### Module Organization
The book is organized into 4 core modules plus a capstone project:

```
my_website/docs/
├── module-1-ros2-basics/           # Introduction to ROS 2 and basic concepts
│   ├── introduction.md
│   ├── nodes-and-topics.md
│   ├── services-and-actions.md
│   └── basic-robot-control.md
├── module-2-navigation-perception/ # Navigation and perception systems
│   ├── nav2-overview.md
│   ├── slam-concepts.md
│   ├── path-planning.md
│   └── sensor-integration.md
├── module-3-humanoid-control/      # Humanoid robot control and AI
│   ├── kinematics.md
│   ├── balance-control.md
│   ├── motion-planning.md
│   └── ai-integration.md
├── module-4-advanced-applications/ # Advanced robotics applications
│   ├── computer-vision.md
│   ├── machine-learning.md
│   ├── multi-robot-systems.md
│   └── deployment-considerations.md
├── capstone-project/               # Complete humanoid robot implementation
│   ├── project-overview.md
│   ├── implementation-phases.md
│   └── evaluation-criteria.md
├── glossary/                       # Technical terms and definitions
└── references/                     # Citations and external resources
```

## Adding New Content

### 1. Create a New Chapter
Create a new Markdown file in the appropriate module directory:
```markdown
---
title: Chapter Title
sidebar_position: 1
description: Brief description of the chapter
---

# Chapter Title

Content goes here...

## Section 1

Text for the first section...

## Section 2

Text for the second section...
```

### 2. Update Sidebars
Edit `my_website/sidebars.js` to add your new chapter to the navigation:
```javascript
module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Module 1: ROS 2 Basics',
      items: [
        'module-1-ros2-basics/introduction',
        'module-1-ros2-basics/nodes-and-topics',
        // Add your new chapter here
        'module-1-ros2-basics/your-new-chapter'
      ],
    },
  ],
};
```

## Working with Code Examples

### Python ROS 2 Examples
Code examples should follow this structure:
```python
#!/usr/bin/env python3
# Example: Basic ROS 2 Publisher Node
# File: my_website/static/code_examples/module1/basic_publisher.py

import rclpy
from rclpy.node import Node
from std_msgs.msg import String


class MinimalPublisher(Node):

    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1


def main(args=None):
    rclpy.init(args=args)
    minimal_publisher = MinimalPublisher()
    rclpy.spin(minimal_publisher)
    minimal_publisher.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

### Running Code Examples
```bash
# Source ROS 2 setup
source /opt/ros/humble/setup.bash

# Navigate to the example directory
cd my_website/static/code_examples/module1

# Run the example
python3 basic_publisher.py
```

## Building the Production Site

### 1. Build the Docusaurus Site
```bash
cd my_website
npm run build
```

### 2. Serve the Built Site Locally
```bash
npm run serve
```

## RAG Chatbot Integration

### 1. Index Book Content
```bash
cd backend
python -m src.services.indexer.index_book_content
```

### 2. Query the Chatbot
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is ROS 2?",
    "session_id": "test-session"
  }'
```

## Testing and Validation

### 1. Run Backend Tests
```bash
cd backend
python -m pytest tests/
```

### 2. Validate Docusaurus Build
```bash
cd my_website
npm run build
# Check for any build errors
```

### 3. Code Example Validation
Each code example should be tested in a simulated environment:
```bash
# Run all code examples in a module
cd my_website/static/code_examples/module1
./validate_all_examples.sh
```

## Deployment

### GitHub Pages Deployment
The book site is automatically deployed to GitHub Pages when changes are pushed to the main branch:
```bash
git add .
git commit -m "Update book content"
git push origin main
```

### Backend Deployment
For the RAG system, deploy the backend to a cloud provider:
1. Build Docker image: `docker build -t robotics-book-backend .`
2. Push to container registry
3. Deploy to cloud platform (AWS, GCP, Azure, etc.)

## Troubleshooting

### Common Issues

1. **Docusaurus won't start**: Ensure Node.js version is 18.x or higher
2. **ROS 2 examples fail**: Verify ROS 2 Humble is properly installed and sourced
3. **RAG system not responding**: Check that the backend server is running and properly configured
4. **Build errors**: Clear cache with `npm start -- --clear-cache`

### Getting Help
- Check the troubleshooting section in each module
- Review the glossary for technical terms
- Use the RAG chatbot to ask questions about the content