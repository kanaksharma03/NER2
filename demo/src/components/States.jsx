export default function LoadingState({ lines = 3 }) {
  return (
    <div className="state" role="status">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}

export function EmptyState({ message }) {
  return <div className="state">{message}</div>;
}

export function ErrorState({ message }) {
  return <div className="state">{message || "Unable to retrieve data."}</div>;
}
