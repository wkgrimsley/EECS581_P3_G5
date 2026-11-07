import { useState } from "react";
import { MODULES } from "../modules";
import "./prefrences.css";

type Props = {
  enabled: string[];               // what's currently saved
  onSave: (ids: string[]) => void; // tell App when the user hits Save
};

export default function Prefrences({ enabled: savedIds, onSave }: Props) {
  // Local draft: lets the user toggle freely without changing other pages
  // until they press Save
  const [enabled, setEnabled] = useState<string[]>(savedIds);
  const [saved, setSaved] = useState(false);

  function toggle(id: string) {
    setEnabled((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setSaved(false);
  }

  function handleSave() {
    onSave(enabled);
    setSaved(true);
  }

  return (
    <div className="page">
      <header>
        <h1 className="page-title">Your Morning Dose</h1>
        <p className="muted">Choose what shows up when you wake up.</p>
      </header>

      {/* One row per module, generated from the MODULES list */}
      <ul className="module-list">
        {MODULES.map((module) => {
          const isOn = enabled.includes(module.id);
          return (
            <li key={module.id}>
              {/* Using <label> makes the whole row clickable for the checkbox */}
              <label className={`card module-row ${isOn ? "is-on" : ""}`}>
                <span className="module-icon">{module.icon}</span>
                <span className="module-text">
                  <span className="module-name">{module.name}</span>
                  <span className="muted module-desc">{module.description}</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  className="switch"
                  checked={isOn}
                  onChange={() => toggle(module.id)}
                />
              </label>
            </li>
          );
        })}
      </ul>

      <footer className="prefs-footer">
        <span className="muted">
          {saved ? "Saved ✓" : `${enabled.length} of ${MODULES.length} selected`}
        </span>
        <button className="button" onClick={handleSave}>
          Save
        </button>
      </footer>
    </div>
  );
}
