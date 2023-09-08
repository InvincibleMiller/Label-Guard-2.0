// add bootstrap css
import "bootstrap/dist/css/bootstrap.css";
// global styling
import "./globals.css";

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
      </body>
    </html>
  );
}
