import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Redirect, Tabs } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import type { QuickActionsSheetHandle } from "@/components/layout/QuickActionsSheet";

const loadQuickActions = () => import("@/components/layout/QuickActionsHost");

const QuickActionsHost = lazy(() =>
  loadQuickActions().then((module) => ({
    default: module.QuickActionsHost,
  }))
);

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const quickActionsRef = useRef<QuickActionsSheetHandle>(null);
  const shouldPresentQuickActions = useRef(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    void loadQuickActions();
  }, []);

  const setQuickActionsRef = useCallback((handle: QuickActionsSheetHandle | null) => {
    quickActionsRef.current = handle;
    if (handle && shouldPresentQuickActions.current) {
      shouldPresentQuickActions.current = false;
      requestAnimationFrame(() => handle.present());
    }
  }, []);

  const openQuickActions = useCallback(() => {
    if (quickActionsRef.current) {
      quickActionsRef.current.present();
      return;
    }

    shouldPresentQuickActions.current = true;
    setShowQuickActions(true);
  }, []);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
          },
        }}
        tabBar={(props) => (
          <BottomTabBar
            state={props.state}
            navigation={props.navigation}
            onQuickPress={openQuickActions}
          />
        )}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="library" options={{ title: "Library" }} />
        <Tabs.Screen name="my-library" options={{ title: "My Library" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        <Tabs.Screen name="donate" options={{ href: null }} />
      </Tabs>
      {showQuickActions && (
        <Suspense fallback={null}>
          <QuickActionsHost ref={setQuickActionsRef} />
        </Suspense>
      )}
    </>
  );
}
