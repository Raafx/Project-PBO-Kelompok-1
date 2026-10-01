"use client";

/**
 * Twin Sidebar — icon rail + expandable menu panel.
 * Tailwind conversion of htmls/_sidebar.html (+ _sidebar.scss).
 *
 * - Icon rail lists top-level categories; clicking one swaps the panel's menu group.
 * - The active menu item, its group and its rail icon are derived from the
 *   current route (usePathname), so navigating auto-highlights the right link.
 * - Collapsible to a rail-only strip (persisted) and off-canvas on < xl screens.
 */

import { useLocalStorageSetting } from "@/hooks/use-local-storage-setting";
import LogoIcon from "@/public/assets/images/logo-icon.png";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  AppWindow,
  BadgeCheck,
  BarChart3,
  Bell,
  BellRing,
  Bitcoin,
  Boxes,
  Building2,
  Calendar,
  ChevronDownCircle,
  CircleDot,
  CircleUser,
  Coins,
  CreditCard,
  Ellipsis,
  FileText,
  Gem,
  HandCoins,
  Headset,
  House,
  KeyRound,
  LayoutGrid,
  LineChart,
  ListChecks,
  ListOrdered,
  LoaderCircle,
  Lock,
  LogIn,
  Mail,
  Menu,
  MessageSquareText,
  MessagesSquare,
  MousePointerClick,
  NotebookPen,
  Package,
  Palette,
  PieChart,
  Rocket,
  Rows3,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SquareCheck,
  Star,
  Store,
  Table,
  Tag,
  Tags,
  TextCursorInput,
  ToggleLeft,
  TrendingUp,
  Type,
  Undo2,
  UserPlus,
  UsersRound,
  Wallet,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/* ----------------------------- Menu data ----------------------------- */

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
interface MenuGroup {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Render in the bottom section of the rail (e.g. Settings). */
  bottom?: boolean;
  items: MenuItem[];
}

