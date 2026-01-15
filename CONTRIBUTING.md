# 🌟 Contributing to TrustMed

Thank you for contributing to TrustMed. To ensure our codebase remains robust, maintainable, and research-grade, we adhere to the following engineering standards.

## 🛠 1. Development Workflow

We use a **Trunk-Based Development** approach adapted for feature isolation.

### Branching Strategy
All work must be done on a dedicated branch. **Direct commits to `main` are blocked.**

| Branch Type  | Naming Convention        | Use Case                                                   |
| :----------- | :----------------------- | :--------------------------------------------------------- |
| **Feature** | `feat/short-description` | New capabilities (e.g., `feat/auth-jwt`)                   |
| **Bugfix** | `fix/short-description`  | Fixing an issue (e.g., `fix/header-alignment`)             |
| **Refactor** | `refactor/scope`         | Code cleanup, no logic change (e.g., `refactor/api-utils`) |
| **Hotfix** | `hotfix/issue-id`        | Critical prod fixes (e.g., `hotfix/payment-crash`)         |
| **Chore** | `chore/short-description`| Config changes, dependency updates                         |

---

## 📝 2. Commit Standards

We strictly follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification.

**Format:**
`type(scope): description`

**Allowed Types:**
* `feat`: A new feature
* `fix`: A bug fix
* `docs`: Documentation only changes
* `style`: Changes that do not affect meaning (white-space, formatting)
* `refactor`: A code change that neither fixes a bug nor adds a feature
* `perf`: A code change that improves performance
* `test`: Adding missing tests or correcting existing tests
* `chore`: Changes to the build process or auxiliary tools

**Examples:**
> ✅ `feat(auth): implement google oauth provider`
> ✅ `fix(ui): resolve overlap in mobile navbar`
> ❌ `added login` (Missing type)

---

## 🎨 3. Code Quality & Linting

Before pushing, ensure your code meets our quality gates.

1.  **Linting:** `npm run lint` (Static analysis)
2.  **Type Checking:** Ensure no TypeScript errors exist.

> **Note:** We use **Husky** hooks. Your commit will be automatically rejected if it fails linting or does not follow the commit message convention.

---

## 🚀 4. Pull Request (PR) Process

1.  **Sync:** Ensure your branch is up to date with `main` before raising a PR.
    ```bash
    git fetch origin
    git rebase origin/main
    ```
2.  **Title:** Use the same Conventional Commit format for your PR title.
3.  **Description:** Clearly explain *what* changed and *why*.
4.  **Review:** Request a code review from a maintainer.

---

## ⚖️ License Agreement

By contributing to this repository, you acknowledge that your contributions become the property of **TrustMed** and will be licensed under the project's **Proprietary License**. You agree not to distribute this code externally without permission.