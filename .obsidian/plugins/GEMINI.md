# Project Directive: V6 - Phase 2 Implementation

**Version:** 6.0
**Status:** MVP Complete. Ready for Development (Phase 2).

---

## 1. High-Level Objective

The foundational MVP of the "Agentic Vaults" architecture is complete. The immediate task is to begin **Phase 2** of the new master plan.

## 2. Primary Reference

All work must adhere to the new, comprehensive specification document:

-   **`TETRAHEDRAL_BRAIN_PLAN.md`**

## 3. Immediate Task: MCP Integration

As outlined in the plan, Phase 2 involves three key areas. The most critical and foundational of these is **Basic MCP Integration for context exchange**.

Your task is to refactor the simple, ad-hoc RPC communication currently used between the `plugin` and the `runtime` to strictly adhere to the **Model Context Protocol (MCP)** `IToolCommand` interfaces defined in the `@opencode-obsidian-workspace/core` package.

**Implementation Steps:**

1.  Refactor the `runtime`'s WebSocket server to be a pure MCP command processor. It should expect all incoming messages to be valid `IToolCommand` objects.
2.  Refactor the `plugin`'s `client.ts` to construct and send proper `IToolCommand` objects for all actions (e.g., `ProcessFile`).
3.  Update the `GetAllNodes` command (which we have not yet implemented) to be an MCP command.
4.  Update the React UI to use this new MCP command to fetch and display the list of nodes from the runtime.

## 4. Agent Instructions

1.  Your primary goal is to remove all non-MCP communication between the plugin and the runtime.
2.  Start by implementing the `GetAllNodes` command, as this will provide the data needed for the UI update.
3.  Then, refactor the existing `ProcessFile` trigger to also use the MCP command structure.

You are now cleared to begin Phase 2.