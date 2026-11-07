import { MODULES } from "../modules";

// Look up this page's entry by its id. Name, icon and description now come
// from modules.ts, so editing them there updates this page too.
const info = MODULES.find((m) => m.id === "news")!;

export default function NewsPage() {
  return (
    <div className="page">
      <h1 className="page-title">
        {info.icon} {info.name}
      </h1>
      <p className="muted">{info.description}</p>
      <div className="card">
        <p className="muted">Loading…</p>
      </div>
    </div>
  );
}