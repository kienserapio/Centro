import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Centro – Modern Community Management",
  description:
    "Centralize management, secure your neighborhood, and stay informed with the Philippines' leading platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
