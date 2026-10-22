@'
# Task Decomposition

## 1. Project Overview

This repository contains three web development homework assignments. Each assignment focuses on different frontend development concepts and application functionality.

## 2. HW1 — Data Grid

Directory: `HW1-data-grid/`

- Review the assignment requirements and existing project structure.
- Implement the data grid interface.
- Implement the required data display and user interactions.
- Manage relevant UI state and data updates.
- Test the required features and edge cases.
- Document setup and execution instructions.

**Completion criteria:** Required grid features work correctly, data is displayed consistently, and no known blocking errors remain.

## 3. HW2 — Audio Visualizer

Directory: `hw2-audio-visualizer/`

- Review the assignment requirements and existing project structure.
- Implement the visualization interface and controls.
- Implement the required audio processing or playback behavior.
- Connect audio data or events to the visualization.
- Handle relevant playback and UI states.
- Test the required features and document how to run the application.

**Completion criteria:** Required audio and visualization features work as specified, and no known blocking errors remain.

## 4. HW3 — Flash Sale

Directory: `hw3-flash-sale/`

- Define product and reservation data models.
- Implement the flash sale engine.
- Implement inventory reservation and stock validation.
- Implement checkout and cancellation.
- Implement reservation expiration and inventory release.
- Integrate the engine with the React user interface.
- Record relevant operations in the audit log.
- Test reservation, checkout, cancellation, expiration, and stock updates.
- Document setup and execution instructions.

**Completion criteria:** Inventory and reservation states remain consistent during normal application use, and TypeScript validation passes.

**Limitation:** The current HW3 engine is an in-memory demonstration, not a distributed inventory system with cross-server concurrency guarantees.

## 5. Shared Tasks

- Review each assignment's requirements.
- Keep each homework in its own directory.
- Run available build, type-checking, and lint commands.
- Test required functionality manually.
- Maintain clear source code and useful documentation.
- Track changes with meaningful Git commits.
- Review the final repository before submission.

## 6. Progress Status Definitions

- **Not Started:** Work has not begun.
- **In Progress:** Work is underway.
- **Implemented:** The feature has been developed.
- **Verified:** The feature has been tested against its acceptance criteria.

Task status must reflect actual implementation and testing. A successful commit alone does not prove that a homework is complete.
'@ | Set-Content -Encoding utf8 TASK_DECOMPOSITION.md