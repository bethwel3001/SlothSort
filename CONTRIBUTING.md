# Contributing to SlothSort

Thank you for your interest in contributing to SlothSort. We welcome contributions, bug fixes, and feature proposals from the community.

## Design Philosophy: Keep It Minimal

SlothSort is intentionally designed to be lightweight, fast, and bloat-free. When proposing changes:
- Avoid unnecessary external dependencies or oversized libraries.
- Maintain the minimalist, high-contrast black-and-white visual identity.
- Keep agent logic direct and easy to audit.

## How to Contribute

### 1. Fork the Repository

Create a personal fork of the repository on GitHub and clone it locally:

```bash
git clone https://github.com/<your-username>/SlothSort.git
cd SlothSort
```

### 2. Create a Feature Branch

Always create a dedicated topic branch rather than working directly on `main`:

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

- Follow existing TypeScript and Next.js project patterns.
- Ensure the app builds without errors by running `npm run build`.
- Verify TypeScript types pass cleanly with `npx tsc --noEmit`.

### 4. Commit Using Conventional Commits

We follow the Conventional Commits specification for structured, readable git logs. Every commit message should adhere to the following format:

`<type>(<optional scope>): <description>`

Common types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation updates
- `style`: Formatting or UI style adjustments
- `refactor`: Code reorganization without functional changes
- `chore`: Dependency updates or build tooling maintenance

Examples:
- `feat: add support for custom classification thresholds`
- `fix: resolve file locking on Windows path renaming`
- `docs: clarify local Ollama network configuration`

### 5. Open a Pull Request

Push your branch to your fork and submit a Pull Request against the `main` branch of `bethwel3001/SlothSort`:

```bash
git push -u origin feature/your-feature-name
```

Provide a clear description of the problem your PR solves, what was changed, and how to verify it locally.
