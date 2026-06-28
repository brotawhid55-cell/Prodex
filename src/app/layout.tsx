import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trodex | Curated Products & Reviews",
  description: "Discover and shop highly curated, real user product recommendations, verified reviews, and top affiliate gear.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${roboto.className} antialiased bg-[#FFF8F7] text-[#1A1A1A]`}>
        {children}
      </body>
    </html>
  );
}
