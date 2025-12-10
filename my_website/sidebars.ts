import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      items: ['intro'],
    },
    {
      type: 'category',
      label: 'Module 1: ROS 2 Basics',
      items: [
        'module-1-ros2-basics/index',
        'module-1-ros2-basics/core-concepts',
        'module-1-ros2-basics/rclpy-basics',
        'module-1-ros2-basics/urdf-basics',
        'module-1-ros2-basics/diagrams',
        'module-1-ros2-basics/setup',
      ],
    },
    {
      type: 'category',
      label: 'Module 2: Digital Twin (Gazebo & Unity)',
      items: [
        'module-2-digital-twin/index',
        'module-2-digital-twin/gazebo-basics',
        'module-2-digital-twin/unity-rendering',
        'module-2-digital-twin/sensor-simulation',
        'module-2-digital-twin/simulation-workflows',
        'module-2-digital-twin/gazebo-quickstart',
        'module-2-digital-twin/unity-quickstart',
        'module-2-digital-twin/sensor-quickstart',
        'module-2-digital-twin/digital-twin-integration',
        'module-2-digital-twin/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'Module 3: Isaac AI-Robot Brain',
      items: [
        'isaac-ai-robot/introduction',
        {
          type: 'category',
          label: 'Isaac Sim Basics',
          items: [
            'isaac-ai-robot/isaac-sim-basics',
            'isaac-ai-robot/synthetic-data',
            'isaac-ai-robot/sim-workflow',
            'isaac-ai-robot/physics-lighting',
            'isaac-ai-robot/setup'
          ],
        },
        {
          type: 'category',
          label: 'Isaac ROS Perception',
          items: [
            'isaac-ai-robot/isaac-ros-overview',
            'isaac-ai-robot/vslam-pipeline',
            'isaac-ai-robot/perception-pipeline',
            'isaac-ai-robot/ros-setup'
          ],
        },
        {
          type: 'category',
          label: 'Nav2 Path Planning',
          items: [
            'isaac-ai-robot/nav2-overview',
            'isaac-ai-robot/path-planning',
            'isaac-ai-robot/nav-execution',
            'isaac-ai-robot/nav2-setup'
          ],
        },
        'isaac-ai-robot/ecosystem-integration',
        'isaac-ai-robot/quickstart'
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action (VLA) Module',
      items: [
        'vla-module/index',
        'vla-module/chapter-1-voice-to-action',
        'vla-module/chapter-2-cognitive-planning',
        'vla-module/chapter-3-capstone',
        'vla-module/whisper-integration',
        'vla-module/llm-cognitive-planning',
        'vla-module/command-mapping',
        'vla-module/ros2-action-sequence-generator',
        'vla-module/environmental-awareness-system',
        'vla-module/complete-vla-pipeline-integration',
        'vla-module/end-to-end-vla-pipeline',
        'vla-module/simulation-test-environment',
        'vla-module/complex-command-test-scenarios',
        'vla-module/capstone-project-implementation-guide',
        'vla-module/data-structures',
        'vla-module/api-contracts',
        'vla-module/logging-and-error-handling',
        'vla-module/vla-pipeline-diagram',
        'vla-module/validation-and-quality-assurance',
        'vla-module/summary-and-conclusion',
      ],
    },
  ],
};

export default sidebars;