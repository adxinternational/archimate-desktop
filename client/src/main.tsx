import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, httpLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 }, mutations: { retry: 0 } },
});

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/trpc`
  : "/api/trpc";

const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: API_URL,
      fetch(input, init) {
        return globalThis.fetch(input, { ...(init ?? {}), credentials: "include" });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
