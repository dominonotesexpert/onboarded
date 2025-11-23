/**
 * Navbar Component
 *
 * Main navigation bar displayed at the top of all pages.
 * Provides links to key sections with active state highlighting.
 *
 * Features:
 * - Active route highlighting
 * - Responsive layout
 * - Glassmorphic design with backdrop blur
 * - Smooth hover transitions
 *
 * @component
 * @module Navbar
 */

import { Link, useLocation } from "@remix-run/react";

const links: Array<{
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
}> = [
  { label: "Home", href: "/", isActive: (pathname) => pathname === "/" },
  {
    label: "Workflows",
    href: "/workflows",
    isActive: (pathname) =>
      pathname === "/workflows" ||
      (pathname.startsWith("/workflows/") && !pathname.startsWith("/workflows/new"))
  },
  {
    label: "Builder",
    href: "/workflows/new",
    isActive: (pathname) => pathname.startsWith("/workflows/new")
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    isActive: (pathname) => pathname.startsWith("/dashboard")
  }
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-[60] border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl shadow-xl">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-4">
        <div className="flex flex-1">
          {/* <Link to="/" prefetch="intent" className="text-lg font-semibold tracking-wide text-white">
            FlowForge
          </Link> */}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 text-sm font-medium pointer-events-auto">
          {links.map((link) => {
            const active = link.isActive(location.pathname);
            return (
              <Link
                key={link.href}
                to={link.href}
                prefetch="intent"
                reloadDocument
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 transition ${
                  active
                    ? "bg-white/10 text-white shadow-glow"
                    : "text-white/60 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
