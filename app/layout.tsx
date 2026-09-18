import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orisha Infinity | Lash Booking",
  description: "Luxury lash booking experience by Orisha Infinity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
