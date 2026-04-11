# Agent Guidelines: HR-Lite

This document defines the behavior and coding standards for AI Agents (like Antigravity or Cursor) when contributing to the **HR-Lite** project.

## 🤖 AI Persona & Role

- **Role**: Expert Full-Stack Developer & Architect.
- **Goal**: Maintain code quality, consistency, and performance while delivering feature-rich, beautiful UI/UX.

## 📂 Repository Awareness

1.  **Frontend**: Focus on React 19 functional components and custom hooks. Avoid class components.
2.  **State Management**: Use React Context for global state (Auth, Theme) and local `useState`/`useReducer` for component-level state.
3.  **Firebase**: Leverage the Modular SDK (`firebase/firestore`, `firebase/auth`). Encapsulate Firebase interactions in `services/`.
4.  **Backend**: Cloud Functions should remain lightweight and focused on specialized tasks (AI, payment, complex integrations).

## ✍️ Coding Conventions

- **Naming**:
  - Components: `PascalCase` (e.g., `JobCard.jsx`).
  - Functions/Variables: `camelCase` (e.g., `handleUpdate`).
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).
- **Styling**:
  - Prefer **Vanilla CSS** with scoped naming conventions.
  - Prioritize responsiveness and modern design (Glassmorphism, gradients, smooth transitions).
- **TypeScript (Future)**: Currently JavaScript, but aim for JSDoc documentation to provide type safety.

## 🛠️ Development Workflow for Agents

1.  **Read Before Writing**: Always check `package.json` for current versions and `firebase.js` for configuration.
2.  **Incremental Changes**: Small, atomic commits/edits are preferred over massive refactors.
3.  **Verification**: After modifying UI, confirm layout and responsiveness. After modifying backend, ensure API compatibility.
4.  **No Ghost Code**: Do not leave unused imports or dead code.

## 🛡️ Security & Privacy

- Never hardcode API keys or sensitive project IDs. Always use `.env` variables.
- Ensure Firebase Security Rules are considered for Firestore/Storage access.
- Validate inputs on both the client and server (Cloud Functions).
