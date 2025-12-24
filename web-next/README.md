# One API Web Next

This is the Next.js version of the One API frontend, migrated from the original React application. It uses Ant Design for UI components and supports TypeScript.

## Features

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Ant Design 5
- **State Management**: Redux Toolkit
- **Language**: TypeScript
- **Internationalization**: react-i18next
- **Charts**: ApexCharts (via react-apexcharts)

## Project Structure

- `src/app`: Next.js App Router pages
  - `src/app/panel`: Admin panel pages (Dashboard, User, Channel, etc.)
  - `src/app/login`: Login page
  - `src/app/register`: Registration page
- `src/components`: Reusable UI components
- `src/contexts`: React Contexts (User, Status)
- `src/hooks`: Custom React hooks
- `src/i18n`: Internationalization configuration
- `src/layout`: Layout components (Sidebar, Header)
- `src/lib`: Library configurations (AntD Registry)
- `src/menu-items`: Navigation menu items
- `src/store`: Redux store setup
- `src/utils`: Utility functions

## Getting Started

1. **Install dependencies:**

```bash
npm install
```

2. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

3. **Build for production:**

```bash
npm run build
npm start
```

## Migration Status

Refer to `Plan.md` for the detailed migration status of each feature.
