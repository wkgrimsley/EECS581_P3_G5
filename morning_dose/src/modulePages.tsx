import NewsPage from "./pages/NewsPage";
import WeatherPage from "./pages/WeatherPage";
import SportsPage from "./pages/SportsPage";
import StocksPage from "./pages/StocksPage";
import CalendarPage from "./pages/CalendarPage";

// id (from modules.ts) -> the page component that shows it inside its story card.
// Each page receives its topic's data as a `data` prop (see src/topics/registry.ts).
export const MODULE_PAGES = {
  news: NewsPage,
  weather: WeatherPage,
  sports: SportsPage,
  stocks: StocksPage,
  calendar: CalendarPage,
};
