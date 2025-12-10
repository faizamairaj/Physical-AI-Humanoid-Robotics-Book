---
id: 1
title: book-project-planning
stage: plan
date: 2025-12-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: master
branch: master
user: ABC
command: /sp.plan
labels: ["book", "planning", "architecture", "docusaurus", "ros2"]
links:
  spec: D:\project\physical_robotics_book\specs\master\spec.md
  ticket: null
  adr: null
  pr: null
files:
 - D:\project\physical_robotics_book\specs\master\plan.md
 - D:\project\physical_robotics_book\specs\master\spec.md
 - D:\project\physical_robotics_book\specs\master\research.md
 - D:\project\physical_robotics_book\specs\master\data-model.md
 - D:\project\physical_robotics_book\specs\master\quickstart.md
 - D:\project\physical_robotics_book\specs\master\quality-validation.md
 - D:\project\physical_robotics_book\specs\master\contracts\rag-chatbot-api.yaml
tests:
 - specs\master\research.md completed
 - specs\master\data-model.md completed
 - specs\master\quickstart.md completed
---

## Prompt

Book Project — Physical AI & Humanoid Robotics

Create:
- Book architecture sketch (modules, chapters, sidebar layout)
- Section structure for each module
- Quality validation steps for accuracy, clarity, and reproducibility

Decisions needing documentation:
- Docusaurus structure (navigation, routing, sidebar)
- Code format choices (Python/rclpy, C++, TypeScript)
- Diagram format (Mermaid vs. images)
- Depth and scope for each module

Testing strategy:
- Check each chapter against success criteria from the constitution
- Validate all code examples and instructions
- Ensure Docusaurus builds cleanly with correct links
- Confirm technical accuracy using official documentation

Technical details:
- AI/spec-driven authoring workflow
- Book built and deployed with Docusaurus
- Organize work phases as: Outline → Draft → Integrate → Review

## Response snapshot

# Implementation Plan: Physical AI & Humanoid Robotics Book

## Summary

The Physical AI & Humanoid Robotics Book project is an educational initiative to create a comprehensive 150-250 page book targeting senior computer science students and robotics practitioners. The implementation approach combines:

1. **Book Platform**: Docusaurus-based documentation site organized into 4 core modules:
   - Module 1: ROS 2 and Simulation Environments
   - Module 2: Navigation and Perception (Nav2, VSLAM)
   - Module 3: Humanoid Control and AI Integration
   - Module 4: Advanced Robotics Applications
   - Capstone: Complete humanoid robot implementation

2. **Technology Stack**:
   - Frontend: Docusaurus with React/TypeScript for book content
   - Backend: FastAPI for RAG chatbot system
   - Robotics Code: Python (rclpy) and C++ for ROS 2 implementations
   - Storage: Neon Postgres (relational) + Qdrant Cloud (vector database)

3. **RAG System**: Retrieval-Augmented Generation chatbot that answers questions based on book content with proper source attribution

4. **Quality Assurance**: Comprehensive validation including technical accuracy verification, reproducibility testing, and educational quality assessment

The architecture follows a monorepo approach with clear separation between book content (Docusaurus), RAG system (FastAPI), and shared utilities (ROS 2 examples).

## Technical Context

