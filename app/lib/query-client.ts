import { QueryClient } from "@tanstack/react-query";

let client: QueryClient | null = null;

export function getQueryClient() {
  if (!client) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1_000 * 30,
          refetchOnWindowFocus: false,
          retry: 1
        }
      }
    });
  }

  return client;
}
