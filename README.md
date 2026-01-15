# 🌟 Contributing to TrustMed

Thank you for your interest in contributing to TrustMed. We adhere to strict engineering standards to ensure our codebase remains robust, maintainable, and research-grade.

## 🛠 1. Development Workflow

We use a **Trunk-Based Development** approach adapted for feature isolation.

### Branching Strategy

All work must be done on a dedicated branch. Direct commits to `main` are blocked.

| Branch Type  | Naming Convention        | Use Case                                                   |
| :----------- | :----------------------- | :--------------------------------------------------------- |
| **Feature**  | `feat/short-description` | New capabilities (e.g., `feat/auth-jwt`)                   |
| **Bugfix**   | `fix/short-description`  | Fixing an issue (e.g., `fix/header-alignment`)             |
| **Refactor** | `refactor/scope`         | Code cleanup, no logic change (e.g., `refactor/api-utils`) |
| **Hotfix**   | `hotfix/issue-id`        | Critical prod fixes (e.g., `hotfix/payment-crash`)         |

---

## 📝 2. Commit Standards

We strictly follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification. This allows us to automate semantic versioning and changelogs.

**Structure:**
`type(scope): description`

**Allowed Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Example:**

> ✅ `feat(auth): implement google oauth provider`
> ❌ `added google login`

---

## 🎨 3. Code Quality & Linting

Before pushing, ensure your code meets our quality gates.

1.  **Linting:** Run `npm run lint` to check for static analysis errors.
2.  **Formatting:** Run `npm run format` (Prettier) to ensure consistent style.
3.  **Type Checking:** Ensure no TypeScript errors exist.

> **Note:** We use **Husky** hooks. Your commit will be automatically rejected if it fails linting or does not follow the commit message convention.

---

## 🚀 4. Pull Request (PR) Process

1.  **Sync:** Ensure your branch is up to date with `main` before raising a PR.
    ```bash
    git fetch origin
    git rebase origin/main
    ```
2.  **Title:** Use the same Conventional Commit format for your PR title.
3.  **Description:** clearly explain _what_ changed and _why_. Attach screenshots if UI is affected.
4.  **Review:** Request a code review from at least one maintainer.

---

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](./LICENSE).
