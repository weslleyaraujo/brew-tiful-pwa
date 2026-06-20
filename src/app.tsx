import { useEffect } from "preact/hooks";
import { useRegisterSW } from "virtual:pwa-register/preact";
import { House, Settings, Clock } from "lucide-preact";
import { HomeScreen } from "./screens/HomeScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { MethodScreen } from "./screens/MethodScreen";
import { RecipeScreen } from "./screens/RecipeScreen";
import { BrewScreen } from "./screens/BrewScreen";
import { BrewHistoryScreen } from "./screens/BrewHistoryScreen";
import { BrewCompleteScreen } from "./screens/BrewCompleteScreen";
import { UpdatePrompt } from "./components/UpdatePrompt";
import { activeTab, activeView, type Tab } from "./store/ui";
import { loading, loadRecipes } from "./store/recipes";
import { initPrefs } from "./store/prefs";

const TABS: { id: Tab; label: string; icon: typeof House }[] = [
  { id: "home", label: "Home", icon: House },
  { id: "history", label: "History", icon: Clock },
  { id: "settings", label: "Settings", icon: Settings },
];

export function App() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    initPrefs();
    loadRecipes();
  }, []);

  // Loading state
  if (loading.value) {
    return (
      <div class="flex items-center justify-center min-h-screen bg-[var(--bg-app)] text-[var(--text-secondary)]">
        <div class="flex flex-col items-center gap-3">
          <span class="text-body">Loading recipes...</span>
        </div>
      </div>
    );
  }

  const view = activeView.value;

  // Full-screen views (method, recipe, brew)
  if (view.type !== "tabs") {
    return (
      <div class="flex flex-col h-dvh bg-[var(--bg-app)]">
        {view.type === "method" && <MethodScreen />}
        {view.type === "recipe" && <RecipeScreen />}
        {view.type === "brew" && <BrewScreen />}
        {view.type === "brew-complete" && <BrewCompleteScreen />}
        {view.type === "history" && <BrewHistoryScreen />}
      </div>
    );
  }

  // Tab-based views
  return (
    <div class="flex flex-col h-dvh bg-[var(--bg-app)]">
      <main class="flex-1 overflow-y-auto">
        {activeTab.value === "home" && <HomeScreen />}
        {activeTab.value === "history" && <BrewHistoryScreen />}
        {activeTab.value === "settings" && <SettingsScreen />}
      </main>

      <nav
        class="flex items-center justify-around px-2 pt-1
               bg-[var(--bg-app)] border-t border-[var(--color-separator)]"
      >
        {TABS.map((tab) => {
          const isActive = activeTab.value === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => (activeTab.value = tab.id)}
              class={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors min-h-[48px] justify-center
                ${
                  isActive
                    ? "text-[var(--color-caramel)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span class="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <UpdatePrompt
        needRefresh={needRefresh}
        updateServiceWorker={updateServiceWorker}
      />
    </div>
  );
}
