---
sidebar_label: 'ROS 2 Architecture Diagrams'
---

# Mermaid Diagrams for ROS 2 Architecture

## Publisher-Subscriber Communication

This diagram shows the basic publisher-subscriber communication pattern in ROS 2:

```mermaid
graph LR
    A[Publisher Node] -->|Publishes messages| B(Topic: /chatter)
    B -->|Subscribes to| C[Subscriber Node]
    D[Another Subscriber] --> B
    style A fill:#4CAF50,stroke:#388E3C,stroke-width:2px
    style C fill:#2196F3,stroke:#0D47A1,stroke-width:2px
    style D fill:#2196F3,stroke:#0D47A1,stroke-width:2px
    style B fill:#FFC107,stroke:#FF6F00,stroke-width:2px
```

## Service Communication

This diagram shows the service client-server communication pattern:

```mermaid
graph LR
    A[Service Client] -->|Request| B(Service Server)
    B -->|Response| A
    style A fill:#9C27B0,stroke:#4A148C,stroke-width:2px
    style B fill:#FF9800,stroke:#E65100,stroke-width:2px
```

## Node Architecture

This diagram shows the relationship between nodes, topics, and services:

```mermaid
graph TB
    subgraph "ROS 2 System"
        A[Navigation Node]
        B[Sensors Node]
        C[Control Node]
        D[UI Node]
    end

    A -->|"cmd_vel"| E(Topic: /cmd_vel)
    B -->|"sensor_data"| F(Topic: /sensor_data)
    C -->|"joint_commands"| G(Topic: /joint_commands)
    D -->|"user_commands"| H(Service: /user_service)

    E --> C
    F --> A
    G -->|"feedback"| C
    H --> A

    style A fill:#8BC34A,stroke:#558B2F,stroke-width:2px
    style B fill:#8BC34A,stroke:#558B2F,stroke-width:2px
    style C fill:#8BC34A,stroke:#558B2F,stroke-width:2px
    style D fill:#8BC34A,stroke:#558B2F,stroke-width:2px
```

## Action Communication

This diagram shows the action communication pattern with feedback:

```mermaid
graph LR
    A[Action Client] -->|Goal| B(Action Server)
    B -->|Feedback| A
    B -->|Result| A
    style A fill:#00BCD4,stroke:#006064,stroke-width:2px
    style B fill:#FF5722,stroke:#BF360C,stroke-width:2px
```

## DDS Communication Layer

This diagram shows the underlying DDS communication layer:

```mermaid
graph LR
    subgraph "DDS Implementation"
        A[DDS Domain]
    end

    subgraph "Node 1"
        B[Publisher]
        C[Subscriber]
    end

    subgraph "Node 2"
        D[Publisher]
        E[Subscriber]
    end

    B --> A
    A --> C
    D --> A
    A --> E

    style A fill:#9E9E9E,stroke:#424242,stroke-width:2px
    style B fill:#4CAF50,stroke:#388E3C,stroke-width:2px
    style C fill:#2196F3,stroke:#0D47A1,stroke-width:2px
    style D fill:#4CAF50,stroke:#388E3C,stroke-width:2px
    style E fill:#2196F3,stroke:#0D47A1,stroke-width:2px
```