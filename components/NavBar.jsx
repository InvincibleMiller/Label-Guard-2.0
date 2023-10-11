import Link from "next/link";

export function NavLink({ href, children }) {
  return (
    <Link className="nav-link text-opacity-25" href={href}>
      {children}
    </Link>
  );
}
