import { Link, useLocation } from "@remix-run/react";
import { motion } from "framer-motion";

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
    <div className="fixed top-6 left-0 right-0 z-[60] flex justify-center pointer-events-none">
      <nav className="pointer-events-auto bg-glass-heavy backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 shadow-glow-sm flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-glow transition-all">
            FlowForge
          </span>
        </Link>

        <div className="h-6 w-px bg-white/10" />

        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active = link.isActive(location.pathname);
            return (
              <Link
                key={link.href}
                to={link.href}
                reloadDocument
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${active
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                {active && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
