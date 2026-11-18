// The module catalog shown by Preferences and the story deck.
// To add a module: add an entry here and wire its page and topic definition.

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
