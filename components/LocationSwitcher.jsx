function LocationSwitcher({ locationDoc, locations }) {
  return (
    <div className="dropdown" style={{ display: "contents" }}>
      <button
        className="btn btn-light dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {locationDoc?.name}
      </button>
      <ul className="dropdown-menu">
        {locations.map(({ id, name }) => (
          <li>
            <form action="/api/auth/change-location" method="post">
              <div className="d-none">
                <input readOnly type="text" name="locationID" value={id} />
              </div>
              <button type="submit" className="dropdown-item">
                {name}
              </button>
            </form>
          </li>
        ))}
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <div className="dropdown-item d-grid">
            <a className="btn btn-primary" href="/auth/register-location/">
              New Location
            </a>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default LocationSwitcher;
