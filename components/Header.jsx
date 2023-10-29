import Link from "next/link";
import { cookies } from "next/headers";

import LogoutButton from "./LogoutButton";

import { RxHamburgerMenu } from "react-icons/rx";

export default function Header() {
  const { has: cookieExists } = cookies();
  const loggedIn = cookieExists(process.env.TOKEN_COOKIE);

  return (
    <header className="container-fluid">
      <div className="row">
        <div className="col bg-primary text-light">
          <div className="container-xl py-2">
            <div className="row py-2">
              <div className="col d-flex justify-content-between align-items-center">
                <a href="/" className="logo-link">
                  Label Guard
                </a>
                {/* Mobile Responsive */}
                <div className="d-none d-md-flex gap-3">
                  {loggedIn ? (
                    <>
                      <Link className="btn btn-light" href="/auth/dashboard">
                        Dashboard
                      </Link>
                      <LogoutButton className="btn btn-outline-light" />
                    </>
                  ) : (
                    <>
                      <Link className="btn btn-outline-light" href="/login">
                        Login
                      </Link>
                      <Link className="btn btn-light" href="/register">
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
                <button
                  className="navbar-toggler d-md-none"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarToggleExternalContent"
                  aria-controls="navbarToggleExternalContent"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <RxHamburgerMenu className="h4 m-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Nav Bar */}
      <div className="row bg-body-tertiary position-absolute start-0 end-0 shadow-sm">
        <div className="collapse" id="navbarToggleExternalContent">
          <div className="p-4">
            <div className="d-grid gap-2">
              {loggedIn ? (
                <>
                  <Link className="btn btn-link" href="/auth/dashboard">
                    Dashboard
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link className="btn btn-link" href="/login">
                    Login
                  </Link>
                  <Link className="btn btn-link" href="/register">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
