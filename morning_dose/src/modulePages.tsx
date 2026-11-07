import type { ComponentType } from "react";
import NewsPage from "./pages/NewsPage";
import WeatherPage from "./pages/WeatherPage";
import SportsPage from "./pages/SportsPage";
import StocksPage from "./pages/StocksPage";
import CalendarPage from "./pages/CalendarPage";

// id (from modules.ts) -> the page component that shows it
export const MODULE_PAGES: Record<string, ComponentType> = {
  news: NewsPage,
  weather: WeatherPage,
  sports: SportsPage,
  stocks: StocksPage,
  calendar: CalendarPage,
};