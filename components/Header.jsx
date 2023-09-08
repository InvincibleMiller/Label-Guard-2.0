import Link from "next/link";

export default function Header() {
  return (
    <header className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <Link className="navbar-brand" href="/">
          Label Guard
        </Link>
        <ul className="nav">
          <li className="nav-item">
            <Link className="nav-link" href="/login">
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" href="/register">
              Sign Up
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
