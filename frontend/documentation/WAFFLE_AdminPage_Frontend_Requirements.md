# W.A.F.F.L.E. — Admin Frontend
## Environment Requirements & Setup Guide

---

## 1. Project Overview

The **W.A.F.F.L.E. Admin Frontend** is a React/TypeScript single-page application for managing users, roles, permissions, SQL connections, ChatStats access, automation permissions, and an LLM controller. The interface is tab-driven and styled with a custom "Ridgemont" design system.

---

## 2. Runtime Requirements

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | 18.x or later (LTS recommended) | Required for Vite and React |
| **npm** | 9.x or later | Comes bundled with Node.js |
| A modern browser | Chrome 110+, Firefox 110+, Edge 110+ | Safari 16+ also supported |

---

## 3. Dependencies

### Production Dependencies

| Package | Purpose |
|---|---|
| `react` | Core UI library |
| `react-dom` | DOM rendering for React |
| `bootstrap` | Base CSS grid/utilities (imported in `main.tsx`) |

### Development Dependencies

| Package | Purpose |
|---|---|
| `typescript` | Static typing |
| `vite` | Build tool and dev server |
| `@vitejs/plugin-react` | Vite plugin for React JSX transform |
| `@types/react` | TypeScript types for React |
| `@types/react-dom` | TypeScript types for React DOM |

### External Fonts

The app loads **Nunito Sans** from Google Fonts at runtime. An internet connection is required on first load, or the import in `App.css` can be replaced with a locally hosted font.

```css
/* App.css — line 1 */
@import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap");
```

---

## 4. Project Structure

```
project-root/
├── src/
│   ├── components/
│   │   ├── UsersTab.tsx              # User management tab
│   │   ├── RolesModulesTab.tsx       # Roles & modules config tab
│   │   ├── SQLTab.tsx                # SQL connections tab
│   │   ├── ChatStatsPermsTab.tsx     # ChatStats permissions tab
│   │   ├── AutomationPerms.tsx       # Automation permissions tab
│   │   ├── LLMTab.tsx                # LLM controller tab
│   │   └── WAFFLE_Header_Message.tsx # Branded header component
│   ├── Admin_Frontend.tsx            # Root app component (tab shell)
│   ├── App.css                       # Global styles & Ridgemont design tokens
│   └── main.tsx                      # Entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Installation & Setup

### Step 1 — Clone or copy the project files

Place all source files into the structure described above.

### Step 2 — Install dependencies

```bash
npm install
```

This will install React, React DOM, Bootstrap, Vite, TypeScript, and all associated type definitions.

### Step 3 — Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default (Vite's standard port).

### Step 4 — Build for production

```bash
npm run build
```

Output will be placed in the `dist/` folder and can be served by any static file host.

---

## 6. Recommended `package.json`

```json
{
  "name": "waffle-admin-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "bootstrap": "^5.3.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

---

## 7. Recommended `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

---

## 8. Recommended `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 9. Design System — CSS Custom Properties

The following CSS variables are defined in `App.css` and used throughout all components. Do not rename or remove them.

| Variable | Value | Usage |
|---|---|---|
| `--ridgemont-blue` | `#006BB7` | Primary brand color, borders, headings |
| `--ridgemont-black` | `#231F20` | Body text |
| `--ridgemont-white` | `#FFFFFF` | Card/container backgrounds |
| `--ridgemont-blue-dark` | `#005494` | Hover states |
| `--ridgemont-blue-light` | `#E8F2FA` | Subtle backgrounds, focus states |
| `--text-color` | alias of `--ridgemont-black` | General text |
| `--bg-color` | `#F4F6F8` | Page background |
| `--accent` | alias of `--ridgemont-blue` | Accent highlights |

---

## 10. Tab Status

| Tab | Component File | Status |
|---|---|---|
| Users | `UsersTab.tsx` | Active |
| Roles/Modules | `RolesModulesTab.tsx` | In development (commented out) |
| SQL Connections | `SQLTab.tsx` | In development (commented out) |
| ChatStats Permissions | `ChatStatsPermsTab.tsx` | Active |
| Automation Permissions | `AutomationPerms.tsx` | In development (commented out) |
| LLM Controller | `LLMTab.tsx` | In development (commented out) |

To enable an in-development tab, uncomment its import and `element` property in `Admin_Frontend.tsx`.

---

## 11. Known Notes & Conventions

- **Base font size** is set to `62.5%` on `<html>`, making `1rem = 10px`. All sizing in components uses `rem` units scaled accordingly (e.g., `1.4rem = 14px`).
- **No router** is used. Navigation is tab-based and fully managed by `useState` in `Admin_Frontend.tsx`.
- **Mock data** is present in `ChatStatsPermsTab.tsx`. All `INITIAL_*` constants and `initialPerms` are placeholders and should be replaced with backend API calls.
- Bootstrap is imported for CSS utilities only. No Bootstrap JavaScript components are used.
