import { trpc } from "@/lib/trpc";
import { useCallback, useMemo } from "react";
import { useLocation } from "wouter";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } = options ?? {};
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      navigate("/login");
    }
  }, [utils, navigate]);

  const state = useMemo(() => {
    const user = meQuery.data ?? null;
    if (redirectOnUnauthenticated && !meQuery.isLoading && !user) {
      if (typeof window !== "undefined" && window.location.pathname !== redirectPath) {
        navigate(redirectPath);
      }
    }
    return {
      user,
      loading: meQuery.isLoading,
      error: meQuery.error ?? null,
      isAuthenticated: Boolean(user),
    };
  }, [meQuery.data, meQuery.error, meQuery.isLoading, redirectOnUnauthenticated, redirectPath, navigate]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
