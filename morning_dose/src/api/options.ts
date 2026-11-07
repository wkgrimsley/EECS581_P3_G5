/*
Choices offered on the Preferences screen.
Update these as pollers add support (e.g. backlog #17: any stock the user picks).

Author: Jamareon Davis
Creation Date: 2026-11-06
*/

export const stockOptions = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'JPM']

// NewsAPI source IDs (https://newsapi.org/v2/top-headlines/sources),
// passed to news_poller.py as --source
export const newsSourceOptions: { id: string; label: string }[] = [
  { id: 'bbc-news', label: 'BBC News' },
  { id: 'associated-press', label: 'AP' },
  { id: 'reuters', label: 'Reuters' },
  { id: 'cnn', label: 'CNN' },
  { id: 'the-verge', label: 'The Verge' },
  { id: 'techcrunch', label: 'TechCrunch' },
  { id: 'espn', label: 'ESPN' },
]

export const leagueOptions = ['NFL', 'NBA', 'NCAAB', 'NCAAF', 'MLB', 'NHL']
