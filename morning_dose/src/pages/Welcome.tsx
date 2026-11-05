// A page is just a component. Each module of Morning Dose gets its own file here.
// The classNames below ("page", "card", ...) come from the theme in index.css.
export default function Welcome() {
  return (
    <div className="page">
      <h1 className="page-title">Good morning </h1>
      <div className="card">
        <p className="muted">Swipe to see your daily dose.</p>
      </div>
    </div>
  );
}
