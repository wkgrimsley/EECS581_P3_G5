// The list of modules a user can turn on or off.
// To add a new module: add an entry here. The preferences page picks it up automatically.

export type ModuleInfo = {
  id: string; // unique key, also what we save
  name: string; // shown to the user
  description: string;
  icon: string; // an emoji keeps things simple for now
};

export const MODULES: ModuleInfo[] = [
  { id: "notes", name: "Notes", description: "Your notes and daily reminders", icon: "📝" },
  { id: "news", name: "News", description: "Top headlines from your sources", icon: "📰" },
  { id: "weather", name: "Weather", description: "Today's forecast", icon: "🌤️" },
  { id: "sports", name: "Sports", description: "Scores from last night", icon: "🏀" },
  { id: "stocks", name: "Stocks", description: "How the market is moving", icon: "📈" },
  { id: "calendar", name: "Calendar", description: "What's on your schedule", icon: "📅" },
];
