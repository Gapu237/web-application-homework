@'
# Project Rules

## 1. General Principles

- Follow the requirements of each homework.
- Keep each homework in its own directory.
- Prefer readable, maintainable, and appropriately simple solutions.
- Avoid modifying unrelated homework files.
- Do not claim that a feature is complete before checking its acceptance criteria.
- Document important implementation decisions when necessary.

## 2. Repository Structure

- `HW1-data-grid/`: Data Grid homework.
- `hw2-audio-visualizer/`: Audio Visualizer homework.
- `hw3-flash-sale/`: Flash Sale homework.
- `TASK_DECOMPOSITION.md`: Task breakdown for the three assignments.
- `PROJECT_RULES.md`: Shared development and repository rules.

Each homework should maintain its own source files, configuration, dependencies manifest, and relevant documentation.

## 3. Coding Standards

### Readability

- Use descriptive names for variables, functions, components, and types.
- Keep functions focused on a clear responsibility.
- Avoid unnecessary duplication.
- Remove unused code and imports.
- Add comments when they clarify non-obvious logic.

### TypeScript and React

- Define suitable types for data and function parameters.
- Avoid `any` unless there is a justified reason.
- Separate UI components from business logic where appropriate.
- Use React state mechanisms correctly.
- Do not mutate React state directly.
- Handle relevant error, empty, and interaction states.

### Application Logic

- Validate user inputs before applying operations.
- Keep state transitions predictable.
- Handle invalid operations safely.
- In HW3, keep inventory and reservation transitions consistent.
- In HW2, follow the assignment requirements for audio and visualization behavior.

## 4. Testing and Validation

Before submitting each homework:

1. Run the application using its documented command.
2. Check the browser console for relevant errors.
3. Test the required features manually.
4. Run available build, type-checking, and lint checks.
5. Fix blocking issues and retest affected features.
6. Confirm that setup instructions are accurate.

For HW3, test reservation creation, stock limits, checkout, cancellation, expiration, and audit log updates.

For HW1 and HW2, test the interactions specified in their respective assignment requirements.

A successful build or type check does not replace functional testing.

## 5. Git Rules

- Use Git to track source code and documentation.
- Review `git status` before committing.
- Review staged changes before creating a commit.
- Keep commits focused on coherent changes.
- Do not commit `node_modules`, generated build output, secrets, passwords, or access tokens.
- Maintain appropriate `.gitignore` files.
- Push only to the intended GitHub repository and branch.

### Commit Message Format

Use:

`<type>(<scope>): <short description>`

Examples:

- `feat(hw1): implement data grid interactions`
- `feat(hw2): add audio visualization controls`
- `feat(hw3): implement flash sale reservation engine`
- `docs: add task decomposition and project rules`
- `fix(hw3): correct reservation expiration handling`

Common types:

- `feat`: New functionality.
- `fix`: Bug fix.
- `docs`: Documentation changes.
- `refactor`: Code restructuring.
- `test`: Test changes.
- `chore`: Maintenance and configuration.

## 6. Dependencies and Security

- Use the package manager and lockfile associated with each homework.
- Avoid unnecessary dependencies.
- Do not commit credentials, API keys, or private tokens.
- Keep dependency installation and setup instructions documented.
- Do not remove lockfiles without a reason.

## 7. Documentation

Each homework should document its purpose, required software, installation steps, run commands, main features, and relevant limitations.

Repository-level documentation should describe the shared structure and development rules.

## 8. Submission Criteria

A homework is ready for submission when:

- Required features have been implemented.
- Relevant validation and manual testing have been performed.
- No known blocking defects remain.
- Required source files and documentation are present.
- Changes have been committed.
- The intended version has been pushed to GitHub.

The instructor's requirements and grading rubric take precedence over these general rules.
'@ | Set-Content -Encoding utf8 PROJECT_RULES.md