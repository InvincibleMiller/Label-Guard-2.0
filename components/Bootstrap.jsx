export function Card({ children, title }) {
  return (
    <div className="card">
      {title && <div className="card-header">{title}</div>}
      <div className="card-body container-fluid">
        <div className="row g-0">{children}</div>
      </div>
    </div>
  );
}
