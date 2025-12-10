---
id: 1
title: ros2-basics-specification
stage: spec
date: 2025-12-08
surface: agent
model: Claude Sonnet 4.5
feature: ros2-basics
branch: 1-ros2-basics
user: user
command: /sp.specify "Module 1 — ROS 2 Basics..."
labels: [specification, ros2, education, robotics]
links:
  spec: specs/1-ros2-basics/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/1-ros2-basics/spec.md
 - specs/1-ros2-basics/checklists/requirements.md
tests:
 - specs/1-ros2-basics/spec.md validation
---

## Prompt

Module 1 — ROS 2 Basics

Target audience:
- Senior CS/engineering students entering robotics

Focus:
- ROS 2 middleware (Nodes, Topics, Services)
- Python control via rclpy
- URDF for humanoid robot models

Chapters (2–3):
1. ROS 2 Core Concepts: Nodes, Topics, Services
2. rclpy: Controlling Humanoid Robots with Python
3. URDF Basics for Humanoids (optional)

Success criteria:
- Clear explanation of ROS 2 architecture
- Working rclpy publisher/subscriber/service examples
- One simple humanoid URDF example
- Steps reproducible on ROS 2 Humble

Constraints:
- Markdown format (Docusaurus)
- Use Mermaid diagrams for ROS 2 flows
- Code must follow ROS 2 best practices

Not building:
- Simulation (Module 2 covers this)
- Nav2, SLAM, or advanced ROS 2 packages

## Response snapshot

Created a comprehensive specification for the ROS 2 Basics module targeting senior CS/engineering students. The specification includes:
- Three user stories prioritized by importance
- Functional requirements for ROS 2 core concepts, rclpy examples, and URDF basics
- Success criteria with measurable outcomes
- Quality validation checklist

## Outcome

- ✅ Impact: Created complete specification document for ROS 2 Basics educational module
- 🧪 Tests: Specification validated against quality criteria checklist
- 📁 Files: Created spec.md and requirements.md checklist
- 🔁 Next prompts: Ready for planning phase (/sp.plan)
- 🧠 Reflection: Specification successfully created without PowerShell script using manual approach

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A