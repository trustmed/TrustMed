# TrustMed

**TrustMed** is a blockchain-based healthcare platform designed to ensure data integrity and patient trust. This repository contains the frontend application, engineered with a focus on security, scalability, and modern web standards.

## ⚡ Tech Stack

This project utilizes a bleeding-edge stack to ensure performance and longevity:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Core:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State/Validation:** React Hook Form + Zod
- **Quality Control:** ESLint + Prettier + Husky + Commitlint

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20 or higher recommended)
- **npm** (comes with Node)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/pasinduvinsuka/TrustMed.git](https://github.com/pasinduvinsuka/TrustMed.git)
    cd TrustMed
    ```

2.  **Install dependencies:**
    _Note: We use legacy peer deps due to the bleeding-edge nature of React 19/Next 16._

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

- **Branching:** We use specific naming conventions (e.g., `feat/`, `fix/`).
- **Commits:** We follow [Conventional Commits](https://www.conventionalcommits.org/).
- **Hooks:** Husky is configured to reject commits that do not meet these standards.

## 📄 License

**Copyright (c) 2026 TrustMed. All Rights Reserved.**

This project is licensed under a **Proprietary License**.
Unauthorized copying, distribution, or use of this source code is strictly prohibited.
See the [LICENSE](./LICENSE) file for details..
