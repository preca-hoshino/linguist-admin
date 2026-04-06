# Linguist Admin

Modern administration dashboard for the Linguist ecosystem. Built with React 19, Vite, and Shadcn UI.

![Linguist Admin](public/images/shadcn-admin.png)

## 🚀 Features

- **Dashboard**: Real-time overview of system status and usage.
- **API Keys**: Secure management of your translation and model API keys.
- **Models**: Comprehensive tools to manage and configure translation models.
- **MCPs**: Support for Model Context Protocol (MCP) integrations.
- **Users**: System-wide user and administrator management.
- **Settings**: Flexible account and preference settings.
- **I18n & RTL**: Seamless internationalization with full Right-to-Left (RTL) support.
- **Themes**: Modern aesthetics with built-in Light and Dark modes.
- **Responsive**: Fully optimized for mobile, tablet, and desktop.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Quality Control**: [Biome](https://biomejs.dev/) & [ESLint](https://eslint.org/)
- **Testing**: [Vitest](https://vitest.dev/) & [Testing Library](https://testing-library.com/)

<details>
<summary>Customized UI Components (click to expand)</summary>

This project uses Shadcn UI components, but some have been slightly modified for better RTL support and specific project needs.

### Modified Components
- scroll-area
- sonner
- separator

### RTL Updated Components
- alert-dialog
- calendar
- command
- dialog
- dropdown-menu
- select
- table
- sheet
- sidebar
- switch

</details>

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/)

### Run Locally

1. Clone the project
   ```bash
   git clone https://github.com/your-org/linguist-admin.git
   ```

2. Go to the project directory
   ```bash
   cd linguist-admin
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## 🧪 Development Workflow

To ensure code quality, please run the following command before submitting any changes:

```bash
# Full check: Format, Lint, Types, Dependencies, and Tests
npm run check
```

For more details, please refer to the [Contributing Guide](CONTRIBUTING.md).

## 📄 License

Licensed under the [MIT License](LICENSE).

---

*Based on [shadcn-admin](https://github.com/satnaing/shadcn-admin) by [@satnaing](https://github.com/satnaing).*
