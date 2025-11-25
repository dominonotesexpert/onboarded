import { Link, useLocation } from "@remix-run/react";
import { useState } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-2 sm:top-4 left-0 right-0 z-[60] mx-auto max-w-5xl px-2 sm:px-4">
      <div className="glass rounded-full px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between shadow-glow-sm border border-white/5">
        <div className="flex items-center gap-3 sm:gap-8">
          <Link to="/" prefetch="intent" className="flex items-center gap-1.5 sm:gap-2 group">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
              <span className="text-white font-bold text-base sm:text-lg">F</span>
            </div>
            <span className="hidden sm:inline text-lg font-bold tracking-tight text-white group-hover:text-glow transition-all duration-300">
              FlowForge
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = link.isActive(location.pathname);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  prefetch="intent"
                  reloadDocument
                  className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${active
                      ? "text-white bg-white/10 shadow-inner border border-white/5"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-0 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="hidden sm:inline-flex btn-secondary !rounded-full !px-3 !py-1.5 text-xs">
            Sign In
          </button>
          <Link
            to="/workflows/new"
            className="hidden sm:inline-flex btn-primary !rounded-full !px-3 sm:!px-4 !py-1.5 text-xs sm:text-sm shadow-glow hover:shadow-glow-lg"
          >
            Get Started
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors touch-manipulation"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="md:hidden fixed top-16 left-2 right-2 glass rounded-3xl px-4 py-6 shadow-glow border border-white/10 max-w-sm mx-auto">
            <div className="flex flex-col gap-2">
              {links.map((link) => {
                const active = link.isActive(location.pathname);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    prefetch="intent"
                    reloadDocument
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation ${
                      active
                        ? "text-white bg-white/10 shadow-inner border border-white/5"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/10">
                <button className="btn-secondary !rounded-full !px-4 !py-2.5 text-sm w-full justify-center">
                  Sign In
                </button>
                <Link
                  to="/workflows/new"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-primary !rounded-full !px-4 !py-2.5 text-sm shadow-glow hover:shadow-glow-lg w-full justify-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
