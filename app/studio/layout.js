export const metadata = {
  title: "Label Guard | Sanity CMS",
  description: "Sanity Studio for Label Guard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
