export default function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <button type="submit" className="btn btn-primary">
        Logout
      </button>
    </form>
  );
}
