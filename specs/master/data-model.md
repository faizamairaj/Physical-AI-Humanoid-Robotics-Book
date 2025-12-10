# Data Model: Physical AI & Humanoid Robotics Book

## 1. Book Content Entities

### BookModule
- **Fields**:
  - id: string (unique identifier)
  - title: string (module title)
  - description: string (module description)
  - order: integer (sequence number)
  - estimatedReadingTime: integer (in minutes)
  - learningObjectives: string[] (list of learning objectives)
  - prerequisites: string[] (required knowledge)
  - chapters: Chapter[] (collection of chapters in the module)
  - codeExamples: CodeExample[] (collection of code examples)
  - exercises: Exercise[] (collection of exercises)
  - createdAt: datetime
  - updatedAt: datetime

### Chapter
- **Fields**:
  - id: string (unique identifier)
  - moduleId: string (reference to parent module)
  - title: string (chapter title)
  - content: string (chapter content in Markdown format)
  - order: integer (sequence within module)
  - estimatedReadingTime: integer (in minutes)
  - learningObjectives: string[] (list of learning objectives)
  - keywords: string[] (important terms in chapter)
  - diagrams: Diagram[] (collection of diagrams in chapter)
  - createdAt: datetime
  - updatedAt: datetime

### CodeExample
- **Fields**:
  - id: string (unique identifier)
  - moduleId: string (reference to module)
  - chapterId: string (reference to chapter)
  - title: string (example title)
  - description: string (description of the example)
  - language: enum (Python, C++, TypeScript, etc.)
  - code: string (actual code content)
  - explanation: string (explanation of the code)
  - filePath: string (path where example is stored)
  - dependencies: string[] (required dependencies)
  - createdAt: datetime
  - updatedAt: datetime

### Exercise
- **Fields**:
  - id: string (unique identifier)
  - moduleId: string (reference to module)
  - chapterId: string (reference to chapter)
  - title: string (exercise title)
  - description: string (exercise description)
  - difficulty: enum (Beginner, Intermediate, Advanced)
  - type: enum (Hands-on, Theoretical, Research)
  - estimatedTime: integer (in minutes)
  - solution: string (solution if applicable)
  - hints: string[] (helpful hints)
  - createdAt: datetime
  - updatedAt: datetime

### Diagram
- **Fields**:
  - id: string (unique identifier)
  - moduleId: string (reference to module)
  - chapterId: string (reference to chapter)
  - title: string (diagram title)
  - type: enum (Mermaid, Image, Custom)
  - description: string (description of the diagram)
  - content: string (diagram content - Mermaid code or file path)
  - caption: string (caption for the diagram)
  - createdAt: datetime
  - updatedAt: datetime

## 2. RAG System Entities

### DocumentChunk
- **Fields**:
  - id: string (unique identifier)
  - documentId: string (reference to source document)
  - moduleId: string (reference to book module)
  - chapterId: string (reference to book chapter)
  - content: string (chunked content text)
  - embedding: float[] (vector embedding of the content)
  - metadata: object (additional metadata)
  - createdAt: datetime
  - updatedAt: datetime

### Conversation
- **Fields**:
  - id: string (unique identifier)
  - userId: string (user identifier)
  - sessionId: string (session identifier)
  - createdAt: datetime
  - updatedAt: datetime
  - messages: Message[] (collection of messages in conversation)

### Message
- **Fields**:
  - id: string (unique identifier)
  - conversationId: string (reference to conversation)
  - role: enum (user, assistant)
  - content: string (message content)
  - sources: SourceReference[] (sources used in response)
  - timestamp: datetime
  - createdAt: datetime
  - updatedAt: datetime

### SourceReference
- **Fields**:
  - id: string (unique identifier)
  - messageId: string (reference to message)
  - documentId: string (reference to source document)
  - moduleId: string (reference to book module)
  - chapterId: string (reference to book chapter)
  - pageReference: string (page/chapter reference)
  - textExcerpt: string (excerpt from source)
  - relevanceScore: float (similarity score)
  - createdAt: datetime

## 3. User and Interaction Entities

### UserQuery
- **Fields**:
  - id: string (unique identifier)
  - userId: string (user identifier)
  - queryText: string (original query)
  - processedQuery: string (processed query)
  - response: string (generated response)
  - sources: SourceReference[] (sources used)
  - feedback: Feedback (user feedback on response)
  - createdAt: datetime
  - updatedAt: datetime

### Feedback
- **Fields**:
  - id: string (unique identifier)
  - queryId: string (reference to user query)
  - rating: integer (1-5 rating)
  - comment: string (optional comment)
  - helpful: boolean (whether response was helpful)
  - createdAt: datetime
  - updatedAt: datetime

## 4. System Configuration Entities

### BookConfiguration
- **Fields**:
  - id: string (unique identifier)
  - title: string (book title)
  - subtitle: string (book subtitle)
  - authors: string[] (list of authors)
  - version: string (book version)
  - publicationDate: datetime
  - totalModules: integer (number of modules)
  - totalPages: integer (estimated total pages)
  - license: string (license information)
  - createdAt: datetime
  - updatedAt: datetime

### SystemSettings
- **Fields**:
  - id: string (unique identifier)
  - ragEnabled: boolean (whether RAG system is enabled)
  - searchThreshold: float (relevance threshold for search)
  - maxResponseTokens: integer (max tokens in response)
  - conversationTimeout: integer (in minutes)
  - rateLimit: integer (requests per minute per user)
  - createdAt: datetime
  - updatedAt: datetime