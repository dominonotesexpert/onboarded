/**
 * ClientOnly Component
 *
 * Ensures children are only rendered on the client-side, not during SSR.
 * Prevents hydration mismatches for browser-only components (like React Flow).
 *
 * Usage:
 * ```tsx
 * <ClientOnly fallback={<Loading />}>
 *   {() => <BrowserOnlyComponent />}
 * </ClientOnly>
 * ```
 *
 * @component
 * @module ClientOnly
 */

import { useEffect, useState, type ReactNode } from "react";

interface ClientOnlyProps {
  /** Function returning the component to render client-side */
  children: () => ReactNode;
  /** Optional fallback to show during SSR */
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
