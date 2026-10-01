"use client";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { SidebarUIProvider, TwinSidebar, useSidebarUI } from "@/components/sidebar";
import ThemeCustomizer from "@/components/theme-customizer/theme-customizer";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

/** Main content column — offset for the fixed rail(72px)+panel(248px) on xl+. */
function Shell({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebarUI();
  return (
    <main
      className={`dashboard-body-wrapper flex flex-col min-w-0 min-h-screen transition-[margin] duration-300 ms-0 ${
        collapsed ? "xl:ms-[72px]" : "xl:ms-[320px]"
      }`}
    >
      <Header />
      <div className="dashboard-body bg-neutral-100 dark:bg-[#1e2734] md:p-6 p-4 flex-1">
        {children}
      </div>
      <Footer />
    </main>
  );
}

export function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarUIProvider>
        <TwinSidebar />
        <Shell>{children}</Shell>
        <ThemeCustomizer />
        <Toaster position="top-center" reverseOrder={false} />
      </SidebarUIProvider>
    </ThemeProvider>
  );
}