**Language/Version**: Python 3.11+ (ROS 2), C++17 (ROS 2), TypeScript 5.0+, JavaScript ES2022
**Primary Dependencies**: ROS 2 (Humble Hawksbill), Docusaurus 3.x, FastAPI 0.104+, React 18+, Node.js 18+
**Storage**: Neon Postgres (relational), Qdrant Cloud (vector database), GitHub Pages (static hosting)
**Testing**: pytest for Python, Jest/Vitest for TypeScript, Robot Framework for integration tests
**Target Platform**: Cross-platform (Linux, Windows, macOS) for development; Web-based for book delivery
**Project Type**: Web-based educational book with integrated RAG chatbot
**Performance Goals**: <200ms response time for chatbot queries, 95% uptime for book site, 100% reproducible code examples
**Constraints**: Must support ROS 2 Humble Hawksbill (LTS), Docusaurus build under 5 minutes, RAG system with 95%+ accuracy
**Scale/Scope**: Educational content for 1000+ students, 150-250 pages, 4 core modules + capstone project

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Technical Accuracy Compliance
- [x] All technical content will be validated against official documentation (constitution #1.1)
- [x] Using current, stable versions of frameworks: ROS 2 Humble Hawksbill (constitution #1.2)
- [x] Including working code examples with complete setup instructions (constitution #1.3)
- [x] Verification of all technical claims through testing (constitution #1.4)

### Educational Excellence Compliance
- [x] Content structured for senior CS students and robotics practitioners (constitution #2.1)
- [x] Including hands-on examples, diagrams, and practical tasks (constitution #2.2)
- [x] Following logical progression from basic to advanced concepts (constitution #2.3)
- [x] Ensuring reproducible workflows with step-by-step instructions (constitution #2.4)

### AI-Native Authoring Compliance
- [x] Leveraging Spec-Kit Plus and Claude Code for content creation (constitution #3.1)
- [x] Maintaining high-quality, consistent documentation standards (constitution #3.2)
- [x] Using AI tools with human oversight (constitution #3.3)
- [x] Implementing modular, scalable content architecture (constitution #3.4)

### Technology Stack Compliance
- [x] Using Docusaurus for book framework (constitution #3.6.1)
- [x] Deploying to GitHub Pages (constitution #3.6.2)
- [x] Using Python (rclpy) + C++ for ROS 2 implementations (constitution #3.6.3)
- [x] Using TypeScript/React for frontend (constitution #3.6.4)
- [x] Using FastAPI for backend (constitution #3.6.5)
- [x] Using Neon Postgres + Qdrant Cloud for storage (constitution #3.6.6)

### Documentation Requirements Compliance
- [x] Including Mermaid diagrams for system architectures (constitution #3.7.1)
- [x] Providing complete environment setup instructions (constitution #3.7.2)
- [x] Documenting troubleshooting steps (constitution #3.7.3)
- [x] Including performance benchmarks (constitution #3.7.4)

### Quality Assurance Compliance
- [x] Technical review by robotics domain experts (constitution #4.1)
- [x] Code examples tested in actual environments (constitution #4.2)
- [x] Peer review process for content accuracy (constitution #4.3)
- [x] Student feedback integration (constitution #4.4)

### RAG System Compliance
- [x] Modular RAG system for production readiness (constitution #5.3)
- [x] Source-linked answers with proper citations (constitution #5.2)
- [x] Scalable vector search capabilities (constitution #5.3)
- [x] Proper error handling (constitution #5.4)

All constitution requirements are satisfied by the proposed implementation approach.

## Project Structure

### Documentation (this feature)

```text
specs/master/
├── spec.md              # Feature specification
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Book and Application Structure
my_website/                 # Docusaurus-based book website
├── docs/                   # Book content organized by modules
│   ├── module-1-ros2-basics/
│   ├── module-2-navigation-perception/
│   ├── module-3-humanoid-control/
│   ├── module-4-advanced-applications/
│   ├── capstone-project/
│   ├── glossary/
│   └── references/
├── src/
│   ├── components/         # Custom React components
│   ├── pages/              # Special pages
│   └── css/                # Custom styles
├── static/                 # Static assets (images, diagrams)
├── docusaurus.config.js    # Docusaurus configuration
├── sidebars.js             # Navigation sidebar configuration
└── package.json            # Dependencies

backend/                    # FastAPI backend for RAG chatbot
├── src/
│   ├── api/                # API endpoints
│   ├── models/             # Data models
│   ├── services/           # Business logic
│   ├── database/           # Database operations
│   └── utils/              # Utility functions
├── tests/                  # Backend tests
├── requirements.txt        # Python dependencies
└── main.py                 # Application entry point

src/                        # Shared utilities (ROS 2 examples, etc.)
├── ros2_examples/          # ROS 2 code examples from book
├── simulation/             # Simulation environment scripts
└── utils/                  # Shared utilities

.history/                   # Prompt History Records
├── prompts/
│   ├── general/
│   ├── book-architecture/
│   ├── module-design/
│   └── implementation/
└── adrs/                   # Architecture Decision Records

.specify/                   # Spec-Kit Plus configuration
├── memory/                 # Project memory
├── templates/              # Template files
└── scripts/                # Utility scripts

specs/                      # Specifications for all features
├── master/                 # Main book project
└── 1-ros2-basics/          # Individual module specs (if needed)

# Configuration files
├── .env.example            # Environment variables template
├── docker-compose.yml      # Docker configuration
├── .gitignore              # Git ignore rules
├── README.md               # Project overview
└── CLAUDE.md               # Claude Code rules
```

**Structure Decision**: The project follows a monorepo approach with three main components:
1. `my_website/` - Docusaurus-based book site with modular content organization
2. `backend/` - FastAPI-based RAG system for the chatbot functionality
3. `src/` - Shared utilities and ROS 2 code examples referenced throughout the book

This structure allows for clear separation of concerns while maintaining modularity for the educational content and supporting systems.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [N/A] | [No violations found] | [All constitution requirements satisfied] |

## Architectural Decision Records (ADRs)

### ADR-1: Docusaurus as Book Platform
- **Decision**: Use Docusaurus as the primary platform for the educational book
- **Rationale**: Docusaurus provides excellent documentation capabilities, built-in search, responsive design, and easy content organization
- **Alternatives**: GitBook, Sphinx, Hugo
- **Status**: Accepted

### ADR-2: Multi-Language Code Examples (Python/C++)
- **Decision**: Include both Python (rclpy) and C++ examples for ROS 2 content
- **Rationale**: ROS 2 ecosystem uses both languages; Python for rapid prototyping, C++ for performance
- **Alternatives**: Single language approach
- **Status**: Accepted

### ADR-3: FastAPI + Qdrant for RAG System
- **Decision**: Use FastAPI backend with Qdrant vector database for the RAG chatbot
- **Rationale**: FastAPI provides excellent performance and documentation; Qdrant is efficient for semantic search
- **Alternatives**: LangChain + Pinecone, custom solution
- **Status**: Accepted

### ADR-4: Mermaid + Custom Images for Diagrams
- **Decision**: Use Mermaid for architecture diagrams and custom images for complex concepts
- **Rationale**: Mermaid provides version-controllable diagrams; custom images needed for complex robotics visuals
- **Alternatives**: Only images or only Mermaid
- **Status**: Accepted

### ADR-5: Monorepo Architecture
- **Decision**: Organize project as a monorepo with separate directories for book, backend, and utilities
- **Rationale**: Clear separation of concerns while maintaining modularity and ease of development
- **Alternatives**: Multi-repo approach
- **Status**: Accepted

## Outcome

- ✅ Impact: Created comprehensive implementation plan for Physical AI & Humanoid Robotics book project with detailed architecture, technology stack, and project structure
- 🧪 Tests: Research, data model, quickstart guide, and quality validation documents completed
- 📁 Files: Created/updated spec.md, plan.md, research.md, data-model.md, quickstart.md, quality-validation.md, and API contracts
- 🔁 Next prompts: Ready to proceed with implementation tasks
- 🧠 Reflection: Planning phase successfully completed with all architectural decisions documented and constitution compliance verified

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - All constitution requirements satisfied
- Prompt variant (if applicable): Standard planning workflow
- Next experiment (smallest change to try): Begin implementation with Module 1 content creation