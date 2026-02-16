# TrustMed

**TrustMed** is a blockchain-based healthcare platform designed to ensure data integrity and patient trust. This repository contains the frontend application, engineered with a focus on security, scalability, and modern web standards.

## ⚡ Tech Stack

This project utilizes a bleeding-edge stack to ensure performance and longevity:

### 🎨 Frontend (Patient & Doctor Portals)
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Core:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State/Validation:** React Hook Form + Zod

### ⚙️ Backend (Core, HMS & Connector)
- **Framework:** [NestJS 11](https://nestjs.com/)
- **Database:** PostgreSQL / MySQL (via TypeORM)
- **Architecture:** Microservices with shared DTOs
- **Validation:** class-validator + class-transformer



## 🏗 System Architecture

The repository is structured into three logical domains:

1.  **Core Platform (`apps/core-*`)**: The central authority managing DIDs and Consent.
2.  **Hospital System (`apps/hms-*`)**: A simulated, standalone hospital environment with its own private database.
3.  **The Bridge (`apps/connector-node`)**: A background service that polls the HMS and securely transmits records to the Core via API.

## 📂 Directory Structure

```text
.
├── apps/                          # 🚀 Deployable Applications
│   ├── core-backend/              # Global API (NestJS)
│   ├── core-frontend/             # Patient Portal (Next.js)
│   ├── hms-backend/               # Demo Hospital API (NestJS)
│   ├── hms-frontend/              # Doctor Dashboard (Next.js)
│   └── connector-node/            # Data Sync Service (NestJS)
│
├── packages/                      # 📦 Shared Libraries
│   ├── types/                     # Shared DTOs & Interfaces (The "Contract")
│   └── 

```

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
See the [LICENSE](./LICENSE) file for details.


test added:
