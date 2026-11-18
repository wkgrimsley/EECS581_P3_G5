# Frontend Information

The frontend is a React + TypeScript app (Vite) in `morning_dose/`. Each topic is a story card in a stack. Swipe the top card away in **any direction** to see the next topic. To go back, tap a segment of the progress bar at the top (or use the arrow keys on a computer). Preferences and Start over are in the ⋯ menu. Changes on the Preferences page take effect when you press Save.

## Run it

Start the backend first (see `backend/backend_info.md`), then in a second terminal:

```powershell
cd morning_dose
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). During `npm run dev`, every request to `/api/...` is forwarded to Flask at `http://127.0.0.1:5000` (see `vite.config.ts`), so no CORS setup is needed in `backend.py`.

No backend or no API key? Create `morning_dose/.env.local` with:

```text
VITE_USE_MOCKS=true
```

and every card shows placeholder data instead.

## Supabase authentication and preferences

The app uses Supabase Auth for email/password accounts and stores preferences
in `public.user_preferences`, with one JSON document per user. Create a Supabase
project, enable Email under Authentication providers, then run
[`supabase/migrations/20261118150000_create_user_preferences.sql`](../supabase/migrations/20261118150000_create_user_preferences.sql)
in the Supabase SQL Editor. The table's row-level security policies restrict
each user to their own row.

Copy `.env.example` to `.env.local` and replace its placeholders with the
project URL and publishable key from Supabase Project Settings → API. Do not
put a service-role key in the frontend or commit `.env.local`. Set the Supabase
Site URL and allowed redirect URL to the local Vite origin printed by `npm run dev`
(normally `http://localhost:5173`). Restart Vite after changing
environment variables.

The app shows sign-up/sign-in before the story deck. If email confirmation is
enabled, confirm the account through the email before signing in. Preferences
load after authentication and are written to Supabase only when Save is pressed.
Existing localStorage preferences are not copied automatically to avoid
transferring one browser user's settings into another account.

## Where things live

```text
src/
  auth/
    AuthProvider.tsx          Supabase session lifecycle and sign-out
    useAuth.ts                Current authenticated user
  lib/supabase.ts             Supabase client
  index.css                  Theme tokens (colors, spacing, type) + shared classes (.page, .card, .button)
  modules.ts                 List of modules + which ones are switched on (shared with Preferences)
  modulePages.tsx            Module id -> the page shown inside its card
  types.ts                   Data shapes the UI uses (NewsItem, StockQuote, ...)
  api/
    config.ts                LIVE_DATA switches + backend URL   <- flip a topic live here
    client.ts                postJSON() / pollBackend() helpers
    news.ts                  Live: POST /api/news -> news_poller.py
    stocks.ts                Mock until stocks poller is registered
    weather.ts               Mock until weather poller is registered
    sports.ts                Mock until sports poller is registered
    calendar.ts              Mock until a calendar poller is written
    mockData.ts              Placeholder data
    options.ts               Choices shown on the Preferences page
  topics/registry.ts         List of story cards (which page + which loader + which preferences)
  components/
    StoryDeck.tsx/.css       Swipe-away card stack (home screen)
    StoryCard.tsx            One card: loading / error / data
    MoreMenu.tsx/.css        The ⋯ menu in the header
    Pager.tsx/.css           Earlier side-scrolling pager (not used right now)
  pages/
    WeatherPage, NewsPage, StocksPage, SportsPage, CalendarPage.tsx
                             What each card displays (styles in cards.css)
    prefrences.tsx/.css      Preferences page
    Welcome.tsx              Earlier welcome page (not used right now)
  hooks/
    usePreferences.ts        Loads/saves preferences
    useAsync.ts              Loading/error state helper
  utils/format.ts            Time formatting helpers
```

## Hooking up a poller

Each `src/api/<topic>.ts` file has a **TO GO LIVE** checklist at the top. In short:

1. Register the poller in `POLLER_FILES` in `backend/backend.py` and pass its preference field to the script in `run_poller()` (table below).
2. Set the topic to `true` in `LIVE_DATA` in `src/api/config.ts`.
3. If the poller's JSON doesn't match the expected output below, edit the adapter function in that topic's file (`toStockQuotes`, `toWeather`, `toGames`, `toEvents`). Nothing else in the UI needs to change.

| Topic   | Request the frontend sends                                     | Expected poller output |
|---------|----------------------------------------------------------------|------------------------|
| News    | `POST /api/news` `{"keywords": [...], "sources": [...]}`       | `{"keywords": [NewsAPI article], "sources": [NewsAPI article]}` (current `news_poller.py`) |
| Stocks  | `POST /api/poll` `{"poller": "stocks", "symbols": ["AAPL"]}`   | `{"quotes": [{"symbol", "name", "price", "change", "changePct"}]}` |
| Weather | `POST /api/poll` `{"poller": "weather", "locations": ["Lawrence, KS"]}` | `{"locations": [{"location", "tempF", "condition", "highF", "lowF", "hourly": [{"time", "tempF", "condition"}]}]}` |
| Sports  | `POST /api/poll` `{"poller": "sports", "leagues": ["NFL"]}`    | `{"games": [{"id", "league", "home", "away", "homeScore", "awayScore", "status", "startTime"}]}` |
| Calendar | `POST /api/poll` `{"poller": "calendar", "date": "2026-11-07"}` | `{"events": [{"id", "title", "start", "end", "allDay", "location"}]}` |

Sports `status` is `"scheduled"`, `"live"`, or `"final"`. Times are ISO strings (e.g. `2026-11-07T18:00:00Z`).

## Adding a new topic

See the comment at the top of `src/topics/registry.ts` (add an id to `types.ts`, an API file, a view, and a registry entry).

## Preferences

Preferences are loaded and saved per authenticated Supabase user in
`src/hooks/usePreferences.ts`. Supabase Auth setup is in `src/auth/`, and the
client configuration is in `src/lib/supabase.ts`.

## Checks

```powershell
npm run build   # type-check + production build
npm run lint
```