const MENU: MenuGroup[] = [
  {
    key: "dashboards",
    label: "Dashboards",
    icon: House,
    items: [
      { label: "E-commerce", href: "/dashboard", icon: ShoppingCart },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "AI Crypto Trading", href: "/ai-crypto-trading", icon: Bitcoin },
      { label: "CRM", href: "/crm", icon: PieChart },
      { label: "Help Desk", href: "/help-desk", icon: Headset },
      { label: "Finance & Banking", href: "/finance-banking", icon: HandCoins },
      { label: "Investment", href: "/investment", icon: TrendingUp },
      { label: "Project Management", href: "/project-management", icon: FileText },
      { label: "Crypto", href: "/crypto", icon: Coins },
      { label: "Sales", href: "/sales", icon: Tag },
      { label: "NFT", href: "/nft", icon: Gem },
    ],
  },
  {
    key: "apps",
    label: "Applications",
    icon: LayoutGrid,
    items: [
      { label: "Email", href: "/email", icon: Mail },
      { label: "Chat", href: "/chat", icon: MessagesSquare },
      { label: "Calendar", href: "/calendar", icon: Calendar },
      { label: "Wallet", href: "/wallet", icon: Wallet },
      { label: "Widgets", href: "/widgets", icon: LayoutGrid },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    icon: UsersRound,
    items: [
      { label: "Users List", href: "/users-list", icon: ListChecks },
      { label: "Users Grid", href: "/users-grid", icon: LayoutGrid },
      { label: "View Profile", href: "/view-profile", icon: CircleUser },
      { label: "Company", href: "/company", icon: Building2 },
    ],
  },
  {
    key: "products",
    label: "Products",
    icon: ShoppingBag,
    items: [
      { label: "Marketplace", href: "/marketplace", icon: Store },
      { label: "Marketplace Details", href: "/marketdetails", icon: Package },
    ],
  },
  {
    key: "components",
    label: "Components",
    icon: Boxes,
    items: [
      { label: "Alerts", href: "/alert", icon: AlertCircle },
      { label: "Buttons", href: "/buttons", icon: MousePointerClick },
      { label: "Card", href: "/card", icon: CreditCard },
      { label: "Tabs", href: "/tab-accordion", icon: AppWindow },
      { label: "Badges", href: "/badge", icon: BadgeCheck },
      { label: "Tooltip", href: "/tooltip", icon: MessageSquareText },
      { label: "Dropdown", href: "/dropdown", icon: ChevronDownCircle },
      { label: "Progress", href: "/progress-bar", icon: LoaderCircle },
      { label: "Avatar", href: "/avatar", icon: CircleUser },
      { label: "Pagination", href: "/pagination", icon: Ellipsis },
      { label: "Radio", href: "/radio", icon: CircleDot },
      { label: "Switch", href: "/switch", icon: ToggleLeft },
      { label: "Tags", href: "/tags", icon: Tags },
    ],
  },
  {
    key: "forms",
    label: "Forms",
    icon: NotebookPen,
    items: [
      { label: "Input Forms", href: "/input-forms", icon: TextCursorInput },
      { label: "Form Layout", href: "/input-layout", icon: Rows3 },
      { label: "Form Validation", href: "/form-validation", icon: SquareCheck },
    ],
  },
  {
    key: "tables",
    label: "Tables",
    icon: Table,
    items: [
      { label: "Basic Table", href: "/basic-table", icon: Table },
      { label: "List", href: "/list", icon: ListOrdered },
    ],
  },
  {
    key: "charts",
    label: "Charts",
    icon: LineChart,
    items: [
      { label: "Line Chart", href: "/line-chart", icon: LineChart },
      { label: "Column Chart", href: "/column-chart", icon: BarChart3 },
      { label: "Pie Chart", href: "/pie-chart", icon: PieChart },
    ],
  },
  {
    key: "auth",
    label: "Authentication",
    icon: ShieldCheck,
    items: [
      { label: "Sign In", href: "/auth/login", icon: LogIn },
      { label: "Sign Up", href: "/auth/register", icon: UserPlus },
      { label: "Forgot Password", href: "/auth/forgot-password", icon: KeyRound },
      { label: "Create Password", href: "/auth/create-password", icon: Lock },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    bottom: true,
    items: [
      { label: "Notification", href: "/settings-notification", icon: Bell },
      { label: "Notification Alert", href: "/notification-alert", icon: BellRing },
      { label: "Typography", href: "/typography", icon: Type },
      { label: "Colors", href: "/colors", icon: Palette },
      { label: "Star Rating", href: "/star-rating", icon: Star },
    ],
  },
];

const isItemActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

const findActiveGroupKey = (pathname: string) =>
  MENU.find((g) => g.items.some((i) => isItemActive(pathname, i.href)))?.key ?? null;

/* --------------------------- UI state context --------------------------- */

interface SidebarUI {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
}

const SidebarUIContext = createContext<SidebarUI | null>(null);

export function useSidebarUI(): SidebarUI {
  const ctx = useContext(SidebarUIContext);
  if (!ctx) throw new Error("useSidebarUI must be used within <SidebarUIProvider>");
  return ctx;
}

export function SidebarUIProvider({ children }: { children: React.ReactNode }) {
  // Persisted so the rail-only mode survives reloads.
  const [collapsedSetting, setCollapsedSetting] = useLocalStorageSetting("twin-collapsed", "false");
  const collapsed = collapsedSetting === "true";
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsedSetting(String(!collapsed));
  }, [collapsed, setCollapsedSetting]);

  const value = useMemo<SidebarUI>(
    () => ({
      collapsed,
      toggleCollapsed,
      mobileOpen,
      openMobile: () => setMobileOpen(true),
      closeMobile: () => setMobileOpen(false),
    }),
    [collapsed, toggleCollapsed, mobileOpen],
  );

  return <SidebarUIContext.Provider value={value}>{children}</SidebarUIContext.Provider>;
}

/* ----------------------- Header collapse trigger ----------------------- */

/** Drop-in replacement for the shadcn SidebarTrigger used in the header. */
export function SidebarCollapseTrigger({ className = "" }: { className?: string }) {
  const { toggleCollapsed, openMobile } = useSidebarUI();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={() => {
        // On mobile the rail is off-canvas, so the header button opens it;
        // on xl+ it collapses the panel to the rail.
        if (window.matchMedia("(min-width: 1280px)").matches) toggleCollapsed();
        else openMobile();
      }}
      className={`inline-flex items-center justify-center w-9 h-9 text-neutral-500 hover:text-primary dark:text-neutral-300 dark:hover:text-primary cursor-pointer ${className}`}
    >
      <Undo2 className="w-5 h-5" />
    </button>
  );
}

/* ------------------------------- Sidebar ------------------------------- */

const railBtn =
  "group relative inline-flex items-center justify-center w-11 h-11 rounded-[14px] shrink-0 transition-colors";
const railIdle =
  "text-[#5c667e] dark:text-neutral-300 hover:bg-[#f4f5fa] dark:hover:bg-[#323d4e] hover:text-[#1f2937] dark:hover:text-white";
const railActive = "bg-primary text-white shadow-sm dark:shadow-lg";

function RailIcon({
  group,
  active,
  collapsed,
  onSelect,
}: {
  group: MenuGroup;
  active: boolean;
  collapsed: boolean;
  onSelect: (key: string) => void;
}) {
  const Icon = group.icon;
  return (
    <button
      type="button"
      aria-label={group.label}
      onClick={() => onSelect(group.key)}
      className={`${railBtn} ${active ? railActive : railIdle}`}
    >
      <Icon className="w-[22px] h-[22px]" />
      <span
        className={`pointer-events-none absolute start-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-neutral-800 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity z-[5] ${
          collapsed ? "group-hover:opacity-100" : ""
        }`}
      >
        {group.label}
      </span>
    </button>
  );
}

