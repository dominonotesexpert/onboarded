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
    <nav className="fixed top-4 left-0 right-0 z-[60] mx-auto max-w-5xl px-4">
      <div className="glass rounded-full px-6 py-3 flex items-center justify-between shadow-glow-sm border border-white/5">
        <div className="flex items-center gap-8">
          <Link to="/" prefetch="intent" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-glow transition-all duration-300">
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

        <div className="flex items-center gap-3">
          <button className="btn-secondary !rounded-full !px-3 !py-1.5 text-xs">
            Sign In
          </button>
          <Link
            to="/workflows/new"
            className="btn-primary !rounded-full !px-4 !py-1.5 text-sm shadow-glow hover:shadow-glow-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
