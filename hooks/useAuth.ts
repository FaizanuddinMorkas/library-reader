import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { ROUTES } from "@/lib/constants";

/**
 * Auth hook providing login/logout/redirect helpers.
 * Wraps the Zustand store with navigation logic.
 */
export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      await login(email, password);
      router.replace(ROUTES.TABS_HOME);
    },
    [login, router]
  );

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace(ROUTES.AUTH_LOGIN);
  }, [logout, router]);

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.AUTH_LOGIN);
    }
  }, [isAuthenticated, router]);

  return {
    user,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    requireAuth,
  };
}
