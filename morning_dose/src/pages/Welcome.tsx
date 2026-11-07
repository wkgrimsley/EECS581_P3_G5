// A page is just a component. Each module of Morning Dose gets its own file here.
// The classNames below ("page", "card", ...) come from the theme in index.css.

type Props = { enabled: string[] };

export default function Welcome({ enabled }: Props) {
  return (
    <div className="page">
      <h1 className="page-title">Good morning </h1>
      <div className="card">
        <p className="muted">{enabled.length} modules in your daily dose. Swipe to see them.</p>
      </div>
    </div>
  );
}
