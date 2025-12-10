---
id: 1
title: Create Project Constitution
stage: constitution
date: 2025-12-08
surface: agent
model: Claude Sonnet 4.5
feature: none
branch: master
user: user
command: /sp.constitution
labels: [constitution, setup, project]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
 - history/prompts/constitution/1-create-project-constitution.constitution.prompt.md
tests:
 - none
---

## Prompt

/sp.constitution

Project: Book + RAG Chatbot — "Physical AI & Humanoid Robotics"

Core Principles:
- Technical accuracy (ROS 2, Gazebo, Unity, Isaac, Nav2, VSLAM).
- Clear, structured explanations for senior CS students.
- Reproducible workflows with complete steps.
- AI-native authoring using Spec-Kit Plus + Claude Code.

Key Standards:
- Citation: IEEE.
- Validate all technical claims with official docs.
- Python (rclpy) + C++ for robotics; TypeScript/React for chatbot.
- Include examples, diagrams (Mermaid), and tasks in each module.

Book Requirements:
- Framework: Docusaurus; deploy on GitHub Pages.
- Content: 4 modules + capstone + glossary + references.
- Length: 150–250 pages; zero plagiarism.

RAG Chatbot Requirements:
- OpenAI Agents/ChatKit SDK + FastAPI.
- Neon Postgres + Qdrant Cloud.
- Answer questions from book text + selected text.
- Provide source-linked answers.

Constraints:
- Full environment setup for ROS 2, Gazebo, Unity, Isaac Sim, Whisper, Nav2.
- RAG system must be modular and production-ready.
- Diagrams must use Mermaid.

Success Criteria:
- Book fully deployed and functional.
- RAG chatbot works with book and selected text.
- No technical inaccuracies.
- All steps reproducible for students.

## Response snapshot

I've successfully created the project constitution file for the Physical AI & Humanoid Robotics book project. The constitution includes:

1. Core principles (technical accuracy, educational excellence, AI-native authoring)
2. Technical standards (citation format, technology stack, documentation requirements)
3. Book requirements (content structure, quality assurance)
4. RAG chatbot requirements (functionality, architecture, performance)
5. Development constraints (technical, quality, timeline)
6. Success criteria (checklists for book delivery, chatbot delivery, quality assurance)
7. Risk mitigation strategies
8. Team responsibilities
9. Version control and collaboration guidelines

The file is located at .specify/memory/constitution.md and contains comprehensive guidelines for the entire project.

## Outcome

- ✅ Impact: Created comprehensive project constitution for Physical AI & Humanoid Robotics book project
- 🧪 Tests: none
- 📁 Files: Created .specify/memory/constitution.md and PHR record
- 🔁 Next prompts: Project setup can now proceed based on established constitution
- 🧠 Reflection: Constitution provides clear guidelines and constraints for the entire project lifecycle

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS - Constitution addresses all requirements from user prompt
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed with feature specification based on constitution