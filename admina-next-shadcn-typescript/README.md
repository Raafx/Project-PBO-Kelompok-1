# Admina — Next.js, Tailwind CSS & shadcn/ui Admin Dashboard

Admina is a multipurpose admin dashboard template built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4** and **shadcn/ui**. It includes 11 dashboards, apps, forms, tables, charts, UI components and a working authentication flow.

## Features

- **11 dashboards:** eCommerce, Analytics, AI Crypto Trading, CRM, Help Desk, Finance & Banking, Investment, Project Management, Crypto, Sales and NFT
- **Apps:** Email, Chat, Calendar (FullCalendar), Wallet, Widgets, Marketplace
- **Users:** users list, users grid, profile, company profile
- **Forms, tables, charts (ApexCharts) and 16 UI component pages**
- **Authentication** with Auth.js (NextAuth v5): email/password, plus optional Google and GitHub sign-in
- **Theme customizer:** light/dark/system mode, LTR/RTL, 6 color schemes and 3 layouts, saved per browser
- Fully responsive, with typed components and zero ESLint errors

## Requirements

- **Node.js 20.9 or newer**
- npm (bundled with Node.js), or pnpm, yarn or bun

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env.local
#    then set AUTH_SECRET (see "Environment variables")

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You are redirected to the sign-in page.

**Demo login:** `admina@gmail.com` / `Pa$$w0rd!` (pre-filled on the sign-in form).

## Scripts

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the development server (webpack)        |
| `npm run dev:turbo` | Start the development server with Turbopack   |
| `npm run build`     | Create an optimized production build          |
| `npm start`         | Serve the production build                    |
| `npm run lint`      | Run ESLint                                    |

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values.

| Variable                                     | Required        | Description |
| -------------------------------------------- | --------------- | ----------- |
| `AUTH_SECRET`                                | Production only | Secret used to encrypt sessions. Generate one with `npx auth secret`. A throwaway value is used automatically in local development only. |
| `NEXT_PUBLIC_SITE_URL`                       | No              | Your public URL (e.g. `https://admin.example.com`), used for social previews, `robots.txt` and `sitemap.xml`. On Vercel the deployment URL is detected automatically. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`  | No              | Enables "Sign in with Google". |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`  | No              | Enables "Sign in with GitHub". |

Never commit `.env.local` or share it with anyone. It contains your secrets.

## Project structure

```
app/
  (dashboard)/          Authenticated pages (dashboards, apps, forms, tables, charts, components)
    (homes)/            The 11 dashboards
    layout.tsx          Dashboard shell (sidebar, header, footer, theme customizer)
  auth/                 Sign in, sign up, forgot password and create password pages
  api/auth/             Auth.js route handler
  layout.tsx            Root layout and default metadata
  opengraph-image.tsx   Generated social preview image
  robots.ts, sitemap.ts
components/
  ui/                   shadcn/ui primitives
  charts/               ApexCharts chart components
  layout/               Header, footer, breadcrumb
  shared/               Reusable pieces (dropdowns, selects, card menu…)
  sidebar.tsx           Sidebar navigation (menu items live in the MENU array)
  theme-customizer/     Theme settings panel
hooks/                  React hooks (theme color, direction, persisted settings…)
lib/                    Validation schemas, auth guard, site URL, utilities
utils/db.ts             Demo user store (replace with your database)
auth.ts                 Auth.js configuration
proxy.ts                Route protection (redirects signed-out users to /auth/login)
public/assets/          Images and static data
```

## Customization

### Colors and theme

Theme tokens (colors, radius, chart colors) are CSS variables in `app/globals.css`, in `:root` for light mode and `.dark` for dark mode. The default primary color is `--primary`. Users can also choose a color scheme in the theme customizer.

### Sidebar menu

Edit the `MENU` array at the top of `components/sidebar.tsx`. Each group has a label, an icon ([lucide-react](https://lucide.dev/icons)) and a list of `{ label, href, icon }` items. The active item is highlighted automatically from the current URL.

### Adding a page

Create `app/(dashboard)/your-page/page.tsx`. The page is automatically wrapped in the dashboard layout and protected by authentication. Export `metadata` to set its title:

```tsx
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Page | Admina Admin Dashboard",
};

export default function YourPage() {
  return <DashboardBreadcrumb title="Your Page" text="Your Page" />;
}
```

## Authentication

- **Configuration:** `auth.ts` configures Auth.js with a Credentials provider. Google and GitHub are added only when their environment variables are set.
- **Users:** `utils/db.ts` is a demo user store. Passwords are stored only as salted scrypt hashes, so to connect a real database, replace `getUserFromDb` with a database lookup and keep storing hashes (`hashPassword` / `verifyPassword`).
- **Route protection:** `proxy.ts` sends signed-out visitors to `/auth/login` and answers unauthenticated `/api/*` requests with `401`.
- **Server actions:** Every server action and API route checks the session itself with `requireUser()` from `lib/auth-guard.ts`. Do the same in any action or route you add.
- **Demo forms:** The form actions in the demo pages (profile, company, settings…) are placeholders. Connect them to your backend where their comments indicate.

## Deployment

The project deploys to any Node.js host. On **Vercel**:

1. Import the repository.
2. Add `AUTH_SECRET` (and any optional variables) under **Settings → Environment Variables**.
3. Deploy.

On other hosts, run `npm run build` and then `npm start`, with the same environment variables set.

## Credits

- [Next.js](https://nextjs.org), [React](https://react.dev): MIT
- [Tailwind CSS](https://tailwindcss.com): MIT
- [shadcn/ui](https://ui.shadcn.com) and [Radix UI](https://www.radix-ui.com): MIT
- [Auth.js](https://authjs.dev): ISC
- [ApexCharts](https://apexcharts.com): MIT
- [FullCalendar](https://fullcalendar.io) (standard plugins): MIT
- [lucide-react](https://lucide.dev): ISC
- [react-simple-maps](https://www.react-simple-maps.io): MIT. Map data: [world-atlas](https://github.com/topojson/world-atlas), ISC
- [React Hook Form](https://react-hook-form.com): MIT. [Zod](https://zod.dev): MIT
- [Inter](https://rsms.me/inter/) font: SIL Open Font License

Images are for preview purposes only and are not included in the license unless stated otherwise.
