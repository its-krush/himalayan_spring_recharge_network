import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(_options?: UseAuthOptions) {
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const loginMutation = trpc.auth.login.useMutation({ onSuccess: () => utils.auth.me.invalidate() });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => utils.auth.me.setData(undefined, null),
  });

  const login = useCallback(() => loginMutation.mutateAsync(), [loginMutation]);
  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (!(error instanceof TRPCClientError) || error.data?.code !== "UNAUTHORIZED") throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  return useMemo(() => ({
    user: meQuery.data ?? null,
    loading: meQuery.isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: meQuery.error ?? loginMutation.error ?? logoutMutation.error ?? null,
    isAuthenticated: Boolean(meQuery.data),
    refresh: () => meQuery.refetch(),
    login,
    logout,
  }), [meQuery.data, meQuery.error, meQuery.isLoading, login, loginMutation.error, loginMutation.isPending, logout, logoutMutation.error, logoutMutation.isPending, meQuery]);
}
