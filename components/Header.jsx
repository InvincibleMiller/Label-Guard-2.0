import Link from "next/link";
import { cookies } from "next/headers";

import LogoutButton from "./LogoutButton";

export default function Header() {
  const { has: cookieExists } = cookies();
  const loggedIn = cookieExists(process.env.TOKEN_COOKIE);

  return (
    <header className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <Link className="navbar-brand" href="/">
          Label Guard
        </Link>
        <ul className="nav">
          {loggedIn ? (
            <>
              <li className="nav-item">
                <LogoutButton />
              </li>
            </>
          ) : (
            <>
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
            </>
          )}
        </ul>
      </div>
    </header>
  );
}
