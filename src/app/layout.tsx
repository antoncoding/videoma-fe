import type { Metadata } from "next";
import { inter, montserrat } from "./fonts";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Learn with Clips",
  description: "Learn languages with YouTube clips",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${montserrat.variable} font-sans`}>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
