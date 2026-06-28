import type { Metadata } from "next";
import "../index.css";

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
      <body className="antialiased bg-[#F5F0EB] text-[#1A1A1A]">
        {children}
      </body>
    </html>
  );
}
