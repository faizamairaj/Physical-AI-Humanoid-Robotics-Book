// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  isaacAISidebar: [
    {
      type: 'category',
      label: 'Isaac AI-Robot Brain Module',
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
  ],
};

module.exports = sidebars;