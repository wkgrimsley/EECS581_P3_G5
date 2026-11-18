// The list of modules a user can turn on or off.
// To add a new module: add an entry here. The preferences page picks it up automatically.

export type ModuleInfo = {
  id: string; // unique key, also what we save
  name: string; // shown to the user
  description: string;
  icon: string; // an emoji keeps things simple for now
};

export const MODULES: ModuleInfo[] = [
  { id: "news", name: "News", description: "Top headlines from your sources", icon: "📰" },
  { id: "weather", name: "Weather", description: "Today's forecast", icon: "🌤️" },
  { id: "sports", name: "Sports", description: "Scores from last night", icon: "🏀" },
  { id: "stocks", name: "Stocks", description: "How the market is moving", icon: "📈" },
  { id: "calendar", name: "Calendar", description: "What's on your schedule", icon: "📅" },
];

// ---- Saving & loading ----
// localStorage keeps data in the browser between visits. It only stores
// strings, so we convert our array to/from JSON. Later this could be
// swapped for a call to the backend without changing the pages.

const STORAGE_KEY = "morningDose.enabledModules";

export function loadEnabledModules(): string[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {
    return MODULES.map((m) => m.id); // first visit: everything on
  }
  return JSON.parse(saved) as string[];
}

export function saveEnabledModules(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
