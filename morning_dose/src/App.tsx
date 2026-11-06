import Pager from "./components/Pager";
import Welcome from "./pages/Welcome";
import Prefrences from "./pages/prefrences.tsx";

// Below is a list which contains the different pages
// To add a page, make a new file in src/pages/, import it, add it here
const pages = [<Welcome key="welcome" />, <Prefrences key="prefrences" />];

export default function App() {
  // Pager is the component that controls the page swipe functionality
  return <Pager pages={pages} />;
}
