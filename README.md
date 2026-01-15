# TrustMed

**TrustMed** is a blockchain-based healthcare platform designed to ensure data integrity and patient trust. This repository contains the frontend application, engineered with a focus on security, scalability, and modern web standards.

## ⚡ Tech Stack

This project utilizes a bleeding-edge stack to ensure performance and longevity:

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Core:** [React 19](https://react.dev/)
* **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **State/Validation:** React Hook Form + Zod
* **Quality Control:** ESLint + Prettier + Husky + Commitlint

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v20 or higher recommended)
* **npm** (comes with Node)

### Installation

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

2.  **Install dependencies:**
    *Note: We use legacy peer deps due to the bleeding-edge nature of React 19/Next 16.*
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Setup Environment:**
    Create a `.env.local` file in the root directory.
    ```bash
    cp .env.example .env.local
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🤝 Contributing

We enforce strict engineering standards to maintain code quality.
**Before contributing, please read our [Contribution Guidelines](./CONTRIBUTING.md).**

* **Branching:** We use specific naming conventions (e.g., `feat/`, `fix/`).
* **Commits:** We follow [Conventional Commits](https://www.conventionalcommits.org/).
* **Hooks:** Husky is configured to reject commits that do not meet these standards.

1.  **Sync:** Ensure your branch is up to date with `main` before raising a PR.
    ```bash
    git fetch origin
    git rebase origin/main
    ```
2.  **Title:** Use the same Conventional Commit format for your PR title.
3.  **Description:** clearly explain _what_ changed and _why_. Attach screenshots if UI is affected.
4.  **Review:** Request a code review from at least one maintainer.

**Copyright (c) 2026 TrustMed. All Rights Reserved.**

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](./LICENSE).
