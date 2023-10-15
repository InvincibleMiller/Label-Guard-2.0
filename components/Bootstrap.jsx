export function Card({ children, title, className }) {
  return (
    <div className={`card ${className || ""}`}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-body container-fluid">
        <div className="row g-0">{children}</div>
      </div>
    </div>
  );
}
