export default function LogoutButton({ className = undefined }) {
  return (
    <form
      style={{ display: "contents" }}
      action="/api/auth/logout"
      method="post"
    >
      <button type="submit" className={className || "btn btn-primary"}>
        Logout
      </button>
    </form>
  );
}