export function TwinSidebar() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, closeMobile, openMobile } = useSidebarUI();

  // Which menu group the panel currently shows. Defaults to the group that
  // owns the current route, falling back to the first group.
  const [selected, setSelected] = useState<string>(
    () => findActiveGroupKey(pathname) ?? MENU[0].key,
  );

  // Follow the route: when it changes to a page in another group, show it.
  // (Adjusting state during render on a changed input, as recommended by React.)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    const key = findActiveGroupKey(pathname);
    if (key) setSelected(key);
  }

  const topGroups = MENU.filter((g) => !g.bottom);
  const bottomGroups = MENU.filter((g) => g.bottom);
  const activeGroup = MENU.find((g) => g.key === selected) ?? MENU[0];

  return (
    <>
      {/* Mobile open button */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={openMobile}
        className="xl:hidden fixed top-[10px] start-4 z-[1050] w-9 h-9 inline-flex items-center justify-center rounded-md bg-white dark:bg-[#273142] text-[#1f2937] dark:text-white shadow-[0_4px_16px_rgba(24,27,44,0.14)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop (mobile) */}
      <div
        onClick={closeMobile}
        className={`xl:hidden fixed inset-0 z-[1040] bg-[#111827]/60 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        aria-label="Primary navigation"
        className={`fixed top-0 start-0 h-screen xl:z-[9] z-[9999] flex bg-white dark:bg-[#273142] dark:shadow-[0_0_24px_rgba(0,0,0,0.35)] transition-transform duration-300 xl:translate-x-0 rtl:xl:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
        {/* Icon rail */}
        <div className="w-[72px] shrink-0 flex flex-col items-center pt-5 pb-[18px] border-e border-[#ececf2] dark:border-[#323d4e]">
          <Link href="/dashboard" aria-label="Admina home" className="inline-flex w-10 h-10 mb-[22px]">
            <Image src={LogoIcon} alt="Admina" className="w-full h-full object-contain" />
          </Link>

          <div className="flex flex-col items-center gap-2.5 grow w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {topGroups.map((g) => (
              <RailIcon
                key={g.key}
                group={g}
                active={selected === g.key}
                collapsed={collapsed}
                onSelect={setSelected}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-2.5 pt-2.5">
            {bottomGroups.map((g) => (
              <RailIcon
                key={g.key}
                group={g}
                active={selected === g.key}
                collapsed={collapsed}
                onSelect={setSelected}
              />
            ))}
          </div>
        </div>

        {/* Menu panel */}
        <div
          className={`shrink-0 flex flex-col overflow-hidden transition-[width,opacity] duration-300 ${
            collapsed ? "w-0 opacity-0 pointer-events-none" : "w-[248px] opacity-100"
          }`}
        >
          <div className="flex items-center justify-between gap-2 h-[78px] px-5 shrink-0">
            <div className="twin-panel__head">
              <Link href="/dashboard" className="twin-panel__logo text-[22px] font-[700]" aria-label="Admina">Admina</Link>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMobile}
              className="xl:hidden text-neutral-500 dark:text-neutral-300 hover:text-primary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grow overflow-y-auto px-4 pt-1 pb-4 scrollbar-thin">
            <ul key={activeGroup.key} className="animate-in fade-in slide-in-from-right-2 duration-200">
              {activeGroup.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(pathname, item.href);
                return (
                  <li key={item.href} className="[&+li]:mt-1">
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className={`relative flex items-center gap-3 px-3.5 py-[11px] rounded-[10px] text-sm font-medium whitespace-nowrap transition-colors ${
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-[#5c667e] dark:text-neutral-300 hover:bg-[#f4f5fa] dark:hover:bg-[#323d4e] hover:text-[#1f2937] dark:hover:text-white"
                      }`}
                    >
                      {active && (
                        <span className="absolute -start-4 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-e-full" />
                      )}
                      <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-primary" : ""}`} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer — upgrade card */}
          <div className="px-4 pt-3 pb-5 shrink-0 text-center">
            <div className="flex flex-col items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <Rocket className="w-8 h-8" />
              </span>
              <p className="text-[12.5px] leading-normal text-[#5c667e] dark:text-neutral-300">
                Upgrade to Pro and unlock advanced features.
              </p>
              <button
                type="button"
                className="block w-full py-[11px] px-4 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white text-sm font-semibold text-center transition-transform hover:-translate-y-px"
              >
                Upgrade PRO
              </button>
            </div>
            <span className="block mt-3.5 text-xs text-neutral-400">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default TwinSidebar;
