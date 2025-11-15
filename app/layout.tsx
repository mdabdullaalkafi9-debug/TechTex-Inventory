import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechTex Inventory Management",
  description: "An inventory management application for TechTex to track woven and non-woven fabric stock.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100 dark:bg-gray-900">{children}</body>
    </html>
  );
}
