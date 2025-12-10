# ADR-001: Vision-Language-Action (VLA) Module Architecture

## Status
Proposed

## Context
For the VLA module in the Physical AI & Humanoid Robotics Book, we need to make key architectural decisions regarding technology stack, system architecture, and simulation environment. These decisions will impact the educational effectiveness and implementation approach for students learning how Whisper, LLMs, and ROS2 coordinate in a single pipeline.

## Decision

### 1. Technology Stack: OpenAI Stack (Whisper + GPT + ROS2)
- **Selected Option**: OpenAI Whisper for speech recognition, OpenAI GPT for cognitive planning, ROS2 for action execution
- **Rationale**: Provides stable APIs, good documentation, and consistent performance for educational purposes
- **Alternatives Considered**:
  - Open source alternatives (Hugging Face models, etc.)
  - Other LLM providers (Anthropic, etc.)
- **Trade-offs**:
  - Pros: Reliable, well-documented, consistent performance
  - Cons: API costs, dependency on external services

### 2. Architecture Pattern: Monolithic Educational Pipeline
- **Selected Option**: Single integrated pipeline rather than microservices
- **Rationale**: Simplifies understanding for students learning the VLA concept
- **Alternatives Considered**:
  - Microservices architecture with separate components
  - Plugin-based architecture
- **Trade-offs**:
  - Pros: Easier for students to understand, simpler debugging
  - Cons: Less scalable, less modular for advanced implementations

### 3. Simulation Environment: Gazebo
- **Selected Option**: Gazebo simulation environment
- **Rationale**: Has wider community support and documentation, better for educational use
- **Alternatives Considered**:
  - Isaac Sim
  - Custom simulation environments
- **Trade-offs**:
  - Pros: Broad compatibility, extensive documentation, large community
  - Cons: Less advanced features compared to Isaac Sim

## Consequences

### Positive
- Students can focus on learning VLA concepts rather than dealing with complex integration issues
- Consistent and reliable learning experience
- Well-documented technologies that are industry-standard

### Negative
- Dependency on external APIs for core functionality
- May not represent all possible implementation approaches
- Potential costs for API usage during extended learning periods

### Neutral
- Architecture decisions align with educational goals of the project
- Technologies chosen are current and relevant to industry practices