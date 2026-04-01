import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HMAX RackSentinel",
  description:
    "RackSentinel predicts cross-rack cascading failures with a live digital twin, quad-modal sensing, and HMAX-ready work orders."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
