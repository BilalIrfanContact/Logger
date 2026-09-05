import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Logger",
  description: "A private work journal for developers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
