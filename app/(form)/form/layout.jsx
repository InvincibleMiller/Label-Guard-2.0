// add bootstrap css
import "bootstrap/dist/css/bootstrap.css";
// custom form css
import "./form.css";

// component imports

// user validation imports

export const metadata = {
  title: {
    template: "Label Guard | %s",
    default: "Label Guard | Form",
  },
  description: "The restaurant violation and repeat tracking app.",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="navbar navbar-expand-lg fixed-top">
          <h1>Label Guard</h1>
        </header>
        {children}
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}
