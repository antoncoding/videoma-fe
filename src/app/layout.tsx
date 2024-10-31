import type { Metadata } from "next";
import { inter, montserrat } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learn With Clips",
  description: "Language Learning Redefined - Master Any Language Through YouTube Videos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} font-inter antialiased`}>
        {children}
      </body>
    </html>
  );
}
