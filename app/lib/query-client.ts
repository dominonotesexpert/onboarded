import { QueryClient } from "@tanstack/react-query";

let browserClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  // Server: always create a new client for each request
  if (typeof window === "undefined") {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1_000 * 30,
          refetchOnWindowFocus: false,
          retry: 1
        }
      }
    });
  }

  // Browser: create singleton on first call
  if (!browserClient) {
    browserClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1_000 * 30,
          refetchOnWindowFocus: false,
          retry: 1
        }
      }
    });
  }

  return browserClient;
}
