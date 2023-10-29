// add bootstrap css
import "bootstrap/dist/css/bootstrap.css";
// global styling
import "./business.css";
import "@/app/global.css";

// google fonts
import { Inter } from "next/font/google";

// components
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    template: "%s | Label Guard",
    default: "Label Guard",
  },
  description: "The complete violation tracking solution for restaurants.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm"
          crossOrigin="anonymous"
        ></script>
      </body>
    </html>
  );
}
