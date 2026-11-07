import { useState } from "react";
import Pager from "./components/Pager";
import Welcome from "./pages/Welcome";
import Prefrences from "./pages/prefrences.tsx";
import { loadEnabledModules, saveEnabledModules } from "./modules";
import { MODULES } from "./modules";
import { MODULE_PAGES } from "./modulePages";

export default function App() {
  // State lives here so every page sees the same list
  const [enabled, setEnabled] = useState<string[]>(() => loadEnabledModules());

  function handleSave(ids: string[]) {
    setEnabled(ids);
    saveEnabledModules(ids);
  }

  // Creates the module pages
  const modulePages = MODULES
  .filter((m) => enabled.includes(m.id))
  .map((m) => {
    const Page = MODULE_PAGES[m.id];
    return <Page key={m.id} />;
  });

  // Pages are built inside the component now, so they can receive props
  const pages = [
    <Welcome key="welcome" enabled={enabled} />, ...modulePages,
    <Prefrences key="prefrences" enabled={enabled} onSave={handleSave} />,
  ];

  return <Pager pages={pages} />;
}