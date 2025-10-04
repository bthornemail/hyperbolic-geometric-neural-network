# H²GNN - Hyperbolic Geometric Neural Network

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

H²GNN is a revolutionary, self-improving AI system for hierarchical learning and collaborative development. It leverages hyperbolic geometry to understand and reason about complex, hierarchical data structures like codebases and knowledge graphs. This project was built using the PocketFlow framework to facilitate the implementation of coding agents.

## ✨ Features

*   **Enhanced H²GNN (Hyperbolic Hierarchical Graph Neural Network):** A sophisticated "brain" that performs learning and reasoning on a persistent hyperbolic graph structure.
*   **Collaborative Learning:** The system is designed for teams, with a **Shared Learning Database** (using Redis/PostgreSQL) to synchronize knowledge and insights across multiple developers and instances.
*   **Custom Rule Engine:** Define and enforce project-specific coding standards and best practices, enabling consistent quality and team-wide alignment.
*   **PocketFlow Integration:** Utilizes a minimalist workflow orchestration engine to define and run complex, multi-step tasks for learning, analysis, and code generation.
*   **Model Context Protocol (MCP):** Employs a universal language for robust and standardized communication between the system's various components.
*   **Agentic Development:** Built from the ground up for collaborative development with AI agents, featuring a "Tool-First" approach to maximize productivity.
*   **Advanced Code Analysis:** Performs deep code understanding using AST (Abstract Syntax Tree) analysis, enabling intelligent refactoring and code generation.
*   **Rich Web UI:** A React-based user interface for visualizing hyperbolic data, interacting with the a knowledge graph, and collaborating with the H²GNN system.
*   **Deployment Ready:** Includes configurations for Docker, Kubernetes, and Terraform, ensuring a smooth path to production.

## 🏛️ Architecture

The H²GNN system is built on a three-tier architecture designed for scalability and performance, with clear separation of concerns:

*   **Broker (Node.js - Pub/Sub):** The central authority and source of truth. It hosts the `CentralizedH2GNNManager` and the `SharedLearningDatabase`, managing the write-path for new knowledge and ensuring data consistency.
*   **Provider (Web Worker - Pub/Sub):** The high-performance compute engine. It runs the H²GNN Core's complex calculations (e.g., hyperbolic distance, projections) off the main thread, transforming data into visualization-friendly formats.
*   **Consumer (DOM - Pub/Sub):** The interactive user interface. It renders the geographic and hyperbolic visualizations using D3 and captures user interactions through the MCP Collaboration Interface.

```mermaid
flowchart TD
    subgraph "User Interaction Layer (Consumer)"
        G[Web UI (React/D3)]
        A[Developer/AI Agent]
    end

    subgraph "Compute & Transformation Layer (Provider)"
        B[H²GNN Core (Web Worker)]
        C(PocketFlow Workflow Engine)
    end

    subgraph "Data & Authority Layer (Broker)"
        D(MCP Communication Bus)
        H(Shared Learning Database - Redis/Postgres)
        I(CentralizedH2GNNManager)
    end

    A -- Interacts with --> G
    G -- Renders Visualizations & Captures User Input --> A
    G -- Subscribes to Visualization Data --> B
    G -- Sends MCP Commands --> D

    B -- Performs Heavy Computations --> B
    B -- Publishes Visualization Data --> G
    B -- Executes Workflows via --> C

    C -- Orchestrates Tasks --> B

    D -- Routes MCP Commands --> I
    I -- Manages Knowledge & Learning --> H
    I -- Publishes Updates --> D
```

## 🗺️ Roadmap

The H²GNN project is developed in phases. Here's a glimpse of what's next:

*   **Phase 3 (In Progress):** Collaborative & Team-Wide Learning, including the implementation of the Shared Learning Database and Custom Rule Engine.
*   **Phase 4:** Scaling, Generalization, and Production Readiness, with a focus on real LLM integration and 3D hyperbolic visualizations.
*   **Phase 5:** Deepening Hyperbolic and Meta-Intelligence Research, including Neural Architecture Search (NAS) and Explainable AI (XAI).
*   **Phase 6:** Multi-Modal and Ecosystem Development, expanding to handle image and audio data and fostering a plugin ecosystem.

## 🚀 Getting Started

### Prerequisites

*   Node.js (>=18.0.0)
*   npm
*   Docker

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
    cd h2gnn-hyperbolic-geometric-neural-network
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

*   **Development Mode:**
    ```bash
    npm run dev
    ```
*   **With Docker:**
    ```bash
    npm run docker:up
    ```

## 🧪 Testing

To run the test suite:

```bash
npm test
```

## 🚢 Deployment

This project is configured for deployment with Docker, Kubernetes, and Terraform.

*   **Docker:**
    ```bash
    npm run docker:up
    ```
*   **Kubernetes:**
    ```bash
    npm run k8s:deploy
    ```
*   **Terraform:**
    ```bash
    npm run terraform:apply
    ```

## 🤝 Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
