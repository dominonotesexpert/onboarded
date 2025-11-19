import { useEffect, useState, type ReactNode } from "react";

interface ClientOnlyProps {
  children: () => ReactNode;
  fallback?: ReactNode;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return <>{fallback}</>;
  return <>{children()}</>;
}
